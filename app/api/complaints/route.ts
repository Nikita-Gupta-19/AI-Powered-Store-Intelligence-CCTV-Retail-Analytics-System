import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api-response';
import { z } from 'zod';
import path from 'path';
import { getSession } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.enum(['FOOTFALL_ENTRY', 'SHELF_INTERACTION', 'QUEUE_WAIT', 'POS_CHECKOUT', 'ANOMALY_SPILL', 'ANOMALY_THEFT']),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  address: z.string().min(5, 'Full address is required (at least 5 characters).'),
  landmark: z.string().optional().default(''),
  mediaUrls: z.array(z.string()).default([]),
});

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type AIResult = {
  summary: string;
  vehicles: Array<{ timestamp: string; vehicleType: string; licensePlate?: string | null; confidence: number }>;
  timeline: Array<{ time: string; label: string; confidence: number }>;
  incidentAnalysis?: {
    incidentDetected?: boolean;
    incidentType?: string;
    severity?: string;
    rawLabel?: string;
    severityLabel?: string;
    timestamp?: string;
    confidence?: number;
    reason?: string;
    source?: string;
    windows?: Array<{ time: string; label: string; confidence: number }>;
  };
};

// Fallback when Python AI service is unreachable
function fallbackAI(category: string): AIResult {
  const severity: Severity = category === 'ANOMALY_THEFT' ? 'HIGH' : 'MEDIUM';
  return {
    summary:
      'AI retail service was not reachable — fallback severity assigned based on retail category. Start the Python FastAPI AI service for YOLOv8 retail object tracking and queue wait-time analysis.',
    vehicles: [],
    timeline: [
      { time: 'N/A', label: `Category-based retail classifier flagged possible ${category.replace(/_/g, ' ')} activity`, confidence: 0.62 },
    ],
    incidentAnalysis: {
      incidentDetected: true,
      incidentType: category,
      severity,
      timestamp: 'N/A',
      confidence: 0.62,
      reason: 'Python AI service was unreachable. Severity estimated from store category.',
      source: 'nextjs_category_fallback',
    },
  };
}

// When no media is uploaded
function noMediaAI(category: string): AIResult {
  const severity: Severity = category === 'ANOMALY_THEFT' ? 'HIGH' : 'MEDIUM';
  return {
    summary: 'No media was provided for AI analysis. Severity estimated based on store category.',
    vehicles: [],
    timeline: [],
    incidentAnalysis: {
      incidentDetected: true,
      incidentType: category,
      severity,
      timestamp: 'N/A',
      confidence: 0.5,
      reason: 'No video or image was uploaded. Severity is estimated from the reported category.',
      source: 'no_media_fallback',
    },
  };
}

function publicUrlToLocalPath(url: string) {
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return path.join(process.cwd(), 'public', clean);
}

async function runAIAnalysis(mediaUrls: string[], category: string): Promise<AIResult> {
  const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
  if (!mediaUrls.length) return noMediaAI(category);

  const controller = new AbortController();
  // Vercel serverless has a strict 10s execution limit. Abort at 4.5s to trigger fallback gracefully.
  const isVercel = process.env.VERCEL === '1';
  const timeoutLimit = isVercel ? 4500 : 120000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutLimit);

  try {
    console.log('[AI] Starting analysis for:', mediaUrls);
    const res = await fetch(`${aiUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        media_paths: mediaUrls.map(publicUrlToLocalPath),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`AI service responded with ${res.status}`);

    const data = (await res.json()) as AIResult;
    return {
      summary: data.summary || 'AI media analysis completed.',
      vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
      timeline: Array.isArray(data.timeline) ? data.timeline : [],
      incidentAnalysis: data.incidentAnalysis,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const reason = err?.name === 'AbortError' ? 'AI service timed out after 90 seconds' : err.message;
    console.error('[AI] Analysis failed:', reason);
    return fallbackAI(category);
  }
}

// Maps AI severity to DB enum — LOW is valid!
function normalizeSeverity(value?: string): Severity {
  if (!value) return 'MEDIUM';
  const up = value.toUpperCase();
  if (up === 'LOW' || up === 'MEDIUM' || up === 'HIGH' || up === 'CRITICAL') return up as Severity;
  // NONE means no incident detected by AI but user filed one — use MEDIUM
  if (up === 'NONE') return 'MEDIUM';
  return 'MEDIUM';
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const where = session.role === 'CITIZEN' ? { userId: session.id } : {};
  return ok(
    await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
  );
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized — please log in to submit a complaint', 401);

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail(parsed.error.issues.map((i) => i.message).join(', '), 400);

  // Find the nearest location hotspot using Haversine formula
  const locations = await prisma.location.findMany();
  let loc = null;
  let minDistance = Infinity;

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  for (const l of locations) {
    const dist = getDistance(parsed.data.lat, parsed.data.lng, l.lat, l.lng);
    if (dist < minDistance) {
      minDistance = dist;
      loc = l;
    }
  }

  // Only link if it's within 15km
  if (minDistance > 15) {
    loc = null;
  }


  // Create the complaint — use raw SQL for address/landmark in case Prisma client is stale
  const complaint = await prisma.complaint.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      mediaUrls: JSON.stringify(parsed.data.mediaUrls),
      locationId: loc?.id,
      userId: session.id,
    },
  });

  // Patch address & landmark via raw SQL (works even if Prisma client is stale)
  const address = parsed.data.address ?? '';
  const landmark = parsed.data.landmark ?? '';
  if (address || landmark) {
    await prisma.$executeRawUnsafe(
      `UPDATE "Complaint" SET "address" = ?, "landmark" = ? WHERE "id" = ?`,
      address,
      landmark,
      complaint.id
    );
  }

  // Run AI analysis
  const ai = await runAIAnalysis(parsed.data.mediaUrls, parsed.data.category);
  const severity = normalizeSeverity(ai.incidentAnalysis?.severity);

  const incident = await prisma.incident.create({
    data: {
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      severity,
      lat: complaint.lat,
      lng: complaint.lng,
      mediaUrls: complaint.mediaUrls,
      aiSummary: JSON.stringify({
        summary: ai.summary,
        incidentAnalysis: ai.incidentAnalysis,
      }),
      locationId: loc?.id,
      complaintId: complaint.id,
      detections: {
        create: ai.vehicles.slice(0, 30).map((v) => ({
          timestamp: v.timestamp,
          vehicleType: v.vehicleType,
          licensePlate: v.licensePlate ?? null,
          confidence: v.confidence,
        })),
      },
      timeline: {
        create: ai.timeline.slice(0, 20).map((t) => ({
          time: t.time,
          label: t.label,
          confidence: t.confidence,
        })),
      },
    },
    include: { detections: true, timeline: true },
  });

  return ok({ complaint, incident, ai: ai.incidentAnalysis }, 201);
}
