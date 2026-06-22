import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
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
  urgency: "inmediata" | "próximos 30 min" | "antes del cierre";
  action: string;
};

type ResponseBody = {
  recommendations: AiRecommendation[];
  executiveBrief: string;
  topPriority: string;
};

const SYSTEM_PROMPT = `Eres el asistente operacional de Kobra, una plataforma de revenue management para barras de eventos en vivo.

Tu rol es transformar datos comerciales ya calculados en instrucciones claras, directas y accionables para el jefe de barra. Los datos vienen del motor de negocio de Kobra — no debes inventar métricas ni cambiar los valores recibidos.

Reglas estrictas:
- Usa SOLO los datos recibidos. No inventes números.
- Sé específico: nombra el producto, el margen estimado y la ventana de acción.
- Tono operacional: como si le hablaras al jefe de barra en pleno evento.
- Máximo 2 oraciones por recomendación.
- La acción debe ser un verbo imperativo concreto (ej: "Ofrece", "Detén descuento en", "Prioriza en zona").
- El resumen ejecutivo: 2-3 líneas, foco en margen y riesgo principal.
- Responde siempre en español chileno natural (no formal).
- Si los datos son demo, indica [DEMO] al inicio del brief.`;

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    recommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          aiText: { type: SchemaType.STRING, description: "Texto mejorado, máximo 2 oraciones operacionales" },
          urgency: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["inmediata", "próximos 30 min", "antes del cierre"],
            description: "Ventana de urgencia de la acción"
          },
          action: { type: SchemaType.STRING, description: "Verbo imperativo concreto, máximo 8 palabras" }
        },
        required: ["id", "aiText", "urgency", "action"]
      }
    },
    executiveBrief: {
      type: SchemaType.STRING,
      description: "Resumen ejecutivo para el productor, 2-3 líneas"
    },
    topPriority: {
      type: SchemaType.STRING,
      description: "La única acción más importante ahora mismo, una frase"
    }
  },
  required: ["recommendations", "executiveBrief", "topPriority"]
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_API_KEY no configurada en las variables de entorno." }, { status: 503 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
  }

  const { recommendations, producerKpis, eventSummary } = body;

  const recsText = recommendations.map((r) =>
    `ID: ${r.id} | Tipo: ${r.type} | Prioridad: ${r.priority}
Título: ${r.title}
Resumen: ${r.summary}
Impacto estimado: ${r.estimatedMargin}
Evidencia: ${r.evidence.map((e) => `${e.label}: ${e.value}`).join(" | ")}`
  ).join("\n\n");

  const kpisText = producerKpis.map((k) => `${k.label}: ${k.value}`).join(" | ");

  const userPrompt = `EVENTO: ${eventSummary.name} — ${eventSummary.status} — Ventana: ${eventSummary.window} — Modo: ${eventSummary.mode}

KPIs ACTUALES: ${kpisText}

RECOMENDACIONES A MEJORAR:
${recsText}

Genera el JSON con las recomendaciones mejoradas, el brief ejecutivo y la prioridad principal.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const parsed: ResponseBody = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido con Gemini.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
