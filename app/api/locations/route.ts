import { prisma } from '@/lib/prisma';import { ok } from '@/lib/api-response';export async function GET(){return ok(await prisma.location.findMany({orderBy:{riskScore:'desc'}}))}
