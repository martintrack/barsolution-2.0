import { buildDashboardSnapshot, type EventInput, type ProductTelemetry } from "@/lib/domain";
import type { ActivityItem, DashboardSnapshot, Recommendation } from "@/lib/types";
import type { Json } from "./database.types";
import { createServerSupabaseClient } from "./server";

type EventProductRow = {
  current_stock: number;
  product_id: string;
  starting_stock: number;
  target_sell_through: number;
  unit_cost: number;
  unit_price: number;
  products: {
    category: string;
    name: string;
  } | null;
};

type EventRow = {
  ends_at: string;
  id: string;
  name: string;
  starts_at: string;
  status: "draft" | "active" | "closed" | "archived";
};

type SaleRow = {
  bar_zone_id: string | null;
  occurred_at: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
};

type RecommendationRow = {
  created_at: string;
  estimated_margin: number;
  evidence: Json;
  id: string;
  priority: "low" | "medium" | "high";
  rule_code: string;
  status: "pending" | "approved" | "dismissed" | "expired";
  summary: string;
  title: string;
};

type ZoneRow = {
  id: string;
  name: string;
};

const moneyFormatter = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  notation: "compact",
  style: "currency"
});

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id,name,starts_at,ends_at,status")
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle<EventRow>();

  if (eventError) {
    throw new Error(`Supabase events error: ${eventError.message}`);
  }

  if (!event) {
    throw new Error("Supabase has no active event.");
  }

  const [{ data: rows, error: productError }, { data: sales, error: salesError }, { data: zones, error: zonesError }, { data: recommendations, error: recommendationsError }] =
    await Promise.all([
      supabase
        .from("event_products")
        .select("product_id,starting_stock,current_stock,unit_price,unit_cost,target_sell_through,products(name,category)")
        .eq("event_id", event.id)
        .returns<EventProductRow[]>(),
      supabase
        .from("sales_transactions")
        .select("product_id,bar_zone_id,quantity,unit_price,unit_cost,occurred_at")
        .eq("event_id", event.id)
        .order("occurred_at", { ascending: false })
        .returns<SaleRow[]>(),
      supabase.from("bar_zones").select("id,name").eq("event_id", event.id).returns<ZoneRow[]>(),
      supabase
        .from("recommendations")
        .select("id,title,summary,priority,status,estimated_margin,evidence,rule_code,created_at")
        .eq("event_id", event.id)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<RecommendationRow[]>()
    ]);

  if (productError) throw new Error(`Supabase event_products error: ${productError.message}`);
  if (salesError) throw new Error(`Supabase sales_transactions error: ${salesError.message}`);
  if (zonesError) throw new Error(`Supabase bar_zones error: ${zonesError.message}`);
  if (recommendationsError) throw new Error(`Supabase recommendations error: ${recommendationsError.message}`);
  if (!rows?.length) throw new Error("Supabase event has no products.");

  const productTelemetry = rows.map((row) => mapProduct(row, sales ?? [], zones ?? []));
  const snapshot = buildDashboardSnapshot(mapEvent(event), productTelemetry);
  const mappedRecommendations = (recommendations ?? []).map(mapRecommendation);

  return {
    ...snapshot,
    recommendations: mappedRecommendations.length ? mappedRecommendations : snapshot.recommendations,
    commercialSignals: buildCommercialSignals(sales ?? [], rows, zones ?? [], event),
    decisionLog: buildDecisionLog(recommendations ?? [])
  };
}

function mapEvent(event: EventRow): EventInput {
  const endsAt = new Date(event.ends_at);
  const hoursRemaining = Math.max(0, (endsAt.getTime() - Date.now()) / 1000 / 60 / 60);

  return {
    name: event.name,
    status: getEventStatusLabel(event.status),
    window: formatEventWindow(event.starts_at, event.ends_at),
    updatedAt: new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date()),
    hoursRemaining,
    mode: "Supabase"
  };
}

