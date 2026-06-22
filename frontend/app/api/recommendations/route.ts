import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { EventSummary, Kpi, Recommendation } from "@/lib/types";

type RequestBody = {
  recommendations: Recommendation[];
  producerKpis: Kpi[];
  eventSummary: EventSummary;
};

type AiRecommendation = {
  id: string;
  aiText: string;
};

type ResponseBody = {
  recommendations: AiRecommendation[];
  executiveBrief: string;
};

const SYSTEM_PROMPT = `Eres el motor de comunicación de Kobra, una plataforma de revenue management para barras de eventos.
Tu trabajo es tomar datos estructurados ya calculados por el motor de negocio y transformarlos en mensajes claros, directos y accionables para el jefe de barra o productor.

Reglas estrictas:
- NO inventes métricas ni valores. Usa solo los datos que recibes.
- Sé específico: menciona el producto, el margen estimado y la ventana de acción cuando estén disponibles.
- Tono: operacional, sin rodeos. Máximo 2 oraciones por recomendación.
- El resumen ejecutivo debe ser 1 párrafo de 3 líneas máximo.
- Responde siempre en español.
- Marca con [DEMO] al inicio si los datos son simulados.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada." }, { status: 503 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const { recommendations, producerKpis, eventSummary } = body;

  const recsText = recommendations
    .map(
      (r) =>
        `ID: ${r.id}
Tipo: ${r.type} | Prioridad: ${r.priority}
Título: ${r.title}
Resumen actual: ${r.summary}
Impacto estimado: ${r.estimatedMargin}
Evidencia: ${r.evidence.map((e) => `${e.label}: ${e.value}`).join(", ")}`
    )
    .join("\n\n");

  const kpisText = producerKpis.map((k) => `${k.label}: ${k.value} (${k.detail})`).join("\n");

  const userPrompt = `Evento: ${eventSummary.name} — ${eventSummary.status} — ${eventSummary.window}
Modo: ${eventSummary.mode}

KPIs del productor:
${kpisText}

Recomendaciones a mejorar:
${recsText}

Devuelve un JSON con esta estructura exacta:
{
  "recommendations": [
    { "id": "<mismo id>", "aiText": "<texto mejorado, máximo 2 oraciones>" }
  ],
  "executiveBrief": "<párrafo ejecutivo de 3 líneas>"
}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }]
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Respuesta del modelo no tiene JSON válido." }, { status: 500 });
    }

    const parsed: ResponseBody = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
