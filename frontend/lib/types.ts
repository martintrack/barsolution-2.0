export type Kpi = {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "neutral" | "risk" | "positive";
};

export type Recommendation = {
  id: string;
  type: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  estimatedMargin: string;
  evidence: Array<{
    label: string;
    value: string;
  }>;
};

export type InventoryRisk = {
  product: string;
  zone: string;
  stock: string;
  sellThrough: string;
  margin: string;
  status: string;
};

export type ActivityItem = {
  time: string;
  text: string;
};

export type EventSummary = {
  name: string;
  status: string;
  window: string;
  mode: string;
  updatedAt: string;
  executiveSummary: string;
};

export type FinancialSummary = {
  sales: string;
  margin: string;
  leftoverRisk: string;
};

export type ChartSeries = {
  label: string;
  tone: "amber" | "steel" | "copper";
  points: number[];
};

export type DashboardSnapshot = {
  eventSummary: EventSummary;
  producerKpis: Kpi[];
  financialSummary: FinancialSummary;
  recommendations: Recommendation[];
  inventoryRisks: InventoryRisk[];
  chartSeries: ChartSeries[];
  commercialSignals: ActivityItem[];
  decisionLog: ActivityItem[];
};

export type SkuMetric = {
  id: string;
  name: string;
  category: string;
  zone: string;
  revenue: number;
  revenueFormatted: string;
  grossMargin: number;
  grossMarginFormatted: string;
  marginRate: number;
  marginRateFormatted: string;
  sellThrough: number;
  sellThroughFormatted: string;
  targetSellThrough: number;
  targetSellThroughFormatted: string;
  sellThroughGap: number;
  currentStock: number;
  projectedLeftover: number;
  projectedLeftoverValue: number;
  projectedLeftoverValueFormatted: string;
  velocityLastHour: number;
  unitMargin: number;
  unitMarginFormatted: string;
  status: string;
  riskScore: number;
};

export type HourlyBucket = {
  label: string;
  unitsSold: number;
  revenue: number;
};

export type SkuHourlySeries = {
  skuId: string;
  name: string;
  tone: ChartSeries["tone"];
  buckets: HourlyBucket[];
};

export type AdoptionStats = {
  approved: number;
  discarded: number;
  pending: number;
};

export type MetricasSnapshot = {
  skuMetrics: SkuMetric[];
  hourlySeries: SkuHourlySeries[];
  productosLentos: SkuMetric[];
  productosSobrante: SkuMetric[];
  adoptionStats: AdoptionStats;
  ventasPorHoraActual: string;
  topProductByMargin: string;
  worstSellThrough: string;
  totalSobranteFormatted: string;
};
