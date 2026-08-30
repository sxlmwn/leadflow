// Brand & Theme Types
export interface ThemeConfig {
  primary_color: string;
  secondary_color?: string;
  bg_color?: string;
  logo_url: string;
  font_style: string;
  headline: string;
}

export interface LegalCopy {
  disclaimer?: string;
  tcpa_text?: string;
  privacy_url?: string;
  terms_url?: string;
  [key: string]: unknown;
}

// Form Schema Types
export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'zip_code'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface FormOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
}

export interface FormStep {
  step_id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  title?: string;
  description?: string;
  steps: FormStep[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  domain: string;
  vertical: string;
  sub_vertical: string | null;
  theme_config: ThemeConfig;
  form_schema: FormSchema;
  legal_copy: LegalCopy;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Verification & Compliance Types
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

// Buyer Delivery Types
export interface OutboundBuyerPayload {
  lead_id: string;
  brand: string;
  submitted_at: string;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    zip_code: string;
  };
  answers: Record<string, unknown>;
  score: number;
  trustedform_cert_url?: string | null;
  subid_params: Record<string, unknown>;
}

export interface BuyerApiResponse {
  accepted: boolean;
  price?: number;
  buyer_lead_id?: string;
  reason?: string;
  raw?: Record<string, unknown>;
}

export interface BuyerRecord {
  id: string;
  name: string;
  api_endpoint: string | null;
  api_key_encrypted: string | null;
  price_per_lead: number | null;
  pricing_model: string | null;
  min_accept_score: number | null;
  min_score?: number | null;
  is_active: boolean;
  active?: boolean;
}
