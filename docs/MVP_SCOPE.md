# MVP Scope

## Qué construiremos en V1

La V1 será una demo funcional end-to-end de revenue management para barras de eventos. Debe demostrar que el sistema puede convertir transacciones en KPIs y recomendaciones accionables.

Incluye:

- POS simulator con datos históricos o mock transactions.
- Ingesta de transacciones.
- Persistencia en Supabase.
- Cálculo de KPIs.
- Motor simple de recomendación.
- Llamada LLM para formatear recomendaciones.
- Dashboard con KPIs y recomendaciones.
- Logs de ejecución e ingesta.

## Qué queda fuera

La V1 no incluye:

- Ticketera completa.
- Venta real de entradas.
- Pagos reales con Mercado Pago.
- QR de acceso.
- App consumidor final.
- Promociones automáticas ejecutadas sin aprobación humana.
- Predicción compleja de demanda.
- Pricing dinámico totalmente autónomo.
- Integración directa con POS real salvo que aparezca una oportunidad simple y acotada.

## Qué puede simularse

- Transacciones POS.
- Replays de eventos.
- Usuarios operativos.
- Cambios de stock.
- Aplicación manual de recomendaciones.
- Datos históricos de venta, siempre marcados como simulados o importados.

## Qué debe funcionar de punta a punta

1. Crear/configurar un evento demo.
2. Cargar productos, precios, costos e inventario inicial.
3. Enviar transacciones desde el POS simulator.
4. Persistir transacciones y detalle.
5. Calcular KPIs de ventas, margen, stock y rotación.
6. Ejecutar el recommendation engine.
7. Generar recomendaciones estructuradas con evidencia.
8. Formatear texto con LLM sin inventar métricas.
9. Mostrar dashboard con KPIs y recomendaciones.
10. Aplicar o descartar recomendaciones.
11. Registrar logs y auditoría.

## Demo exitosa

Una demo exitosa muestra un evento con datos simulados, barras, productos e inventario. A medida que entran transacciones, el dashboard cambia y el motor detecta oportunidades.

La demo debe poder responder:

- Qué producto está generando mayor margen.
- Qué producto se vende lento.
- Qué producto corre riesgo de sobrante.
- Qué producto no debería descontarse.
- Qué recomendación tiene mayor prioridad.
- Qué evidencia justifica la recomendación.
- Qué pasó cuando el usuario aplicó o descartó la recomendación.

## Criterio de acotamiento

Si una funcionalidad no ayuda a demostrar transacciones, KPIs, recomendación y decisión humana, queda fuera de V1.

## Supuestos iniciales

- La productora puede entregar costos aproximados por SKU.
- El inventario inicial por barra puede cargarse manualmente.
- Los datos POS reales se simularán al inicio.
- El margen incremental estimado será una métrica de oportunidad, no una garantía.
- La decisión final siempre queda en manos de una persona.

