'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  MapPin,
  LogOut,
  User,
  HeartHandshake,
} from 'lucide-react';

const navItems = [
  { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Report Incident', href: '/dashboard/report', icon: Upload },
  { label: 'My Complaints', href: '/dashboard/complaints', icon: FileText },
  { label: 'Public Alerts', href: '/dashboard/alerts', icon: Bell },
  { label: 'Live Map', href: '/dashboard/map', icon: MapPin },
];

export default function CitizenSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        minHeight: '100vh',
        width: '260px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, #020d1a 0%, #041424 100%)',
        borderRight: '1px solid rgba(6,182,212,0.12)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Teal top accent bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #0891b2, #22d3ee, #0891b2)', flexShrink: 0 }} />

      {/* Logo / Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(6,182,212,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(6,182,212,0.15)',
          }}>
            <HeartHandshake size={18} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' }}>
              Citizen Portal
            </div>
            <div style={{ fontSize: '10px', color: '#22d3ee', letterSpacing: '0.08em', fontWeight: 500 }}>
              Delhi NCR Incident AI
            </div>
          </div>
        </div>

        {/* Welcome banner */}
        <div style={{
          marginTop: '12px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(99,102,241,0.06))',
          border: '1px solid rgba(6,182,212,0.12)',
          borderRadius: '8px', padding: '8px 12px',
        }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>Your community portal</div>
          <div style={{ fontSize: '11px', color: '#22d3ee', fontWeight: 500 }}>Report · Track · Stay Safe</div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '16px 20px 6px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: '#475569', letterSpacing: '0.12em', fontWeight: 600 }}>
          MENU
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '10px',
                textDecoration: 'none', transition: 'all 0.15s ease',
                background: active
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(99,102,241,0.08))'
                  : 'transparent',
                border: active ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
                color: active ? '#22d3ee' : '#94a3b8',
                boxShadow: active ? '0 2px 12px rgba(6,182,212,0.06)' : 'none',
              }}
            >
              <Icon size={15} style={{ flexShrink: 0, color: active ? '#22d3ee' : '#64748b' }} />
              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User section */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(6,182,212,0.06)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
          background: 'rgba(6,182,212,0.04)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.08)',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2))',
            border: '1px solid rgba(6,182,212,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={13} style={{ color: '#22d3ee' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>{userName || 'Citizen Account'}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>Verified Member</div>
          </div>
          <Link href="/login">
            <LogOut size={13} style={{ color: '#475569', cursor: 'pointer' }} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
