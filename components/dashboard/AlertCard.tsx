import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, Bell, Clock, MapPin } from 'lucide-react';

export default function AlertCard({ alert }: any) {
  const isCritical = alert.severity === 'CRITICAL';
  
  return (
    <div
      style={{
        background: 'rgba(4, 20, 36, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)'}`,
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
      className="group hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
    >
      {/* Decorative glow */}
      <div 
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'rgba(6, 182, 212, 0.05)',
          filter: 'blur(20px)',
        }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)',
              border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isCritical ? (
              <AlertTriangle size={20} className="text-red-500" />
            ) : (
              <Bell size={20} className="text-blue-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
              {alert.title}
            </h3>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
        
        <Badge 
          variant={isCritical ? 'danger' : 'warning'}
          className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider"
        >
          {alert.severity}
        </Badge>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} />
          <span>{alert.locationName || 'General Area'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={13} />
          <span>{formatDate(alert.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
