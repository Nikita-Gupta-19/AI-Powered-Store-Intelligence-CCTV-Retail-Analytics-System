import CitizenLayout from '@/components/layout/CitizenLayout';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound, redirect } from 'next/navigation';
import { MapPin, ExternalLink, FileText, Shield, Clock, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import MediaViewer from '@/components/media/MediaViewer';

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REVIEWING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  UNDER_INVESTIGATION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Reverse lookup: find nearest location name by lat/lng
const KNOWN_LOCATIONS = [
  { name: 'Connaught Place', lat: 28.6304, lng: 77.2177 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1888 },
  { name: 'South Extension', lat: 28.5684, lng: 77.2183 },
  { name: 'Vasant Kunj', lat: 28.5292, lng: 77.1541 },
  { name: 'Dwarka Sector 21', lat: 28.5528, lng: 77.0587 },
  { name: 'Noida Sector 18', lat: 28.5708, lng: 77.3204 },
  { name: 'Gurugram Cyber Hub', lat: 28.4950, lng: 77.0888 },
  { name: 'Chandni Chowk', lat: 28.6506, lng: 77.2303 },
  { name: 'Lajpat Nagar', lat: 28.5677, lng: 77.2433 },
  { name: 'Rohini Sector 10', lat: 28.7158, lng: 77.1147 },
  { name: 'Saket', lat: 28.5246, lng: 77.2066 },
  { name: 'Greater Kailash', lat: 28.5494, lng: 77.2393 },
  { name: 'Faridabad NIT', lat: 28.3883, lng: 77.3005 },
  { name: 'Ghaziabad Indirapuram', lat: 28.6385, lng: 77.3698 },
];

function nearestLocationName(lat: number, lng: number): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const loc of KNOWN_LOCATIONS) {
    const d = Math.sqrt((loc.lat - lat) ** 2 + (loc.lng - lng) ** 2);
    if (d < bestDist && d < 0.05) { bestDist = d; best = loc.name; }
  }
  return best;
}

export default async function ComplaintDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const complaint = await prisma.complaint.findUnique({
    where: { id: params.id },
    include: {
      incident: {
        include: {
          notes: { orderBy: { createdAt: 'desc' } },
          detections: true,
          timeline: true,
        },
      },
    },
  });

  if (!complaint || complaint.userId !== session.id) return notFound();

  // Fetch address & landmark via raw SQL in case Prisma client is stale
  let extraFields: { address: string; landmark: string } = { address: '', landmark: '' };
  try {
    const rows = await prisma.$queryRawUnsafe<{ address: string; landmark: string }[]>(
      `SELECT "address", "landmark" FROM "Complaint" WHERE "id" = ?`,
      params.id
    );
    if (rows.length > 0) extraFields = rows[0];
  } catch {}

  const fullComplaint = { ...complaint, ...extraFields };

  let mediaUrls: string[] = [];
  try {
    mediaUrls = JSON.parse(complaint.mediaUrls || '[]');
  } catch {}

  const incident = complaint.incident;

  return (
    <CitizenLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/complaints" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to My Complaints
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">{complaint.title}</h1>
          <p className="text-slate-400 mt-1 text-sm">Filed on {formatDate(complaint.createdAt)}</p>
        </div>
        <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[complaint.status] ?? 'bg-slate-700 text-slate-300'}`}>
          {complaint.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT column */}
        <div className="space-y-6">
          {/* Complaint details */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <FileText size={16} className="text-cyan-400" />
              Complaint Details
            </CardTitle>
            <div className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Category</span>
                <p className="text-slate-200 capitalize">{complaint.category.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Status</span>
                <div className="mt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[complaint.status] ?? 'bg-slate-700 text-slate-300'}`}>
                    {complaint.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Description</span>
                <p className="text-slate-300 leading-relaxed mt-1">{complaint.description}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MapPin size={10} /> Location
                </span>
                {(() => {
                  const locName = nearestLocationName(complaint.lat, complaint.lng);
                  return (
                    <div className="mt-2 space-y-1.5">
                      {locName && (
                        <p className="text-slate-400 text-xs">{locName}, Delhi NCR</p>
                      )}
                      {fullComplaint.address && fullComplaint.address.trim() && (
                        <p className="text-slate-200 font-medium text-sm leading-snug">{fullComplaint.address}</p>
                      )}
                      {fullComplaint.landmark && fullComplaint.landmark.trim() && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          <MapPin size={9} className="text-cyan-400" />
                          <span className="text-xs text-cyan-300">{fullComplaint.landmark}</span>
                        </div>
                      )}
                      <p className="text-slate-600 font-mono text-[10px]">
                        {complaint.lat.toFixed(5)}, {complaint.lng.toFixed(5)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${complaint.lat},${complaint.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 underline"
                      >
                        View on Google Maps <ExternalLink size={10} />
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* Police investigation updates */}
          {incident && (
            <Card>
              <CardTitle className="flex items-center gap-2">
                <Shield size={16} className="text-purple-400" />
                Police Investigation Updates
              </CardTitle>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Investigation Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[incident.status] ?? 'bg-slate-700 text-slate-300'}`}>
                    {incident.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {incident.notes.length > 0 ? (
                  <div className="space-y-4 border-l border-slate-800 ml-1 pl-4">
                    {incident.notes.map((note) => (
                      <div key={note.id} className="relative">
                        <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-purple-500/60" />
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
                  <p className="text-sm text-slate-600 italic">No updates from the police yet. You will be notified when there is a change.</p>
                )}
              </div>

              {incident.severity && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <BarChart3 size={10} /> AI Severity Assessment
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                    incident.severity === 'CRITICAL' || incident.severity === 'HIGH'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : incident.severity === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
              )}
            </Card>
          )}

          {!incident && (
            <div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
              <Clock size={20} className="mx-auto mb-2 text-slate-600" />
              <p className="text-sm text-slate-500">Your complaint is being reviewed. An incident record will be created once a police officer picks it up.</p>
            </div>
          )}
        </div>

        {/* RIGHT column — media */}
        <div>
          <MediaViewer urls={complaint.mediaUrls} />
        </div>
      </div>
    </CitizenLayout>
  );
}
