export interface AdminLead {
  id: string;
  brand_id: string;
  brand_name?: string;
  full_name: string;
  email: string;
  phone: string;
  zip_code: string;
  form_answers: Record<string, unknown>;
  subid_params: Record<string, unknown>;
  funnel_variant?: string;
  funnel_step_reached?: number;
  status: 'new' | 'verifying' | 'verified' | 'rejected' | 'sold' | 'duplicate';
  is_duplicate: boolean;
  trustedform_cert_url?: string;
  dnc_scrub_passed?: boolean;
  dnc_flagged?: boolean;
  score?: number;
  score_breakdown?: Record<string, unknown>;
  sold?: boolean;
  sold_to_buyer_id?: string;
  sold_to_buyer_name?: string;
  sold_at?: string;
  created_at: string;
  updated_at?: string;
  click_id?: string;
}

export interface AdminBrand {
  id: string;
  slug: string;
  name: string;
  domain: string;
  vertical: string;
  sub_vertical?: string;
  theme_config: {
    primary_color?: string;
    logo_url?: string;
    font_style?: string;
    headline?: string;
    background_image_url?: string;
  };
  form_schema: {
    fields?: Array<{
      id: string;
      label: string;
      type: 'text' | 'email' | 'phone' | 'zip' | 'radio' | 'checkbox' | 'select';
      placeholder?: string;
      required?: boolean;
      options?: string[];
    }>;
  };
  legal_copy: {
    disclaimer?: string;
    tcpa_text?: string;
    privacy_url?: string;
    terms_url?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminBuyer {
  id: string;
  name: string;
  api_endpoint?: string;
  api_key_encrypted?: string;
  price_per_lead?: number;
  pricing_model?: 'flat' | 'tiered' | 'auction';
  min_accept_score?: number;
  min_score?: number;
  is_active: boolean;
  active?: boolean;
  accepted_brands?: string[];
  created_at: string;
}

export interface AdminDelivery {
  id: string;
  lead_id: string;
  buyer_id: string;
  buyer_name?: string;
  brand_name?: string;
  delivered_at: string;
  request_payload?: Record<string, unknown>;
  response_payload?: Record<string, unknown>;
  http_status?: number;
  accepted: boolean;
  price_paid?: number;
  converted?: boolean;
  converted_at?: string;
  conversion_value?: number;
  created_at: string;
}

export interface AdminDomain {
  id: string;
  domain: string;
  brand_id: string;
  brand_name: string;
  status: 'active' | 'pending' | 'error';
  ssl_status: 'active' | 'issuing' | 'expired';
  created_at: string;
}

export const MOCK_BRANDS: AdminBrand[] = [];

export const MOCK_DOMAINS: AdminDomain[] = [];

