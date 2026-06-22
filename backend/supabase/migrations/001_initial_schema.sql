-- Kobra initial Supabase schema.
-- Run this in Supabase SQL Editor or as the first migration when the CLI is configured.

create extension if not exists pgcrypto;

create type public.event_status as enum ('draft', 'active', 'closed', 'archived');
create type public.recommendation_status as enum ('pending', 'approved', 'dismissed', 'expired');
create type public.recommendation_priority as enum ('low', 'medium', 'high');
create type public.inventory_movement_type as enum ('opening_stock', 'restock', 'transfer_in', 'transfer_out', 'waste', 'correction');
create type public.simulation_status as enum ('draft', 'running', 'completed', 'failed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'producer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  venue_name text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.event_status not null default 'draft',
  target_margin_rate numeric(5, 4) not null default 0.38,
  currency text not null default 'CLP',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.bar_zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  capacity_multiplier numeric(8, 4) not null default 1,
  created_at timestamptz not null default now(),
  unique (event_id, name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sku text,
  name text not null,
  category text not null,
  unit_size text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);

create table public.event_products (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  starting_stock integer not null default 0,
  current_stock integer not null default 0,
  unit_price integer not null,
  unit_cost integer not null,
  target_sell_through numeric(5, 4) not null default 0.7,
  min_margin_rate numeric(5, 4) not null default 0.25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, product_id),
  check (starting_stock >= 0),
  check (current_stock >= 0),
  check (unit_price >= 0),
  check (unit_cost >= 0),
  check (unit_price >= unit_cost)
);

create table public.sales_transactions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  bar_zone_id uuid references public.bar_zones(id) on delete set null,
  quantity integer not null,
  unit_price integer not null,
  unit_cost integer not null,
  gross_amount integer generated always as (quantity * unit_price) stored,
  gross_margin integer generated always as (quantity * (unit_price - unit_cost)) stored,
  source text not null default 'manual',
  external_id text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (quantity > 0),
  check (unit_price >= unit_cost)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  from_bar_zone_id uuid references public.bar_zones(id) on delete set null,
  to_bar_zone_id uuid references public.bar_zones(id) on delete set null,
  movement_type public.inventory_movement_type not null,
  quantity integer not null,
  reason text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (quantity > 0)
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  bar_zone_id uuid references public.bar_zones(id) on delete set null,
  title text not null,
  summary text not null,
  priority public.recommendation_priority not null default 'medium',
  status public.recommendation_status not null default 'pending',
  estimated_margin integer not null default 0,
  evidence jsonb not null default '{}'::jsonb,
  rule_code text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  status public.simulation_status not null default 'draft',
  assumptions jsonb not null default '{}'::jsonb,
  baseline_snapshot jsonb not null default '{}'::jsonb,
  result_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.simulation_actions (
  id uuid primary key default gen_random_uuid(),
  simulation_run_id uuid not null references public.simulation_runs(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  bar_zone_id uuid references public.bar_zones(id) on delete set null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index events_organization_id_idx on public.events(organization_id);
create index bar_zones_event_id_idx on public.bar_zones(event_id);
create index products_organization_id_idx on public.products(organization_id);
create index event_products_event_id_idx on public.event_products(event_id);
create index sales_transactions_event_time_idx on public.sales_transactions(event_id, occurred_at desc);
create index sales_transactions_product_idx on public.sales_transactions(product_id);
create index inventory_movements_event_time_idx on public.inventory_movements(event_id, occurred_at desc);
create index recommendations_event_status_idx on public.recommendations(event_id, status, priority);
create index simulation_runs_event_id_idx on public.simulation_runs(event_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger event_products_set_updated_at
before update on public.event_products
for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.events enable row level security;
alter table public.bar_zones enable row level security;
alter table public.products enable row level security;
alter table public.event_products enable row level security;
alter table public.sales_transactions enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.recommendations enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.simulation_actions enable row level security;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members members
    where members.organization_id = target_organization_id
      and members.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_event(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events event
    where event.id = target_event_id
      and public.is_org_member(event.organization_id)
  );
$$;

create policy "Members can read organizations"
on public.organizations for select
using (public.is_org_member(id));

create policy "Members can read memberships"
on public.organization_members for select
using (user_id = auth.uid() or public.is_org_member(organization_id));

create policy "Members can manage events"
on public.events for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Members can manage zones"
on public.bar_zones for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage products"
on public.products for all
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "Members can manage event products"
on public.event_products for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage sales"
on public.sales_transactions for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage inventory movements"
on public.inventory_movements for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage recommendations"
on public.recommendations for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage simulation runs"
on public.simulation_runs for all
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

create policy "Members can manage simulation actions"
on public.simulation_actions for all
using (
  exists (
    select 1
    from public.simulation_runs run
    where run.id = simulation_actions.simulation_run_id
      and public.can_access_event(run.event_id)
  )
)
with check (
  exists (
    select 1
    from public.simulation_runs run
    where run.id = simulation_actions.simulation_run_id
      and public.can_access_event(run.event_id)
  )
);
