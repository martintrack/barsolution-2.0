import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { eventSummary, metricasSnapshot, producerKpis, recommendations } from "@/lib/mock-data";
import { RecommendationsWithAI } from "@/components/dashboard/RecommendationsWithAI";
import type { SkuHourlySeries, SkuMetric } from "@/lib/types";

const { skuMetrics, hourlySeries, productosLentos, productosSobrante, adoptionStats } = metricasSnapshot;

const metricaKpis = [
  {
    label: "Ventas actuales / hora",
    value: metricasSnapshot.ventasPorHoraActual,
    detail: "Suma de velocidad × precio por SKU.",
    tone: "primary" as const
  },
  {
    label: "Producto top por margen",
    value: metricasSnapshot.topProductByMargin,
    detail: "Mayor margen bruto acumulado.",
    tone: "positive" as const
  },
  {
    label: "Peor sell-through",
    value: metricasSnapshot.worstSellThrough,
    detail: "Mayor brecha contra objetivo.",
    tone: "risk" as const
  },
  {
    label: "Sobrante en riesgo",
    value: metricasSnapshot.totalSobranteFormatted,
    detail: "Costo de stock proyectado sobrante.",
    tone: "neutral" as const
  }
];

const TONE_COLORS: Record<string, string> = {
  amber: "var(--amber)",
  steel: "var(--steel)",
  copper: "var(--copper)"
};

