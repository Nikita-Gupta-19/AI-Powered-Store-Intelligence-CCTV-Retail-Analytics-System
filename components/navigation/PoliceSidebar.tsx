'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Crosshair,
  FileWarning,
  Car,
  BarChart3,
  Bell,
  LogOut,
  Radio,
  Activity,
} from 'lucide-react';

const navItems = [
  { label: 'Command Center', href: '/police', icon: Crosshair },
  { label: 'Incident Queue', href: '/police/incidents', icon: FileWarning },
  { label: 'Vehicles', href: '/police/vehicles', icon: Car },
  { label: 'Alerts', href: '/police/alerts', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function PoliceSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        minHeight: '100vh',
        width: '260px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, #0a0d14 0%, #0d1117 100%)',
        borderRight: '1px solid rgba(239,68,68,0.15)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Red top accent bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #dc2626, #f97316, #dc2626)', flexShrink: 0 }} />

      {/* Logo / Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(239,68,68,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(220,38,38,0.2)',
          }}>
            <Shield size={18} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.05em' }}>
              DELHI NCR
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '0.15em', fontWeight: 600 }}>
              POLICE COMMAND
            </div>
          </div>
        </div>

        {/* Live status */}
        <div style={{
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: '6px', padding: '5px 10px',
        }}>
          <Radio size={11} style={{ color: '#ef4444' }} />
          <span style={{ fontSize: '10px', color: '#ef4444', letterSpacing: '0.1em', fontWeight: 600 }}>
            LIVE OPERATIONS
          </span>
          <span style={{
            marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%',
            background: '#ef4444', boxShadow: '0 0 6px #ef4444',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '16px 20px 6px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: '#475569', letterSpacing: '0.12em', fontWeight: 600 }}>
          NAVIGATION
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/police' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '8px',
                textDecoration: 'none', transition: 'all 0.15s ease',
                background: active ? 'rgba(220,38,38,0.12)' : 'transparent',
                border: active ? '1px solid rgba(220,38,38,0.25)' : '1px solid transparent',
                color: active ? '#f87171' : '#94a3b8',
                boxShadow: active ? '0 0 10px rgba(220,38,38,0.08)' : 'none',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0, color: active ? '#ef4444' : '#64748b' }} />
              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%',
                  background: '#ef4444', boxShadow: '0 0 6px #ef4444',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System status */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(239,68,68,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Activity size={12} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '10px', color: '#4ade80', letterSpacing: '0.08em' }}>ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
          background: 'rgba(15,23,42,0.8)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={12} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>{userName || 'Officer Portal'}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>Secure Access</div>
          </div>
          <Link href="/login">
            <LogOut size={13} style={{ color: '#475569', cursor: 'pointer' }} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
