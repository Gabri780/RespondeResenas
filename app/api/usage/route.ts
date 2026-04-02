import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  const today = new Date().toISOString().split('T')[0];

  const usage = await getPrisma().usage.findFirst({
    where: { ipAddress, date: today },
  });

  return NextResponse.json({ count: usage ? usage.count : 0 });
}
