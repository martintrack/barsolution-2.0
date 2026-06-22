import { ActivityList } from "@/components/dashboard/ActivityList";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RecommendationsWithAI } from "@/components/dashboard/RecommendationsWithAI";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import type { DashboardSnapshot } from "@/lib/types";

type DashboardPageProps = {
  snapshot: DashboardSnapshot;
};

export function DashboardPage({ snapshot }: DashboardPageProps) {
  const { chartSeries, commercialSignals, decisionLog, eventSummary, financialSummary, inventoryRisks, producerKpis, recommendations } = snapshot;
  const primaryEvidence = recommendations[0]?.evidence ?? [];

  return (
    <>
      <DashboardNav />
      <main className="app-shell" id="dashboard">
        <aside className="app-sidebar" aria-label="Contexto del evento">
          <div className="event-card">
            <p className="section-kicker">Evento</p>
            <h1>{eventSummary.name}</h1>
            <dl>
              <div>
                <dt>Estado</dt>
                <dd>{eventSummary.status}</dd>
              </div>
              <div>
                <dt>Ventana</dt>
                <dd>{eventSummary.window}</dd>
              </div>
              <div>
                <dt>Modo</dt>
                <dd>{eventSummary.mode}</dd>
              </div>
            </dl>
          </div>

          <nav className="side-nav" aria-label="Vistas del dashboard">
            <a href="#overview">Overview</a>
            <a href="#recommendations">Recomendaciones</a>
            <a href="#inventory">Inventario</a>
            <a href="#logs">Logs</a>
          </nav>

          <div className="engine-card">
            <span>Resumen ejecutivo</span>
            <strong>{eventSummary.executiveSummary}</strong>
            <p>{recommendations.length} oportunidades activas y {producerKpis[2]?.value.toLowerCase()} con riesgo de sobrante.</p>
          </div>
        </aside>

        <section className="app-main">
          <div className="dashboard-hero">
            <div>
              <p className="section-kicker">Revenue cockpit</p>
              <h2>Resultados, margen y riesgo comercial del evento</h2>
              <p>Vista para productor basada en datos de Supabase. El objetivo es mostrar cuánto margen se puede proteger, qué stock podría sobrar y qué decisiones comerciales tienen prioridad.</p>
            </div>
            <div className="event-meta" aria-label="Estado del evento">
              <span>{eventSummary.status}</span>
              <span>Última actualización {eventSummary.updatedAt}</span>
            </div>
          </div>

          <section id="overview" className="dashboard-grid" aria-label="Resumen de KPIs">
            {producerKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </section>

          <section className="dashboard-layout">
            <RevenueChart series={chartSeries} />
            <aside className="insight-panel run-panel" aria-label="Resumen financiero">
              <div className="panel-heading">
                <h3>Resumen financiero</h3>
                <span>Evento activo</span>
              </div>
              <dl className="run-list">
                <div>
                  <dt>Ventas acumuladas</dt>
                  <dd>{financialSummary.sales}</dd>
                </div>
                <div>
                  <dt>Margen estimado</dt>
                  <dd>{financialSummary.margin}</dd>
                </div>
                <div>
                  <dt>Riesgo sobrante</dt>
                  <dd>{financialSummary.leftoverRisk}</dd>
                </div>
              </dl>
            </aside>
          </section>

          <section id="recommendations" className="dashboard-layout" aria-label="Recomendaciones y evidencia">
            <RecommendationsWithAI recommendations={recommendations} producerKpis={producerKpis} eventSummary={eventSummary} />
            <aside className="evidence-panel" aria-label="Evidencia de recomendación">
              <div className="panel-heading">
                <h3>Evidencia</h3>
                <span>{recommendations[0]?.type ?? "Sin alerta"}</span>
              </div>
              <dl className="evidence-list">
                {primaryEvidence.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="evidence-copy">Regla disparada: stock alto + rotación bajo objetivo + margen mínimo protegido.</p>
            </aside>
          </section>

          <InventoryTable rows={inventoryRisks} />

          <section id="logs" className="dashboard-layout compact-layout" aria-label="Actividad reciente">
            <ActivityList title="Señales comerciales" eyebrow="Última hora" items={commercialSignals} />
            <ActivityList title="Decisiones aprobadas" eyebrow="Impacto demo" items={decisionLog} />
          </section>
        </section>
      </main>
    </>
  );
}
