import DashboardLayout from '@/components/layout/DashboardLayout';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import RecentIncidents from '@/components/dashboard/RecentIncidents';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
import {
  FileText,
  AlertCircle,
  Bell,
  HeartHandshake,
  ArrowRight,
  CheckCircle,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';

export default async function Dashboard() {
  const session = await getSession();
  const [incidents, alerts, complaints] = await Promise.all([
    prisma.incident.findMany({ 
      where: {
        NOT: {
          complaint: {
            userId: session?.id
          }
        }
      },
      include: { location: true }, 
      take: 10, 
      orderBy: { createdAt: 'desc' } 
    }),
    prisma.alert.findMany({ take: 4, orderBy: { timestamp: 'desc' } }),
    prisma.complaint.count({
      where: {
        userId: session?.id
      }
    }),
  ]);

  const stats = [
    {
      label: 'My Uploads',
      value: complaints,
      icon: FileText,
      color: '#22d3ee',
      bg: 'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.18)',
      desc: 'CCTV video streams',
    },
    {
      label: 'Active Sessions',
      value: incidents.length,
      icon: AlertCircle,
      color: '#6366f1',
      bg: 'rgba(99,102,241,0.08)',
      border: 'rgba(99,102,241,0.18)',
      desc: 'tracked shoppers',
    },
    {
      label: 'Store Alerts',
      value: alerts.length,
      icon: Bell,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.18)',
      desc: 'operational notices',
    },
  ];

  return (
    <DashboardLayout>
      {/* Welcome header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <HeartHandshake size={16} style={{ color: '#22d3ee' }} />
          <span style={{ fontSize: '11px', color: '#22d3ee', letterSpacing: '0.1em', fontWeight: 600 }}>
            MANAGER PORTAL
          </span>
        </div>
        <h1 style={{
          fontSize: '26px', fontWeight: 700, color: '#f1f5f9',
          letterSpacing: '-0.01em', margin: 0,
        }}>
          Store Operations Control
        </h1>
        <p style={{ marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
          Monitor customer tracking streams, operational metrics, and aisle alerts.
        </p>
      </div>

      {/* Quick action CTA */}
      <Link
        href="/dashboard/report"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderRadius: '14px', textDecoration: 'none', marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid rgba(6,182,212,0.2)',
          boxShadow: '0 4px 20px rgba(6,182,212,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(6,182,212,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Megaphone size={18} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
              Analyze CCTV Video Stream
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
              Upload CCTV feeds to trigger YOLOv8 customer tracking and conversion analytics.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22d3ee' }}>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Upload Feed</span>
          <ArrowRight size={14} />
        </div>
      </Link>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px',
      }}>
        {stats.map(({ label, value, icon: Icon, color, bg, border, desc }) => (
          <div
            key={label}
            style={{
              background: 'rgba(4,20,36,0.9)',
              border: `1px solid ${border}`,
              borderRadius: '14px',
              padding: '20px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px',
              width: '80px', height: '80px', borderRadius: '50%',
              background: bg, filter: 'blur(20px)',
            }} />
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: bg, border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <Icon size={17} style={{ color }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '4px' }}>
              {value}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{
          background: 'rgba(4,20,36,0.8)', border: '1px solid rgba(6,182,212,0.1)',
          borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle size={14} style={{ color: '#22d3ee' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', margin: 0 }}>
              Recent Store Sessions
            </h2>
          </div>
          <RecentIncidents incidents={incidents} />
        </div>
        <div style={{
          background: 'rgba(4,20,36,0.8)', border: '1px solid rgba(245,158,11,0.1)',
          borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Bell size={14} style={{ color: '#f59e0b' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#cbd5e1', margin: 0 }}>
              Store Operations Alerts
            </h2>
          </div>
          <RecentAlerts alerts={alerts} />
        </div>
      </div>
    </DashboardLayout>
  );
}
