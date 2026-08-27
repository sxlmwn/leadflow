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

export const MOCK_BRANDS: AdminBrand[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    slug: 'windowhound',
    name: 'WindowHound',
    domain: 'windowhound.com',
    vertical: 'home_improvement',
    sub_vertical: 'windows',
    is_active: true,
    created_at: '2026-08-25T15:26:13Z',
    theme_config: {
      primary_color: '#2563eb',
      logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=120&auto=format&fit=crop&q=80',
      font_style: 'Inter, sans-serif',
      headline: 'Find Top-Rated Window Replacement Experts Near You'
    },
    form_schema: {
      fields: [
        { id: 'zip', label: 'ZIP Code', type: 'zip', placeholder: 'Enter 5-digit ZIP', required: true },
        { id: 'project_type', label: 'Project Type', type: 'radio', options: ['Replacement', 'Repair', 'New Installation'], required: true },
        { id: 'window_count', label: 'Number of Windows', type: 'select', options: ['1-3 Windows', '4-9 Windows', '10+ Windows'], required: true },
        { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
        { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
        { id: 'phone', label: 'Phone Number', type: 'phone', placeholder: '(555) 000-0000', required: true }
      ]
    },
    legal_copy: {
      disclaimer: 'By clicking Submit, you agree to receive calls and text messages from window installation pros.',
      tcpa_text: 'I consent to automated marketing calls and emails.',
      privacy_url: 'https://windowhound.com/privacy',
      terms_url: 'https://windowhound.com/terms'
    }
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    slug: 'medtrialmatch',
    name: 'MedTrialMatch',
    domain: 'medtrialmatch.com',
    vertical: 'paid_clinical_trials',
    sub_vertical: 'clinical_studies',
    is_active: true,
    created_at: '2026-08-25T15:26:13Z',
    theme_config: {
      primary_color: '#0d9488',
      logo_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=120&auto=format&fit=crop&q=80',
      font_style: 'Outfit, sans-serif',
      headline: 'Earn up to $5,000 in Paid Clinical Trials'
    },
    form_schema: {
      fields: [
        { id: 'age', label: 'Age Group', type: 'select', options: ['18-30', '31-50', '51-70', '71+'], required: true },
        { id: 'condition', label: 'Medical Condition', type: 'select', options: ['Asthma', 'Diabetes', 'Migraine', 'Healthy Volunteer'], required: true },
        { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', required: true },
        { id: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com', required: true },
        { id: 'phone', label: 'Phone Number', type: 'phone', placeholder: '(555) 123-4567', required: true }
      ]
    },
    legal_copy: {
      disclaimer: 'Participation in clinical trials is voluntary. Terms and privacy apply.',
      tcpa_text: 'I agree to be contacted by clinical trial research coordinators.',
      privacy_url: 'https://medtrialmatch.com/privacy',
      terms_url: 'https://medtrialmatch.com/terms'
    }
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    slug: 'reliefologist',
    name: 'ReliefOlogist',
    domain: 'reliefologist.com',
    vertical: 'health_product',
    sub_vertical: 'pain_relief',
    is_active: true,
    created_at: '2026-08-25T15:26:13Z',
    theme_config: {
      primary_color: '#16a34a',
      logo_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120&auto=format&fit=crop&q=80',
      font_style: 'Roboto, sans-serif',
      headline: 'Natural & Effective Relief Tailored to Your Needs'
    },
    form_schema: {
      fields: [
        { id: 'pain_area', label: 'Primary Pain Area', type: 'radio', options: ['Joint/Knee', 'Back/Spine', 'Neck/Shoulder', 'General Muscle'], required: true },
        { id: 'severity', label: 'Pain Severity Level', type: 'select', options: ['Mild (1-3)', 'Moderate (4-6)', 'Severe (7-10)'], required: true },
        { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Alex Johnson', required: true },
        { id: 'phone', label: 'Phone Number', type: 'phone', placeholder: '(555) 987-6543', required: true }
      ]
    },
    legal_copy: {
      disclaimer: 'Statements have not been evaluated by the FDA. Results may vary.',
      tcpa_text: 'I consent to promotional SMS text messages.',
      privacy_url: 'https://reliefologist.com/privacy',
      terms_url: 'https://reliefologist.com/terms'
    }
  }
];

export const MOCK_DOMAINS: AdminDomain[] = [
  { id: 'd1', domain: 'windowhound.com', brand_id: 'b1111111-1111-1111-1111-111111111111', brand_name: 'WindowHound', status: 'active', ssl_status: 'active', created_at: '2026-08-25T15:30:00Z' },
  { id: 'd2', domain: 'medtrialmatch.com', brand_id: 'b2222222-2222-2222-2222-222222222222', brand_name: 'MedTrialMatch', status: 'active', ssl_status: 'active', created_at: '2026-08-25T15:31:00Z' },
  { id: 'd3', domain: 'reliefologist.com', brand_id: 'b3333333-3333-3333-3333-333333333333', brand_name: 'ReliefOlogist', status: 'active', ssl_status: 'active', created_at: '2026-08-25T15:32:00Z' },
  { id: 'd4', domain: 'windows-direct.net', brand_id: 'b1111111-1111-1111-1111-111111111111', brand_name: 'WindowHound', status: 'pending', ssl_status: 'issuing', created_at: '2026-08-26T10:15:00Z' }
];
