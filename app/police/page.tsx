import PoliceLayout from '@/components/layout/PoliceLayout';
import IncidentsTable from '@/components/tables/IncidentsTable';
import AlertsTable from '@/components/tables/AlertsTable';
import { prisma } from '@/lib/prisma';
import {
  FileWarning,
  Clock,
  CheckCircle2,
  Bell,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import CrimeMapLive from '@/components/map/CrimeMapLive';

export default async function Police() {
  const [incidents, alerts, pending, resolved] = await Promise.all([
    prisma.incident.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.alert.findMany({ take: 5, orderBy: { timestamp: 'desc' } }),
    prisma.incident.count({ where: { status: 'PENDING' } }),
    prisma.incident.count({ where: { status: 'RESOLVED' } }),
  ]);

  const stats = [
    {
      label: 'Total Incidents',
      value: incidents.length,
      icon: FileWarning,
      color: '#ef4444',
      bg: 'rgba(220,38,38,0.08)',
      border: 'rgba(220,38,38,0.2)',
      glow: 'rgba(220,38,38,0.15)',
    },
    {
      label: 'Pending Review',
      value: pending,
      icon: Clock,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.2)',
      glow: 'rgba(249,115,22,0.15)',
    },
    {
      label: 'Resolved Cases',
      value: resolved,
      icon: CheckCircle2,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.2)',
      glow: 'rgba(34,197,94,0.15)',
    },
    {
      label: 'Active Alerts',
      value: alerts.length,
      icon: Bell,
      color: '#eab308',
      bg: 'rgba(234,179,8,0.08)',
      border: 'rgba(234,179,8,0.2)',
      glow: 'rgba(234,179,8,0.15)',
    },
  ];

  return (
    <PoliceLayout>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(220,38,38,0.15)',
          }}>
            <Shield size={16} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#ef4444', letterSpacing: '0.15em', fontWeight: 600 }}>
              POLICE COMMAND CENTER
            </span>
          </div>
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '20px', padding: '4px 10px',
          }}>
            <Activity size={10} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
        <h1 style={{
          fontSize: '26px', fontWeight: 800, color: '#f1f5f9',
          letterSpacing: '-0.02em', margin: 0,
        }}>
          Police Investigation Dashboard
        </h1>
        <p style={{ marginTop: '4px', fontSize: '13px', color: '#475569' }}>
          Real-time incident monitoring and case management
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px',
      }}>
        {stats.map(({ label, value, icon: Icon, color, bg, border, glow }) => (
          <div
            key={label}
            style={{
              background: 'rgba(10,13,20,0.8)',
              border: `1px solid ${border}`,
              borderRadius: '12px',
              padding: '18px 20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 4px 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', letterSpacing: '0.05em', fontWeight: 500 }}>
                  {label.toUpperCase()}
                </p>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>
                  {value}
                </div>
              </div>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: bg, border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={10} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: '10px', color: '#22c55e' }}>Updated live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Map */}
      <div style={{ marginBottom: '28px' }}>
        <CrimeMapLive role="POLICE" />
      </div>

      {/* Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{
          background: 'rgba(10,13,20,0.8)', border: '1px solid rgba(220,38,38,0.1)',
          borderRadius: '12px', padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileWarning size={14} style={{ color: '#ef4444' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '0.05em' }}>
              RECENT INCIDENTS
            </h2>
          </div>
          <IncidentsTable data={incidents} />
        </div>
        <div style={{
          background: 'rgba(10,13,20,0.8)', border: '1px solid rgba(234,179,8,0.1)',
          borderRadius: '12px', padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell size={14} style={{ color: '#eab308' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '0.05em' }}>
              ACTIVE ALERTS
            </h2>
          </div>
          <AlertsTable data={alerts} />
        </div>
      </div>
    </PoliceLayout>
  );
}
