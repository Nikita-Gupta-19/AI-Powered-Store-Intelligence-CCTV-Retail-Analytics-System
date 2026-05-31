'use client';

import { useState } from 'react';
import { Bell, AlertTriangle, MapPin, Clock, Shield, TrendingUp, CheckCircle, X, ExternalLink } from 'lucide-react';

const SEV_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH:     'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  LOW:      'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

type Incident = {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  lat: number;
  lng: number;
  createdAt: string;
  status: string;
  locationName?: string;
};

type Cluster = {
  locationKey: string;
  locationName: string;
  lat: number;
  lng: number;
  count: number;
  incidents: Incident[];
  topSeverity: string;
};

interface Props {
  highSeverityIncidents: Incident[];
  locationClusters: Cluster[];
}

function AlertConfirmModal({
  incident,
  cluster,
  onConfirm,
  onCancel,
  loading,
}: {
  incident?: Incident;
  cluster?: Cluster;
  onConfirm: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isCluster = !!cluster;
  const title = isCluster
    ? `High Incident Zone: ${cluster!.locationName}`
    : `${incident!.severity} Severity: ${incident!.title}`;
  const message = isCluster
    ? `There are ${cluster!.count} reported incidents near ${cluster!.locationName}. This area has elevated risk.`
    : `A ${incident!.severity.toLowerCase()}-severity ${incident!.category.replace(/_/g, ' ')} incident has been reported.`;
  const locationName = isCluster ? cluster!.locationName : incident!.locationName || 'Delhi NCR';
  const severity = isCluster ? cluster!.topSeverity : incident!.severity;
  const lat = isCluster ? cluster!.lat : incident!.lat;
  const lng = isCluster ? cluster!.lng : incident!.lng;
  const incidentType = isCluster
    ? cluster!.incidents[0]?.category || 'SUSPICIOUS_ACTIVITY'
    : incident!.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#0d1117] shadow-2xl shadow-amber-500/10 p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Bell size={20} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Issue Public Alert?</h2>
            <p className="text-xs text-slate-400 mt-0.5">This alert will be visible to all citizens on the public portal.</p>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Alert preview */}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 mb-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Alert Preview</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Location</span>
              <p className="text-xs text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin size={10} className="text-cyan-400" /> {locationName}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Severity</span>
              <p className={`text-xs font-bold mt-0.5 ${severity === 'CRITICAL' || severity === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`}>
                {severity}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Type</span>
              <p className="text-xs text-slate-200 mt-0.5">{incidentType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Coordinates</span>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4 bg-slate-800/50 rounded-lg px-3 py-2 border border-white/5">
          ⚠ Are you sure you want to issue this public alert? Citizens in this area will be notified of the safety concern.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({
              title,
              message,
              incidentType,
              locationName,
              severity,
              lat,
              lng,
              incidentId: incident?.id,
            })}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-xs">⏳</span> Issuing…</>
            ) : (
              <><Bell size={14} /> Issue Alert</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SmartAlertCenter({ highSeverityIncidents, locationClusters }: Props) {
  const [pending, setPending] = useState<{ incident?: Incident; cluster?: Cluster } | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState<string[]>([]);
  const [tab, setTab] = useState<'severity' | 'cluster'>('severity');

  const handleIssue = async (data: any) => {
    setIssuing(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          message: data.message,
          incidentType: data.incidentType,
          locationName: data.locationName,
          severity: data.severity,
          lat: data.lat,
          lng: data.lng,
          incidentId: data.incidentId ?? null,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const key = pending?.incident?.id ?? pending?.cluster?.locationKey ?? '';
      setIssued(prev => [...prev, key]);
      setPending(null);
    } catch {
      alert('Failed to issue alert. Please try again.');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <>
      {pending && (
        <AlertConfirmModal
          incident={pending.incident}
          cluster={pending.cluster}
          onConfirm={handleIssue}
          onCancel={() => setPending(null)}
          loading={issuing}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('severity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
            tab === 'severity'
              ? 'bg-red-500/15 border-red-500/40 text-red-400'
              : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <AlertTriangle size={14} /> High Severity Incidents
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400">
            {highSeverityIncidents.length}
          </span>
        </button>
        <button
          onClick={() => setTab('cluster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
            tab === 'cluster'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <TrendingUp size={14} /> Location Clusters
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400">
            {locationClusters.length}
          </span>
        </button>
      </div>

      {/* HIGH SEVERITY TAB */}
      {tab === 'severity' && (
        <div className="space-y-4">
          {highSeverityIncidents.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
              <CheckCircle size={24} className="mx-auto mb-3 text-emerald-400" />
              <p className="text-slate-400 text-sm">No high-severity incidents requiring alerts.</p>
            </div>
          )}
          {highSeverityIncidents.map(inc => {
            const isIssued = issued.includes(inc.id);
            return (
              <div
                key={inc.id}
                className={`rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                  isIssued
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60'
                    : 'border-red-500/20 bg-[#0d1117] hover:border-red-500/40'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${SEV_COLOR[inc.severity] || SEV_COLOR.MEDIUM}`}>
                  <Shield size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEV_COLOR[inc.severity] || SEV_COLOR.MEDIUM}`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                      {inc.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-slate-600 ml-auto">
                      <Clock size={9} className="inline mr-1" />
                      {new Date(inc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">{inc.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{inc.description}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin size={10} className="text-cyan-400" />
                    <span className="text-xs text-slate-400">
                      {inc.locationName || `${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}`}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${inc.lat},${inc.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <ExternalLink size={8} /> Maps
                    </a>
                  </div>
                </div>
                <div className="shrink-0">
                  {isIssued ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <CheckCircle size={12} /> Issued
                    </span>
                  ) : (
                    <button
                      onClick={() => setPending({ incident: inc })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                    >
                      <Bell size={13} /> Issue Alert
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOCATION CLUSTER TAB */}
      {tab === 'cluster' && (
        <div className="space-y-4">
          {locationClusters.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center">
              <CheckCircle size={24} className="mx-auto mb-3 text-emerald-400" />
              <p className="text-slate-400 text-sm">No location clusters with 2+ incidents detected.</p>
            </div>
          )}
          {locationClusters.map(cluster => {
            const isIssued = issued.includes(cluster.locationKey);
            return (
              <div
                key={cluster.locationKey}
                className={`rounded-2xl border p-5 transition-all ${
                  isIssued
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60'
                    : 'border-amber-500/20 bg-[#0d1117] hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <TrendingUp size={18} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400">
                        {cluster.count} INCIDENTS
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEV_COLOR[cluster.topSeverity] || SEV_COLOR.MEDIUM}`}>
                        TOP: {cluster.topSeverity}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <MapPin size={12} className="text-cyan-400" />
                      {cluster.locationName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {cluster.incidents.map(i => i.category.replace(/_/g, ' ')).join(' · ')}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isIssued ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle size={12} /> Issued
                      </span>
                    ) : (
                      <button
                        onClick={() => setPending({ cluster })}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors"
                      >
                        <Bell size={13} /> Issue Alert
                      </button>
                    )}
                  </div>
                </div>
                {/* Incident list */}
                <div className="mt-4 ml-14 space-y-1">
                  {cluster.incidents.slice(0, 3).map(inc => (
                    <div key={inc.id} className="flex items-center gap-2 text-xs text-slate-500">
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <span className="truncate">{inc.title}</span>
                      <span className="ml-auto shrink-0 text-[10px]">{new Date(inc.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                  {cluster.incidents.length > 3 && (
                    <p className="text-[10px] text-slate-600 ml-3">+{cluster.incidents.length - 3} more incidents</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
