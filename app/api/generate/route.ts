import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, stars, businessType, tone, businessName, language, extraInfo, proEmail } = body;

    if (!review || !stars || !businessType || !tone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    const today = new Date().toISOString().split('T')[0];

    // Check if user is Pro
    let isPro = false;
    if (proEmail) {
      const sub = await getPrisma().subscription.findUnique({
        where: { email: proEmail },
      });
      if (sub && sub.status === 'active') {
        isPro = true;
      }
    }

    let usage = await getPrisma().usage.findFirst({
      where: { ipAddress, date: today },
    });

    if (!isPro && usage && usage.count >= 5) {
      return NextResponse.json(
        { error: "Has alcanzado el límite diario de 5 respuestas gratuitas" },
        { status: 429 }
      );
    }

    // Prepare variables
    let toneDescription = tone;
    if (tone === "profesional") {
      toneDescription = "profesional y empático";
    } else if (tone === "cercano") {
      toneDescription = "cercano, como el dueño del negocio";
    } else if (tone === "humor" || tone === "gracioso") {
      toneDescription = "con humor inteligente y simpatía";
    }

    let extraInstructions = "";
    if (businessName) {
      extraInstructions += `\n- Firma las respuestas con el nombre del negocio: ${businessName}. Úsalo de forma natural, no solo al final.`;
    }
    if (language && language !== 'Español') {
      extraInstructions += `\n- Genera las respuestas en ${language}. El tono y estilo deben ser naturales en ese idioma, no una traducción literal.`;
    }
    if (extraInfo) {
      extraInstructions += `\n\nINFORMACIÓN EXTRA Y EVENTOS DEL NEGOCIO:\n${extraInfo}\n- IMPORTANTE: Usa esta información para personalizar la respuesta. Si hay eventos próximos o recomendaciones específicas (platos, servicios), incorpóralos de forma natural como una invitación o sugerencia para la próxima visita. No lo pongas como una lista, sino como parte de la conversación del dueño.`;
    }

    const prompt = `Eres el dueño de un negocio local en España. Respondes personalmente a las reseñas de Google de tu negocio.

CONTEXTO:
- Tipo de negocio: ${businessType}
- Reseña del cliente: ${stars} estrellas
- Tono deseado: ${toneDescription}

RESEÑA:
"${review}"

Genera 3 respuestas diferentes. Cada una debe:
- Tener 2-4 frases máximo
- Estar en español de España natural (tutear si es tono cercano, usted si es profesional)
- Mencionar algo CONCRETO que dice la reseña (un plato, un servicio, una queja específica)
- Si es negativa: reconocer el problema sin excusas, ofrecer solución concreta
- Si es positiva: agradecer sin ser empalagoso, invitar a volver de forma natural
- Si es media: valorar lo positivo y abordar lo negativo con honestidad
- PROHIBIDO usar: "Lamentamos las molestias", "Gracias por su feedback", "No dude en contactarnos", "Esperamos verle pronto", "Su opinión es muy importante"
- PROHIBIDO usar emojis
- Que suene como una persona REAL, no como una empresa corporativa${extraInstructions}

Responde SOLO JSON: ["resp1","resp2","resp3"]`;

    // Fetch from Anthropic with timeout
    const fetchWithTimeout = async () => {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }]
      });
      return response;
    };

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 15000);
    });

    const anthropicResponse: any = await Promise.race([fetchWithTimeout(), timeoutPromise]);

    const content = anthropicResponse.content[0].text;
    
    // Parse JSON
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
        throw new Error('No JSON found in response');
    }
    
    let responsesArray;
    try {
        responsesArray = JSON.parse(match[0]);
    } catch(e) {
        throw new Error('Failed to parse JSON');
    }

    // Use a transaction to ensure atomic increment and generation saving
    let newCount = 1;
    await getPrisma().$transaction(async (tx: any) => {
      if (usage) {
        const u = await tx.usage.update({
          where: { id: usage.id },
          data: { count: { increment: 1 } },
        });
        newCount = u.count;
      } else {
        await tx.usage.create({
          data: { ipAddress, date: today, count: 1 },
        });
      }

      await tx.generation.create({
        data: {
          review,
          stars,
          businessType,
          tone,
          responses: JSON.stringify(responsesArray),
          ipAddress
        }
      });
    });
    
    return NextResponse.json({ responses: responsesArray, usageCount: newCount });

  } catch (error: any) {
    if (error.message === 'Timeout') {
        return NextResponse.json({ error: "La generación ha tardado demasiado (timeout 15s)." }, { status: 504 });
    }
    console.error('Error in /api/generate:', error);
    return NextResponse.json({ error: "Ha ocurrido un error al generar las respuestas." }, { status: 500 });
  }
}
