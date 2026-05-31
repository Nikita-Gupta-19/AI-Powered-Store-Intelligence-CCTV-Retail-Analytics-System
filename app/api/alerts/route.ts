import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api-response';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// All valid store intelligence categories
const INCIDENT_TYPES = [
  'FOOTFALL_ENTRY',
  'SHELF_INTERACTION',
  'QUEUE_WAIT',
  'POS_CHECKOUT',
  'ANOMALY_SPILL',
  'ANOMALY_THEFT',
] as const;

// Map AI-returned behaviors to valid retail DB enum values
function normalizeIncidentType(raw: string): typeof INCIDENT_TYPES[number] {
  const up = raw.toUpperCase().replace(/ /g, '_');
  if ((INCIDENT_TYPES as readonly string[]).includes(up)) return up as typeof INCIDENT_TYPES[number];
  if (up === 'ACCIDENT' || up === 'CRASH') return 'ANOMALY_SPILL';
  if (up === 'THEFT') return 'ANOMALY_THEFT';
  if (up === 'NORMAL') return 'FOOTFALL_ENTRY';
  return 'SHELF_INTERACTION';
}

const alertSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  incidentType: z.string().min(1), // Accept any string, normalize below
  locationName: z.string().min(2),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  lat: z.number(),
  lng: z.number(),
  incidentId: z.string().nullable().optional(),
});

export async function GET() {
  return ok(await prisma.alert.findMany({ orderBy: { timestamp: 'desc' } }));
}

export async function POST(req: Request) {
  // Only store managers/admin can issue alerts
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  if (session.role === 'CITIZEN') return fail('Only store managers can issue operational alerts', 403);

  try {
    const body = await req.json();
    const parsed = alertSchema.safeParse(body);
    if (!parsed.success) {
      return fail(parsed.error.issues.map((i) => i.message).join(', '), 400);
    }

    const { title, message, locationName, severity, lat, lng, incidentId } = parsed.data;
    const incidentType = normalizeIncidentType(parsed.data.incidentType);

    const alert = await prisma.alert.create({
      data: {
        title,
        message,
        incidentType,
        locationName,
        severity,
        lat,
        lng,
        incidentId: incidentId ?? null,
      },
    });

    return ok(alert, 201);
  } catch (err: any) {
    console.error('[alerts POST]', err);
    return fail('Failed to create alert: ' + (err.message ?? 'unknown error'), 500);
  }
}
