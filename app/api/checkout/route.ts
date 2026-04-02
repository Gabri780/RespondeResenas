import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: Request) {
  // Verificación de variables de entorno (para ayudar al usuario si faltan)
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
    return NextResponse.json({ error: 'Falta configurar STRIPE_SECRET_KEY en el servidor.' }, { status: 500 });
  }
  if (!process.env.STRIPE_PRICE_ID || process.env.STRIPE_PRICE_ID.includes('price_...')) {
    return NextResponse.json({ error: 'Falta configurar STRIPE_PRICE_ID en el servidor.' }, { status: 500 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: "https://responderesenas.vercel.app/app?success=true",
      cancel_url: "https://responderesenas.vercel.app/pricing",
      customer_email: email,
      metadata: {
        email,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
