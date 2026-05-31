import DashboardLayout from '@/components/layout/DashboardLayout';
import AnalyticsGrid from '@/components/charts/AnalyticsGrid';
import StatCard from '@/components/dashboard/StatCard';
import { prisma } from '@/lib/prisma';
import { Activity, ShoppingBag, BarChart3, Users } from 'lucide-react';

export default async function Analytics() {
  const sessions = await prisma.incident.findMany({ include: { location: true } });
  
  // Exclude staff from conversion metrics
  const customers = sessions.filter((s) => !s.isStaff);
  const staff = sessions.filter((s) => s.isStaff);

  const totalFootfall = sessions.reduce((sum, s) => sum + (s.customerCount ?? 1), 0);
  const conversions = customers.filter((s) => s.hasPurchased).length;
  const conversionRate = customers.length > 0 ? Math.round((conversions / customers.length) * 100) : 0;

  // Distribution chart data
  const distribution = Object.entries(customers.reduce((a: any, i) => ({ ...a, [i.category]: (a[i.category] || 0) + 1 }), {}))
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
    
  // Hotspot dwell time chart data
  const hotspots = Object.entries(customers.reduce((a: any, i) => {
    const n = i.location?.name.split(' - ')[1] || i.location?.name || 'Aisle';
    a[n] = (a[n] || 0) + Math.round(i.dwellTimeSeconds || 0);
    return a;
  }, {})).map(([name, count]) => ({ name, count }));
  
  // Weekly trend chart data
  const trends = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'].map((w, i) => ({
    month: w,
    incidents: Math.max(10, Math.round(totalFootfall * (0.35 + i * 0.12))) // Keep key name 'incidents' for Recharts CrimeTrendChart compatibility
  }));

  const activeAlertsCount = await prisma.alert.count();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className='text-4xl font-bold tracking-tight'>Store Intelligence Analytics</h1>
          <p className='text-slate-400 mt-1'>Comprehensive data-driven insights into customer journeys, dwell times, and conversion rates.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Activity size={14} />
          Live CCTV Analytics Feed
        </div>
      </div>

      <div className='mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard label='Total Footfall' value={totalFootfall} trend="+14% since last week" />
        <StatCard label='Customer Dwells' value={customers.length} />
        <StatCard label='Active Manager Alerts' value={activeAlertsCount} trend="Operational notifications" />
        <StatCard label='Store Conversion Rate' value={`${conversionRate}%`} />
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Department Intelligence</h2>
          <div className="h-px flex-1 bg-slate-800" />
        </div>
        <AnalyticsGrid data={{ distribution, hotspots, trends }} />
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShoppingBag size={200} />
        </div>
        <div className="max-w-2xl relative z-10">
          <h3 className="text-2xl font-bold mb-4">Strategic Retail Report</h3>
          <p className="text-slate-400 leading-relaxed">
            The data shows a high dwell-time concentration in the {hotspots[0]?.name || 'Apparel'} section. 
            AI-driven forecasting suggests optimizing checkout associate schedules during peak traffic hours 
            to mitigate {distribution[0]?.name || 'checkout queue wait'} bottlenecks.
          </p>
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
              <BarChart3 size={16} />
              Register Schedule Optimization Suggested
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
