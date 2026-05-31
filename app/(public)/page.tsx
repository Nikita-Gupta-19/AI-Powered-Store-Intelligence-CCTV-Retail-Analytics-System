import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Shield, Map, Bell, ArrowRight, Activity, Eye, Zap } from 'lucide-react';

export default function Home() {
  return (
    <PublicLayout>
      <div className="relative isolate pt-14">
        {/* Background glow effects */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-500 to-indigo-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex justify-center mb-8">
                <span className="rounded-full px-3 py-1 text-sm font-semibold leading-6 text-cyan-400 ring-1 ring-inset ring-cyan-500/20 bg-cyan-500/5">
                  AI-Powered Store Intelligence Stack
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Real-Time <span className="text-cyan-400">Store Intelligence</span> & Analytics
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-400">
                Revolutionizing retail operations with automated customer session tracking, in-store heatmaps, checkout queue detection, and retail anomaly alerts.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/login">
                  <Button className="h-12 px-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">
                    Open Manager Portal
                  </Button>
                </Link>
                <Link href="/map" className="text-sm font-semibold leading-6 text-white flex items-center gap-2 hover:text-cyan-400 transition-colors">
                  Open Aisle Heatmap <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'AI Processed Sessions', value: '42,912+', icon: Activity, color: 'text-cyan-400' },
                { label: 'Active Store Heatmaps', value: '7', icon: Map, color: 'text-orange-400' },
                { label: 'Conversion Lift Gain', value: '18.4%', icon: Zap, color: 'text-yellow-400' },
                { label: 'Operations Alerts', value: '3', icon: Bell, color: 'text-purple-400' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm">
                  <div className={`p-2 rounded-lg bg-white/5 inline-flex mb-4 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-32">
              <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-cyan-400 uppercase tracking-widest">Platform Core Features</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Transforming raw CCTV signals into retail success
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <Eye className="h-5 w-5 flex-none text-cyan-400" />
                      AI Video Intelligence
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                      <p className="flex-auto">Automated detection of customer traffic counts, shopping basket items, checkout lines, and staff floor shifts directly from camera streams.</p>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <Map className="h-5 w-5 flex-none text-cyan-400" />
                      Aisle Heatmapping
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                      <p className="flex-auto">Dynamic density visualizations tracking customer dwell times across individual cosmetic and apparel zones to optimize floor plans.</p>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <Shield className="h-5 w-5 flex-none text-cyan-400" />
                      Operations Alerting
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                      <p className="flex-auto">Real-time alerts alerting store management to queue congestion bottlenecks and physical hazards like liquid floor spills.</p>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
