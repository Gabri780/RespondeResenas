import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, stars, businessType, tone, businessName, language, proEmail } = body;

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

    const prompt = `Escribe 3 respuestas cortas a esta reseña de Google. Eres el dueño de un ${businessType} en España respondiendo personalmente.

Reseña (${stars}/5): "${review}"

Tono: ${toneDescription}

${toneDescription === "profesional y empático" ? `TONO PROFESIONAL — habla de usted, educado pero HUMANO (no corporativo):
Bien: "Sentimos mucho lo de las hamburguesas y patatas que faltaban. No es lo que queremos ofrecer y lo tenemos presente. Si nos da otra oportunidad, estaremos pendientes."
Bien: "Gracias por contárnoslo. Que falten cosas en el pedido es un fallo que nos tomamos en serio. Esperamos poder atenderle mejor la próxima vez."
Mal: "Reconocemos que nuestros estándares no se están cumpliendo" (suena a multinacional)
Mal: "Le invitamos a contactarnos a través de nuestros canales oficiales" (nadie habla así)
Mal: "Estos incidentes serán revisados por nuestro equipo" (corporativo)` :

toneDescription === "cercano, como el dueño del negocio" ? `TONO CERCANO — tutea, habla como el dueño en la barra:
Bien: "Vaya, lo de que falten hamburguesas y patatas no tiene nombre. Lo sabemos y nos fastidia. Pásate otro día y verás que la cosa cambia."
Bien: "Qué rabia lo de los pedidos incompletos, en serio. No es lo normal. Si te animas a volver, estaremos atentos."
Mal: "Entendemos tu frustración y trabajaremos para mejorar" (suena a robot)
Mal: "Tomamos nota de tu feedback" (nadie dice feedback en un bar)` :

`TONO CON HUMOR — tutea, ingenio y gracia sin faltar al respeto:
Bien: "Lo de las hamburguesas desaparecidas es un misterio que ni Scooby-Doo resolvería. Bromas aparte, es un fallo nuestro y lo sentimos. Danos otra oportunidad y esta vez contamos las hamburguesas dos veces."
Bien: "Patatas y hamburguesas que se pierden por el camino... ojalá fuera porque se las come el repartidor, pero no, es culpa nuestra. Si vuelves, te prometemos un pedido con todo y sin sorpresas."
Mal: "Lamentamos la situación y estamos implementando mejoras" (ni gracioso ni humano)`}

REGLAS:
- Máximo 2-3 frases. Breve y directo.
- Menciona algo CONCRETO de la reseña (hamburguesas, patatas, espera, lo que sea)
- Si mencionan irse a otro sitio, IGNÓRALO — no lo comentes
- NO inventes soluciones ("hemos implementado", "nuevo protocolo")
- NO te humilles ("tiene toda la razón", "es inaceptable")
- Las 3 respuestas deben sonar DIFERENTE entre sí
- Que suene a PERSONA REAL, no a departamento de atención al cliente
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
