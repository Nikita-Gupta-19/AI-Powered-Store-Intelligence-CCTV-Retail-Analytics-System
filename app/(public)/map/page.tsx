import PublicLayout from '@/components/layout/PublicLayout';
import CrimeMapLive from '@/components/map/CrimeMapLive';
import { prisma } from '@/lib/prisma';

async function getInitialMapData() {
  const [incidents, alerts, locations] = await Promise.all([
    prisma.incident.findMany({ include: { location: true }, orderBy: { createdAt: 'desc' } }),
    prisma.alert.findMany({ orderBy: { timestamp: 'desc' } }),
    prisma.location.findMany(),
  ]);

  const severityWeight: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 5 };
  const severityRank: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

  function bucket(lat: number, lng: number) {
    return `${lat.toFixed(2)},${lng.toFixed(2)}`;
  }

  const grouped = new Map<string, any>();
  for (const incident of incidents) {
    const key = bucket(incident.lat, incident.lng);
    const current = grouped.get(key) || {
      id: key,
      lat: incident.lat,
      lng: incident.lng,
      count: 0,
      score: 0,
      severity: 'LOW',
      categories: {},
      latestIncidentTitle: incident.title,
    };
    current.count += 1;
    current.score += severityWeight[incident.severity] || 1;
    if (severityRank[incident.severity] > severityRank[current.severity]) current.severity = incident.severity;
    current.latestIncidentTitle = incident.title;
    grouped.set(key, current);
  }

  const hotspots = Array.from(grouped.values()).map((h) => ({ ...h, radius: Math.min(1800, 250 + h.score * 120) }));
  return JSON.parse(JSON.stringify({ incidents, alerts, locations, hotspots, updatedAt: new Date().toISOString() }));
}

export default async function PublicMapPage() {
  const initialData = await getInitialMapData();

  return (
    <PublicLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Live Safety <span className="text-blue-400">Map</span>
        </h1>
        <p className="mt-2 text-slate-400">
          Real-time visualization of safety incidents and active alerts across Delhi NCR.
        </p>
      </div>

      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950/50 backdrop-blur-md h-[700px]">
        <CrimeMapLive initialData={initialData} role="PUBLIC" />
      </div>
    </PublicLayout>
  );
}
