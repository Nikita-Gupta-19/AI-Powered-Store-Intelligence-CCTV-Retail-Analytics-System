'use client';

import { useQuery } from '@tanstack/react-query';
import CrimeMap from './CrimeMap';
import { api } from '@/services/http';
import { Activity } from 'lucide-react';

export default function CrimeMapLive({ initialData, role }: { initialData?: any; role?: string }) {
  const { data, isFetching } = useQuery({
    queryKey: ['crime-hotspots'],
    queryFn: () => api<any>('/api/map/hotspots'),
    initialData,
    refetchInterval: 10000,
  });

  const isPolice = role === 'POLICE' || role === 'ADMIN';

  return (
    <div>
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={14} style={{ color: '#22d3ee' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
            Live Delhi NCR Incident Intelligence
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: isFetching ? '#f59e0b' : '#22c55e',
            boxShadow: isFetching ? '0 0 6px #f59e0b' : '0 0 6px #22c55e',
          }} />
          <span style={{ fontSize: '11px', color: '#475569' }}>
            {isFetching ? 'Updating…' : 'Live'} · Refreshes every 10s
          </span>
        </div>
      </div>

      {/* The actual map */}
      <CrimeMap
        incidents={data?.incidents || []}
        alerts={data?.alerts || []}
        locations={data?.locations || []}
        hotspots={data?.hotspots || []}
        role={role}
      />

      {/* Top hotspot summary — only for police/admin */}
      {isPolice && (data?.hotspots || []).length > 0 && (
        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {(data.hotspots as any[]).slice(0, 3).map((h: any) => {
            const isCritical = h.severity === 'CRITICAL' || h.severity === 'HIGH';
            return (
              <div
                key={h.id}
                style={{
                  background: 'rgba(4,20,36,0.9)',
                  border: isCritical ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '12px', padding: '14px 16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>Hotspot {h.id}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                    color: isCritical ? '#ef4444' : '#f59e0b',
                    background: isCritical ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    border: isCritical ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '99px', padding: '2px 8px',
                  }}>{h.severity}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                  {h.count} incident(s) · Score {h.score}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{h.latestIncidentTitle}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
