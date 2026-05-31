import { Badge } from '@/components/ui/badge';
import { formatTimestamp, timestampToSeconds } from '@/lib/utils';

export default function VehicleDetectionTable({ data = [] }: any) {
  // Clean up YOLO repetitions: group by license plate or vehicle type and keep highest confidence
  const cleanedData = data.reduce((acc: any[], current: any) => {
    const key = current.licensePlate || current.vehicleType;
    const existingIndex = acc.findIndex(item => (item.licensePlate || item.vehicleType) === key);
    
    if (existingIndex > -1) {
      if (current.confidence > acc[existingIndex].confidence) {
        acc[existingIndex] = current;
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, []).sort((a: any, b: any) => {
    // Better sorting for MM:SS or dates
    const timeA = timestampToSeconds(a.timestamp) || new Date(a.timestamp).getTime();
    const timeB = timestampToSeconds(b.timestamp) || new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  if (cleanedData.length === 0) {
    return <div className="p-4 text-center text-sm text-slate-400 bg-slate-900/50 rounded-2xl border border-white/10">No vehicles detected in this incident media yet.</div>;
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-white/10'>
      <table className='w-full text-sm'>
        <thead className='bg-white/5'>
          <tr>
            <th className='p-3 text-left text-slate-400 font-medium'>Timestamp</th>
            <th className='text-left text-slate-400 font-medium'>Vehicle</th>
            <th className='text-left text-slate-400 font-medium'>Plate</th>
            <th className='text-left text-slate-400 font-medium'>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {cleanedData.map((v: any) => (
            <tr key={v.id} className='border-t border-white/10 bg-slate-950/30 hover:bg-slate-800/50 transition-colors'>
              <td className='p-3 text-slate-300 font-mono'>
                {formatTimestamp(v.timestamp)}
              </td>
              <td className='text-slate-200 capitalize'>{v.vehicleType.toLowerCase()}</td>
              <td><Badge variant="secondary" className="font-mono bg-blue-500/10 text-blue-300 border-blue-500/20">{v.licensePlate || 'UNKNOWN'}</Badge></td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.round(v.confidence * 100)}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{Math.round(v.confidence * 100)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
