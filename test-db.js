const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Locations:', await prisma.location.findMany());
  console.log('Alerts:', await prisma.alert.findMany());
  console.log('Incidents:', await prisma.incident.findMany({ select: { id: true, title: true, locationId: true }}));
}

main().finally(() => prisma.$disconnect());
