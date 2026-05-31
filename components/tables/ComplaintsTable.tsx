'use client';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REVIEWING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  UNDER_INVESTIGATION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ComplaintsTable({ data = [] }: any) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-white/5 bg-white/5 text-center">
        <p className="text-sm text-slate-400 mb-2">You have not submitted any complaints yet.</p>
        <Link href="/dashboard/report" className="text-xs text-cyan-400 hover:underline">
          Submit your first complaint →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="p-4 text-left">Complaint</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Latest Update</th>
            <th className="p-4 text-left">Date Filed</th>
            <th className="p-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c: any) => (
            <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="p-4">
                <p className="font-medium text-slate-200 max-w-[180px] truncate">{c.title}</p>
                {c.incident && (
                  <p className="text-[10px] text-slate-500 mt-0.5">Incident created ✓</p>
                )}
              </td>
              <td className="p-4 text-slate-400 capitalize">
                {c.category.replace(/_/g, ' ').toLowerCase()}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[c.status] ?? 'bg-slate-700 text-slate-300'}`}>
                  {c.status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="p-4 max-w-[200px]">
                {c.incident?.progressNote ? (
                  <p className="text-xs text-slate-400 truncate">{c.incident.progressNote}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic">Awaiting update</p>
                )}
              </td>
              <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                {formatDate(c.createdAt)}
              </td>
              <td className="p-4">
                <Link
                  href={`/dashboard/complaints/${c.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
                >
                  <Eye size={12} />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
