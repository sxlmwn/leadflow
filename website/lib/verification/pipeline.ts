import { supabase } from '@/lib/supabase/client';
import { verifyTrustedForm } from './trustedform';
import { checkDNC } from './dnc';
import { calculateScore } from '@/lib/scoring/scorer';
import { deliverToBuyers } from '@/lib/buyers/delivery';
import { VerificationResult } from '@/types';

export async function runVerificationPipeline(leadId: string): Promise<{
  success: boolean;
  score: number;
  verificationResults: VerificationResult[];
}> {
  const verificationResults: VerificationResult[] = [];

  try {
    // 1. Fetch Lead Record from Supabase
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (fetchError || !lead) {
      console.error(`[Pipeline Error] Lead ID ${leadId} not found:`, fetchError);
      return { success: false, score: 0, verificationResults: [] };
    }

    // 2. Step 1: TrustedForm Verification
    let tfResult: VerificationResult;
    try {
      tfResult = await verifyTrustedForm(lead.trustedform_cert_url);
    } catch (err: unknown) {
      const error = err as Error;
      tfResult = {
        check_type: 'trustedform',
        provider: 'trustedform',
        status: 'error',
        raw_response: { error_message: error.message || 'TrustedForm check failed unexpectedly' },
      };
    }
    verificationResults.push(tfResult);

    await supabase.from('verification_results').insert({
      lead_id: leadId,
      check_type: tfResult.check_type,
      provider: tfResult.provider,
      raw_response: tfResult.raw_response,
      status: tfResult.status,
    });

    // 3. Step 2: DNC Scrub Check
    let dncResult: VerificationResult;
    try {
      dncResult = await checkDNC(lead.phone);
    } catch (err: unknown) {
      const error = err as Error;
      dncResult = {
        check_type: 'dnc_scrub',
        provider: 'dnc_scrubber',
        status: 'error',
        raw_response: { error_message: error.message || 'DNC scrub check failed unexpectedly' },
      };
    }
    verificationResults.push(dncResult);

    await supabase.from('verification_results').insert({
      lead_id: leadId,
      check_type: dncResult.check_type,
      provider: dncResult.provider,
      raw_response: dncResult.raw_response,
      status: dncResult.status,
    });

    // Update DNC columns on leads table
    const dncPassed = dncResult.status === 'passed';
    const dncFlagged = dncResult.status === 'failed';

    await supabase
      .from('leads')
      .update({
        dnc_scrub_passed: dncPassed,
        dnc_scrub_checked_at: new Date().toISOString(),
        dnc_flagged: dncFlagged,
      })
      .eq('id', leadId);

    // Update local lead object for scoring calculation
    lead.dnc_flagged = dncFlagged;

    // 4. Step 3: Lead Scoring Calculation
    let scoreResult = { score: 0, breakdown: {} };
    let scoringResult: VerificationResult;

    try {
      const calculated = calculateScore(lead, verificationResults);
      scoreResult = { score: calculated.score, breakdown: calculated.breakdown };
      scoringResult = {
        check_type: 'scoring',
        provider: 'internal_scorer',
        status: 'passed',
        raw_response: calculated.breakdown as unknown as Record<string, unknown>,
      };
    } catch (err: unknown) {
      const error = err as Error;
      scoringResult = {
        check_type: 'scoring',
        provider: 'internal_scorer',
        status: 'error',
        raw_response: { error_message: error.message || 'Scoring engine failed unexpectedly' },
      };
    }
    verificationResults.push(scoringResult);

    await supabase.from('verification_results').insert({
      lead_id: leadId,
      check_type: scoringResult.check_type,
      provider: scoringResult.provider,
      raw_response: scoringResult.raw_response,
      status: scoringResult.status,
    });

    // Update score and score_breakdown on leads table
    await supabase
      .from('leads')
      .update({
        score: scoreResult.score,
        score_breakdown: scoreResult.breakdown,
      })
      .eq('id', leadId);

    // 5. Step 4: Broadcast Buyer Delivery (Non-blocking step)
    try {
      await deliverToBuyers(leadId, scoreResult.score);
    } catch (deliveryErr) {
      console.error(`[Pipeline Delivery Error] leadId: ${leadId}`, deliveryErr);
    }

    return {
      success: true,
      score: scoreResult.score,
      verificationResults: verificationResults,
    };
  } catch (pipelineErr: unknown) {
    const error = pipelineErr as Error;
    console.error(`[Pipeline Critical Error] leadId: ${leadId}`, error);
    return {
      success: false,
      score: 0,
      verificationResults: verificationResults,
    };
  }
}
