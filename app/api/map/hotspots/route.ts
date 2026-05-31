import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api-response';

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
const severityWeight: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 5 };
const severityRank: Record<Severity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

function bucket(lat: number, lng: number) {
  // About 1.1 km buckets around Delhi NCR. Good enough for live hotspot visualization.
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export async function GET() {
  const [incidents, alerts, locations] = await Promise.all([
    prisma.incident.findMany({ include: { location: true }, orderBy: { createdAt: 'desc' } }),
    prisma.alert.findMany({ orderBy: { timestamp: 'desc' } }),
    prisma.location.findMany(),
  ]);

  const grouped = new Map<string, any>();
  for (const incident of incidents) {
    const key = bucket(incident.lat, incident.lng);
    const current = grouped.get(key) || {
      id: key,
      lat: incident.lat,
      lng: incident.lng,
      count: 0,
      score: 0,
      severity: 'LOW' as Severity,
      categories: {} as Record<string, number>,
      latestIncidentTitle: incident.title,
    };

    const severity = incident.severity as Severity;
    current.count += 1;
    current.score += severityWeight[severity] || 1;
    current.categories[incident.category] = (current.categories[incident.category] || 0) + 1;
    if (severityRank[severity] > severityRank[current.severity as Severity]) current.severity = severity;
    current.latestIncidentTitle = incident.title;
    grouped.set(key, current);
  }

  const hotspots = Array.from(grouped.values())
    .map((h) => ({ ...h, radius: Math.min(1800, 250 + h.score * 120) }))
    .sort((a, b) => b.score - a.score);

  return ok({ incidents, alerts, locations, hotspots, updatedAt: new Date().toISOString() });
}
