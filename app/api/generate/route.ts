import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { review, stars, businessType, tone, businessName, language, proEmail, customInstructions } = body;

    if (!review || !stars || !businessType || !tone) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

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

    const usageCount = await getPrisma().usage.aggregate({
      where: { ipAddress },
      _sum: { count: true }
    });
    const currentTotal = usageCount._sum.count || 0;

    if (!isPro && currentTotal >= 2) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 2 respuestas de prueba gratuitas. Suscríbete a Pro para respuestas ilimitadas." },
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

    const isCustomMode = tone === 'custom' && customInstructions;

    const prompt = `Escribe 3 respuestas cortas a esta reseña de Google. Eres el dueño de un ${businessType} en España.

Reseña (${stars}/5): "${review}"

Tono: ${isCustomMode ? 'Personalizado según instrucciones' : toneDescription}

${isCustomMode ? `INSTRUCCIONES ESPECÍFICAS DEL DUEÑO (SÍGUELAS A RAJATABLA):
"${customInstructions}"

REGLAS PARA MODO PERSONALIZADO:
- Ignora cualquier borrador genérico.
- Céntrate 100% en incluir la información o el ángulo que el dueño ha pedido.
- Mantén la brevedad (máximo 2-3 frases).
- Genera 3 variaciones profesionales basadas en esa instrucción.` : 

        stars <= 2 ? `RESEÑA NEGATIVA — sé breve, profesional, y queda bien ante quien lo lea:
- Frase 1: Agradece o reconoce brevemente mencionando algo concreto de la reseña
- Frase 2: Invita a contactar directamente para solucionarlo
- MÁXIMO 2 frases. No más.
- NO te humilles, no inventes soluciones, no menciones si dicen que se van a otro sitio
- Que cualquier futuro cliente que lea esto piense "este negocio es serio y profesional"

${toneDescription === "profesional y empático" ?
          `Ejemplo: "Sentimos lo de las hamburguesas y patatas que faltaban en su pedido. Si nos contacta directamente podremos revisarlo y compensarle como es debido."
Ejemplo: "No es la experiencia que queremos dar con nuestros pedidos para llevar. Estamos a su disposición para resolverlo personalmente."` :
          toneDescription === "cercano, como el dueño del negocio" ?
            `Ejemplo: "Vaya, lo de que falten cosas en el pedido no tiene nombre. Escríbenos directamente y lo arreglamos."
Ejemplo: "Nos fastidia mucho lo de las hamburguesas y patatas que faltaban. Contacta con nosotros y lo solucionamos."` :
            `Ejemplo: "Las hamburguesas que se escapan del pedido no era el truco de magia que teníamos planeado. Escríbenos y lo arreglamos, esta vez sin sorpresas."
Ejemplo: "Patatas y hamburguesas desaparecidas... ni Houdini lo haría mejor. Bromas aparte, contacta con nosotros y lo solucionamos."`}` :

        stars === 3 ? `RESEÑA MEDIA — valora lo bueno, reconoce lo mejorable:
- Máximo 2-3 frases
- Agradece lo positivo que mencionan
- Reconoce brevemente lo negativo
- Cierra con invitación a volver` :

          `RESEÑA POSITIVA — agradece de forma natural:
- Máximo 2 frases
- Menciona algo concreto que dicen en la reseña
- Invita a volver de forma casual
- No seas empalagoso

${toneDescription === "profesional y empático" ?
            `Ejemplo: "Le agradecemos que destaque nuestra paella. Un placer atenderle, esperamos verle de nuevo."` :
            toneDescription === "cercano, como el dueño del negocio" ?
              `Ejemplo: "Nos alegra un montón que os gustara la paella. Volved cuando queráis, aquí os esperamos."` :
              `Ejemplo: "La paella os ha gustado... pues esperad a probar los postres. Volved pronto y lo comprobáis."`}`}

REGLAS:
- Menciona algo CONCRETO de la reseña
- ESTRUCTURA DE LAS 3 OPCIONES:
  1. RESPUESTA 1 (Corta): Máximo 1-2 frases. Muy directa.
  2. RESPUESTA 2 (Media): Máximo 2-3 frases. Equilibrada y profesional.
  3. RESPUESTA 3 (Detallada): Hasta 4 frases. Más cálida, explicativa e integradora.
- Las 3 respuestas deben sonar DIFERENTE
- Adapta vocabulario al tipo de negocio
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
    let newTotal = currentTotal + 1;
    await getPrisma().$transaction(async (tx: any) => {
      const existingUsage = await tx.usage.findFirst({
        where: { ipAddress },
        orderBy: { id: 'asc' }
      });

      if (existingUsage) {
        await tx.usage.update({
          where: { id: existingUsage.id },
          data: { count: { increment: 1 } },
        });
      } else {
        await tx.usage.create({
          data: { ipAddress, date: 'lifetime', count: 1 },
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

    return NextResponse.json({ responses: responsesArray, usageCount: newTotal });

  } catch (error: any) {
    if (error.message === 'Timeout') {
      return NextResponse.json({ error: "La generación ha tardado demasiado (timeout 15s)." }, { status: 504 });
    }
    console.error('Error in /api/generate:', error);
    return NextResponse.json({ error: "Ha ocurrido un error al generar las respuestas." }, { status: 500 });
  }
}
