-- ============================================================
-- Step 5: Add Buyer Delivery & Sold Columns
-- ============================================================

-- Add active and min_score aliases to buyers table if needed
alter table buyers add column if not exists active boolean not null default true;
alter table buyers add column if not exists min_score numeric default 0;

-- Ensure buyers.min_score defaults to min_accept_score if set
update buyers set min_score = min_accept_score where min_score is null or min_score = 0;
update buyers set active = is_active where active is null;

-- Add sold tracking columns to leads table
alter table leads add column if not exists sold boolean not null default false;
alter table leads add column if not exists sold_to_buyer_id uuid references buyers(id);
alter table leads add column if not exists sold_at timestamptz;

create index if not exists idx_leads_sold on leads(sold);
create index if not exists idx_leads_sold_to_buyer_id on leads(sold_to_buyer_id);
