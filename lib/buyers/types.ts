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
