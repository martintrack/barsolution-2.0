# Project Plan

## Resumen ejecutivo

Kobra será una plataforma de inteligencia comercial para barras de eventos. Su primera versión se enfocará en recibir o simular transacciones de barra, persistirlas, calcular KPIs de margen e inventario y generar recomendaciones accionables para mejorar la operación durante el evento.

El producto debe ser defendible técnicamente: la lógica financiera vive en reglas y cálculos auditables; el LLM solo convierte evidencia estructurada en comunicación clara.

## Problema

Las productoras suelen tener información fragmentada sobre ventas de barra, stock y costos. Incluso cuando existe POS o ticketera, los datos no siempre se transforman en decisiones operativas a tiempo. Esto genera tres pérdidas frecuentes:

- Productos de baja rotación que quedan como sobrante.
- Descuentos aplicados a productos que no necesitaban incentivo.
- Falta de priorización entre margen, velocidad de venta y stock disponible.

## Solución

Construir una capa de revenue management para barras que:

- Ingesta transacciones desde un POS simulado o webhook futuro.
- Consolida ventas, productos, costos e inventario.
- Calcula KPIs por evento, barra, SKU y franja horaria.
- Detecta oportunidades con reglas explícitas.
- Genera recomendaciones con evidencia, impacto estimado y acción sugerida.
- Muestra el estado en un dashboard táctico para decisiones en vivo.

## Usuario objetivo

- Productor: busca maximizar margen y entender el resultado comercial del evento.
- Jefe de barra: necesita decidir qué empujar, qué cuidar y dónde ajustar operación.
- Bartender/admin: registra, valida o supervisa ventas e inventario según el flujo operativo.

## Flujo principal del MVP

1. Se crea una organización y un evento.
2. Se configuran barras, productos, costos, precios e inventario inicial.
3. El simulador POS envía transacciones al backend.
4. El backend valida y persiste las transacciones.
5. El sistema recalcula KPIs de venta, margen, stock y rotación.
6. El motor de recomendaciones detecta oportunidades.
7. El LLM formatea las recomendaciones a lenguaje claro y accionable.
8. El dashboard muestra KPIs, alertas y recomendaciones.
9. El usuario aplica o descarta una recomendación.
10. El sistema registra la decisión para análisis posterior.

## Alcance de la primera versión

La V1 debe demostrar un flujo completo con datos simulados o históricos:

- Ingesta POS.
- Persistencia en Supabase.
- Dashboard básico por evento.
- KPIs comerciales.
- Recomendaciones simples, explicables y auditables.
- Registro de logs y decisiones.

## Éxito esperado

Una demo exitosa permite mirar un evento, entender su estado comercial y recibir recomendaciones concretas como:

- "Empujar cerveza premium en zona norte durante los próximos 45 minutos."
- "No descontar agua: rotación alta y stock controlado."
- "Riesgo de sobrante en energéticas: revisar oferta manual con margen mínimo protegido."

El éxito no se medirá por la sofisticación del modelo, sino por claridad operativa, trazabilidad y potencial de margen incremental.

## Entregables

- Estructura base del repositorio.
- Documentación de producto, arquitectura, datos, API, diseño, roadmap y riesgos.
- Preparación para Next.js y Supabase sin inicializar frameworks todavía.
- Base conceptual para iniciar backend y frontend en fases separadas.

## Hitos por fase

- Fase 0: Documentación y arquitectura.
- Fase 1: Schema Supabase y RLS preliminar.
- Fase 2: POS simulator y replay de transacciones.
- Fase 3: Ingesta y persistencia.
- Fase 4: KPIs y recommendation engine.
- Fase 5: LLM formatter con prompts controlados.
- Fase 6: Dashboard básico.
- Fase 7: Demo end-to-end con evento histórico o simulado.
- Fase 8: Piloto real con una productora.

