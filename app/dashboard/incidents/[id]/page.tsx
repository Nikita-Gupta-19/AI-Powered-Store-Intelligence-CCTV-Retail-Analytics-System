import CitizenLayout from '@/components/layout/CitizenLayout';
import { prisma } from '@/lib/prisma';
import MediaViewer from '@/components/media/MediaViewer';
import { Card, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Shield, MapPin, ExternalLink } from 'lucide-react';
import AISummaryDisplay from '@/components/incidents/AISummaryDisplay';

export default async function CitizenIncidentPage({ params }: { params: { id: string } }) {
  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: { location: true, notes: { orderBy: { createdAt: 'desc' } } }
  });

  if (!incident) return <CitizenLayout>Incident not found</CitizenLayout>;

  return (
    <CitizenLayout>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>{incident.title}</h1>
        <p className='text-slate-400 mt-1'>
          Reported on {formatDate(incident.createdAt)}
        </p>
        {/* Actual incident location from coordinates submitted with complaint */}
        <div className="mt-3 flex items-start gap-2">
          <MapPin size={14} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            {incident.location?.name && (
              <p className="text-sm font-medium text-slate-300">{incident.location.name}</p>
            )}
            <p className="text-xs text-slate-500 font-mono">
              {incident.lat.toFixed(5)}, {incident.lng.toFixed(5)}
            </p>
            <a
              href={`https://www.google.com/maps?q=${incident.lat},${incident.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-cyan-400 hover:text-cyan-300 underline"
            >
              View on Google Maps <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
      
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              Incident Details
            </CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Category</span>
                <p className="text-slate-200">{incident.category}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                <p className="text-slate-200">{incident.status}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Description</span>
                <p className='text-slate-300'>{incident.description}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Official Timeline & Updates</h3>
              {incident.notes.length > 0 ? (
                <div className="space-y-4 border-l border-slate-800 ml-1 pl-4">
                  {incident.notes.map((note) => (
                    <div key={note.id} className="relative">
                      <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-slate-700" />
                      <div className="p-3 bg-slate-900/50 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 font-semibold">{note.authorName}</span>
                          <span className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{note.content}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">No updates from the police yet.</p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">AI Investigation Findings</h3>
              <AISummaryDisplay
                data={incident.aiSummary}
                userCategory={incident.category}
                dbSeverity={incident.severity}
              />
            </div>
          </Card>
        </div>
        <div>
          <MediaViewer urls={incident.mediaUrls} />
        </div>
      </div>
    </CitizenLayout>
  );
}
