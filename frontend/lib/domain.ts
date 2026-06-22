import type { ChartSeries, DashboardSnapshot, InventoryRisk, Kpi, MetricasSnapshot, Recommendation, SkuHourlySeries, SkuMetric } from "./types";

export type EventInput = {
  name: string;
  status: string;
  window: string;
  updatedAt: string;
  hoursRemaining: number;
  mode?: string;
};

export type ProductTelemetry = {
  id: string;
  name: string;
  category: string;
  zone: string;
  startingStock: number;
  currentStock: number;
  unitsSold: number;
  unitPrice: number;
  unitCost: number;
  targetSellThrough: number;
  velocityLastHour: number;
};

type ProductScore = ProductTelemetry & {
  revenue: number;
  grossMargin: number;
  unitMargin: number;
  sellThrough: number;
  projectedLeftover: number;
  projectedLeftoverValue: number;
  riskScore: number;
};

const moneyFormatter = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency"
});

const unitMoneyFormatter = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  style: "currency"
});

const integerFormatter = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 0
});

export function buildDashboardSnapshot(event: EventInput, products: ProductTelemetry[]): DashboardSnapshot {
  const scoredProducts = products.map((product) => scoreProduct(product, event.hoursRemaining));
  const totalSales = sum(scoredProducts.map((product) => product.revenue));
  const totalMargin = sum(scoredProducts.map((product) => product.grossMargin));
  const leftoverUnits = sum(scoredProducts.map((product) => product.projectedLeftover));
  const leftoverRiskValue = sum(scoredProducts.map((product) => product.projectedLeftoverValue));
  const incrementalMargin = estimateIncrementalMargin(scoredProducts);
  const marginRate = totalSales > 0 ? totalMargin / totalSales : 0;

  const producerKpis: Kpi[] = [
    {
      label: "Margen incremental estimado",
      value: formatMoney(incrementalMargin),
      detail: "Oportunidad proyectada para este evento.",
      tone: "primary"
    },
    {
      label: "Venta total barra",
      value: formatMoney(totalSales),
      detail: "Acumulado demo del evento."
    },
    {
      label: "Sobrante estimado",
      value: `${integerFormatter.format(leftoverUnits)} u.`,
      detail: "Stock proyectado al cierre.",
      tone: "risk"
    },
    {
      label: "Margen promedio",
      value: formatPercent(marginRate),
      detail: "Promedio ponderado por venta.",
      tone: "positive"
    }
  ];

  return {
    eventSummary: {
      name: event.name,
      status: event.status,
      window: event.window,
      mode: event.mode ?? "Datos demo",
      updatedAt: event.updatedAt,
      executiveSummary: `${formatMoney(incrementalMargin)} de margen incremental estimado`
    },
    producerKpis,
    financialSummary: {
      sales: formatMoney(totalSales),
      margin: formatMoney(totalMargin),
      leftoverRisk: formatMoney(leftoverRiskValue)
    },
    recommendations: buildRecommendations(scoredProducts),
    inventoryRisks: buildInventoryRisks(scoredProducts),
    chartSeries: buildChartSeries(scoredProducts),
    commercialSignals: [
      { time: event.updatedAt, text: "Cerveza premium sostiene margen sobre objetivo." },
      { time: "23:40", text: "Agua sin gas rota bien: no requiere descuento." },
      { time: "23:38", text: "Gin tonic lata proyecta sobrante al cierre." }
    ],
    decisionLog: [
      { time: "23:31", text: "\"No descontar agua\" protege margen unitario." },
      { time: "23:22", text: "Oferta de energetica descartada por bajo impacto." },
      { time: "23:10", text: "Run #024 priorizo oportunidades por margen." }
    ]
  };
}

function scoreProduct(product: ProductTelemetry, hoursRemaining: number): ProductScore {
  const unitMargin = product.unitPrice - product.unitCost;
  const revenue = product.unitsSold * product.unitPrice;
  const grossMargin = product.unitsSold * unitMargin;
  const sellThrough = product.startingStock > 0 ? product.unitsSold / product.startingStock : 0;
  const projectedLeftover = Math.max(0, Math.round(product.currentStock - product.velocityLastHour * hoursRemaining));
  const projectedLeftoverValue = projectedLeftover * product.unitCost;
  const sellThroughGap = Math.max(0, product.targetSellThrough - sellThrough);
  const riskScore = sellThroughGap * 100 + projectedLeftover / Math.max(product.startingStock, 1) * 100;

  return {
    ...product,
    revenue,
    grossMargin,
    projectedLeftover,
    projectedLeftoverValue,
    riskScore,
    sellThrough,
    unitMargin
  };
}

