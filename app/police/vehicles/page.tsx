import PoliceLayout from '@/components/layout/PoliceLayout';
import VehicleDetectionGroup from '@/components/vehicle/VehicleDetectionGroup';
import { prisma } from '@/lib/prisma';

export default async function Vehicles() {
  const incidents = await prisma.incident.findMany({
    where: {
      detections: {
        some: {}
      }
    },
    include: {
      detections: {
        orderBy: { timestamp: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <PoliceLayout>
      <h1 className='mb-5 text-3xl font-bold'>Vehicle Detections</h1>
      <VehicleDetectionGroup incidents={incidents} />
    </PoliceLayout>
  );
}
