# Kobra

Kobra es una plataforma para productoras de eventos que necesitan tomar mejores decisiones comerciales durante la operación de barras. El foco inicial no es vender entradas ni reemplazar una ticketera, sino convertir las ventas de barra en señales accionables sobre margen, inventario, rotación y stock en riesgo.

## Problema que resuelve

En eventos masivos, la barra suele operar con mucha presión y poca visibilidad en tiempo real. Las decisiones comerciales se toman tarde, por intuición o mirando reportes parciales: qué producto empujar, qué stock no conviene descontar, qué SKU puede sobrar, qué margen se está perdiendo y dónde hay una oportunidad real de venta.

Kobra busca transformar transacciones de barra en recomendaciones operativas defendibles, basadas en reglas de negocio, KPIs y datos del evento.

## Para quién es

El producto está pensado para:

- Productoras de eventos que gestionan ingresos de barra.
- Jefes de barra que necesitan operar con inventario, ritmo de venta y margen bajo control.
- Equipos administrativos que consolidan ventas, stock, costos y resultados post evento.

## Qué se construirá primero

La primera versión será un MVP de revenue management para barras:

- Simulador POS con transacciones históricas o mock.
- Ingesta de transacciones como si vinieran desde un POS o ticketera.
- Persistencia de ventas e inventario en Supabase.
- Cálculo de KPIs comerciales y operativos.
- Motor simple de recomendaciones explicables.
- Formateo de recomendaciones con LLM.
- Dashboard básico con KPIs, alertas y recomendaciones.
- Logs de ingesta y ejecución.

## Qué no se construirá todavía

La V1 no incluirá:

- Ticketera completa.
- Venta real de entradas.
- Pagos reales con Mercado Pago u otros PSP.
- QR de acceso.
- App para consumidor final.
- Promociones automáticas sin aprobación humana.
- Predicción compleja de demanda.
- Pricing dinámico totalmente autónomo.

## División frontend/backend

El repositorio se divide en dos áreas principales:

- `frontend`: futuro frontend preparado para Next.js. Contendrá la experiencia de dashboard, componentes de marketing sobrio, componentes de operación y estilos base.
- `backend`: servicios de ingesta, Supabase, funciones, prompts, simulador POS y motor de recomendaciones.

La separación debe permitir evolucionar backend y frontend por separado, mantener contratos API claros y evitar que la UI contenga lógica financiera crítica.

## Uso de Supabase

Supabase será la base operativa del MVP:

- Base de datos Postgres para organizaciones, eventos, barras, productos, inventario, transacciones y recomendaciones.
- Row Level Security para separar datos por organización.
- Edge Functions o backend API para ingesta, replay de datos y ejecución de recomendaciones.
- Logs persistentes para auditar ingesta POS, errores y decisiones generadas.

## Uso de IA

La IA no será el cerebro financiero del sistema. La lógica crítica debe vivir en un motor de negocio explicable que calcule indicadores, detecte oportunidades y genere una estructura base de recomendación.

El LLM se usará para transformar esa estructura en mensajes claros, accionables y consistentes para el productor. Debe recibir datos ya calculados, límites explícitos y evidencia. No debe inventar métricas ni tomar decisiones autónomas.

## Qué significa revenue management para barras

Revenue management para barras significa optimizar el resultado comercial del evento mientras todavía se puede actuar. No se trata solo de vender más unidades: se trata de proteger margen, acelerar productos lentos, evitar sobrantes costosos, no descontar SKUs que ya rotan bien y priorizar acciones con impacto estimado.

## Métricas

Métrica principal:

- Margen incremental estimado por evento.

Métricas secundarias:

- Ventas por hora.
- Margen por SKU.
- Stock restante.
- Sell-through.
- Productos lentos.
- Productos con riesgo de sobrante.
- Adopción de recomendaciones.

Todas las métricas iniciales deben marcar claramente si son reales, simuladas o supuestos de demo.

## Estado actual

Fase inicial de planificación técnica. Este repositorio contiene la base documental, la estructura de carpetas y los contratos preliminares para avanzar luego con Supabase, backend, simulador POS, motor de recomendaciones y frontend.

