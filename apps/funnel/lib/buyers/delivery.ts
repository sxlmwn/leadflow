import { supabase } from '@/lib/supabase/client';
import { OutboundBuyerPayload, BuyerRecord, BuyerApiResponse } from '@/types';

/**
 * Broadcasts a verified & scored lead to all eligible buyers in parallel.
 * Implements first-accept-wins atomic locking to prevent double-selling.
 */
export async function deliverToBuyers(
  leadId: string,
  passedScore?: number
): Promise<{
  success: boolean;
  sold: boolean;
  sold_to_buyer_id?: string | null;
  deliveriesCount: number;
  reason?: string;
}> {
  try {
    // 1. Fetch Lead record
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error(`[Delivery Engine] Lead ${leadId} not found.`);
      return { success: false, sold: false, deliveriesCount: 0, reason: 'lead_not_found' };
    }

    const leadScore = passedScore !== undefined ? passedScore : (lead.score || 0);

    // 2. HARD GATES: DNC Flagged or Duplicate lead
    if (lead.dnc_flagged || lead.is_duplicate) {
      const gateReason = lead.dnc_flagged
        ? 'Hard Gate: Lead is flagged on DNC registry. Delivery aborted.'
        : 'Hard Gate: Lead is a duplicate submission. Delivery aborted.';

      console.log(`[Delivery Engine] ${gateReason} Lead ID: ${leadId}`);

      await supabase.from('verification_results').insert({
        lead_id: leadId,
        check_type: 'scoring',
        provider: 'delivery_engine',
        status: 'skipped',
        raw_response: { reason: gateReason, dnc_flagged: lead.dnc_flagged, is_duplicate: lead.is_duplicate },
      });

      return { success: true, sold: false, deliveriesCount: 0, reason: gateReason };
    }

    // 3. Fetch Brand slug for payload
    const { data: brand } = await supabase
      .from('brands')
      .select('slug')
      .eq('id', lead.brand_id)
      .single();

    const brandSlug = brand?.slug || 'unknown';

    // 4. Query Eligible Buyers for Brand
    const { data: buyerBrandRows } = await supabase
      .from('buyer_brands')
      .select('buyer_id')
      .eq('brand_id', lead.brand_id);

    const buyerIds = (buyerBrandRows || []).map((row) => row.buyer_id);

    if (buyerIds.length === 0) {
      console.log(`[Delivery Engine] No buyer associations found for brand ${lead.brand_id}.`);
      await supabase.from('verification_results').insert({
        lead_id: leadId,
        check_type: 'scoring',
        provider: 'delivery_engine',
        status: 'skipped',
        raw_response: { reason: 'no_eligible_buyers' },
      });
      return { success: true, sold: false, deliveriesCount: 0, reason: 'no_eligible_buyers' };
    }

    // Fetch active buyers with min_score <= leadScore
    const { data: buyersData } = await supabase
      .from('buyers')
      .select('*')
      .in('id', buyerIds);

    const eligibleBuyers: BuyerRecord[] = (buyersData || []).filter((b) => {
      const isActive = b.active !== undefined ? b.active : b.is_active;
      const minScore = b.min_score !== undefined && b.min_score !== null ? b.min_score : (b.min_accept_score || 0);
      return isActive && minScore <= leadScore;
    });

    if (eligibleBuyers.length === 0) {
      console.log(`[Delivery Engine] Zero buyers met score threshold (${leadScore}) for lead ${leadId}.`);
      await supabase.from('verification_results').insert({
        lead_id: leadId,
        check_type: 'scoring',
        provider: 'delivery_engine',
        status: 'skipped',
        raw_response: { reason: 'no_eligible_buyers_meeting_score_threshold', lead_score: leadScore },
      });
      return { success: true, sold: false, deliveriesCount: 0, reason: 'no_buyers_met_min_score' };
    }

    // 5. Construct Generic Outbound Payload
    const nameParts = (lead.full_name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const payload: OutboundBuyerPayload = {
      lead_id: lead.id,
      brand: brandSlug,
      submitted_at: lead.created_at,
      contact: {
        first_name: firstName,
        last_name: lastName,
        email: lead.email || '',
        phone: lead.phone || '',
        zip_code: lead.zip_code || '',
      },
      answers: lead.form_answers || {},
      score: leadScore,
      trustedform_cert_url: lead.trustedform_cert_url,
      subid_params: lead.subid_params || {},
    };

    // 6. Broadcast to all eligible buyers in parallel (5s timeout per buyer)
    let leadSold = false;
    let winningBuyerId: string | null = null;

    const deliveryPromises = eligibleBuyers.map(async (buyer) => {
      const endpoint = buyer.api_endpoint || 'http://localhost:3000/api/dev/mock-buyer';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let httpStatus = 0;
      let responsePayload: Record<string, unknown> = {};
      let buyerAccepted = false;
      let pricePaid = 0;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(buyer.api_key_encrypted ? { 'Authorization': `Bearer ${buyer.api_key_encrypted}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        httpStatus = response.status;
        const data = (await response.json().catch(() => ({}))) as BuyerApiResponse;
        responsePayload = data as unknown as Record<string, unknown>;

        if (response.ok && data.accepted) {
          buyerAccepted = true;
          pricePaid = data.price || buyer.price_per_lead || 0;
        }
      } catch (err: unknown) {
        const error = err as Error;
        httpStatus = error.name === 'AbortError' ? 408 : 500;
        responsePayload = {
          error: error.message || 'Request failed or timed out',
          timed_out: error.name === 'AbortError',
        };
      } finally {
        clearTimeout(timeoutId);
      }

      // First-Accept-Wins Atomic Locking Logic
      let isWinner = false;

      if (buyerAccepted) {
        // Attempt atomic claim on leads table
        const { data: claimedLead } = await supabase
          .from('leads')
          .update({
            sold: true,
            status: 'sold',
            sold_to_buyer_id: buyer.id,
            sold_at: new Date().toISOString(),
          })
          .eq('id', lead.id)
          .eq('sold', false)
          .select('id')
          .maybeSingle();

        if (claimedLead) {
          isWinner = true;
          leadSold = true;
          winningBuyerId = buyer.id;
          console.log(`[Delivery Engine] WINNER! Buyer ${buyer.name} (${buyer.id}) claimed lead ${lead.id}`);
        } else {
          // Buyer accepted, but another buyer already won the claim
          buyerAccepted = false;
          pricePaid = 0;
          responsePayload = {
            ...responsePayload,
            note: 'lead_already_sold',
            original_accepted: true,
          };
          console.log(`[Delivery Engine] SECOND PLACE: Buyer ${buyer.name} accepted but lead ${lead.id} was already claimed.`);
        }
      }

      // Record buyer_deliveries audit log row
      await supabase.from('buyer_deliveries').insert({
        lead_id: lead.id,
        buyer_id: buyer.id,
        request_payload: payload as unknown as Record<string, unknown>,
        response_payload: responsePayload,
        http_status: httpStatus,
        accepted: isWinner,
        price_paid: isWinner ? pricePaid : 0,
        converted: false,
      });

      return { buyer_id: buyer.id, accepted: isWinner, price: pricePaid };
    });

    const results = await Promise.allSettled(deliveryPromises);

    return {
      success: true,
      sold: leadSold,
      sold_to_buyer_id: winningBuyerId,
      deliveriesCount: results.length,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error(`[Delivery Engine Critical Error] leadId: ${leadId}`, error);
    return { success: false, sold: false, deliveriesCount: 0, reason: error.message };
  }
}
