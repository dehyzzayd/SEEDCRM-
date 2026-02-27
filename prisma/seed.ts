import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LotPilot demo data...");

  const org = await prisma.organization.upsert({
    where:  { id: "org_demo_001" },
    update: {},
    create: {
      id:              "org_demo_001",
      name:            "Sunshine Auto Group",
      dealerState:     "TX",
      dealerCity:      "Dallas",
      subscriptionTier: "PRO",
    },
  });

  const hash = await bcrypt.hash("lotpilot2026!", 12);

  const owner = await prisma.user.upsert({
    where:  { email: "zayd@sunshine.auto" },
    update: {},
    create: {
      id:             "user_demo_001",
      email:          "zayd@sunshine.auto",
      name:           "Zayd Al-Rashid",
      role:           "ADMIN",
      organizationId: org.id,
      passwordHash:   hash,
      title:          "General Manager",
    },
  });

  // Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where:  { vin: "1HGBH41JXMN109186" },
      update: {},
      create: {
        organizationId: org.id,
        stockNumber:    "SA-001",
        vin:            "1HGBH41JXMN109186",
        year: 2022, make: "Toyota", model: "Camry", trim: "XSE V6",
        exteriorColor: "Midnight Black", interiorColor: "Black",
        mileage: 28400, fuelType: "GASOLINE", transmission: "AUTOMATIC",
        condition: "USED_GOOD", costBasis: 22000, askingPrice: 27995,
        status: "AVAILABLE", lotLocation: "Row A-3",
        features: ["Sunroof", "Navigation", "Heated Seats", "Apple CarPlay"],
      },
    }),
    prisma.vehicle.upsert({
      where:  { vin: "5YJSA1DG9PF123456" },
      update: {},
      create: {
        organizationId: org.id,
        stockNumber:    "SA-002",
        vin:            "5YJSA1DG9PF123456",
        year: 2023, make: "Tesla", model: "Model 3", trim: "Long Range",
        exteriorColor: "Pearl White", interiorColor: "White",
        mileage: 11200, fuelType: "ELECTRIC", transmission: "AUTOMATIC",
        condition: "USED_EXCELLENT", costBasis: 34000, askingPrice: 41500,
        status: "AVAILABLE", lotLocation: "Row B-1",
        features: ["Autopilot", "Premium Audio", "Glass Roof"],
      },
    }),
    prisma.vehicle.upsert({
      where:  { vin: "WBA3A5G59DNP26082" },
      update: {},
      create: {
        organizationId: org.id,
        stockNumber:    "SA-003",
        vin:            "WBA3A5G59DNP26082",
        year: 2021, make: "BMW", model: "3 Series", trim: "330i xDrive",
        exteriorColor: "Alpine White", interiorColor: "Cognac",
        mileage: 41000, fuelType: "GASOLINE", transmission: "AUTOMATIC",
        condition: "USED_GOOD", costBasis: 28500, askingPrice: 34900,
        status: "IN_NEGOTIATION", lotLocation: "Row A-7",
        features: ["M Sport Package", "Harman Kardon", "Heads Up Display"],
      },
    }),
    prisma.vehicle.upsert({
      where:  { vin: "2T1BURHE0JC043821" },
      update: {},
      create: {
        organizationId: org.id,
        stockNumber:    "SA-004",
        vin:            "2T1BURHE0JC043821",
        year: 2020, make: "Honda", model: "CR-V", trim: "EX-L AWD",
        exteriorColor: "Sonic Gray", interiorColor: "Gray",
        mileage: 52000, fuelType: "GASOLINE", transmission: "CVT",
        condition: "USED_GOOD", costBasis: 19500, askingPrice: 24499,
        status: "AVAILABLE", lotLocation: "Row C-2",
        features: ["Leather Seats", "Sunroof", "Honda Sensing"],
      },
    }),
    prisma.vehicle.upsert({
      where:  { vin: "1G1ZD5ST8JF123456" },
      update: {},
      create: {
        organizationId: org.id,
        stockNumber:    "SA-005",
        vin:            "1G1ZD5ST8JF123456",
        year: 2018, make: "Chevrolet", model: "Malibu", trim: "LT",
        exteriorColor: "Silver Ice", interiorColor: "Jet Black",
        mileage: 68000, fuelType: "GASOLINE", transmission: "AUTOMATIC",
        condition: "USED_FAIR", costBasis: 10500, askingPrice: 13995,
        status: "AVAILABLE", lotLocation: "Row D-4",
        features: ["Backup Camera", "Bluetooth"],
      },
    }),
  ]);

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where:  { id: "cust_001" },
      update: {},
      create: {
        id: "cust_001", organizationId: org.id,
        firstName: "Marcus", lastName: "Thompson",
        email: "marcus.t@email.com", phone: "214-555-0142",
        city: "Dallas", state: "TX", zip: "75201",
        creditTier: "Good", preApproved: true, preApprovedAmount: 35000,
        leadSource: "WEBSITE",
      },
    }),
    prisma.customer.upsert({
      where:  { id: "cust_002" },
      update: {},
      create: {
        id: "cust_002", organizationId: org.id,
        firstName: "Sarah", lastName: "Chen",
        email: "sarah.chen@email.com", phone: "972-555-0189",
        city: "Plano", state: "TX", zip: "75024",
        creditTier: "Excellent", preApproved: false,
        leadSource: "REFERRAL",
      },
    }),
    prisma.customer.upsert({
      where:  { id: "cust_003" },
      update: {},
      create: {
        id: "cust_003", organizationId: org.id,
        firstName: "James", lastName: "O'Brien",
        email: "jobrien@email.com", phone: "469-555-0231",
        city: "Frisco", state: "TX", zip: "75033",
        creditTier: "Fair",
        leadSource: "WALK_IN",
      },
    }),
  ]);

  // Sales Deals
  await prisma.salesDeal.upsert({
    where:  { dealNumber: "LP-2026-001" },
    update: {},
    create: {
      dealNumber:     "LP-2026-001",
      organizationId: org.id,
      customerId:     "cust_001",
      vehicleId:      vehicles[1].id,
      assignedUserId: owner.id,
      stage:          "FINANCE_AND_INSURANCE",
      leadSource:     "WEBSITE",
      probability:    85,
      askingPrice:    41500,
      offerPrice:     39900,
      costBasis:      34000,
      frontEndGross:  5900,
      financeType:    "DEALER_FINANCE",
      lender:         "Ally Financial",
      loanAmount:     36000,
      interestRate:   0.0699,
      loanTermMonths: 60,
      monthlyPayment: 713.42,
      downPayment:    3900,
      hasTradeIn:     false,
      docFee:         150,
      internalNotes:  "Customer pre-approved at Chase. Trying dealer finance for reserve.",
    },
  });

  await prisma.salesDeal.upsert({
    where:  { dealNumber: "LP-2026-002" },
    update: {},
    create: {
      dealNumber:     "LP-2026-002",
      organizationId: org.id,
      customerId:     "cust_002",
      vehicleId:      vehicles[2].id,
      assignedUserId: owner.id,
      stage:          "TEST_DRIVE_DONE",
      leadSource:     "REFERRAL",
      probability:    60,
      askingPrice:    34900,
      costBasis:      28500,
      frontEndGross:  0,
      financeType:    "CASH",
      hasTradeIn:     true,
      internalNotes:  "Has 2019 Audi A4 trade-in. Need ACV.",
    },
  });

  await prisma.salesDeal.upsert({
    where:  { dealNumber: "LP-2026-003" },
    update: {},
    create: {
      dealNumber:     "LP-2026-003",
      organizationId: org.id,
      customerId:     "cust_003",
      vehicleId:      vehicles[0].id,
      assignedUserId: owner.id,
      stage:          "NEW_LEAD",
      leadSource:     "WALK_IN",
      probability:    20,
      askingPrice:    27995,
      costBasis:      22000,
      frontEndGross:  0,
      financeType:    "BANK_FINANCE",
      hasTradeIn:     false,
    },
  });

  console.log("✅ LotPilot seed complete");
  console.log("   Login: zayd@sunshine.auto / lotpilot2026!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
