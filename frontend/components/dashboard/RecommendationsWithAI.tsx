"use client";

import { useState } from "react";
import type { EventSummary, Kpi, Recommendation } from "@/lib/types";

type AiRec = {
  id: string;
  aiText: string;
  urgency: string;
  action: string;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; recs: Record<string, AiRec>; brief: string; topPriority: string };

type Props = {
  recommendations: Recommendation[];
  producerKpis: Kpi[];
  eventSummary: EventSummary;
};

const URGENCY_CLASS: Record<string, string> = {
  "inmediata": "urgency-high",
  "próximos 30 min": "urgency-mid",
  "antes del cierre": "urgency-low"
};

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

      const recs: Record<string, AiRec> = {};
      for (const r of data.recommendations ?? []) {
        recs[r.id] = r;
      }
      setAi({ status: "done", recs, brief: data.executiveBrief ?? "", topPriority: data.topPriority ?? "" });
    } catch (err) {
      setAi({ status: "error", message: err instanceof Error ? err.message : "Error al conectar con Gemini." });
    }
  }

  return (
    <div className="decision-list">
      <div className="panel-heading">
        <h3>Decisiones comerciales priorizadas</h3>
        <span>{recommendations.length} activas</span>
      </div>

      {ai.status === "done" && (
        <>
          {ai.topPriority && (
            <div className="ai-top-priority">
              <span className="ai-badge">⚡ Acción prioritaria</span>
              <strong>{ai.topPriority}</strong>
            </div>
          )}
          {ai.brief && (
            <div className="ai-brief">
              <span className="ai-badge">Gemini · Resumen ejecutivo</span>
              <p>{ai.brief}</p>
            </div>
          )}
        </>
      )}

      {recommendations.map((rec) => {
        const aiRec = ai.status === "done" ? ai.recs[rec.id] : null;
        return (
          <article
            className={`decision-item ${rec.priority === "high" ? "decision-high" : ""}`}
            key={rec.id}
          >
            <div>
              <span className="decision-type">{rec.type}</span>
              <h4>{rec.title}</h4>

              {aiRec ? (
                <>
                  <p className="ai-text">{aiRec.aiText}</p>
                  <div className="ai-meta">
                    <span className={`urgency-badge ${URGENCY_CLASS[aiRec.urgency] ?? "urgency-low"}`}>
                      {aiRec.urgency}
                    </span>
                    <span className="ai-action-label">{aiRec.action}</span>
                  </div>
                </>
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
        );
      })}

      <div className="ai-action-row">
        {ai.status === "idle" && (
          <button className="ai-analyze-btn" onClick={handleAnalyze} type="button">
            ✦ Analizar con Gemini
          </button>
        )}
        {ai.status === "loading" && (
          <span className="ai-loading">Gemini analizando el evento…</span>
        )}
        {ai.status === "error" && (
          <span className="ai-error">
            {ai.message}
            <button onClick={handleAnalyze} type="button">Reintentar</button>
          </span>
        )}
        {ai.status === "done" && (
          <button className="ai-reset-btn" onClick={() => setAi({ status: "idle" })} type="button">
            Limpiar análisis
          </button>
        )}
      </div>
    </div>
  );
}
