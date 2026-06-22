import type { Recommendation } from "@/lib/types";

type RecommendationsPanelProps = {
  recommendations: Recommendation[];
};

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <div className="decision-list">
      <div className="panel-heading">
        <h3>Decisiones comerciales priorizadas</h3>
        <span>{recommendations.length} activas</span>
      </div>
      {recommendations.map((recommendation) => (
        <article className={`decision-item ${recommendation.priority === "high" ? "decision-high" : ""}`} key={recommendation.id}>
          <div>
            <span className="decision-type">{recommendation.type}</span>
            <h4>{recommendation.title}</h4>
            <p>{recommendation.summary}</p>
            <small>Impacto estimado: {recommendation.estimatedMargin}</small>
          </div>
          <div className="decision-actions">
            <button type="button">Aprobar</button>
            <button type="button">Descartar</button>
          </div>
        </article>
      ))}
    </div>
  );
}
