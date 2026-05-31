import DashboardLayout from '@/components/layout/DashboardLayout';
import CrimeMapLive from '@/components/map/CrimeMapLive';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const severityWeight: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 5 };
const severityRank: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

function bucket(lat: number, lng: number) {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

async function getInitialMapData() {
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
      severity: 'LOW',
      categories: {},
      latestIncidentTitle: incident.title,
    };
    current.count += 1;
    current.score += severityWeight[incident.severity] || 1;
    current.categories[incident.category] = (current.categories[incident.category] || 0) + 1;
    if (severityRank[incident.severity] > severityRank[current.severity]) current.severity = incident.severity;
    current.latestIncidentTitle = incident.title;
    grouped.set(key, current);
  }

  const hotspots = Array.from(grouped.values()).map((h) => ({ ...h, radius: Math.min(1800, 250 + h.score * 120) }));
  return JSON.parse(JSON.stringify({ incidents, alerts, locations, hotspots, updatedAt: new Date().toISOString() }));
}

export default async function DashboardMapPage() {
  const initialData = await getInitialMapData();
  const session = await getSession();
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Crime & Safety Map</h1>
        <p className="text-slate-400 mt-1">Real-time incident hotspots and active police alerts across the region.</p>
      </div>
      
      <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-slate-900/50 h-[calc(100vh-220px)] min-h-[500px]">
        <CrimeMapLive initialData={initialData} role={session?.role} />
      </div>
    </DashboardLayout>
  );
}
