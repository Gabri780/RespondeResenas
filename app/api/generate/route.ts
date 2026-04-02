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

    const prompt = `Eres ${businessName || "el dueño de un " + businessType} en España. Respondes personalmente a cada reseña porque te importa tu negocio y tus clientes.

RESEÑA (${stars} estrellas):
"${review}"

NEGOCIO: ${businessType}
TONO: ${toneDescription}

INSTRUCCIONES POR TONO:

Si tono es "profesional y empático":
- Habla de usted
- Educado pero humano, no corporativo
- Ejemplo: "Le agradezco que nos cuente su experiencia. Lo del tiempo de espera no es lo habitual y tomamos nota. Nos encantaría que nos diese otra oportunidad."

Si tono es "cercano, como el dueño del negocio":
- Tutea al cliente
- Habla como un dueño real, directo y cálido
- Usa expresiones naturales españolas
- Ejemplo: "Qué rabia lo de la espera, de verdad. No es lo normal y lo sabemos. Pásate otro día y verás que la cosa cambia."

Si tono es "con humor inteligente y simpatía":
- Tutea al cliente
- Humor elegante, ingenio, juegos de palabras
- Incluso en negativas, desarma con gracia sin faltar al respeto
- Ejemplo: "Lo de la espera no tiene nombre... bueno sí, tiene nombre: la culpa fue nuestra. Vuelve y te prometemos que el reloj irá más rápido (o al menos la cocina)."

REGLAS OBLIGATORIAS:

1. MENCIONA ALGO CONCRETO de la reseña. Si hablan de croquetas, di croquetas. Si hablan de la espera, habla de la espera. Si mencionan a un camarero, habla del equipo. PROHIBIDO responder sin referencia a algo específico de la reseña.

2. VOCABULARIO DEL SECTOR:
- Restaurante/bar: platos, cocina, barra, carta, equipo de sala
- Hotel: estancia, habitación, recepción, descanso
- Peluquería: corte, tratamiento, look, estilista
- Tienda: productos, colección, atención
- Clínica: consulta, tratamiento, especialista
- Taller: reparación, revisión, vehículo, técnico

3. RESEÑAS NEGATIVAS (1-2 estrellas):
- Reconoce el fallo concreto sin hundirte
- NO inventes soluciones: PROHIBIDO decir "hemos implementado", "hemos reforzado", "nuevo protocolo", "hemos hablado con el equipo"
- NO seas excesivamente sumiso: PROHIBIDO "tiene toda la razón", "es inaceptable", "no hay excusa"
- NO valides irse a la competencia: PROHIBIDO "comprendo que se vaya a X", "entiendo que no quiera volver", "es normal que busque alternativas"
- NO uses frases corporativas: PROHIBIDO "lamentamos las molestias", "su opinión es muy importante", "no dude en contactarnos"
- SÍ reconoce el problema con honestidad pero manteniendo la dignidad del negocio
- SÍ invita a volver o contactar para solucionarlo
- Recuerda: esta respuesta la leen TODOS los futuros clientes, no solo quien escribió

4. RESEÑAS POSITIVAS (4-5 estrellas):
- Agradece sin ser empalagoso
- Destaca algo concreto que mencionan
- Invita a volver de forma natural, no forzada

5. RESEÑAS MEDIAS (3 estrellas):
- Valora lo positivo
- Aborda lo negativo con honestidad sin hundirte

6. LAS 3 RESPUESTAS DEBEN SER CLARAMENTE DIFERENTES:
- Opción 1: Centrada en agradecer y reconocer la experiencia
- Opción 2: Centrada en el detalle específico que mencionan
- Opción 3: Centrada en la invitación a volver o solucionar

7. Máximo 3 frases por respuesta. Breve y directo.
8. Sin emojis. Sin hashtags.
${extraInstructions}

ANTES DE GENERAR, REPASA ESTA CHECKLIST PARA CADA RESPUESTA:
- ¿Digo "tiene razón"? → REESCRIBE
- ¿Invento algo que el negocio supuestamente va a hacer? → REESCRIBE
- ¿Valido que el cliente se vaya a otro sitio? → REESCRIBE
- ¿Suena como un email de atención al cliente de una gran empresa? → REESCRIBE
- ¿Tiene más de 3 frases? → ACORTA
- ¿Podría servir para cualquier negocio sin cambiar nada? → REESCRIBE, hazla más específica

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
