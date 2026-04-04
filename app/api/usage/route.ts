import { NextResponse } from 'next/server';
import getPrisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
  const usageCount = await getPrisma().usage.aggregate({
    where: { ipAddress },
    _sum: { count: true }
  });

  return NextResponse.json({ count: usageCount._sum.count || 0 });
}
