import PoliceLayout from '@/components/layout/PoliceLayout';
import IncidentsTable from '@/components/tables/IncidentsTable';
import { prisma } from '@/lib/prisma';

export default async function PoliceIncidents() {
  const incidents = await prisma.incident.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <PoliceLayout>
      <h1 className='mb-5 text-3xl font-bold'>Incident Review Queue</h1>
      <IncidentsTable data={incidents} />
    </PoliceLayout>
  );
}

