# Product Spec

## Personas

### Productor

Responsable del resultado comercial del evento. Necesita visibilidad de margen, ventas, stock restante y oportunidades mientras todavía hay tiempo para actuar.

### Jefe de barra

Responsable de la operación en terreno. Necesita recomendaciones simples, priorizadas y aplicables: qué producto empujar, qué producto no tocar, dónde hay riesgo y qué acción requiere aprobación.

### Bartender/admin

Usuario operativo que puede registrar movimientos, validar ventas, reportar stock o ejecutar instrucciones comerciales. En la V1 su rol puede ser simulado o limitado a lectura/validación.

## Casos de uso

- Monitorear el margen estimado de un evento en vivo.
- Detectar productos con baja rotación y alto stock restante.
- Evitar descuentos innecesarios sobre productos que ya se venden rápido.
- Priorizar productos con buen margen y ritmo bajo.
- Ejecutar un replay de ventas históricas para probar recomendaciones.
- Registrar si una recomendación fue aplicada o descartada.
- Revisar logs para explicar por qué se generó una recomendación.

## Jobs-to-be-done

- Cuando estoy operando una barra en un evento, quiero saber qué productos necesitan acción comercial para reducir sobrantes y proteger margen.
- Cuando veo ventas subir, quiero distinguir si el aumento mejora margen o solo mueve productos de baja rentabilidad.
- Cuando queda stock alto de un SKU lento, quiero una recomendación concreta con límites de descuento y motivo.
- Cuando recibo una recomendación, quiero entender la evidencia para confiar o descartarla rápido.
- Cuando termina el evento, quiero revisar qué recomendaciones se aplicaron y qué impacto pudieron tener.

## Flujo usuario-producto

1. El usuario entra al dashboard de un evento.
2. Ve KPIs principales: margen estimado, ventas por hora, stock restante, sell-through y alertas.
3. Revisa recomendaciones activas ordenadas por prioridad.
4. Abre una recomendación para ver evidencia: SKU, stock, rotación, margen, ventana de tiempo e impacto estimado.
5. Decide aplicar o descartar.
6. El sistema registra estado, usuario, timestamp y razón opcional.
7. En el reporte posterior, el usuario revisa adopción y resultados.

## Reglas del negocio

- Ninguna recomendación puede ocultar la evidencia que la generó.
- El sistema no debe recomendar descuentos si el producto ya tiene alta rotación y stock bajo control.
- Las recomendaciones deben proteger un margen mínimo configurable por producto o categoría.
- El impacto estimado debe marcarse como estimación, no como resultado real.
- Las acciones comerciales requieren aprobación humana.
- Los datos simulados deben identificarse claramente.
- Si faltan costos, inventario o precios, el motor debe degradar con advertencia en vez de inventar valores.

## Tipos de recomendaciones

- Oferta controlada: sugerir una promoción manual para mover stock lento sin romper margen mínimo.
- Empuje operativo: recomendar priorizar un SKU en barra o comunicación interna.
- No descontar: bloquear o advertir contra descuentos en productos que ya rotan bien.
- Alerta de sobrante: detectar alto stock restante con baja venta proyectada.
- Alerta de margen: detectar SKUs con venta alta pero contribución baja.
- Reposición o redistribución: sugerir mover stock entre barras si una zona vende más rápido que otra.

## Estados de una recomendación

- `draft`: generada por el motor, aún no visible o pendiente de revisión.
- `active`: visible para el usuario y disponible para acción.
- `dismissed`: descartada por el usuario.
- `applied`: marcada como aplicada por el usuario.
- `expired`: ya no aplica por tiempo, stock o cambio de condiciones.

## Ejemplos reales de recomendaciones

### Riesgo de sobrante

Producto: gin tonic lata.

Evidencia: 68% de stock restante, venta promedio de 9 unidades por hora, evento con 90 minutos restantes. Margen unitario positivo, pero ritmo insuficiente para vender stock objetivo.

Acción sugerida: activar oferta manual 2 por precio controlado durante 45 minutos, solo si el margen mínimo configurado se mantiene.

### No descontar

Producto: agua sin gas.

Evidencia: sell-through alto, stock restante dentro de rango y rotación superior al promedio de barra.

Acción sugerida: no aplicar descuento. Mantener precio y priorizar disponibilidad.

### Empuje de margen

Producto: cerveza premium.

Evidencia: margen por unidad alto, stock suficiente y rotación media. Puede capturar mayor contribución si se prioriza en barra principal.

Acción sugerida: instruir a barra principal a ofrecer este SKU como primera alternativa durante la próxima hora.

