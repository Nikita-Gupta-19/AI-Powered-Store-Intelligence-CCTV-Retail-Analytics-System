import DashboardLayout from '@/components/layout/DashboardLayout';
import { prisma } from '@/lib/prisma';
import MediaViewer from '@/components/media/MediaViewer';
import VehicleDetectionPanel from '@/components/vehicle/VehicleDetectionPanel';
import Timeline from '@/components/timeline/Timeline';
import { Card, CardTitle } from '@/components/ui/card';
import StatusUpdater from '@/components/incidents/StatusUpdater';
import { getSession } from '@/lib/auth';
import AISummaryDisplay from '@/components/incidents/AISummaryDisplay';
import { MapPin, ExternalLink } from 'lucide-react';

export default async function IncidentPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: {
      detections: true,
      timeline: true,
      location: true,
      notes: { orderBy: { createdAt: 'desc' } },
      complaint: true,
    }
  });

  if (!incident) return <DashboardLayout>Incident not found</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{incident.title}</h1>
          <p className='text-slate-400 mt-0.5'>Zone: {incident.location?.name || 'Unassigned'} • {incident.category.replace(/_/g, ' ')}</p>
          {/* Address & landmark from citizen complaint */}
          {incident.complaint && (
            <div className="mt-3 space-y-1">
              {incident.complaint.address && incident.complaint.address.trim() && (
                <div className="flex items-start gap-1.5">
                  <MapPin size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-200 font-medium">{incident.complaint.address}</p>
                    {incident.complaint.landmark && incident.complaint.landmark.trim() && (
                      <p className="text-xs text-cyan-300 mt-0.5">📍 {incident.complaint.landmark}</p>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${incident.lat},${incident.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs text-cyan-400 hover:text-cyan-300 underline"
                    >
                      View on Google Maps <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <StatusUpdater incidentId={incident.id} initialStatus={incident.status} userRole={session?.role} />
      </div>
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Card>
            <CardTitle>Incident Information</CardTitle>
            <p className='mt-3 text-slate-300 leading-relaxed'>{incident.description}</p>
            
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Progress & Updates</h3>
              {incident.notes.length > 0 ? (
                <div className="space-y-4 border-l-2 border-blue-500/20 ml-2 pl-6 py-2">
                  {incident.notes.map((note) => (
                    <div key={note.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">{note.authorName}</span>
                          <span className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-blue-100 leading-relaxed italic">"{note.content}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No official updates have been added yet.</p>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">YOLO AI Detection Summary</h3>
              <AISummaryDisplay
                data={incident.aiSummary}
                userCategory={incident.category}
                dbSeverity={incident.severity}
              />
            </div>
          </Card>
          <MediaViewer urls={incident.mediaUrls} />
        </div>
        <div className='space-y-6'>
          <VehicleDetectionPanel detections={incident.detections} />
          <Card>
            <CardTitle>AI Event Timeline</CardTitle>
            <div className='mt-5'>
              <Timeline events={incident.timeline} />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
