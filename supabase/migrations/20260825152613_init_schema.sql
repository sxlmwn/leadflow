-- ============================================================
-- LeadFlow — Multi-Brand Lead-Gen Platform
-- Core Schema: brands, clicks, leads, buyers, buyer_deliveries
-- ============================================================

create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  domain text unique not null,
  vertical text not null,
  sub_vertical text,
  theme_config jsonb not null default '{}'::jsonb,
  form_schema jsonb not null default '{}'::jsonb,
  legal_copy jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clicks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  landing_url text not null,
  subid_params jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now(),
  converted_lead_id uuid
);

create index idx_clicks_brand on clicks(brand_id);
create index idx_clicks_created on clicks(created_at);
create index idx_clicks_subid_params on clicks using gin (subid_params);

create table leads (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id),
  click_id uuid references clicks(id),
  full_name text,
  email text,
  phone text,
  zip_code text,
  form_answers jsonb not null default '{}'::jsonb,
  subid_params jsonb not null default '{}'::jsonb,
  funnel_variant text,
  funnel_step_reached integer,
  status text not null default 'new'
    check (status in ('new','verifying','verified','rejected','sold','duplicate')),
  is_duplicate boolean not null default false,
  duplicate_of_lead_id uuid references leads(id),
  trustedform_cert_url text,
  dnc_scrub_passed boolean,
  dnc_scrub_checked_at timestamptz,
  score numeric,
  score_breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_brand on leads(brand_id);
create index idx_leads_status on leads(status);
create index idx_leads_email on leads(email);
create index idx_leads_phone on leads(phone);
create index idx_leads_created on leads(created_at);
create index idx_leads_subid_params on leads using gin (subid_params);

alter table clicks
  add constraint fk_clicks_converted_lead
  foreign key (converted_lead_id) references leads(id);

create table buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_endpoint text,
  api_key_encrypted text,
  price_per_lead numeric,
  pricing_model text default 'flat'
    check (pricing_model in ('flat','tiered','auction')),
  min_accept_score numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table buyer_brands (
  buyer_id uuid not null references buyers(id),
  brand_id uuid not null references brands(id),
  primary key (buyer_id, brand_id)
);

create table buyer_deliveries (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  buyer_id uuid not null references buyers(id),
  delivered_at timestamptz not null default now(),
  request_payload jsonb,
  response_payload jsonb,
  http_status integer,
  accepted boolean,
  price_paid numeric,
  converted boolean default false,
  converted_at timestamptz,
  conversion_value numeric,
  created_at timestamptz not null default now()
);

create index idx_deliveries_lead on buyer_deliveries(lead_id);
create index idx_deliveries_buyer on buyer_deliveries(buyer_id);
create index idx_deliveries_converted on buyer_deliveries(converted);

-- ============================================================
-- Seed Data: Initial 3 Brands for local development & testing
-- ============================================================

insert into brands (slug, name, domain, vertical, sub_vertical, theme_config)
values 
(
  'windowhound',
  'WindowHound',
  'windowhound.com',
  'home_improvement',
  'windows',
  '{"primary_color": "#2563eb", "logo_url": "/brands/windowhound-logo.svg", "font_style": "Inter, sans-serif", "headline": "Find Top-Rated Window Replacement Experts Near You"}'::jsonb
),
(
  'medtrialmatch',
  'MedTrialMatch',
  'medtrialmatch.com',
  'paid_clinical_trials',
  'clinical_studies',
  '{"primary_color": "#0d9488", "logo_url": "/brands/medtrialmatch-logo.svg", "font_style": "Outfit, sans-serif", "headline": "Earn up to $5,000 in Paid Trials"}'::jsonb
),
(
  'reliefologist',
  'ReliefOlogist',
  'reliefologist.com',
  'health_product',
  'pain_relief',
  '{"primary_color": "#16a34a", "logo_url": "/brands/reliefologist-logo.svg", "font_style": "Roboto, sans-serif", "headline": "Natural & Effective Relief Tailored to Your Needs"}'::jsonb
)
on conflict (slug) do update set
  name = excluded.name,
  domain = excluded.domain,
  vertical = excluded.vertical,
  sub_vertical = excluded.sub_vertical,
  theme_config = excluded.theme_config;
