import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api-response';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  // Police/admin see all incidents; citizens should use /api/complaints instead
  if (session.role === 'CITIZEN') return fail('Forbidden', 403);

  return ok(
    await prisma.incident.findMany({
      include: { location: true, detections: true, timeline: true },
      orderBy: { createdAt: 'desc' },
    })
  );
}

// Direct incident creation is not allowed — incidents are created via /api/complaints
export async function POST() {
  return fail('Incidents must be created by submitting a complaint via /api/complaints', 405);
}
