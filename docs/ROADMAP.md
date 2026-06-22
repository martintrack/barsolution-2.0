# Roadmap

## Fase 0: Documentación y arquitectura

Objetivo: dejar el proyecto entendible, defendible y listo para implementación.

Entregables:

- README.
- Plan de proyecto.
- Product spec.
- Arquitectura.
- Modelo de datos draft.
- Contrato API draft.
- Dirección visual.
- Alcance MVP.
- Riesgos y supuestos.

## Fase 1: Supabase schema

Objetivo: crear la base de datos inicial con RLS preliminar.

Entregables:

- Migraciones SQL.
- Tablas base.
- Policies por organización.
- Seed de evento demo.

## Fase 2: POS simulator

Objetivo: generar transacciones reproducibles para pruebas y demos.

Entregables:

- Dataset demo.
- Generador de transacciones.
- Replay controlado por velocidad.
- Logs de envío.

## Fase 3: Recommendation engine

Objetivo: calcular KPIs y detectar oportunidades con reglas explicables.

Entregables:

- Cálculo de ventas por hora.
- Margen por SKU.
- Sell-through.
- Riesgo de sobrante.
- Reglas de recomendación.
- Estructura de evidencia.

## Fase 4: LLM formatter

Objetivo: transformar recomendaciones estructuradas en texto claro.

Entregables:

- Prompt versionado.
- Schema de entrada/salida.
- Guardrails contra invención de métricas.
- Tests con casos de recomendación.

## Fase 5: Dashboard básico

Objetivo: mostrar KPIs y recomendaciones de forma operativa.

Entregables:

- Layout de dashboard.
- KPIs principales.
- Lista de recomendaciones.
- Detalle con evidencia.
- Acciones aplicar/descartar.

## Fase 6: Replay de evento histórico

Objetivo: reproducir un evento completo para demo y validación.

Entregables:

- Replay acelerado.
- Cambios de KPIs en el tiempo.
- Recomendaciones generadas durante la simulación.

## Fase 7: Métricas y reporte

Objetivo: analizar resultados del evento y adopción de recomendaciones.

Entregables:

- Reporte post evento.
- Recomendaciones aplicadas vs descartadas.
- Margen incremental estimado.
- Productos con sobrante y rotación.

## Fase 8: Piloto real

Objetivo: validar con una productora y datos reales o semi reales.

Entregables:

- Carga de datos reales.
- Validación operativa.
- Ajuste de reglas.
- Feedback de usuarios.

## Fase 9: Integración POS/pagos futura

Objetivo: conectar fuentes reales si el MVP valida valor.

Entregables:

- Webhook POS real.
- Importador de ventas.
- Mapeo de productos externos.
- Manejo de duplicados y reversas.

## Fase 10: Ticketera futura

Objetivo: evaluar ticketera solo si el sistema de barra valida valor suficiente.

Entregables posibles:

- Venta de entradas.
- QR de acceso.
- Pagos.
- App consumidor final.

Esta fase no debe adelantarse en V1.

