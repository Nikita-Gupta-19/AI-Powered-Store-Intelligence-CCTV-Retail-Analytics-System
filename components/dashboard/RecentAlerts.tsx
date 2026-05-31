import AlertCard from './AlertCard';
import { ShieldCheck } from 'lucide-react';

export default function RecentAlerts({alerts=[]}:any){
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/5 bg-white/5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 mb-3">
          <ShieldCheck size={24} className="text-green-400" />
        </div>
        <h3 className="font-medium text-slate-200">No Active Alerts</h3>
        <p className="text-sm text-slate-400 mt-1">Your community is currently safe with no public alerts.</p>
      </div>
    );
  }
  return <div className='grid gap-4'>{alerts.slice(0,4).map((a:any)=><AlertCard key={a.id} alert={a}/>)}</div>
}