function buildRecommendations(products: ProductScore[]): Recommendation[] {
  const risk = [...products].sort((a, b) => b.riskScore - a.riskScore)[0];
  const protect = products.find((product) => product.sellThrough >= product.targetSellThrough && product.currentStock < product.startingStock * 0.35);
  const push = [...products]
    .filter((product) => product.currentStock > product.startingStock * 0.35)
    .sort((a, b) => b.unitMargin - a.unitMargin)[0];

  return [
    {
      id: "rec-risk",
      type: "Riesgo alto",
      title: `Activar oferta controlada para ${risk.name.toLowerCase()}`,
      summary: `${formatPercent(1 - risk.sellThrough)} de stock relativo aun disponible con venta bajo objetivo. Ventana sugerida: 45 minutos.`,
      priority: "high",
      estimatedMargin: formatMoney(Math.max(0, risk.projectedLeftover * risk.unitMargin * 0.42)),
      evidence: [
        { label: "Stock restante", value: formatPercent(risk.currentStock / risk.startingStock) },
        { label: "Venta por hora", value: `${integerFormatter.format(risk.velocityLastHour)} u.` },
        { label: "Margen unitario", value: formatUnitMoney(risk.unitMargin) },
        { label: "Sobrante proyectado", value: `${integerFormatter.format(risk.projectedLeftover)} u.` }
      ]
    },
    {
      id: "rec-protect",
      type: "Proteger margen",
      title: protect ? `No descontar ${protect.name.toLowerCase()}` : "No descontar productos con rotacion sana",
      summary: "Sell-through alto, stock controlado y rotacion sobre promedio.",
      priority: "medium",
      estimatedMargin: formatMoney((protect?.unitMargin ?? 900) * 42),
      evidence: protect ? [
        { label: "Sell-through", value: formatPercent(protect.sellThrough) },
        { label: "Stock restante", value: formatPercent(protect.currentStock / protect.startingStock) },
        { label: "Margen unitario", value: formatUnitMoney(protect.unitMargin) }
      ] : []
    },
    {
      id: "rec-push",
      type: "Empuje comercial",
      title: push ? `Priorizar ${push.name.toLowerCase()} en zona ${push.zone.toLowerCase()}` : "Priorizar SKU de mayor margen",
      summary: "Margen unitario alto y stock suficiente. Recomendacion valida hasta 00:20.",
      priority: "medium",
      estimatedMargin: formatMoney((push?.unitMargin ?? 1200) * 26),
      evidence: push ? [
        { label: "Stock restante", value: `${integerFormatter.format(push.currentStock)} u.` },
        { label: "Margen unitario", value: formatUnitMoney(push.unitMargin) },
        { label: "Sell-through", value: formatPercent(push.sellThrough) }
      ] : []
    }
  ];
}

function buildInventoryRisks(products: ProductScore[]): InventoryRisk[] {
  return [...products]
    .sort((a, b) => b.riskScore - a.riskScore)
    .map((product) => ({
      product: product.name,
      zone: product.zone,
      stock: `${integerFormatter.format(product.currentStock)} u.`,
      sellThrough: formatPercent(product.sellThrough),
      margin: formatUnitMoney(product.unitMargin),
      status: getInventoryStatus(product)
    }));
}

function buildChartSeries(products: ProductScore[]): ChartSeries[] {
  const topProducts = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 3);
  const tones: ChartSeries["tone"][] = ["amber", "steel", "copper"];

  return topProducts.map((product, index) => ({
    label: product.name,
    tone: tones[index],
    points: buildTrend(product)
  }));
}

function buildTrend(product: ProductScore): number[] {
  const base = Math.max(8, product.velocityLastHour);
  const riskDrag = product.riskScore > 45 ? 0.74 : 1.04;

  return [0.7, 0.82, 0.94, 0.88, 1.08, riskDrag, 1.12].map((multiplier) => {
    return Math.round(base * product.unitMargin * multiplier);
  });
}

