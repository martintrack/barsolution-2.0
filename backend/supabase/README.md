# Kobra Supabase

This folder contains the database contract for Kobra.

## First setup

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run `migrations/001_initial_schema.sql`.
4. Copy the Project URL and anon key into `frontend/.env.local`.

## MVP tables

- `organizations`: productoras.
- `organization_members`: users linked to a productora.
- `events`: each event/festival/club night.
- `bar_zones`: sales zones inside the event.
- `products`: product catalog for an organization.
- `event_products`: stock, price, cost and targets for an event.
- `sales_transactions`: sales imported from POS or simulator.
- `inventory_movements`: stock changes and transfers.
- `recommendations`: Kobra decision suggestions.
- `simulation_runs` and `simulation_actions`: scenario planning without touching the real event.

## Auth note

RLS is enabled and policies are prepared for Supabase Auth. During early prototyping, we can use mock data or service-role server actions. Before presentation, connect login and insert the first `organization_members` row for your user.
