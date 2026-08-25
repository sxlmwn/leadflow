export type CheckType = 'trustedform' | 'dnc_scrub' | 'scoring';
export type CheckStatus = 'passed' | 'failed' | 'error' | 'skipped';

export interface VerificationResult {
  check_type: CheckType;
  provider: string;
  raw_response: Record<string, unknown>;
  status: CheckStatus;
  details?: Record<string, unknown>;
}

export interface ScoreBreakdown {
  total_score: number;
  max_score: number;
  factors: Record<string, { points: number; description: string }>;
  dnc_capped: boolean;
}
