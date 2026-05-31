import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/api-response';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'POLICE' && session.role !== 'ADMIN')) {
      return fail('Unauthorized', 403);
    }

    const { status, progressNote } = await req.json();

    if (status && !['PENDING', 'UNDER_INVESTIGATION', 'RESOLVED'].includes(status)) {
      return fail('Invalid status', 400);
    }

    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: { 
        ...(status && { status }),
        ...(progressNote && {
          notes: {
            create: {
              content: progressNote,
              authorName: session.name || 'Police Officer',
            }
          }
        })
      },
    });

    return ok(incident);
  } catch (error) {
    console.error(error);
    return fail('Internal server error', 500);
  }
}
