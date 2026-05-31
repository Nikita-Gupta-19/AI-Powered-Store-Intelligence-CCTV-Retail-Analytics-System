'use client';

import { Shield, Clock, BarChart3, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WindowResult {
  time: string;
  label: string;
  confidence: number;
}

interface AISummaryData {
  summary: string;
  incidentAnalysis?: {
    incidentDetected?: boolean;
    incidentType?: string;
    severity?: string;
    rawLabel?: string;
    timestamp?: string;
    confidence?: number;
    reason?: string;
    source?: string;
    windows?: WindowResult[];
  };
}

// Confidence threshold: AI is considered reliable at >= 45%
const CONFIDENCE_THRESHOLD = 0.45;

function isAIReliable(analysis: AISummaryData['incidentAnalysis']): boolean {
  if (!analysis) return false;
  return (analysis.confidence ?? 0) >= CONFIDENCE_THRESHOLD;
}

function getSeverityColor(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'text-red-400';
    case 'HIGH':     return 'text-orange-400';
    case 'MEDIUM':   return 'text-amber-400';
    case 'LOW':      return 'text-blue-400';
    default:         return 'text-slate-400';
  }
}

function getSeverityBg(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500/15 border-red-500/40 text-red-400';
    case 'HIGH':     return 'bg-orange-500/15 border-orange-500/40 text-orange-400';
    case 'MEDIUM':   return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
    case 'LOW':      return 'bg-blue-500/15 border-blue-500/40 text-blue-400';
    default:         return 'bg-slate-700 border-slate-600 text-slate-300';
  }
}

export default function AISummaryDisplay({
  data,
  userCategory,
  dbSeverity,
}: {
  data: string | null;
  userCategory?: string;
  dbSeverity?: string;
}) {
  if (!data) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-slate-400 italic text-sm">
        No AI analysis available for this incident.
      </div>
    );
  }

  let parsed: AISummaryData;
  try {
    parsed = JSON.parse(data);
  } catch {
    // Fallback for legacy string format
    return (
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
        {data}
      </div>
    );
  }

  const analysis = parsed.incidentAnalysis;

  if (!analysis) {
    return (
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-200 leading-relaxed text-sm">
        {parsed.summary}
      </div>
    );
  }

  const reliable = isAIReliable(analysis);
  const confidencePct = Math.round((analysis.confidence ?? 0) * 100);

  // Trust AI incidentDetected when it's in the response; fall back to severity check
  const aiSaysDetected = analysis.incidentDetected === true ||
    (analysis.severity && ['HIGH', 'CRITICAL', 'MEDIUM'].includes(analysis.severity.toUpperCase()));

  // Display severity: prefer DB (normalized) value over raw AI value
  const displaySeverity = (dbSeverity && dbSeverity !== 'MEDIUM')
    ? dbSeverity.toUpperCase()
    : (analysis.severity?.toUpperCase() ?? dbSeverity?.toUpperCase() ?? 'MEDIUM');

  // Show the reported category prominently
  const reportedAs = userCategory
    ? userCategory.replace(/_/g, ' ')
    : (analysis.incidentType ?? 'Unknown');

  const incidentType = analysis.incidentType ?? 'UNKNOWN';
  const source = analysis.source ?? 'ai_analysis';
  const isFallback = source.includes('fallback') || source.includes('heuristic');

  return (
    <div className="space-y-4">
      {/* Source indicator */}
      {isFallback ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-400">
              {source.includes('heuristic') || source.includes('yolo')
                ? 'No trained crash model found — using YOLO heuristic analysis'
                : 'Python AI service offline — using category-based fallback'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              The classification below is estimated from vehicle detections and the reported category.
              {userCategory && (
                <> Citizen reported: <span className="text-white font-semibold">{userCategory.replace(/_/g, ' ')}</span>.</>
              )}
            </p>
          </div>
        </div>
      ) : !reliable ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/30 px-3 py-2.5">
          <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AI confidence is {confidencePct}% — results are indicative, not conclusive. Manual officer review recommended.
          </p>
        </div>
      ) : null}

      {/* Main detection result */}
      <div className={`rounded-xl border p-4 ${aiSaysDetected ? 'border-red-500/25 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
        <div className="flex items-center gap-3 mb-3">
          {aiSaysDetected ? (
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-bold ${aiSaysDetected ? 'text-red-300' : 'text-emerald-300'}`}>
              {aiSaysDetected ? 'Incident Detected' : 'No Incident Detected'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {confidencePct}% confidence · {analysis.timestamp && analysis.timestamp !== 'N/A' ? `at ${analysis.timestamp}` : 'timestamp N/A'}
            </p>
          </div>
          <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBg(displaySeverity)}`}>
            {displaySeverity}
          </div>
        </div>

        {/* Metric grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
              <AlertCircle size={9} /> Reported As
            </p>
            <p className="text-xs font-semibold text-slate-200">{reportedAs}</p>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
              <Shield size={9} /> AI Classification
            </p>
            <p className="text-xs font-semibold text-slate-200">
              {incidentType === 'NORMAL' ? 'Normal Traffic' : incidentType.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
              <BarChart3 size={9} /> Severity
            </p>
            <p className={`text-xs font-bold ${getSeverityColor(displaySeverity)}`}>{displaySeverity}</p>
          </div>
          <div className="bg-black/20 rounded-lg p-2.5">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
              <Clock size={9} /> Key Timestamp
            </p>
            <p className="text-xs font-mono text-slate-200">
              {analysis.timestamp && analysis.timestamp !== 'N/A' ? analysis.timestamp : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* AI explanation */}
      {analysis.reason && (
        <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Explanation</span>
            <Badge className="ml-auto text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 border-slate-700">
              {confidencePct}% confidence
            </Badge>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {analysis.reason}
          </p>
        </div>
      )}

      <div className="text-[10px] text-slate-600 px-1">
        Analysis powered by YOLOv8 + Smart Policing Incident Classifier · Source: {source}
      </div>
    </div>
  );
}
