import PublicLayout from '@/components/layout/PublicLayout';
import AlertCard from '@/components/dashboard/AlertCard';
import { prisma } from '@/lib/prisma';
import { BellOff, Megaphone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PublicAlertsPage() {
  const alerts = await prisma.alert.findMany({
    orderBy: { timestamp: 'desc' },
  });

  return (
    <PublicLayout>
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Megaphone size={18} className="text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Live Updates</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Public Safety <span className="text-blue-400">Alerts</span>
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl">
          Stay informed about active incidents, road closures, and community safety notices issued by the Delhi NCR Police Department.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {alerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      ) : (
        <div 
          style={{
            background: 'rgba(4, 20, 36, 0.5)',
            border: '1px dashed rgba(6, 182, 212, 0.2)',
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
            There are currently no active public safety alerts for your area. Check back later for real-time updates.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Monitoring live updates
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
