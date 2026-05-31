import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api-response';

export async function GET() {
  const sessions = await prisma.incident.findMany();

  // Divide into customers vs staff
  const customers = sessions.filter((s) => !s.isStaff);
  const staff = sessions.filter((s) => s.isStaff);

  const totalFootfall = sessions.reduce((sum, s) => sum + (s.customerCount ?? 1), 0);
  const customerFootfall = customers.reduce((sum, s) => sum + (s.customerCount ?? 1), 0);
  const staffCount = staff.length;

  // Conversion calculations
  const uniqueCustomersCount = customers.length;
  const conversions = customers.filter((s) => s.hasPurchased).length;
  const conversionRate = uniqueCustomersCount > 0 ? conversions / uniqueCustomersCount : 0.0;

  // Average dwell time calculation
  const totalDwellTime = customers.reduce((sum, s) => sum + (s.dwellTimeSeconds ?? 0.0), 0);
  const averageDwellTime = uniqueCustomersCount > 0 ? totalDwellTime / uniqueCustomersCount : 0.0;

  // Format active occupancy (simulated or based on last 30 minutes)
  const activeOccupancy = Math.max(2, customers.filter((s) => s.createdAt > new Date(Date.now() - 30 * 60 * 1000)).length);

  return ok({
    total_footfall: totalFootfall,
    customer_footfall: customerFootfall,
    staff_count_excluded: staffCount,
    unique_customers: uniqueCustomersCount,
    checkout_conversions: conversions,
    store_conversion_rate: parseFloat(conversionRate.toFixed(3)),
    average_dwell_time_seconds: Math.round(averageDwellTime),
    active_occupancy: activeOccupancy,
    updatedAt: new Date().toISOString()
  });
}
