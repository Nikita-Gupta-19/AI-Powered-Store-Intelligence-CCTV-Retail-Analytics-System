import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/api-response';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return fail('Missing required fields', 400);
    }

    const finalRole = role === 'POLICE' ? 'POLICE' : 'CITIZEN';

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return fail('Email already in use', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: finalRole,
      },
    });

    return ok({ id: user.id, email: user.email, role: user.role, name: user.name });
  } catch (error) {
    return fail('Internal server error', 500);
  }
}
