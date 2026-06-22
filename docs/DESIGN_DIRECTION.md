# Design Direction

## Principio central

Kobra debe sentirse como un sistema operativo comercial para eventos: sobrio, táctico, moderno y orientado a decisiones. La interfaz debe parecer una herramienta real de control room de barra, no una landing genérica de software ni un juguete de IA.

El mensaje visual debe ser: no solo vendes, decides mejor durante el evento.

## Personalidad visual

- Premium sin lujo decorativo.
- Técnica sin verse fría.
- Comercial sin sonar publicitaria.
- Operativa, directa y confiable.
- Diseñada para leer señales en tiempo real.

## Restricciones explícitas

No usar:

- Emojis.
- AI pill en el hero.
- Frases como "Powered by AI", "Unlock the power of AI", "Revolutionize your business with AI" o similares.
- Robot icons, brain icons, magic wand icons, sparkles genéricos ni íconos obvios de IA.
- Layout típico de hero centrado, gradiente morado/azul, tres cards, pricing y testimonios falsos.
- Bento grid genérico sin relación con datos reales del producto.
- Glassmorphism excesivo.
- Mockups falsos de dashboard con números sin sentido.
- Logos falsos de empresas.
- Stock photos.
- Colores neón obvios de startup AI.
- Íconos genéricos por defecto sin criterio.
- "Inter + gradiente + cards redondeadas" como solución automática.

## Paleta inicial

La paleta debe combinar operación nocturna, lectura comercial y señales tácticas sin caer en azul/morado startup.

- Fondo base: `#10110F` negro cálido operativo.
- Superficie principal: `#181A17` grafito oliva.
- Superficie elevada: `#22251F`.
- Línea/borde: `#34382F`.
- Texto principal: `#F4F1E8` marfil técnico.
- Texto secundario: `#B8B4A8`.
- Texto terciario: `#7F8278`.
- Acción principal: `#D6B25E` ámbar margen.
- Señal positiva: `#6FA77A` verde inventario sano.
- Alerta: `#C46A4A` cobre riesgo.
- Información: `#7B9AA6` azul acero desaturado.

Uso:

- El ámbar debe reservarse para acciones, margen y oportunidades.
- El cobre debe comunicar riesgo o urgencia, no decoración.
- El verde debe comunicar estado sano o recomendación aplicada.
- Evitar superficies con demasiada saturación.

## Sistema tipográfico

Dirección:

- Sans serif moderna, seria y legible.
- Opciones razonables: `Geist`, `Suisse Int'l`, `Akkurat`, `IBM Plex Sans`, `Neue Haas Grotesk` o fallback `system-ui`.
- Tamaños en `rem`, no `px`.
- Letter spacing en `0`, salvo labels técnicos muy pequeños donde se puede evaluar con cuidado.
- Jerarquía editorial fuerte, pero sin titulares exagerados.
- Dashboard optimizado para lectura rápida.

Escala sugerida:

- Display: `3rem` a `4.5rem` solo en hero.
- H1 app: `2rem` a `2.5rem`.
- H2 sección: `1.5rem` a `2rem`.
- Métrica principal: `2.25rem` a `3rem`.
- Body: `1rem`.
- Small/meta: `0.8125rem` a `0.875rem`.

## Estilo de íconos

- Íconos lineales custom o muy seleccionados.
- Trazo consistente, sin rellenos decorativos.
- Inspiración visual: rutas de flujo, barras de inventario, puntos de venta, corte de caja, timeline operativo.
- Evitar símbolos obvios de IA.
- Si se usa una librería futura, limitarla a acciones funcionales y mantener coherencia.

## Layout de landing

La landing debe abrir como una herramienta en operación, no como promesa abstracta.

Hero sugerido:

- Primera pantalla con una escena de dashboard realista construida con datos etiquetados como demo.
- Señales visibles: margen estimado, ritmo de ventas, stock en riesgo, recomendación activa y evidencia.
- Headline sobrio: "Control comercial para barras de eventos".
- Subcopy: "Convierte ventas, stock y margen en decisiones aplicables durante el evento."
- CTA: "Ver flujo del MVP" o "Revisar arquitectura".
- Sin cards flotantes excesivas; usar layout de panel operativo.

Secciones posteriores:

- Problema operativo.
- Cómo fluye una transacción hasta una recomendación.
- Qué calcula el motor.
- Qué rol cumple el LLM.
- Alcance del MVP.
- Roadmap técnico.

## Layout de dashboard

El dashboard debe priorizar lectura y acción.

Estructura sugerida:

- Header compacto con evento, estado, modo de datos y última actualización.
- Banda superior de KPIs: margen estimado, ventas por hora, sell-through, stock en riesgo.
- Columna principal: recomendaciones activas ordenadas por prioridad.
- Panel lateral: productos lentos, productos a no descontar, logs recientes.
- Vista de detalle: evidencia, regla disparada, impacto estimado y acciones.

Estados clave:

- Sin datos.
- Datos simulados.
- Evento activo.
- Evento cerrado.
- Recomendación expirada.
- Error de ingesta.
- Faltan costos o inventario.

## Componentes principales

- `MetricTile`: métrica con valor, tendencia, fuente y estado.
- `RecommendationCard`: recomendación con prioridad, acción y evidencia mínima.
- `EvidenceTable`: datos que justifican una recomendación.
- `InventoryRiskRow`: SKU, stock, sell-through, ritmo y riesgo.
- `EventStatusBar`: estado del evento y modo de datos.
- `DecisionLog`: historial de acciones aplicadas o descartadas.
- `RunStatus`: estado de ejecución del recommendation engine.
- `DataModeBadge`: `simulated`, `historical` o `live`, sin estética de AI pill.

## Microcopy bueno

- "Stock alto, rotación baja. Requiere acción antes de 00:30."
- "No descontar: venta sobre objetivo y margen protegido."
- "Oportunidad estimada, pendiente de aprobación."
- "Faltan costos para calcular margen. Recomendación bloqueada."
- "Datos simulados para demo; no representan resultado real."
- "Aplicar como instrucción manual de barra."

## Microcopy malo

- "Nuestra IA revoluciona tus eventos."
- "Desbloquea el poder de la inteligencia artificial."
- "Oferta mágica recomendada."
- "Aumenta tus ingresos garantizado."
- "Dashboard inteligente con insights increíbles."
- "Los números hablan solos."

## Criterio de calidad visual

Antes de avanzar a frontend, validar:

- El producto se entiende sin explicación oral.
- La pantalla parece una herramienta operativa real.
- Los números tienen fuente, estado o etiqueta de supuesto.
- La IA no domina el relato.
- La interfaz evita clichés SaaS/AI.
- Las decisiones tienen evidencia visible.

