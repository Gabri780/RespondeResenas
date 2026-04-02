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

    const prompt = `Genera 3 respuestas a esta reseña de Google para un ${businessType} en España.

RESEÑA (${stars}/5 estrellas): "${review}"

TONO ELEGIDO: ${toneDescription}

CÓMO DEBE SONAR CADA TONO:

PROFESIONAL:
- Habla de usted
- Breve, educado, con dignidad
- Ejemplo positiva: "Le agradecemos que destaque nuestro [cosa específica]. Es un placer atenderle y esperamos verle de nuevo."
- Ejemplo negativa: "Sentimos lo de [problema concreto]. Lo tenemos en cuenta. Si nos da otra oportunidad, estaremos atentos."
- Ejemplo media: "Nos alegra que disfrutara de [lo bueno]. Sobre [lo malo], tomamos nota para mejorar."

CERCANO:
- Tutea al cliente
- Como hablaría el dueño en persona, directo y cálido
- Ejemplo positiva: "Nos alegra un montón que te gustara [cosa específica]. Vuelve cuando quieras, aquí te esperamos."
- Ejemplo negativa: "Vaya, lo de [problema concreto] no mola nada y lo sabemos. Pásate otra vez y verás que la cosa es distinta."
- Ejemplo media: "Qué bien que te gustara [lo bueno]. Lo de [lo malo] lo tenemos fichado. A ver si la próxima es un 5."

CON HUMOR:
- Tutea al cliente
- Ingenio, juegos de palabras, que el lector sonría
- Ejemplo positiva: "Eso de [cosa específica] se lo vamos a enseñar al equipo para que se les suba el ego (un poquito, tampoco mucho). Vuelve pronto."
- Ejemplo negativa: "Lo de [problema concreto]... sí, ahí no tenemos excusa bonita que valga. Pero si nos das otra oportunidad, prometemos poner las pilas (y las patatas, y lo que haga falta)."
- Ejemplo media: "Lo de [lo bueno] nos saca una sonrisa. Lo de [lo malo]... eso nos la quita. Trabajaremos en equilibrar la balanza."

REGLAS PARA NEGATIVAS (1-2 estrellas):
- Objetivo: quedar bien ante futuros clientes que lean esto
- Menciona el problema concreto, breve, sin arrastrarte
- NO inventes soluciones ("hemos implementado", "nuevo protocolo", "hemos reforzado")
- NO valides irse a la competencia ("comprendo que busque alternativas")
- NO te humilles ("tiene toda la razón", "es inaceptable")
- NO uses frases de call center ("lamentamos las molestias", "su opinión es importante")
- IGNORA si mencionan irse a otro sitio — no lo comentes

REGLAS PARA POSITIVAS (4-5 estrellas):
- Agradece mencionando algo específico de la reseña
- Breve y natural, sin ser empalagoso
- Invita a volver de forma casual

REGLAS PARA MEDIAS (3 estrellas):
- Valora lo positivo que mencionan
- Aborda lo negativo brevemente sin excusas
- Deja buena impresión final

REGLAS GENERALES:
- Máximo 2-3 frases. NUNCA más de 3.
- Menciona algo ESPECÍFICO de la reseña
- Adapta vocabulario al sector (restaurante=platos/cocina, hotel=estancia, peluquería=corte/tratamiento, tienda=productos, clínica=consulta, taller=reparación)
- Las 3 respuestas deben ser CLARAMENTE DIFERENTES entre sí
- Sin emojis, sin hashtags
${extraInstructions}

JSON: ["resp1","resp2","resp3"]`;

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
    } catch (e) {
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
