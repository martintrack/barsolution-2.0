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
  norte: "33333333-3333-4333-8333-333333333301",
  sur: "33333333-3333-4333-8333-333333333302",
  general: "33333333-3333-4333-8333-333333333303",
  vip: "33333333-3333-4333-8333-333333333304"
};

const products = [
  {
    id: "44444444-4444-4444-8444-444444444401",
    sku: "PISCO-ALTO-35",
    name: "Piscola alto 35",
    category: "Coctel",
    unit_size: "vaso",
    starting_stock: 640,
    current_stock: 318,
    unit_price: 5200,
    unit_cost: 2850,
    target_sell_through: 0.72,
    min_margin_rate: 0.32,
    zone: zones.norte
  },
  {
    id: "44444444-4444-4444-8444-444444444403",
    sku: "CERVEZA-PREMIUM",
    name: "Cerveza premium",
    category: "Cerveza",
    unit_size: "470 ml",
    starting_stock: 980,
    current_stock: 176,
    unit_price: 4900,
    unit_cost: 2980,
    target_sell_through: 0.68,
    min_margin_rate: 0.3,
    zone: zones.norte
  },
  {
    id: "44444444-4444-4444-8444-444444444402",
    sku: "AGUA-SIN-GAS",
    name: "Agua sin gas",
    category: "Agua",
    unit_size: "500 ml",
    starting_stock: 900,
    current_stock: 112,
    unit_price: 2000,
    unit_cost: 1480,
    target_sell_through: 0.72,
    min_margin_rate: 0.18,
    zone: zones.general
  },
  {
    id: "44444444-4444-4444-8444-444444444404",
    sku: "ENERGETICA-355",
    name: "Energética 355",
    category: "Mixer",
    unit_size: "355 ml",
    starting_stock: 520,
    current_stock: 148,
    unit_price: 3000,
    unit_cost: 2120,
    target_sell_through: 0.62,
    min_margin_rate: 0.22,
    zone: zones.sur
  },
  {
    id: "44444444-4444-4444-8444-444444444405",
    sku: "GIN-TONIC-LATA",
    name: "Gin tonic lata",
    category: "RTD",
    unit_size: "355 ml",
    starting_stock: 420,
    current_stock: 214,
    unit_price: 3900,
    unit_cost: 2450,
    target_sell_through: 0.66,
    min_margin_rate: 0.25,
    zone: zones.vip
  }
];

const now = Date.now();

function iso(minutesAgo) {
  return new Date(now - minutesAgo * 60_000).toISOString();
}

