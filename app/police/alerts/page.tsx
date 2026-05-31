import PoliceLayout from '@/components/layout/PoliceLayout';
import AlertsTable from '@/components/tables/AlertsTable';
import SmartAlertCenter from '@/components/incidents/SmartAlertCenter';
import { prisma } from '@/lib/prisma';
import { Bell, AlertTriangle, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Group incidents by approximate location (0.03 deg grid ≈ 3km)
function clusterByLocation(incidents: any[]) {
  const grid: Record<string, any[]> = {};
  for (const inc of incidents) {
    const key = `${Math.round(inc.lat / 0.03) * 0.03},${Math.round(inc.lng / 0.03) * 0.03}`;
    if (!grid[key]) grid[key] = [];
    grid[key].push(inc);
  }

  const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

  return Object.entries(grid)
    .filter(([, incs]) => incs.length >= 2)
    .map(([key, incs]) => {
      const topSev = incs.reduce(
        (best, i) => (SEV_RANK[i.severity] > SEV_RANK[best] ? i.severity : best),
        'LOW'
      );
      const avgLat = incs.reduce((s: number, i: any) => s + i.lat, 0) / incs.length;
      const avgLng = incs.reduce((s: number, i: any) => s + i.lng, 0) / incs.length;
      const locName = incs[0]?.locationName || incs[0]?.location?.name || `${avgLat.toFixed(3)}, ${avgLng.toFixed(3)}`;
      return {
        locationKey: key,
        locationName: locName,
        lat: avgLat,
        lng: avgLng,
        count: incs.length,
        incidents: incs,
        topSeverity: topSev,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export default async function PoliceAlerts() {
  const [rawIncidents, issuedAlerts] = await Promise.all([
    prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      include: { location: true },
    }),
    prisma.alert.findMany({ orderBy: { timestamp: 'desc' } }),
  ]);

  // Enrich incidents with a readable location name
  const incidents = rawIncidents.map((inc) => ({
    ...inc,
    createdAt: inc.createdAt.toISOString(),
    updatedAt: inc.updatedAt.toISOString(),
    locationName: inc.location?.name ?? `${inc.lat.toFixed(3)}, ${inc.lng.toFixed(3)}`,
  }));

  const highSeverity = incidents.filter(
    (i) => (i.severity === 'HIGH' || i.severity === 'CRITICAL') && i.status !== 'RESOLVED'
  );

  const clusters = clusterByLocation(incidents);

  return (
    <PoliceLayout>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell size={16} className="text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Alert Command</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Public Alert Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Issue public safety alerts based on high-severity cases or incident hotspots. Each alert will be visible to all citizens.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              <AlertTriangle size={10} className="text-red-400" /> High Severity
            </div>
            <p className="text-2xl font-bold text-red-400">{highSeverity.length}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              <TrendingUp size={10} className="text-amber-400" /> Hotspot Zones
            </div>
            <p className="text-2xl font-bold text-amber-400">{clusters.length}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              <Bell size={10} className="text-green-400" /> Alerts Issued
            </div>
            <p className="text-2xl font-bold text-green-400">{issuedAlerts.length}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              <AlertTriangle size={10} className="text-blue-400" /> Total Incidents
            </div>
            <p className="text-2xl font-bold text-blue-400">{incidents.length}</p>
          </div>
        </div>
      </div>

      {/* Smart alert generation */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Recommend Alerts — Select cases to issue a public warning
        </h2>
        <SmartAlertCenter
          highSeverityIncidents={highSeverity}
          locationClusters={clusters}
        />
      </div>

      {/* Already issued alerts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} className="text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-200">Previously Issued Alerts</h2>
        </div>
        {issuedAlerts.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center">
            <p className="text-sm text-slate-500">No alerts have been issued yet.</p>
          </div>
        ) : (
          <AlertsTable data={issuedAlerts} />
        )}
      </div>
    </PoliceLayout>
  );
}
