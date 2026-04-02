import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import getPrisma from '@/lib/prisma';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    await getPrisma().subscription.upsert({
      where: { email: session.customer_details.email },
      update: {
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: subscription.status,
      },
      create: {
        email: session.customer_details.email,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: subscription.status,
      },
    });
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    const email = (customer as Stripe.Customer).email;

    if (email) {
      await getPrisma().subscription.update({
        where: { email },
        data: {
          status: subscription.status,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