function buildSalesRows() {
  const rows = [];
  const demandProfile = [
    [138, 42, 100, 96, 36, 24],
    [118, 58, 128, 130, 50, 26],
    [96, 64, 150, 140, 64, 32],
    [72, 56, 140, 130, 70, 36],
    [48, 50, 126, 120, 62, 40],
    [24, 34, 100, 104, 54, 48],
    [8, 18, 60, 68, 36, 0]
  ];

  for (const [minutesAgo, piscola, cerveza, agua, energetica, gin] of demandProfile) {
    const quantities = [piscola, cerveza, agua, energetica, gin];

    products.forEach((product, index) => {
      const quantity = quantities[index];
      if (!quantity) return;

      rows.push({
        event_id: eventId,
        product_id: product.id,
        bar_zone_id: product.zone,
        quantity,
        unit_price: product.unit_price,
        unit_cost: product.unit_cost,
        source: "kobra_seed",
        external_id: `seed-${product.sku}-${minutesAgo}`,
        occurred_at: iso(minutesAgo)
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
  await must(
    "clear simulation actions",
    supabase.from("simulation_actions").delete().neq("id", "00000000-0000-0000-0000-000000000000")
  );
  await must("clear simulation runs", supabase.from("simulation_runs").delete().eq("event_id", eventId));
  await must("clear recommendations", supabase.from("recommendations").delete().eq("event_id", eventId));
  await must("clear movements", supabase.from("inventory_movements").delete().eq("event_id", eventId));
  await must("clear sales", supabase.from("sales_transactions").delete().eq("event_id", eventId));

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
      name: "Warehouse Club",
      venue_name: "Warehouse Club",
      starts_at: new Date(now - 2.5 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now + 75 * 60 * 1000).toISOString(),
      status: "active",
      target_margin_rate: 0.38,
      currency: "CLP"
    })
  );

  await must(
    "zones",
    supabase.from("bar_zones").upsert([
      { id: zones.norte, event_id: eventId, name: "Norte", capacity_multiplier: 1.15 },
      { id: zones.sur, event_id: eventId, name: "Sur", capacity_multiplier: 0.9 },
      { id: zones.general, event_id: eventId, name: "General", capacity_multiplier: 1 },
      { id: zones.vip, event_id: eventId, name: "VIP", capacity_multiplier: 0.72 }
    ])
  );

  await must(
    "products",
    supabase.from("products").upsert(
      products.map((product) => ({
        id: product.id,
        organization_id: organizationId,
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit_size: product.unit_size,
        active: true
      }))
    )
  );

  await must(
    "event products",
    supabase.from("event_products").upsert(
      products.map((product) => ({
        event_id: eventId,
        product_id: product.id,
        starting_stock: product.starting_stock,
        current_stock: product.current_stock,
        unit_price: product.unit_price,
        unit_cost: product.unit_cost,
        target_sell_through: product.target_sell_through,
        min_margin_rate: product.min_margin_rate
      })),
      { onConflict: "event_id,product_id" }
    )
  );

  await must("sales", supabase.from("sales_transactions").insert(buildSalesRows()));

  await must(
    "movements",
    supabase.from("inventory_movements").insert([
      {
        event_id: eventId,
        product_id: products[0].id,
        to_bar_zone_id: zones.norte,
        movement_type: "opening_stock",
        quantity: 640,
        reason: "Stock inicial piscola",
        occurred_at: iso(170)
      },
      {
        event_id: eventId,
        product_id: products[0].id,
        from_bar_zone_id: zones.vip,
        to_bar_zone_id: zones.norte,
        movement_type: "transfer_in",
        quantity: 84,
        reason: "Refuerzo zona norte por activacion 2x1",
        occurred_at: iso(22)
      },
      {
        event_id: eventId,
        product_id: products[3].id,
        to_bar_zone_id: zones.sur,
        movement_type: "correction",
        quantity: 12,
        reason: "Ajuste conteo barra sur",
        occurred_at: iso(34)
      }
    ])
  );

  await must(
    "recommendations",
    supabase.from("recommendations").insert([
      {
        event_id: eventId,
        product_id: products[0].id,
        bar_zone_id: zones.norte,
        title: "Activar oferta 2x1 para piscolas",
        summary: "Demanda bajo objetivo, stock alto y margen unitario suficiente para una ventana promocional controlada.",
        priority: "high",
        status: "pending",
        estimated_margin: 124000,
        evidence: {
          stock_restante: "50%",
          demanda_vs_objetivo: "-31%",
          margen_unitario: "$2.350",
          ventana_sugerida: "35 min"
        },
        rule_code: "LOW_DEMAND_HIGH_STOCK"
      },
      {
        event_id: eventId,
        product_id: products[2].id,
        bar_zone_id: zones.general,
        title: "No descontar agua sin gas",
        summary: "Rotación sana y stock controlado. Descontar este SKU destruye margen sin resolver sobrante.",
        priority: "medium",
        status: "pending",
        estimated_margin: 42000,
        evidence: {
          sell_through: "88%",
          stock_restante: "12%",
          margen_unitario: "$520"
        },
        rule_code: "PROTECT_MARGIN"
      },
      {
        event_id: eventId,
        product_id: products[1].id,
        bar_zone_id: zones.norte,
        title: "Priorizar cerveza premium en barra norte",
        summary: "Alto margen y ritmo estable. Mantener visibilidad en menú y reposición cerca del punto de venta.",
        priority: "medium",
        status: "approved",
        estimated_margin: 76000,
        evidence: {
          venta_ultima_hora: "82 u.",
          margen_unitario: "$1.920",
          zona: "Norte"
        },
        rule_code: "PUSH_HIGH_MARGIN"
      }
    ])
  );

  const simulation = await must(
    "simulation",
    supabase
      .from("simulation_runs")
      .insert({
        event_id: eventId,
        name: "Oferta 2x1 piscolas 35 min",
        status: "completed",
        assumptions: {
          uplift_demanda: 0.42,
          descuento: "2x1",
          duracion_minutos: 35,
          margen_minimo: 0.28
        },
        baseline_snapshot: {
          sobrante_piscolas: 168,
          margen_proyectado: 3600000
        },
        result_snapshot: {
          sobrante_piscolas: 97,
          margen_incremental: 124000,
          margen_proyectado: 3724000
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
        product_id: products[0].id,
        bar_zone_id: zones.norte,
        action_type: "promotion",
        payload: {
          type: "2x1",
          duration_minutes: 35,
          expected_units_moved: 86
        }
      }
    ])
  );

  const [{ count: salesCount }, { count: recommendationCount }, { count: simulationCount }] = await Promise.all([
    supabase.from("sales_transactions").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("event_id", eventId),
    supabase.from("simulation_runs").select("id", { count: "exact", head: true }).eq("event_id", eventId)
  ]);

  console.log(
    JSON.stringify({
      ok: true,
      event: "Warehouse Club",
      products: products.length,
      sales: salesCount,
      recommendations: recommendationCount,
      simulations: simulationCount
    })
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
