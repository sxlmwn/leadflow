-- ============================================================
-- Verification Results Audit Trail Table
-- ============================================================

create table if not exists verification_results (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  check_type text not null check (check_type in ('trustedform', 'dnc_scrub', 'scoring')),
  provider text not null,
  raw_response jsonb not null default '{}'::jsonb,
  status text not null check (status in ('passed', 'failed', 'error', 'skipped')),
  created_at timestamptz not null default now()
);

create index if not exists idx_verification_results_lead_id on verification_results(lead_id);
create index if not exists idx_verification_results_check_type on verification_results(check_type);

-- Ensure dnc_flagged column exists on leads table
alter table leads add column if not exists dnc_flagged boolean default false;
