import IncidentCard from './IncidentCard';

export default function RecentIncidents({incidents=[]}:any){
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-white/5 bg-white/5">
        <p className="text-sm text-slate-400">No recent community incidents reported.</p>
      </div>
    );
  }
  return <div className='grid gap-4 md:grid-cols-2'>{incidents.slice(0,6).map((i:any)=><IncidentCard key={i.id} incident={i}/>)}</div>
}
