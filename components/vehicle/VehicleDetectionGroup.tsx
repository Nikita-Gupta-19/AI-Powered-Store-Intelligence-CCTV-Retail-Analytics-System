'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Car } from 'lucide-react';
import VehicleDetectionTable from './VehicleDetectionTable';

export default function VehicleDetectionGroup({ incidents }: any) {
  const [openCases, setOpenCases] = useState<Record<string, boolean>>({});

  const toggleCase = (id: string) => {
    setOpenCases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!incidents || incidents.length === 0) {
    return <div className="text-slate-400">No vehicle detections found.</div>;
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident: any) => (
        <div key={incident.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <button
            onClick={() => toggleCase(incident.id)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Car className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200">{incident.title}</h3>
                <p className="text-xs text-slate-400">
                  {(() => {
                    const uniqueCount = incident.detections.reduce((acc: Set<string>, d: any) => {
                      acc.add(d.licensePlate || d.vehicleType);
                      return acc;
                    }, new Set()).size;
                    return `${uniqueCount} vehicle${uniqueCount !== 1 ? 's' : ''} detected`;
                  })()}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {openCases[incident.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          
          {openCases[incident.id] && (
            <div className="border-t border-white/10 p-4 bg-black/20">
              <VehicleDetectionTable data={incident.detections} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
