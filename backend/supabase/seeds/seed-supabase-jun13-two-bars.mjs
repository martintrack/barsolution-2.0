import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const frontendDir = path.resolve(process.cwd(), "frontend");
const envPath = path.join(frontendDir, ".env");
const require = createRequire(path.join(frontendDir, "package.json"));
const { createClient } = require("@supabase/supabase-js");

if (!fs.existsSync(envPath)) {
  throw new Error(`Missing env file at ${envPath}`);
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const organizationId = "11111111-1111-4111-8111-111111111111";
const eventId = "22222222-2222-4222-8222-222222222222";

const zones = {
  barra1: "66666666-6666-4666-8666-666666666601",
  barra2: "66666666-6666-4666-8666-666666666602"
};

const products = [
  product("55555555-5555-4555-8555-555555555501", "FERNET", "Fernet", "Coctel", "vaso", 11, 40, 8000, 4200, 0.7, 0.32, 0.62),
  product("55555555-5555-4555-8555-555555555502", "TROPICAL-2X", "Tropical 2x", "Promo", "pack 2 vasos", 37, 60, 10000, 5200, 0.75, 0.34, 0.55),
  product("55555555-5555-4555-8555-555555555503", "VASO", "Vaso", "Insumo", "unidad", 76, 220, 1000, 250, 0.65, 0.2, 0.5),
  product("55555555-5555-4555-8555-555555555504", "PISCOLA", "Piscola", "Coctel", "vaso", 62, 180, 7500, 3800, 0.78, 0.32, 0.6),
  product("55555555-5555-4555-8555-555555555505", "RED-BULL", "Red Bull", "Mixer", "lata", 3, 60, 3000, 1800, 0.55, 0.25, 0.42),
  product("55555555-5555-4555-8555-555555555506", "BEBIDA", "Bebida", "Mixer", "vaso", 2, 40, 3000, 1200, 0.55, 0.25, 0.48),
  product("55555555-5555-4555-8555-555555555507", "PROMO-2-PISCOLAS-RED-BULL", "Promo 2 Piscolas + Red Bull", "Promo", "pack", 46, 80, 12000, 6500, 0.8, 0.3, 0.64),
  product("55555555-5555-4555-8555-555555555508", "2-RAMAZZOTTI", "2 Ramazzotti", "Promo", "pack 2 vasos", 0, 30, 10000, 5600, 0.55, 0.28, 0.35),
  product("55555555-5555-4555-8555-555555555509", "CERVEZA-2X", "Cerveza 2x", "Promo", "pack 2 unidades", 4, 50, 7000, 3800, 0.6, 0.28, 0.46),
  product("55555555-5555-4555-8555-555555555510", "PROMO-3-PISCOLAS-2-RED-BULL", "Promo 3 Piscolas + 2 Red Bull", "Promo", "pack", 11, 30, 20000, 10400, 0.68, 0.32, 0.72),
  product("55555555-5555-4555-8555-555555555511", "TROPICAL", "Tropical", "Coctel", "vaso", 19, 50, 7000, 3600, 0.7, 0.32, 0.52),
  product("55555555-5555-4555-8555-555555555512", "AGUA", "Agua", "Agua", "botella", 18, 60, 2500, 900, 0.72, 0.18, 0.5),
  product("55555555-5555-4555-8555-555555555513", "GIN-TONIC", "Gin Tonic", "Coctel", "vaso", 8, 40, 8000, 4300, 0.65, 0.3, 0.58),
  product("55555555-5555-4555-8555-555555555514", "RAMAZZOTTI", "Ramazzotti", "Coctel", "vaso", 1, 40, 6000, 3400, 0.55, 0.28, 0.38),
  product("55555555-5555-4555-8555-555555555515", "VODKA-TONICA", "Vodka Tónica", "Coctel", "vaso", 2, 30, 7000, 3900, 0.55, 0.28, 0.44),
  product("55555555-5555-4555-8555-555555555516", "AGUA-2X", "Agua 2x", "Promo", "pack 2 botellas", 1, 30, 4000, 1600, 0.55, 0.18, 0.5),
  product("55555555-5555-4555-8555-555555555517", "CERVEZA", "Cerveza", "Cerveza", "unidad", 2, 50, 4000, 2200, 0.55, 0.25, 0.5)
];

const eventStart = new Date("2026-06-13T22:30:00-04:00");

function product(id, sku, name, category, unitSize, sold, startingStock, unitPrice, unitCost, targetSellThrough, minMarginRate, barra1Share) {
  return {
    id,
    sku,
    name,
    category,
    unit_size: unitSize,
    sold,
    starting_stock: startingStock,
    current_stock: startingStock - sold,
    unit_price: unitPrice,
    unit_cost: unitCost,
    target_sell_through: targetSellThrough,
    min_margin_rate: minMarginRate,
    barra1Share
  };
}

function at(minutesAfterStart) {
  return new Date(eventStart.getTime() + minutesAfterStart * 60_000).toISOString();
}

function splitQuantity(quantity, firstShare) {
  if (quantity <= 0) return [0, 0];
  if (quantity === 1) return [1, 0];

  const first = Math.max(1, Math.min(quantity - 1, Math.round(quantity * firstShare)));
  return [first, quantity - first];
}

function splitAcrossTimes(quantity) {
  if (quantity <= 0) return [];
  if (quantity === 1) return [1];
  if (quantity === 2) return [1, 1];

  const first = Math.max(1, Math.round(quantity * 0.42));
  const second = Math.max(1, Math.round(quantity * 0.34));
  const third = quantity - first - second;

  return third > 0 ? [first, second, third] : [first, quantity - first];
}

function buildSalesRows() {
  const rows = [];
  const timeOffsets = [45, 125, 210];

  for (const item of products) {
    const [barra1Quantity, barra2Quantity] = splitQuantity(item.sold, item.barra1Share);

    [
      { zoneId: zones.barra1, zoneName: "barra-1", quantity: barra1Quantity },
      { zoneId: zones.barra2, zoneName: "barra-2", quantity: barra2Quantity }
    ].forEach((zone) => {
      splitAcrossTimes(zone.quantity).forEach((quantity, index) => {
        rows.push({
          event_id: eventId,
          product_id: item.id,
          bar_zone_id: zone.zoneId,
          quantity,
          unit_price: item.unit_price,
          unit_cost: item.unit_cost,
          source: "13-jun-import",
          external_id: `13jun-${item.sku}-${zone.zoneName}-${index + 1}`,
          occurred_at: at(timeOffsets[index] ?? 240)
        });
      });
    });
  }

  return rows;
}

async function must(label, promise) {
  const { error, data } = await promise;
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
  return data;
}

async function main() {
  await must("clear simulation actions", supabase.from("simulation_actions").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  await must("clear simulation runs", supabase.from("simulation_runs").delete().eq("event_id", eventId));
  await must("clear recommendations", supabase.from("recommendations").delete().eq("event_id", eventId));
  await must("clear movements", supabase.from("inventory_movements").delete().eq("event_id", eventId));
  await must("clear sales", supabase.from("sales_transactions").delete().eq("event_id", eventId));
  await must("clear event products", supabase.from("event_products").delete().eq("event_id", eventId));
  await must("clear bar zones", supabase.from("bar_zones").delete().eq("event_id", eventId));

  await must(
    "organization",
    supabase.from("organizations").upsert({
      id: organizationId,
      name: "Kobra Demo Productora",
      legal_name: "Kobra Demo Productora SpA"
    })
  );

  await must(
    "event",
    supabase.from("events").upsert({
      id: eventId,
      organization_id: organizationId,
      name: "Venta 13 Jun - Dos barras",
      venue_name: "Evento 13 Jun",
      starts_at: eventStart.toISOString(),
      ends_at: new Date("2026-06-14T03:30:00-04:00").toISOString(),
      status: "active",
      target_margin_rate: 0.38,
      currency: "CLP"
    })
  );

  await must(
    "zones",
    supabase.from("bar_zones").upsert([
      { id: zones.barra1, event_id: eventId, name: "Barra 1", capacity_multiplier: 1.05 },
      { id: zones.barra2, event_id: eventId, name: "Barra 2", capacity_multiplier: 0.95 }
    ])
  );

  await must(
    "products",
    supabase.from("products").upsert(
      products.map((item) => ({
        id: item.id,
        organization_id: organizationId,
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit_size: item.unit_size,
        active: true
      }))
    )
  );

  await must(
    "event products",
    supabase.from("event_products").upsert(
      products.map((item) => ({
        event_id: eventId,
        product_id: item.id,
        starting_stock: item.starting_stock,
        current_stock: item.current_stock,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost,
        target_sell_through: item.target_sell_through,
        min_margin_rate: item.min_margin_rate
      })),
      { onConflict: "event_id,product_id" }
    )
  );

  await must("sales", supabase.from("sales_transactions").insert(buildSalesRows()));

  await must(
    "movements",
    supabase.from("inventory_movements").insert(
      products.map((item) => ({
        event_id: eventId,
        product_id: item.id,
        to_bar_zone_id: item.barra1Share >= 0.5 ? zones.barra1 : zones.barra2,
        movement_type: "opening_stock",
        quantity: item.starting_stock,
        reason: `Stock inicial ${item.name} - venta 13 Jun`,
        occurred_at: at(-30)
      }))
    )
  );

  await must(
    "recommendations",
    supabase.from("recommendations").insert([
      {
        event_id: eventId,
        product_id: products.find((item) => item.sku === "PISCOLA").id,
        bar_zone_id: zones.barra1,
        title: "Empujar piscola en Barra 1",
        summary: "Piscola concentra venta relevante, pero mantiene 118 unidades de stock. Conviene activar visibilidad u oferta corta sin bajar el margen mínimo.",
        priority: "high",
        status: "pending",
        estimated_margin: 185000,
        evidence: {
          vendido: "62 u.",
          stock_restante: "118 u.",
          margen_unitario: "$3.700",
          barra_principal: "Barra 1"
        },
        rule_code: "LOW_DEMAND_HIGH_STOCK"
      },
      {
        event_id: eventId,
        product_id: products.find((item) => item.sku === "PROMO-2-PISCOLAS-RED-BULL").id,
        bar_zone_id: zones.barra1,
        title: "Mantener promo 2 Piscolas + Red Bull",
        summary: "Es el mayor generador de ingresos del evento. Mantenerla visible y evitar descuentos adicionales protege margen.",
        priority: "medium",
        status: "approved",
        estimated_margin: 253000,
        evidence: {
          vendido: "46 packs",
          venta_bruta: "$552.000",
          margen_unitario: "$5.500"
        },
        rule_code: "PROTECT_MARGIN"
      },
      {
        event_id: eventId,
        product_id: products.find((item) => item.sku === "RED-BULL").id,
        bar_zone_id: zones.barra2,
        title: "No vender Red Bull solo como descuento",
        summary: "La venta individual es baja, pero el producto tracciona promos con piscola. Mantenerlo reservado para packs de mayor ticket.",
        priority: "medium",
        status: "pending",
        estimated_margin: 92000,
        evidence: {
          venta_individual: "3 u.",
          promo_2_piscolas_red_bull: "46 packs",
          promo_3_piscolas_2_red_bull: "11 packs"
        },
        rule_code: "BUNDLE_DRIVER"
      },
      {
        event_id: eventId,
        product_id: products.find((item) => item.sku === "RAMAZZOTTI").id,
        bar_zone_id: zones.barra2,
        title: "Reducir exposición de Ramazzotti",
        summary: "Ramazzotti y 2 Ramazzotti tienen demanda casi nula frente al stock disponible. Reubicar espacio de menú hacia Tropical o Piscola.",
        priority: "high",
        status: "pending",
        estimated_margin: 64000,
        evidence: {
          ramazzotti: "1 u.",
          pack_2_ramazzotti: "0 u.",
          stock_restante_estimado: "69 u."
        },
        rule_code: "MENU_SPACE_REALLOCATION"
      }
    ])
  );

  const simulation = await must(
    "simulation",
    supabase
      .from("simulation_runs")
      .insert({
        event_id: eventId,
        name: "Reasignar foco comercial entre dos barras",
        status: "completed",
        assumptions: {
          barras: ["Barra 1", "Barra 2"],
          accion: "Mover visibilidad desde Ramazzotti hacia Piscola y Tropical",
          duracion_minutos: 40,
          uplift_demanda_piscola: 0.18,
          uplift_demanda_tropical: 0.12
        },
        baseline_snapshot: {
          venta_total: 2088000,
          unidades_linea: products.reduce((total, item) => total + item.sold, 0),
          productos: products.length
        },
        result_snapshot: {
          margen_incremental: 185000,
          unidades_adicionales_estimadas: 28,
          riesgo_sobrante_reducido: "medio"
        },
        completed_at: new Date().toISOString()
      })
      .select("id")
      .single()
  );

  await must(
    "simulation actions",
    supabase.from("simulation_actions").insert([
      {
        simulation_run_id: simulation.id,
        product_id: products.find((item) => item.sku === "PISCOLA").id,
        bar_zone_id: zones.barra1,
        action_type: "promotion",
        payload: {
          type: "visibilidad_menu",
          duration_minutes: 40,
          expected_units_moved: 18
        }
      },
      {
        simulation_run_id: simulation.id,
        product_id: products.find((item) => item.sku === "RAMAZZOTTI").id,
        bar_zone_id: zones.barra2,
        action_type: "menu_reallocation",
        payload: {
          from: "Ramazzotti",
          to: "Tropical/Piscola",
          reason: "baja demanda"
        }
      }
    ])
  );

  const [{ count: productCount }, { count: salesCount }, { data: revenueRows }, { count: recommendationCount }] = await Promise.all([
    supabase.from("event_products").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("sales_transactions").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("sales_transactions").select("gross_amount,quantity").eq("event_id", eventId),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("event_id", eventId)
  ]);

  const revenue = (revenueRows ?? []).reduce((total, row) => total + row.gross_amount, 0);
  const units = (revenueRows ?? []).reduce((total, row) => total + row.quantity, 0);

  console.log(
    JSON.stringify({
      ok: true,
      event: "Venta 13 Jun - Dos barras",
      bars: 2,
      products: productCount,
      salesRows: salesCount,
      lineUnits: units,
      revenue,
      expectedRevenue: 2088000,
      recommendations: recommendationCount
    })
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