function mapProduct(row: EventProductRow, sales: SaleRow[], zones: ZoneRow[]): ProductTelemetry {
  const productSales = sales.filter((sale) => sale.product_id === row.product_id);
  const unitsSold = sum(productSales.map((sale) => sale.quantity));
  const lastHourCutoff = Date.now() - 60 * 60 * 1000;
  const velocityLastHour = sum(productSales.filter((sale) => new Date(sale.occurred_at).getTime() >= lastHourCutoff).map((sale) => sale.quantity));

  return {
    id: row.product_id,
    name: row.products?.name ?? "Producto sin nombre",
    category: row.products?.category ?? "General",
    zone: getPrimaryZone(productSales, zones),
    startingStock: row.starting_stock,
    currentStock: row.current_stock,
    unitsSold,
    unitPrice: row.unit_price,
    unitCost: row.unit_cost,
    targetSellThrough: row.target_sell_through,
    velocityLastHour: Math.max(8, velocityLastHour)
  };
}

function mapRecommendation(row: RecommendationRow): Recommendation {
  return {
    id: row.id,
    type: getRecommendationType(row),
    title: row.title,
    summary: row.summary,
    priority: row.priority,
    estimatedMargin: moneyFormatter.format(row.estimated_margin),
    evidence: mapEvidence(row.evidence)
  };
}

function buildCommercialSignals(sales: SaleRow[], products: EventProductRow[], zones: ZoneRow[], event: EventRow): ActivityItem[] {
  const productById = new Map(products.map((product) => [product.product_id, product.products?.name ?? "Producto"]));
  const zoneById = new Map(zones.map((zone) => [zone.id, zone.name]));
  const latestSales = [...sales].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).slice(0, 3);

  if (!latestSales.length) {
    return [{ time: formatShortTime(event.starts_at), text: "Esperando ventas del evento." }];
  }

  return latestSales.map((sale) => ({
    time: formatShortTime(sale.occurred_at),
    text: `${productById.get(sale.product_id)} vendió ${sale.quantity} u. en zona ${sale.bar_zone_id ? zoneById.get(sale.bar_zone_id) ?? "General" : "General"}.`
  }));
}

function buildDecisionLog(recommendations: RecommendationRow[]): ActivityItem[] {
  const resolved = recommendations.filter((recommendation) => recommendation.status === "approved" || recommendation.status === "dismissed");

  if (!resolved.length) {
    return recommendations.slice(0, 3).map((recommendation) => ({
      time: formatShortTime(recommendation.created_at),
      text: `${recommendation.title} está pendiente de decisión.`
    }));
  }

  return resolved.slice(0, 3).map((recommendation) => ({
    time: formatShortTime(recommendation.created_at),
    text: `${recommendation.status === "approved" ? "Aprobada" : "Descartada"}: ${recommendation.title}.`
  }));
}

function getPrimaryZone(sales: SaleRow[], zones: ZoneRow[]) {
  const counts = new Map<string, number>();

  for (const sale of sales) {
    if (!sale.bar_zone_id) continue;
    counts.set(sale.bar_zone_id, (counts.get(sale.bar_zone_id) ?? 0) + sale.quantity);
  }

  const [zoneId] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  return zones.find((zone) => zone.id === zoneId)?.name ?? "General";
}

function getRecommendationType(row: RecommendationRow) {
  if (row.priority === "high") return "Riesgo alto";
  if (row.rule_code.includes("PROTECT")) return "Proteger margen";
  if (row.rule_code.includes("PUSH")) return "Empuje comercial";
  return row.status === "approved" ? "Aprobada" : "Recomendación";
}

function mapEvidence(evidence: Json): Recommendation["evidence"] {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return [];
  }

  return Object.entries(evidence).map(([key, value]) => ({
    label: prettifyEvidenceLabel(key),
    value: String(value)
  }));
}

function prettifyEvidenceLabel(key: string) {
  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Vs", "vs");
}

function formatEventWindow(startsAt: string, endsAt: string) {
  return `${formatShortTime(startsAt)} - ${formatShortTime(endsAt)}`;
}

function formatShortTime(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getEventStatusLabel(status: EventRow["status"]) {
  const labels: Record<EventRow["status"], string> = {
    active: "Activo",
    archived: "Archivado",
    closed: "Cerrado",
    draft: "Borrador"
  };

  return labels[status];
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