function HourlyBarChart({ series }: { series: SkuHourlySeries[] }) {
  const allRevenues = series.flatMap((s) => s.buckets.map((b) => b.revenue));
  const maxRevenue = Math.max(...allRevenues, 1);
  const chartH = 160;
  const chartW = 560;
  const bucketCount = series[0]?.buckets.length ?? 6;
  const groupW = chartW / bucketCount;
  const barW = Math.floor(groupW / (series.length + 1));
  const labels = series[0]?.buckets.map((b) => b.label) ?? [];

  return (
    <figure className="metricas-chart-wrap" aria-label="Ventas por período de 10 minutos">
      <svg viewBox={`0 0 ${chartW} ${chartH + 28}`} className="metricas-bar-chart" role="img" aria-label="Gráfico de barras de ventas por hora">
        {series.map((s, si) =>
          s.buckets.map((b, bi) => {
            const barH = Math.max(2, (b.revenue / maxRevenue) * chartH);
            const x = bi * groupW + si * (barW + 2) + 4;
            const y = chartH - barH;
            return (
              <rect
                key={`${s.skuId}-${bi}`}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill={TONE_COLORS[s.tone]}
                opacity={0.82}
                rx={2}
              >
                <title>{`${s.name}: ${b.label} — ${b.unitsSold} u. / $${b.revenue.toLocaleString("es-CL")}`}</title>
              </rect>
            );
          })
        )}
        {labels.map((label, i) => (
          <text
            key={label}
            x={i * groupW + groupW / 2}
            y={chartH + 20}
            textAnchor="middle"
            fontSize={10}
            fill="var(--text-muted)"
          >
            {label}
          </text>
        ))}
      </svg>
      <figcaption className="metricas-chart-legend">
        {series.map((s) => (
          <span key={s.skuId} style={{ color: TONE_COLORS[s.tone] }}>
            ● {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function SellThroughBars({ metrics }: { metrics: SkuMetric[] }) {
  return (
    <div className="sell-through-list" role="list" aria-label="Sell-through por SKU">
      {metrics.map((m) => {
        const pct = Math.min(100, Math.round(m.sellThrough * 100));
        const targetPct = Math.round(m.targetSellThrough * 100);
        const gap = m.sellThroughGap > 0;
        return (
          <div className="sell-through-row" key={m.id} role="listitem">
            <div className="sell-through-meta">
              <span className="sell-through-name">{m.name}</span>
              <span className={`sell-through-pct ${gap ? "st-risk" : "st-ok"}`}>
                {m.sellThroughFormatted} / objetivo {m.targetSellThroughFormatted}
              </span>
            </div>
            <div className="sell-through-track" aria-label={`${m.name}: ${pct}% de ${targetPct}% objetivo`}>
              <div
                className={`sell-through-fill ${gap ? "st-fill-risk" : "st-fill-ok"}`}
                style={{ width: `${pct}%` }}
              />
              <div className="sell-through-target" style={{ left: `${targetPct}%` }} aria-hidden="true" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkuMetricsTable({ metrics }: { metrics: SkuMetric[] }) {
  return (
    <div className="data-table-wrap" role="table" aria-label="Métricas detalladas por SKU">
      <div className="sku-table-head" role="row">
        <span role="columnheader">Producto</span>
        <span role="columnheader">Zona</span>
        <span role="columnheader">Ingresos</span>
        <span role="columnheader">Margen bruto</span>
        <span role="columnheader">Tasa margen</span>
        <span role="columnheader">Vel. / hora</span>
        <span role="columnheader">Sobrante proy.</span>
        <span role="columnheader">Estado</span>
      </div>
      {metrics.map((m) => (
        <div className="sku-table-row" key={m.id} role="row">
          <span role="cell" className="sku-name-cell">
            <strong>{m.name}</strong>
            <small>{m.category}</small>
          </span>
          <span role="cell">{m.zone}</span>
          <span role="cell">{m.revenueFormatted}</span>
          <span role="cell">{m.grossMarginFormatted}</span>
          <span role="cell">{m.marginRateFormatted}</span>
          <span role="cell">{m.velocityLastHour} u.</span>
          <span role="cell" className={m.projectedLeftover > 0 ? "cell-risk" : "cell-ok"}>
            {m.projectedLeftover > 0 ? `${m.projectedLeftover} u. — ${m.projectedLeftoverValueFormatted}` : "Sin sobrante"}
          </span>
          <span role="cell">
            <span className={`status-badge status-${m.status.toLowerCase().replace(/\s/g, "-")}`}>
              {m.status}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SobranteRanking({ metrics }: { metrics: SkuMetric[] }) {
  if (metrics.length === 0) {
    return <p className="empty-state">Sin productos con sobrante proyectado.</p>;
  }
  const maxVal = metrics[0].projectedLeftoverValue;
  return (
    <div className="sobrante-list" role="list" aria-label="Productos con riesgo de sobrante">
      {metrics.map((m) => {
        const barPct = maxVal > 0 ? (m.projectedLeftoverValue / maxVal) * 100 : 0;
        return (
          <div className="sobrante-row" key={m.id} role="listitem">
            <div className="sobrante-meta">
              <span className="sobrante-name">{m.name}</span>
              <span className="sobrante-units">{m.projectedLeftover} u. estimadas</span>
              <span className="sobrante-value cell-risk">{m.projectedLeftoverValueFormatted}</span>
            </div>
            <div className="sobrante-track">
              <div className="sobrante-fill" style={{ width: `${barPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdoptionChart({ stats }: { stats: { approved: number; discarded: number; pending: number } }) {
  const total = stats.approved + stats.discarded + stats.pending;
  const pctApproved = total > 0 ? Math.round((stats.approved / total) * 100) : 0;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const approvedArc = (stats.approved / total) * circumference;
  const discardedArc = (stats.discarded / total) * circumference;

  return (
    <div className="adoption-wrap">
      <svg viewBox="0 0 140 140" className="adoption-donut" aria-label={`Adopción: ${pctApproved}% aprobadas`}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={14} />
        <circle
          cx={70} cy={70} r={r}
          fill="none"
          stroke="var(--green)"
          strokeWidth={14}
          strokeDasharray={`${approvedArc} ${circumference - approvedArc}`}
          strokeDashoffset={circumference / 4}
        />
        <circle
          cx={70} cy={70} r={r}
          fill="none"
          stroke="var(--copper)"
          strokeWidth={14}
          strokeDasharray={`${discardedArc} ${circumference - discardedArc}`}
          strokeDashoffset={circumference / 4 - approvedArc}
        />
        <text x={70} y={67} textAnchor="middle" fontSize={22} fontWeight={700} fill="var(--text)">{pctApproved}%</text>
        <text x={70} y={84} textAnchor="middle" fontSize={10} fill="var(--text-muted)">aprobadas</text>
      </svg>
      <dl className="adoption-stats">
        <div>
          <dt className="stat-approved">Aprobadas</dt>
          <dd>{stats.approved}</dd>
        </div>
        <div>
          <dt className="stat-discarded">Descartadas</dt>
          <dd>{stats.discarded}</dd>
        </div>
        <div>
          <dt className="stat-pending">Pendientes</dt>
          <dd>{stats.pending}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MetricasPage() {
  return (
    <>
      <DashboardNav />
      <main className="app-shell" id="metricas">
        <aside className="app-sidebar" aria-label="Contexto del evento">
          <div className="event-card">
            <p className="section-kicker">Evento</p>
            <h1>{eventSummary.name}</h1>
            <dl>
              <div><dt>Estado</dt><dd>{eventSummary.status}</dd></div>
              <div><dt>Ventana</dt><dd>{eventSummary.window}</dd></div>
              <div><dt>Modo</dt><dd>{eventSummary.mode}</dd></div>
            </dl>
          </div>

          <nav className="side-nav" aria-label="Secciones de métricas">
            <a href="#metricas-kpis">KPIs</a>
            <a href="#ventas-hora">Ventas por hora</a>
            <a href="#sell-through">Sell-through</a>
            <a href="#sku-table">Por SKU</a>
            <a href="#sobrante">Sobrante</a>
            <a href="#adopcion">Adopción</a>
            <a href="#recomendaciones-ia">Recomendaciones IA</a>
          </nav>
        </aside>

        <section className="app-main">
          <div className="dashboard-hero">
            <div>
              <p className="section-kicker">Métricas operativas</p>
              <h2>Análisis detallado del evento</h2>
              <p>Ventas por hora, margen por SKU, sell-through, riesgo de sobrante y adopción de recomendaciones. Todos los datos marcados como demo.</p>
            </div>
            <div className="event-meta" aria-label="Estado del evento">
              <span>{eventSummary.status}</span>
              <span>Última actualización {eventSummary.updatedAt}</span>
            </div>
          </div>

          <section id="metricas-kpis" className="dashboard-grid" aria-label="KPIs de métricas">
            {metricaKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </section>

          <section id="ventas-hora" className="metricas-section" aria-labelledby="ventas-hora-title">
            <div className="section-header">
              <h3 id="ventas-hora-title">Ventas por hora</h3>
              <span className="section-badge">Demo</span>
            </div>
            <p className="section-desc">Distribución simulada de unidades vendidas por período de 10 minutos para cada producto.</p>
            <HourlyBarChart series={hourlySeries} />
          </section>

          <section id="sell-through" className="metricas-section" aria-labelledby="sell-through-title">
            <div className="section-header">
              <h3 id="sell-through-title">Sell-through por SKU</h3>
              <span className="section-badge">Demo</span>
            </div>
            <p className="section-desc">Porcentaje vendido vs. objetivo. La línea vertical marca el target. Rojo indica brecha negativa.</p>
            <SellThroughBars metrics={skuMetrics} />
          </section>

          <section id="sku-table" className="metricas-section" aria-labelledby="sku-title">
            <div className="section-header">
              <h3 id="sku-title">Métricas por SKU</h3>
              <span className="section-badge">Demo</span>
            </div>
            <p className="section-desc">Ingresos, margen bruto, tasa de margen, velocidad de venta y sobrante proyectado por producto.</p>
            <SkuMetricsTable metrics={skuMetrics} />
          </section>

          <section id="sobrante" className="metricas-section" aria-labelledby="sobrante-title">
            <div className="section-header">
              <h3 id="sobrante-title">Riesgo de sobrante</h3>
              <span className="section-badge">Demo</span>
            </div>
            <p className="section-desc">Productos con unidades proyectadas sobrantes al cierre, ordenados por valor de costo en riesgo.</p>
            {productosLentos.length > 0 && (
              <div className="lentos-alert" role="alert">
                <strong>Productos lentos detectados:</strong>{" "}
                {productosLentos.map((p) => p.name).join(", ")} — sell-through bajo objetivo.
              </div>
            )}
            <SobranteRanking metrics={productosSobrante} />
          </section>

          <section id="adopcion" className="metricas-section" aria-labelledby="adopcion-title">
            <div className="section-header">
              <h3 id="adopcion-title">Adopción de recomendaciones</h3>
              <span className="section-badge">Demo</span>
            </div>
            <p className="section-desc">Proporción de recomendaciones aprobadas, descartadas y pendientes durante el evento.</p>
            <AdoptionChart stats={adoptionStats} />
          </section>

          <section id="recomendaciones-ia" className="metricas-section" aria-labelledby="ia-title">
            <div className="section-header">
              <h3 id="ia-title">Recomendaciones con IA</h3>
              <span className="section-badge ai-badge-header">Claude</span>
            </div>
            <p className="section-desc">El motor de negocio calcula las oportunidades. Claude transforma esos datos en mensajes claros y accionables para el productor.</p>
            <RecommendationsWithAI
              recommendations={recommendations}
              producerKpis={producerKpis}
              eventSummary={eventSummary}
            />
          </section>
        </section>
      </main>
    </>
  );
}
