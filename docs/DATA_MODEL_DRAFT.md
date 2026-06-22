# Data Model Draft

Este modelo es un borrador para Supabase/Postgres. Los campos son sugeridos y deben ajustarse cuando se implemente el schema real.

## organizations

Propósito: representar productoras o empresas que usan el sistema.

Campos sugeridos:

- `id uuid primary key`
- `name text not null`
- `slug text unique`
- `created_at timestamptz`
- `updated_at timestamptz`

Relaciones:

- Tiene muchos `events`, `products`, `profiles`, `audit_logs`.

Seguridad/RLS:

- Usuarios solo pueden leer organizaciones donde tienen perfil asociado.
- Escritura limitada a owners/admins.

## events

Propósito: representar cada evento operado por una organización.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `name text not null`
- `venue text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `status text` (`draft`, `active`, `closed`)
- `data_mode text` (`simulated`, `historical`, `live`)
- `created_at timestamptz`

Relaciones:

- Pertenece a `organizations`.
- Tiene muchas `bars`, `inventory`, `transactions`, `recommendation_runs`.

Seguridad/RLS:

- Acceso por organización.
- Roles operativos pueden leer eventos activos; admins pueden crear y cerrar.

## bars

Propósito: representar barras físicas o puntos de venta dentro de un evento.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `name text not null`
- `location text`
- `status text`
- `created_at timestamptz`

Relaciones:

- Pertenece a `events`.
- Tiene muchas `transactions` e `inventory`.

Seguridad/RLS:

- Acceso por organización y evento.
- Edición limitada a admins o jefes de barra.

## products

Propósito: catálogo de productos vendibles en barras.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `sku text`
- `name text not null`
- `category text`
- `unit_cost numeric`
- `default_price numeric`
- `min_margin_percent numeric`
- `is_active boolean`
- `created_at timestamptz`

Relaciones:

- Pertenece a `organizations`.
- Aparece en `inventory`, `transaction_items`, `offers`.

Seguridad/RLS:

- Lectura por usuarios de la organización.
- Costos visibles solo para roles autorizados.

## inventory

Propósito: stock inicial, stock asignado y stock restante por evento/barra/producto.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `bar_id uuid references bars(id)`
- `product_id uuid references products(id)`
- `initial_quantity integer`
- `current_quantity integer`
- `reserved_quantity integer`
- `waste_quantity integer`
- `updated_at timestamptz`

Relaciones:

- Pertenece a `events`, `bars` y `products`.

Seguridad/RLS:

- Acceso por organización.
- Cambios manuales deben generar `audit_logs`.

## transactions

Propósito: venta o movimiento comercial recibido desde POS/ticketera/simulador.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `bar_id uuid references bars(id)`
- `external_id text`
- `source text` (`pos_simulator`, `pos_webhook`, `manual_import`)
- `occurred_at timestamptz`
- `currency text`
- `gross_total numeric`
- `discount_total numeric`
- `net_total numeric`
- `status text` (`completed`, `voided`, `refunded`)
- `created_at timestamptz`

Relaciones:

- Tiene muchos `transaction_items`.
- Pertenece a `events` y `bars`.

Seguridad/RLS:

- Acceso por organización.
- Ingesta vía service role o función segura, no desde cliente público.

## transaction_items

Propósito: detalle de productos vendidos en una transacción.

Campos sugeridos:

- `id uuid primary key`
- `transaction_id uuid references transactions(id)`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `product_id uuid references products(id)`
- `quantity integer`
- `unit_price numeric`
- `unit_cost_snapshot numeric`
- `discount_amount numeric`
- `line_total numeric`
- `created_at timestamptz`

Relaciones:

- Pertenece a `transactions`.
- Referencia `products`.

Seguridad/RLS:

- Acceso por organización.
- Cost snapshots visibles solo para roles autorizados.

## recommendation_runs

Propósito: registrar cada ejecución del motor de recomendaciones.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `started_at timestamptz`
- `finished_at timestamptz`
- `status text` (`running`, `completed`, `failed`)
- `engine_version text`
- `prompt_version text`
- `input_summary jsonb`
- `error_message text`

Relaciones:

- Tiene muchas `recommendations`.

Seguridad/RLS:

- Lectura por roles autorizados de la organización.
- Escritura solo backend/service role.

## recommendations

Propósito: oportunidades o alertas accionables generadas por el sistema.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `run_id uuid references recommendation_runs(id)`
- `bar_id uuid references bars(id)`
- `product_id uuid references products(id)`
- `type text`
- `status text` (`draft`, `active`, `dismissed`, `applied`, `expired`)
- `priority text` (`low`, `medium`, `high`)
- `title text`
- `summary text`
- `evidence jsonb`
- `estimated_incremental_margin numeric`
- `confidence_label text`
- `expires_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Relaciones:

- Pertenece a `recommendation_runs`.
- Puede referenciar `bars`, `products` y `offers`.

Seguridad/RLS:

- Acceso por organización.
- Cambios de estado auditados.
- El cliente no debe modificar evidencia calculada.

## offers

Propósito: representar ofertas manuales sugeridas o aplicadas.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `recommendation_id uuid references recommendations(id)`
- `product_id uuid references products(id)`
- `name text`
- `description text`
- `discount_type text`
- `discount_value numeric`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `status text` (`draft`, `approved`, `active`, `ended`, `cancelled`)
- `created_at timestamptz`

Relaciones:

- Puede nacer desde una `recommendation`.
- Referencia `products` y `events`.

Seguridad/RLS:

- Creación/aprobación limitada a roles autorizados.
- V1 no ejecuta ofertas automáticamente en POS real.

## pos_ingestion_logs

Propósito: auditar payloads, validaciones y errores de ingesta POS.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `source text`
- `external_id text`
- `status text` (`received`, `processed`, `failed`, `duplicate`)
- `payload jsonb`
- `error_message text`
- `received_at timestamptz`
- `processed_at timestamptz`

Relaciones:

- Puede vincularse a `transactions` por `external_id`.

Seguridad/RLS:

- Lectura solo para admins/operaciones.
- Cuidar datos sensibles del payload.

## users/profiles

Propósito: extender usuarios de Supabase Auth con rol y organización.

Campos sugeridos:

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `organization_id uuid references organizations(id)`
- `full_name text`
- `role text` (`owner`, `admin`, `bar_manager`, `viewer`)
- `created_at timestamptz`
- `updated_at timestamptz`

Relaciones:

- Pertenece a `organizations`.
- Vincula Supabase Auth con permisos de aplicación.

Seguridad/RLS:

- Cada usuario puede leer su perfil.
- Owners/admins pueden administrar perfiles de su organización.

## audit_logs

Propósito: registrar acciones relevantes para trazabilidad.

Campos sugeridos:

- `id uuid primary key`
- `organization_id uuid references organizations(id)`
- `event_id uuid references events(id)`
- `actor_profile_id uuid references profiles(id)`
- `action text`
- `entity_type text`
- `entity_id uuid`
- `metadata jsonb`
- `created_at timestamptz`

Relaciones:

- Referencia indirecta a entidades mediante `entity_type` y `entity_id`.

Seguridad/RLS:

- Solo lectura para roles autorizados.
- Escritura solo backend/service role.

