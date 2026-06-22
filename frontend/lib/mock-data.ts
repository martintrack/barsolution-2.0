import { buildDashboardSnapshot, type EventInput, type ProductTelemetry } from "./domain";

const event: EventInput = {
  name: "Warehouse Club",
  status: "Activo",
  window: "23:40 - 01:10",
  updatedAt: "23:42",
  hoursRemaining: 1.5
};

const products: ProductTelemetry[] = [
  {
    id: "gin-tonic-lata",
    name: "Gin tonic lata",
    category: "RTD",
    zone: "Norte",
    startingStock: 504,
    currentStock: 204,
    unitsSold: 300,
    unitPrice: 3900,
    unitCost: 2450,
    targetSellThrough: 0.75,
    velocityLastHour: 24
  },
  {
    id: "agua-sin-gas",
    name: "Agua sin gas",
    category: "Agua",
    zone: "General",
    startingStock: 996,
    currentStock: 96,
    unitsSold: 900,
    unitPrice: 2000,
    unitCost: 1480,
    targetSellThrough: 0.68,
    velocityLastHour: 84
  },
  {
    id: "cerveza-premium",
    name: "Cerveza premium",
    category: "Cerveza",
    zone: "Norte",
    startingStock: 988,
    currentStock: 188,
    unitsSold: 800,
    unitPrice: 4900,
    unitCost: 2980,
    targetSellThrough: 0.58,
    velocityLastHour: 80
  },
  {
    id: "energetica-355",
    name: "Energetica 355",
    category: "Mixer",
    zone: "Sur",
    startingStock: 608,
    currentStock: 108,
    unitsSold: 500,
    unitPrice: 3000,
    unitCost: 2120,
    targetSellThrough: 0.56,
    velocityLastHour: 30
  }
];

export const dashboardSnapshot = buildDashboardSnapshot(event, products);

export const {
  chartSeries,
  commercialSignals,
  decisionLog,
  eventSummary,
  financialSummary,
  inventoryRisks,
  producerKpis,
  recommendations
} = dashboardSnapshot;
