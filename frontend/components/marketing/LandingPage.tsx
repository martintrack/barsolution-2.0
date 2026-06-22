import { ButtonLink } from "@/components/primitives/ButtonLink";
import { MarketingNav } from "./MarketingNav";

export function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main id="top">
        <section className="hero landing-hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="section-kicker">Revenue management para eventos</p>
            <h1 id="hero-title">Más margen en barra, menos stock sobrante al cierre</h1>
            <p className="hero-lede">
              Kobra ayuda a productoras a transformar ventas de barra en decisiones comerciales durante el evento: qué empujar, qué no descontar y qué stock mover antes de que sea tarde.
            </p>
            <div className="hero-actions" aria-label="Acciones principales">
              <ButtonLink href="#product">Ver propuesta</ButtonLink>
              <ButtonLink href="/dashboard" variant="secondary">
                Ver dashboard demo
              </ButtonLink>
            </div>
            <p className="hero-note">
              Una oportunidad de software B2B para productoras que ya venden barra, pero aún no gestionan revenue en tiempo real.
            </p>
          </div>

          <aside className="ops-console landing-console" aria-label="Resumen operativo demo">
            <div className="console-header">
              <div>
                <p className="eyebrow">Evento en curso</p>
                <h2>Warehouse Club 23:40</h2>
              </div>
              <span className="status-pill">Demo</span>
            </div>
            <div className="signal-grid" aria-label="Indicadores principales">
              <Metric label="Margen estimado" value="$3.6M" detail="+8.4% vs objetivo" />
              <Metric label="Ventas/hora" value="$1.2M" detail="Ritmo estable" />
              <Metric label="Stock en riesgo" value="312" detail="Unidades proyectadas" />
            </div>
            <div className="live-demand-card" aria-label="Señal de demanda en vivo">
              <div>
                <span className="live-dot" aria-hidden="true" />
                <p className="eyebrow">Señal en vivo</p>
                <h3>Piscolas bajo ritmo esperado</h3>
              </div>
              <strong>-31%</strong>
            </div>
            <div className="recommendation-strip">
              <div className="priority-line" aria-hidden="true" />
              <div>
                <p className="eyebrow">Oportunidad detectada</p>
                <h3>Riesgo de sobrante en piscolas</h3>
                <p>Stock alto, demanda bajo objetivo. Evaluar oferta 2x1 por 35 minutos con margen mínimo protegido.</p>
              </div>
            </div>
            <div className="hero-recommendation-popover" role="status" aria-live="polite">
              <div className="popover-topline">
                <span>Recomendación Kobra</span>
                <strong>Alta prioridad</strong>
              </div>
              <h3>Piscolas con baja demanda y stock alto</h3>
              <p>Armamos oferta 2x1 por 35 minutos para mover 86 unidades sin bajar del margen mínimo.</p>
              <dl className="popover-evidence">
                <div>
                  <dt>Impacto</dt>
                  <dd>+$124K</dd>
                </div>
                <div>
                  <dt>Sobrante</dt>
                  <dd>-42%</dd>
                </div>
                <div>
                  <dt>Margen</dt>
                  <dd>Protegido</dd>
                </div>
              </dl>
              <div className="popover-actions" aria-label="Acciones de recomendación">
                <button className="popover-button popover-reject" type="button">Rechazar</button>
                <button className="popover-button popover-edit" type="button">Editar</button>
                <button className="popover-button popover-accept" type="button">Aceptar</button>
              </div>
            </div>
            <div className="proof-list" aria-label="Diferencia del producto">
              <div>
                <span>Impacto</span>
                <strong>Prioriza acciones que pueden proteger margen durante la operación.</strong>
              </div>
              <div>
                <span>Decisión</span>
                <strong>El productor decide con evidencia, margen estimado y riesgo de sobrante.</strong>
              </div>
            </div>
          </aside>
        </section>

        <section id="product" className="band band-muted" aria-labelledby="product-title">
          <div className="section-head">
            <p className="section-kicker">Propuesta comercial</p>
            <h2 id="product-title">Un cockpit de revenue para productoras que venden barra</h2>
            <p>
              La productora no necesita otra pantalla bonita: necesita saber dónde está perdiendo margen, qué producto puede sobrar y qué decisión tomar ahora. Kobra convierte datos de venta e inventario en recomendaciones accionables para capturar más valor por evento.
            </p>
          </div>
          <div className="feature-grid">
            <Feature number="01" title="Más visibilidad durante el evento" copy="Ventas, margen, stock y ritmo se leen en una sola vista para decidir con información actualizada." />
            <Feature number="02" title="Menos decisiones por intuición" copy="El sistema muestra evidencia antes de sugerir una oferta, un empuje comercial o una alerta de no descuento." />
            <Feature number="03" title="Mejor cierre comercial" copy="La meta es reducir sobrantes, proteger margen y aumentar la adopción de decisiones útiles." />
          </div>
        </section>

        <section id="value" className="band" aria-labelledby="value-title">
          <div className="section-head">
            <p className="section-kicker">Valor para productoras</p>
            <h2 id="value-title">El resultado esperado no es más datos, es mejor decisión comercial</h2>
          </div>
          <div className="feature-grid value-grid">
            <Feature number="Margen" title="Proteger productos rentables" copy="Evita descuentos innecesarios sobre SKUs que ya rotan bien y aportan margen." />
            <Feature number="Stock" title="Reducir sobrantes" copy="Detecta productos lentos con stock alto antes de que el evento termine." />
            <Feature number="Decisión" title="Priorizar por impacto" copy="Ordena las acciones por margen estimado, urgencia y evidencia comercial." />
          </div>
        </section>

        <section id="mvp" className="band band-muted" aria-labelledby="mvp-title">
          <div className="section-head">
            <p className="section-kicker">MVP</p>
            <h2 id="mvp-title">Un MVP defendible para presentar, probar y evolucionar</h2>
            <p>
              La primera versión demuestra una tesis simple: si una productora puede ver margen, stock y rotación durante el evento, puede tomar mejores decisiones comerciales antes del cierre.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

function Feature({ number, title, copy }: { number: string; title: string; copy: string }) {
  return (
    <article className="feature-card">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}
