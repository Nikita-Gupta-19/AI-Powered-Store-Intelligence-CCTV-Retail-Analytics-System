'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/services/http';
import { 
  MessageSquarePlus, 
  Save, 
  X, 
  Clock, 
  Search, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function StatusUpdater({ 
  incidentId, 
  initialStatus, 
  userRole 
}: { 
  incidentId: string, 
  initialStatus: string, 
  userRole?: string 
}) {
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);

  const canEdit = userRole === 'POLICE' || userRole === 'ADMIN';

  async function handleUpdate() {
    if (!canEdit) return;
    
    setIsUpdating(true);
    try {
      await api(`/api/incidents/${incidentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, progressNote: note })
      });
      setNote(''); 
      setShowNoteInput(false);
      window.location.reload(); 
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdating(false);
    }
  }

  if (!canEdit) {
    const badgeVariant = 
      status === 'RESOLVED' ? 'success' : 
      status === 'UNDER_INVESTIGATION' ? 'warning' : 'default';
    
    return (
      <Badge variant={badgeVariant}>
        <div className="flex items-center gap-1.5">
          {status === 'RESOLVED' && <CheckCircle2 size={12} />}
          {status === 'UNDER_INVESTIGATION' && <Search size={12} />}
          {status === 'PENDING' && <Clock size={12} />}
          {status}
        </div>
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start mr-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Case Phase</span>
          <div className="relative group">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              disabled={isUpdating}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl text-sm pl-4 pr-10 py-2 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:bg-slate-750"
            >
              <option value="PENDING">Pending Review</option>
              <option value="UNDER_INVESTIGATION">Investigation</option>
              <option value="RESOLVED">Resolved Case</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end gap-2 pt-5">
          <Button
            variant="secondary"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`px-4 py-2 flex items-center gap-2 ${showNoteInput ? 'bg-slate-800 border-blue-500/50 text-blue-400' : ''}`}
          >
            {showNoteInput ? <X size={16} /> : <MessageSquarePlus size={16} />}
            <span>{showNoteInput ? 'Cancel' : 'Add Note'}</span>
          </Button>

          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-6 py-2 flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isUpdating ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Update Case</span>
          </Button>
        </div>
      </div>

      {showNoteInput && (
        <div className="w-full mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-widest mb-1.5 ml-1 flex items-center gap-1.5">
            <MessageSquarePlus size={10} />
            Internal Investigation Note
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document latest findings, evidence collected, or case progress updates..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl text-sm p-4 text-blue-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[100px] transition-all"
          />
          <p className="text-[10px] text-slate-500 mt-2 ml-1 italic">
            Note: Updates are visible to victims and other assigned officers.
          </p>
        </div>
      )}
    </div>
  );
}
