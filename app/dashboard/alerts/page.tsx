import CitizenLayout from '@/components/layout/CitizenLayout';
import { prisma } from '@/lib/prisma';
import { Bell, BellOff, MapPin, ExternalLink, AlertTriangle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SEV_STYLES: Record<string, { ring: string; dot: string; badge: string; label: string }> = {
  CRITICAL: {
    ring: 'border-red-500/40 bg-red-500/5',
    dot: 'bg-red-500 animate-pulse',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: '🚨 CRITICAL',
  },
  HIGH: {
    ring: 'border-orange-500/30 bg-orange-500/5',
    dot: 'bg-orange-400 animate-pulse',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    label: '⚠ HIGH',
  },
  MEDIUM: {
    ring: 'border-amber-500/20 bg-amber-500/5',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'MEDIUM',
  },
  LOW: {
    ring: 'border-blue-500/20 bg-blue-500/5',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'LOW',
  },
};

export default async function CitizenAlertsPage() {
  const alerts = await prisma.alert.findMany({
    orderBy: { timestamp: 'desc' },
  });

  const critical = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <CitizenLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell size={16} className="text-amber-400" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Live Safety Feed</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Public Safety Alerts</h1>
        <p className="text-slate-400 text-sm mt-1">
          Real-time alerts issued by Delhi NCR Police based on reported incidents and hotspot analysis.
        </p>

        {critical > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <p className="text-sm text-red-300 font-medium">
              {critical} high-severity alert{critical > 1 ? 's are' : ' is'} active in your area. Stay cautious.
            </p>
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div
          style={{
            background: 'rgba(4,20,36,0.5)',
            border: '1px dashed rgba(6,182,212,0.2)',
            borderRadius: '24px',
            padding: '80px 40px',
            textAlign: 'center',
          }}
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
            <BellOff size={32} className="text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">All Clear</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            No active public safety alerts for Delhi NCR right now. Check back for real-time updates.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Monitoring live updates
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {alerts.map((alert) => {
            const sev = SEV_STYLES[alert.severity] ?? SEV_STYLES.MEDIUM;
            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-5 transition-all hover:shadow-lg ${sev.ring}`}
              >
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`h-3 w-3 rounded-full ${sev.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${sev.badge}`}>
                        {sev.label}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {alert.incidentType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">{alert.title}</h3>
                  </div>
                </div>

                {/* Message */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4 pl-6">{alert.message}</p>

                {/* Meta */}
                <div className="pl-6 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={10} className="text-cyan-400" />
                    <span>{alert.locationName}</span>
                    <a
                      href={`https://www.google.com/maps?q=${alert.lat},${alert.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <ExternalLink size={8} /> Map
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={9} />
                    {new Date(alert.timestamp).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CitizenLayout>
  );
}