function getInventoryStatus(product: ProductScore) {
  if (product.riskScore > 44) return "Riesgo alto";
  if (product.sellThrough >= product.targetSellThrough && product.currentStock < product.startingStock * 0.35) return "No descontar";
  if (product.unitMargin > 1500 && product.currentStock > product.startingStock * 0.35) return "Empujar";
  return "Observar";
}

function estimateIncrementalMargin(products: ProductScore[]) {
  return sum(products.map((product) => Math.max(0, product.projectedLeftover * product.unitMargin * 0.24)));
}

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatUnitMoney(value: number) {
  return unitMoneyFormatter.format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function buildMetricasSnapshot(event: EventInput, products: ProductTelemetry[]): MetricasSnapshot {
  const scored = products.map((p) => scoreProduct(p, event.hoursRemaining));

  const skuMetrics: SkuMetric[] = scored.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    zone: p.zone,
    revenue: p.revenue,
    revenueFormatted: formatMoney(p.revenue),
    grossMargin: p.grossMargin,
    grossMarginFormatted: formatMoney(p.grossMargin),
    marginRate: p.revenue > 0 ? p.grossMargin / p.revenue : 0,
    marginRateFormatted: formatPercent(p.revenue > 0 ? p.grossMargin / p.revenue : 0),
    sellThrough: p.sellThrough,
    sellThroughFormatted: formatPercent(p.sellThrough),
    targetSellThrough: p.targetSellThrough,
    targetSellThroughFormatted: formatPercent(p.targetSellThrough),
    sellThroughGap: Math.max(0, p.targetSellThrough - p.sellThrough),
    currentStock: p.currentStock,
    projectedLeftover: p.projectedLeftover,
    projectedLeftoverValue: p.projectedLeftoverValue,
    projectedLeftoverValueFormatted: formatMoney(p.projectedLeftoverValue),
    velocityLastHour: p.velocityLastHour,
    unitMargin: p.unitMargin,
    unitMarginFormatted: formatUnitMoney(p.unitMargin),
    status: getInventoryStatus(p),
    riskScore: p.riskScore
  }));

  const tones: ChartSeries["tone"][] = ["amber", "steel", "copper", "amber"];
  const hourlySeries: SkuHourlySeries[] = scored.map((p, i) => {
    const rampPattern = [0.6, 0.8, 1.0, 1.15, 1.05, 0.9];
    const weightSum = rampPattern.reduce((a, b) => a + b, 0);
    const hours = ["23:40", "23:50", "00:00", "00:10", "00:30", "00:50"];
    return {
      skuId: p.id,
      name: p.name,
      tone: tones[i % tones.length],
      buckets: rampPattern.map((w, idx) => {
        const units = Math.round((p.unitsSold * w) / weightSum);
        return { label: hours[idx], unitsSold: units, revenue: units * p.unitPrice };
      })
    };
  });

  const productosLentos = [...skuMetrics]
    .filter((s) => s.sellThroughGap > 0.05)
    .sort((a, b) => b.sellThroughGap - a.sellThroughGap);

  const productosSobrante = [...skuMetrics]
    .filter((s) => s.projectedLeftover > 0)
    .sort((a, b) => b.projectedLeftoverValue - a.projectedLeftoverValue);

  const totalSobrante = sum(skuMetrics.map((s) => s.projectedLeftoverValue));
  const topByMargin = [...skuMetrics].sort((a, b) => b.grossMargin - a.grossMargin)[0];
  const worstST = [...skuMetrics].sort((a, b) => (a.sellThrough - a.targetSellThrough) - (b.sellThrough - b.targetSellThrough))[0];
  const totalVentasHora = sum(scored.map((p) => p.velocityLastHour * p.unitPrice));

  return {
    skuMetrics,
    hourlySeries,
    productosLentos,
    productosSobrante,
    adoptionStats: { approved: 1, discarded: 1, pending: 1 },
    ventasPorHoraActual: formatMoney(totalVentasHora),
    topProductByMargin: topByMargin?.name ?? "—",
    worstSellThrough: worstST ? `${worstST.name} (${worstST.sellThroughFormatted})` : "—",
    totalSobranteFormatted: formatMoney(totalSobrante)
  };
}
