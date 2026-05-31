import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.vehicleDetection.deleteMany();
  await prisma.incidentNote.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Seed standard platform users
  await prisma.user.createMany({
    data: [
      { name: 'Store Associate', email: 'citizen@example.com', passwordHash, role: 'CITIZEN' },
      { name: 'Brigade Store Manager', email: 'police@delhi.gov.in', passwordHash, role: 'POLICE' },
      { name: 'Platform Admin', email: 'admin@platform.local', passwordHash, role: 'ADMIN' }
    ]
  });

  // Read compiled Excel layouts
  const layoutPath = path.join(process.cwd(), 'prisma', 'store_layout.json');
  let storeName = "Brigade Road Bangalore";
  let excelSource = "Brigade Road - Store layoutc5f5d56.xlsx";
  let layoutRevision = "Revised";
  let departments: Array<{ name: string; lat: number; lng: number; section: string; optimal_dwell: number }> = [];

  if (fs.existsSync(layoutPath)) {
    try {
      const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));
      storeName = layout.store_name;
      excelSource = layout.excel_source;
      layoutRevision = layout.layout_revision;
      departments = layout.departments;
    } catch (e) {
      console.error("Error reading store_layout.json:", e);
    }
  }

  // Fallback if layout.json has parsing issues
  if (departments.length === 0) {
    departments = [
      { name: 'Aisle 1 - Makeup & Cosmetics', lat: 28.6180, lng: 77.2120, section: 'North Wing', optimal_dwell: 35 },
      { name: 'Aisle 2 - Skincare & Dermatologicals', lat: 28.6150, lng: 77.2100, section: 'East Wing', optimal_dwell: 40 },
      { name: 'Aisle 3 - Luxury Fragrances', lat: 28.6160, lng: 77.2080, section: 'West Wing', optimal_dwell: 25 },
      { name: 'Aisle 4 - Bath, Body & Haircare', lat: 28.6210, lng: 77.2050, section: 'South-East Wing', optimal_dwell: 30 },
      { name: 'POS Register checkout counters', lat: 28.6080, lng: 77.2020, section: 'Front South Wing', optimal_dwell: 50 }
    ];
  }

  const locEntry = await prisma.location.create({
    data: { name: 'Store Entry / Exit Zone', lat: 28.6139, lng: 77.2090, district: 'Front Aisle', riskScore: 10 }
  });

  const createdDepts: Record<string, string> = {};
  for (const dept of departments) {
    const loc = await prisma.location.create({
      data: {
        name: dept.name,
        lat: dept.lat,
        lng: dept.lng,
        district: dept.section,
        riskScore: dept.optimal_dwell
      }
    });
    createdDepts[dept.name] = loc.id;
  }

  const deptMap: Record<string, string> = {
    'makeup': createdDepts['Aisle 1 - Makeup & Cosmetics'] || locEntry.id,
    'skin': createdDepts['Aisle 2 - Skincare & Dermatologicals'] || locEntry.id,
    'fragrance': createdDepts['Aisle 3 - Luxury Fragrances'] || locEntry.id,
    'bath-and-body': createdDepts['Aisle 4 - Bath, Body & Haircare'] || locEntry.id,
    'hair': createdDepts['Aisle 4 - Bath, Body & Haircare'] || locEntry.id,
    'personal-care': createdDepts['Aisle 4 - Bath, Body & Haircare'] || locEntry.id
  };

  // Parse Brigade Bangalore real transaction CSV
  const csvPath = path.join(process.cwd(), 'videos', 'Brigade_Bangalore_10_April_26 (1)bc6219c.csv');
  let realOrdersCount = 0;
  let totalGMV = 0;

  if (fs.existsSync(csvPath)) {
    try {
      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      const orderIdIdx = headers.indexOf('order_id');
      const customerNameIdx = headers.indexOf('customer_name');
      const productNameIdx = headers.indexOf('product_name');
      const depNameIdx = headers.indexOf('dep_name');
      const gmvIdx = headers.indexOf('GMV');
      const qtyIdx = headers.indexOf('qty');

      const rows = lines.slice(1).filter(line => line.trim().length > 0);
      realOrdersCount = rows.length;

      for (let i = 0; i < Math.min(25, rows.length); i++) {
        const cols = rows[i].split(',');
        const orderId = cols[orderIdIdx]?.trim() || `ORD-${1000 + i}`;
        const customerName = cols[customerNameIdx]?.trim() || 'Retail Guest';
        const productName = cols[productNameIdx]?.replace(/"/g, '').trim() || 'Purplle Cosmetics';
        const depName = cols[depNameIdx]?.trim() || 'makeup';
        const gmv = parseFloat(cols[gmvIdx]?.trim() || '350.0');
        const qty = parseInt(cols[qtyIdx]?.trim() || '1');

        totalGMV += gmv;
        const targetLocationId = deptMap[depName] || locEntry.id;

        const session = await prisma.incident.create({
          data: {
            title: `POS Checkout #${orderId}`,
            description: `Real purchase by ${customerName} | Item: ${productName} (Qty: ${qty})`,
            category: 'POS_CHECKOUT',
            severity: 'LOW',
            lat: 28.6080,
            lng: 77.2020,
            dwellTimeSeconds: Math.round(180 + Math.random() * 600),
            isStaff: false,
            hasPurchased: true,
            customerCount: 1,
            locationId: targetLocationId,
            aiSummary: JSON.stringify({
              summary: `Brigade Road transaction: ${productName} purchased.`,
              incidentAnalysis: {
                incidentDetected: true,
                incidentType: 'POS_CHECKOUT',
                severity: 'LOW',
                timestamp: '08:45',
                confidence: 0.98,
                reason: `Customer ${customerName} purchased ${productName} (Category: ${depName}, GMV: ${gmv}). Layout: ${layoutRevision}`
              }
            })
          }
        });

        // Add timeline events for this customer
        await prisma.timelineEvent.createMany({
          data: [
            { time: '00:02', label: 'Entered main doorway', confidence: 0.99, incidentId: session.id },
            { time: '02:40', label: `Browsed ${depName} department shelves`, confidence: 0.89, incidentId: session.id },
            { time: '07:15', label: 'Entered cash register queue', confidence: 0.92, incidentId: session.id },
            { time: '08:45', label: `Completed checkout payment for ${productName}`, confidence: 0.97, incidentId: session.id },
          ]
        });
      }
      
      console.log(`Loaded ${Math.min(25, rows.length)} real purchases from CSV.`);
    } catch (err) {
      console.error("Error parsing transactions CSV:", err);
    }
  }

  // Seed an Operational Floor Staff shift session
  const locCheckout = createdDepts['POS Register checkout counters'] || locEntry.id;
  const locSkin = createdDepts['Aisle 2 - Skincare & Dermatologicals'] || locEntry.id;
  const locMakeup = createdDepts['Aisle 1 - Makeup & Cosmetics'] || locEntry.id;

  const staffSession = await prisma.incident.create({
    data: {
      title: 'Store Associate Shift #204',
      description: 'CCTV floor track of store associate restocking cosmetics shelves.',
      category: 'SHELF_INTERACTION',
      severity: 'LOW',
      lat: 28.6180,
      lng: 77.2120,
      dwellTimeSeconds: 1540.0,
      isStaff: true,
      hasPurchased: false,
      customerCount: 1,
      locationId: locMakeup,
      aiSummary: JSON.stringify({
        summary: 'Staff floor associate identified by persistent non-checkout dwell tracks.',
        incidentAnalysis: {
          incidentDetected: false,
          incidentType: 'SHELF_INTERACTION',
          severity: 'LOW',
          timestamp: '25:00',
          confidence: 0.99,
          reason: 'Dwell time exceeds staff filtering threshold. Excluded from conversion metrics.'
        }
      })
    }
  });

  // Seed Operations Manager alerts
  await prisma.alert.createMany({
    data: [
      {
        title: 'Checkout Queue Traffic Congestion',
        incidentType: 'QUEUE_WAIT',
        locationName: 'POS Register checkout counters',
        severity: 'HIGH',
        message: 'CCTV analytics: Register 1 occupancy (6 customers) exceeds standard threshold of 5. Opening Register 2 is recommended.',
        lat: 28.6080,
        lng: 77.2020,
        locationId: locCheckout
      },
      {
        title: 'Floor Hazard Spill Detection',
        incidentType: 'ANOMALY_SPILL',
        locationName: 'Aisle 2 - Skincare Section',
        severity: 'CRITICAL',
        message: 'CCTV feed anomaly: liquid floor spill detected in Skincare Zone 2. Cleaning dispatch requested immediately.',
        lat: 28.6150,
        lng: 77.2100,
        locationId: locSkin
      }
    ]
  });

  console.log(`Database successfully seeded with Excel layout: ${excelSource} (Revision: ${layoutRevision}) ✓`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
