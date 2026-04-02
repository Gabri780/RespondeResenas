import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const subscription = await getPrisma().subscription.findUnique({
      where: { email },
    });

    if (subscription && subscription.status === 'active') {
      return NextResponse.json({ isPro: true });
    }

    return NextResponse.json({ isPro: false });
  } catch (error: any) {
    console.error('Error verifying Pro status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
