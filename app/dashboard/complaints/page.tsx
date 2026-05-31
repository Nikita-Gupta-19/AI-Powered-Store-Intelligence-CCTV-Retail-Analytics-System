import CitizenLayout from '@/components/layout/CitizenLayout';
import ComplaintsTable from '@/components/tables/ComplaintsTable';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export default async function Complaints() {
  const session = await getSession();
  const data = await prisma.complaint.findMany({
    where: {
      userId: session?.id
    },
    orderBy: { createdAt: 'desc' },
    include: { incident: true }
  });

  return (
    <CitizenLayout>
      <h1 className='mb-5 text-3xl font-bold'>Complaint Tracking</h1>
      <ComplaintsTable data={data} />
    </CitizenLayout>
  );
}

