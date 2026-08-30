export interface ScoringWeights {
  form_fully_completed: number;
  valid_non_disposable_email: number;
  valid_phone_format: number;
  trustedform_verified: number;
  trustedform_missing_penalty: number;
  dnc_passed: number;
  not_duplicate: number;
  dnc_hit_cap: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  form_fully_completed: 20,
  valid_non_disposable_email: 15,
  valid_phone_format: 10,
  trustedform_verified: 25,
  trustedform_missing_penalty: -15,
  dnc_passed: 20,
  not_duplicate: 10,
  dnc_hit_cap: 20,
};

// Known disposable email domains to flag
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'mailinator.com',
  '10minutemail.com',
  'dispostable.com',
  'yopmail.com',
  'trashmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'getnada.com',
]);
