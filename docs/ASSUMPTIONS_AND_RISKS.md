# Assumptions and Risks

## Supuestos del MVP

- La productora puede entregar una lista de productos, precios y costos aproximados.
- El inventario inicial por evento o barra puede cargarse manualmente.
- Las transacciones POS pueden simularse de forma suficientemente realista para validar el flujo.
- El usuario objetivo valora recomendaciones explicables más que automatización autónoma.
- El margen incremental estimado se tratará como oportunidad, no como promesa.
- Supabase es suficiente para la primera versión en datos, auth, RLS y funciones.
- La aprobación humana es obligatoria para acciones comerciales.

## Riesgos técnicos

- Modelar mal la relación entre evento, barra, producto e inventario puede dificultar reportes posteriores.
- La ingesta POS puede traer duplicados, reversas, descuentos o formatos inesperados.
- El cálculo de inventario puede desalinearse si existen ventas offline o ajustes manuales no registrados.
- Las RLS policies pueden bloquear flujos legítimos o exponer datos si se diseñan sin pruebas.
- El LLM puede introducir frases no deseadas si no se controla con schema y prompts versionados.

Mitigación:

- Mantener contratos claros.
- Registrar logs de ingesta.
- Guardar snapshots de costo/precio en transacciones.
- Escribir reglas simples antes de optimizar.
- Testear RLS desde el inicio.

## Riesgos de datos

- Costos por SKU incompletos.
- Inventario inicial incorrecto.
- Productos mal mapeados entre POS y catálogo interno.
- Descuentos no reflejados correctamente.
- Datos simulados que parezcan reales.

Mitigación:

- Marcar `data_mode` por evento.
- Bloquear recomendaciones de margen si faltan costos.
- Mostrar advertencias de calidad de datos.
- Mantener importación y mapeo auditables.

## Riesgos comerciales

- El usuario puede esperar una ticketera completa demasiado pronto.
- La promesa de "IA" puede distraer del valor operativo real.
- El margen incremental estimado puede interpretarse como garantía.
- El comprador puede pedir automatizaciones antes de validar confianza.

Mitigación:

- Comunicar que el MVP es revenue management de barra, no ticketera.
- Mostrar evidencia y límites de cada recomendación.
- Usar lenguaje de estimación y oportunidad.
- Mantener aprobación humana.

## Riesgos operativos en evento

- El productor puede no tener una lectura suficientemente clara durante el evento.
- Una recomendación puede llegar tarde si el evento cambia rápido.
- Una oferta puede afectar logística, filas o percepción de precios.
- El equipo puede no ejecutar una recomendación aunque la marque aplicada.

Mitigación:

- Microcopy breve.
- Prioridad clara.
- Expiración de recomendaciones.
- Registro de aplicación manual y notas.
- Recomendaciones con ventana de acción.

## Qué hay que validar con datos reales

- Umbrales de rotación lenta por categoría.
- Margen mínimo aceptable por producto.
- Ritmo de venta por hora según tipo de evento.
- Relación entre oferta manual y venta incremental.
- Calidad de inventario inicial.
- Disposición del equipo a aplicar recomendaciones en vivo.

## Cómo evitar overengineering

- No crear una ticketera antes de validar la capa de barra.
- No implementar pricing autónomo en V1.
- No construir modelos predictivos complejos sin datos reales.
- No diseñar integraciones POS múltiples antes de un primer flujo estable.
- No convertir el dashboard en una suite administrativa completa.
- Priorizar un evento demo end-to-end sobre muchas pantallas incompletas.

## Cómo evitar que la IA sea decorativa

- El motor de negocio debe generar la recomendación estructurada antes del LLM.
- El LLM debe recibir métricas ya calculadas y evidencia.
- El output debe tener schema controlado.
- Cada recomendación debe poder explicarse sin el LLM.
- Si faltan datos, la IA no debe rellenar espacios.
- La interfaz debe hablar de decisiones, margen e inventario antes que de IA.

## Riesgo principal

El riesgo principal es construir una apariencia de dashboard inteligente sin demostrar una decisión mejor. La V1 debe enfocarse en una cadena simple y verificable:

transacción -> KPI -> oportunidad -> recomendación -> decisión humana -> log.

