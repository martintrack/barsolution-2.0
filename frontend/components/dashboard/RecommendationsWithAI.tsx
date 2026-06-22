"use client";

import { useState } from "react";
import type { EventSummary, Kpi, Recommendation } from "@/lib/types";

type Props = {
  recommendations: Recommendation[];
  producerKpis: Kpi[];
  eventSummary: EventSummary;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; texts: Record<string, string>; brief: string };

export function RecommendationsWithAI({ recommendations, producerKpis, eventSummary }: Props) {
  const [ai, setAi] = useState<AiState>({ status: "idle" });

  async function handleAnalyze() {
    setAi({ status: "loading" });
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendations, producerKpis, eventSummary })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      const texts: Record<string, string> = {};
      for (const r of data.recommendations ?? []) {
        texts[r.id] = r.aiText;
      }
      setAi({ status: "done", texts, brief: data.executiveBrief ?? "" });
    } catch (err) {
      setAi({ status: "error", message: err instanceof Error ? err.message : "Error al conectar con la IA." });
    }
  }

  return (
    <div className="decision-list">
      <div className="panel-heading">
        <h3>Decisiones comerciales priorizadas</h3>
        <span>{recommendations.length} activas</span>
      </div>

      {ai.status === "done" && ai.brief && (
        <div className="ai-brief">
          <span className="ai-badge">IA · Resumen ejecutivo</span>
          <p>{ai.brief}</p>
        </div>
      )}

      {recommendations.map((rec) => (
        <article
          className={`decision-item ${rec.priority === "high" ? "decision-high" : ""}`}
          key={rec.id}
        >
          <div>
            <span className="decision-type">{rec.type}</span>
            <h4>{rec.title}</h4>
            {ai.status === "done" && ai.texts[rec.id] ? (
              <p className="ai-text">{ai.texts[rec.id]}</p>
            ) : (
              <p>{rec.summary}</p>
            )}
            <small>Impacto estimado: {rec.estimatedMargin}</small>
          </div>
          <div className="decision-actions">
            <button type="button">Aprobar</button>
            <button type="button">Descartar</button>
          </div>
        </article>
      ))}

      <div className="ai-action-row">
        {ai.status === "idle" && (
          <button className="ai-analyze-btn" onClick={handleAnalyze} type="button">
            Analizar con IA
          </button>
        )}
        {ai.status === "loading" && (
          <span className="ai-loading">Generando recomendaciones…</span>
        )}
        {ai.status === "error" && (
          <span className="ai-error">
            {ai.message}
            <button onClick={handleAnalyze} type="button">Reintentar</button>
          </span>
        )}
        {ai.status === "done" && (
          <button className="ai-reset-btn" onClick={() => setAi({ status: "idle" })} type="button">
            Limpiar análisis IA
          </button>
        )}
      </div>
    </div>
  );
}
