# API Contract Draft

Este contrato es preliminar. Los endpoints pueden implementarse como Next.js route handlers, Supabase Edge Functions o un backend Node dedicado.

## POST /api/pos/transactions

Objetivo: recibir una transacción POS individual y persistirla.

Request body esperado:

```json
{
  "organizationId": "uuid",
  "eventId": "uuid",
  "barId": "uuid",
  "source": "pos_simulator",
  "externalId": "pos-tx-001",
  "occurredAt": "2026-06-17T22:15:00Z",
  "currency": "CLP",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 5000,
      "discountAmount": 0
    }
  ]
}
```

Response esperado:

```json
{
  "transactionId": "uuid",
  "status": "processed",
  "netTotal": 10000
}
```

Errores comunes:

- `400`: payload inválido o items vacíos.
- `401`: credenciales inválidas.
- `404`: evento, barra o producto inexistente.
- `409`: `externalId` duplicado.
- `422`: evento cerrado o producto inactivo.

Tablas que toca:

- `pos_ingestion_logs`
- `transactions`
- `transaction_items`
- `inventory`
- `audit_logs`

## POST /api/pos/replay

Objetivo: ejecutar replay de transacciones históricas o mock para una demo o prueba.

Request body esperado:

```json
{
  "organizationId": "uuid",
  "eventId": "uuid",
  "datasetId": "demo-event-001",
  "speed": "10x",
  "resetEventData": false
}
```

Response esperado:

```json
{
  "replayId": "uuid",
  "status": "started",
  "estimatedTransactions": 350
}
```

Errores comunes:

- `400`: dataset no especificado.
- `404`: evento o dataset inexistente.
- `409`: replay ya activo para el evento.
- `422`: evento no está en modo `simulated` o `historical`.

Tablas que toca:

- `pos_ingestion_logs`
- `transactions`
- `transaction_items`
- `inventory`
- `audit_logs`

## GET /api/events/:eventId/dashboard

Objetivo: entregar datos agregados para el dashboard de un evento.

Request esperado:

- Path param: `eventId`.
- Query opcional: `barId`, `from`, `to`.

Response esperado:

```json
{
  "event": {
    "id": "uuid",
    "name": "Evento demo",
    "status": "active",
    "dataMode": "simulated"
  },
  "kpis": {
    "estimatedIncrementalMargin": 0,
    "salesPerHour": 1200000,
    "grossSales": 8400000,
    "estimatedMargin": 3600000,
    "sellThrough": 0.58,
    "remainingStockUnits": 940
  },
  "slowProducts": [],
  "atRiskProducts": [],
  "recommendations": []
}
```

Errores comunes:

- `401`: usuario no autenticado.
- `403`: usuario sin acceso al evento.
- `404`: evento inexistente.

Tablas que toca:

- `events`
- `bars`
- `products`
- `inventory`
- `transactions`
- `transaction_items`
- `recommendations`

## POST /api/recommendations/run

Objetivo: ejecutar el motor de recomendaciones para un evento.

Request body esperado:

```json
{
  "organizationId": "uuid",
  "eventId": "uuid",
  "barId": "uuid",
  "mode": "manual",
  "includeLlmFormatting": true
}
```

Response esperado:

```json
{
  "runId": "uuid",
  "status": "completed",
  "recommendationsCreated": 3,
  "warnings": []
}
```

Errores comunes:

- `400`: `eventId` faltante.
- `403`: usuario sin permiso para ejecutar recomendaciones.
- `409`: run en curso para el mismo evento.
- `422`: faltan costos, inventario o transacciones suficientes.
- `500`: error del motor o formatter.

Tablas que toca:

- `recommendation_runs`
- `recommendations`
- `inventory`
- `transactions`
- `transaction_items`
- `products`
- `audit_logs`

## GET /api/recommendations

Objetivo: listar recomendaciones por evento, estado, barra o tipo.

Request esperado:

- Query: `eventId`.
- Query opcional: `status`, `barId`, `type`, `limit`.

Response esperado:

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "stock_risk",
      "status": "active",
      "priority": "high",
      "title": "Riesgo de sobrante en gin tonic lata",
      "summary": "Stock alto y rotación bajo objetivo.",
      "estimatedIncrementalMargin": 180000,
      "expiresAt": "2026-06-18T02:00:00Z"
    }
  ]
}
```

Errores comunes:

- `400`: `eventId` faltante.
- `403`: usuario sin acceso.
- `404`: evento inexistente.

Tablas que toca:

- `recommendations`
- `recommendation_runs`
- `products`
- `bars`

## POST /api/recommendations/:id/apply

Objetivo: marcar una recomendación como aplicada por un usuario.

Request body esperado:

```json
{
  "appliedByProfileId": "uuid",
  "note": "Se comunicó a zona norte priorizar cerveza premium."
}
```

Response esperado:

```json
{
  "id": "uuid",
  "status": "applied",
  "appliedAt": "2026-06-17T23:10:00Z"
}
```

Errores comunes:

- `403`: usuario sin permiso.
- `404`: recomendación inexistente.
- `409`: recomendación ya aplicada, descartada o expirada.

Tablas que toca:

- `recommendations`
- `offers`
- `audit_logs`

## POST /api/recommendations/:id/dismiss

Objetivo: descartar una recomendación y registrar motivo opcional.

Request body esperado:

```json
{
  "dismissedByProfileId": "uuid",
  "reason": "Stock reservado para after party."
}
```

Response esperado:

```json
{
  "id": "uuid",
  "status": "dismissed",
  "dismissedAt": "2026-06-17T23:12:00Z"
}
```

Errores comunes:

- `403`: usuario sin permiso.
- `404`: recomendación inexistente.
- `409`: recomendación ya aplicada, descartada o expirada.

Tablas que toca:

- `recommendations`
- `audit_logs`

