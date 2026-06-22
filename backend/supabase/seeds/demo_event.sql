-- Kobra demo data for the university presentation.
-- Run after migrations/001_initial_schema.sql.

insert into public.organizations (id, name, legal_name)
values (
  '11111111-1111-4111-8111-111111111111',
  'Kobra Demo Productora',
  'Kobra Demo Productora SpA'
)
on conflict (id) do update set
  name = excluded.name,
  legal_name = excluded.legal_name;

insert into public.events (
  id,
  organization_id,
  name,
  venue_name,
  starts_at,
  ends_at,
  status,
  target_margin_rate
)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Warehouse Club',
  'Warehouse Club',
  now() - interval '2 hours',
  now() + interval '90 minutes',
  'active',
  0.38
)
on conflict (id) do update set
  name = excluded.name,
  venue_name = excluded.venue_name,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  target_margin_rate = excluded.target_margin_rate;

insert into public.bar_zones (id, event_id, name, capacity_multiplier)
values
  ('33333333-3333-4333-8333-333333333301', '22222222-2222-4222-8222-222222222222', 'Norte', 1.15),
  ('33333333-3333-4333-8333-333333333302', '22222222-2222-4222-8222-222222222222', 'Sur', 0.9),
  ('33333333-3333-4333-8333-333333333303', '22222222-2222-4222-8222-222222222222', 'General', 1)
on conflict (event_id, name) do update set
  capacity_multiplier = excluded.capacity_multiplier;

insert into public.products (id, organization_id, sku, name, category, unit_size)
values
  ('44444444-4444-4444-8444-444444444401', '11111111-1111-4111-8111-111111111111', 'GIN-TONIC-LATA', 'Gin tonic lata', 'RTD', '355 ml'),
  ('44444444-4444-4444-8444-444444444402', '11111111-1111-4111-8111-111111111111', 'AGUA-SIN-GAS', 'Agua sin gas', 'Agua', '500 ml'),
  ('44444444-4444-4444-8444-444444444403', '11111111-1111-4111-8111-111111111111', 'CERVEZA-PREMIUM', 'Cerveza premium', 'Cerveza', '470 ml'),
  ('44444444-4444-4444-8444-444444444404', '11111111-1111-4111-8111-111111111111', 'ENERGETICA-355', 'Energetica 355', 'Mixer', '355 ml')
on conflict (id) do update set
  sku = excluded.sku,
  name = excluded.name,
  category = excluded.category,
  unit_size = excluded.unit_size;

insert into public.event_products (
  event_id,
  product_id,
  starting_stock,
  current_stock,
  unit_price,
  unit_cost,
  target_sell_through,
  min_margin_rate
)
values
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444401', 504, 204, 3900, 2450, 0.75, 0.25),
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444402', 996, 96, 2000, 1480, 0.68, 0.2),
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444403', 988, 188, 4900, 2980, 0.58, 0.3),
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444404', 608, 108, 3000, 2120, 0.56, 0.22)
on conflict (event_id, product_id) do update set
  starting_stock = excluded.starting_stock,
  current_stock = excluded.current_stock,
  unit_price = excluded.unit_price,
  unit_cost = excluded.unit_cost,
  target_sell_through = excluded.target_sell_through,
  min_margin_rate = excluded.min_margin_rate;

insert into public.recommendations (
  event_id,
  product_id,
  bar_zone_id,
  title,
  summary,
  priority,
  status,
  estimated_margin,
  evidence,
  rule_code
)
values (
  '22222222-2222-4222-8222-222222222222',
  '44444444-4444-4444-8444-444444444401',
  '33333333-3333-4333-8333-333333333301',
  'Activar oferta controlada para gin tonic lata',
  'Stock alto, rotacion bajo objetivo y margen unitario aun protegible.',
  'high',
  'pending',
  103000,
  '{"stock_restante":"40%","venta_por_hora":"24 u.","margen_unitario":"$1.450"}'::jsonb,
  'STOCK_HIGH_ROTATION_LOW'
);
