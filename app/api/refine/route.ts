import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, currentResponse, instruction, proEmail } = body;

    if (!review || !currentResponse || !instruction) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Rate Limiting (Simple check, Pro skip)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const today = new Date().toISOString().split('T')[0];

    let isPro = false;
    if (proEmail) {
      const sub = await getPrisma().subscription.findUnique({
        where: { email: proEmail },
      });
      if (sub && sub.status === 'active') {
        isPro = true;
      }
    }

    // We don't increment the usage count for refinement as it's a sub-action, 
    // but we could if needed. 

    const prompt = `Modifica esta respuesta a una reseña de Google según las instrucciones del dueño del negocio.
    
Reseña original: "${review}"
Respuesta actual: "${currentResponse}"
Instrucción del dueño: "${instruction}"

REGLAS:
- Mantén el tono profesional y coherente con el tipo de negocio.
- Sé breve (máximo 2-3 frases).
- Si te piden añadir un dato (como un horario u oferta), inclúyelo de forma natural.
- Si te piden cambiar el estilo (más corto, más gracioso, etc.), hazlo respetando la reseña original.
- Devuelve SOLO el texto de la nueva respuesta. Sin etiquetas, sin explicaciones.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    });

    const anthropicResponse: any = response;
    const newResponse = anthropicResponse.content[0].text.trim();

    return NextResponse.json({ newResponse });

  } catch (error: any) {
    console.error('Error in /api/refine:', error);
    return NextResponse.json({ error: "No se ha podido refinar la respuesta." }, { status: 500 });
  }
}
