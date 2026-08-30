import { VerificationResult, ScoreBreakdown } from '@/types';
import { DEFAULT_SCORING_WEIGHTS, DISPOSABLE_EMAIL_DOMAINS, ScoringWeights } from './weights';

export interface LeadForScoring {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  zip_code?: string | null;
  form_answers?: Record<string, unknown> | null;
  is_duplicate?: boolean | null;
  trustedform_cert_url?: string | null;
}

export function calculateScore(
  lead: LeadForScoring,
  verificationResults: VerificationResult[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): { score: number; breakdown: ScoreBreakdown } {
  let score = 0;
  const factors: Record<string, { points: number; description: string }> = {};

  // 1. Form Fully Completed Check (+20 pts)
  const answers = lead.form_answers || {};
  const hasCoreFields = Boolean(lead.full_name && lead.email && lead.phone && lead.zip_code);
  const hasExtraAnswers = Object.keys(answers).length > 0 && Object.values(answers).every((v) => v !== null && v !== '');

  if (hasCoreFields && hasExtraAnswers) {
    score += weights.form_fully_completed;
    factors.form_fully_completed = {
      points: weights.form_fully_completed,
      description: 'Form fully completed including all optional/vertical answers.',
    };
  } else {
    factors.form_fully_completed = {
      points: 0,
      description: 'Form partially completed.',
    };
  }

  // 2. Email Validation & Disposable Domain Check (+15 pts)
  if (lead.email && lead.email.includes('@')) {
    const domain = lead.email.split('@')[1]?.toLowerCase().trim();
    const isDisposable = domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;

    if (!isDisposable) {
      score += weights.valid_non_disposable_email;
      factors.valid_non_disposable_email = {
        points: weights.valid_non_disposable_email,
        description: 'Valid email format from a non-disposable domain.',
      };
    } else {
      factors.valid_non_disposable_email = {
        points: 0,
        description: `Disposable email domain detected (${domain}).`,
      };
    }
  } else {
    factors.valid_non_disposable_email = {
      points: 0,
      description: 'Invalid or missing email address.',
    };
  }

  // 3. Valid Phone Format (+10 pts)
  if (lead.phone) {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      score += weights.valid_phone_format;
      factors.valid_phone_format = {
        points: weights.valid_phone_format,
        description: 'Valid 10+ digit phone format.',
      };
    } else {
      factors.valid_phone_format = {
        points: 0,
        description: 'Phone format invalid or too short.',
      };
    }
  } else {
    factors.valid_phone_format = {
      points: 0,
      description: 'Missing phone number.',
    };
  }

  // 4. TrustedForm Cert Check (+25 pts if passed, -15 pts penalty if missing/skipped)
  const tfResult = verificationResults.find((r) => r.check_type === 'trustedform');
  if (tfResult && tfResult.status === 'passed') {
    score += weights.trustedform_verified;
    factors.trustedform_verified = {
      points: weights.trustedform_verified,
      description: 'TrustedForm cert present and verified for TCPA consent.',
    };
  } else if (!tfResult || tfResult.status === 'skipped') {
    score += weights.trustedform_missing_penalty;
    factors.trustedform_verified = {
      points: weights.trustedform_missing_penalty,
      description: 'TrustedForm cert missing or skipped (TCPA consent unverified penalty).',
    };
  } else {
    factors.trustedform_verified = {
      points: 0,
      description: `TrustedForm check status: ${tfResult?.status}.`,
    };
  }

  // 5. DNC Scrub Check (+20 pts if passed / not listed, hard cap at 20 total score if DNC hit)
  const dncResult = verificationResults.find((r) => r.check_type === 'dnc_scrub');
  let dncCapped = false;

  if (dncResult && dncResult.status === 'passed') {
    score += weights.dnc_passed;
    factors.dnc_passed = {
      points: weights.dnc_passed,
      description: 'Phone passed DNC registry check (not listed on DNC).',
    };
  } else if (dncResult && dncResult.status === 'failed') {
    factors.dnc_passed = {
      points: 0,
      description: 'DNC HIT DETECTED! Phone number is listed on Do Not Call registry.',
    };
    dncCapped = true;
  } else {
    factors.dnc_passed = {
      points: 0,
      description: `DNC check status: ${dncResult?.status || 'unverified'}.`,
    };
  }

  // 6. Non-Duplicate Lead (+10 pts)
  if (!lead.is_duplicate) {
    score += weights.not_duplicate;
    factors.not_duplicate = {
      points: weights.not_duplicate,
      description: 'Lead is unique (not a duplicate submission).',
    };
  } else {
    factors.not_duplicate = {
      points: 0,
      description: 'Lead is a duplicate submission.',
    };
  }

  // Clamp raw score to 0 - 100
  let finalScore = Math.max(0, Math.min(100, score));

  // Hard Cap at 20 if DNC Hit occurred
  if (dncCapped) {
    finalScore = Math.min(finalScore, weights.dnc_hit_cap);
  }

  const breakdown: ScoreBreakdown = {
    total_score: finalScore,
    max_score: 100,
    factors: factors,
    dnc_capped: dncCapped,
  };

  return {
    score: finalScore,
    breakdown: breakdown,
  };
}
