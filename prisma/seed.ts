import { PrismaClient, DealStage, Commodity, DealDirection, ProductType, VolumeUnit, PriceType, DealSource, CounterpartyType, CounterpartyStatus, CreditRating, ActivityType, PriceSource, AlertType, AlertSeverity, ContractType, ContractStatus, Currency } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, addDays, subMonths } from "date-fns";

const prisma = new PrismaClient();

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("🌱 Seeding DEHY database...");

  // ─── Organization ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: "org_meridian" },
    update: {},
    create: {
      id: "org_meridian",
      name: "Meridian Energy Trading LLC",
      timezone: "America/Chicago",
      defaultCurrency: "USD",
      subscriptionTier: "ENTERPRISE",
    },
  });
  console.log("✅ Organization created");

  // ─── Users ─────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash("dehy2026!", 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "zayd@meridian.energy" },
      update: {},
      create: {
        id: "user_zayd",
        email: "zayd@meridian.energy",
        name: "Zayd Al-Rashid",
        role: "ADMIN",
        organizationId: org.id,
        passwordHash: hash,
      },
    }),
    prisma.user.upsert({
      where: { email: "sarah.chen@meridian.energy" },
      update: {},
      create: {
        id: "user_sarah",
        email: "sarah.chen@meridian.energy",
        name: "Sarah Chen",
        role: "TRADER",
        organizationId: org.id,
        passwordHash: hash,
      },
    }),
    prisma.user.upsert({
      where: { email: "marcus.reed@meridian.energy" },
      update: {},
      create: {
        id: "user_marcus",
        email: "marcus.reed@meridian.energy",
        name: "Marcus Reed",
        role: "TRADER",
        organizationId: org.id,
        passwordHash: hash,
      },
    }),
    prisma.user.upsert({
      where: { email: "priya.patel@meridian.energy" },
      update: {},
      create: {
        id: "user_priya",
        email: "priya.patel@meridian.energy",
        name: "Priya Patel",
        role: "ANALYST",
        organizationId: org.id,
        passwordHash: hash,
      },
    }),
    prisma.user.upsert({
      where: { email: "james.ohara@meridian.energy" },
      update: {},
      create: {
        id: "user_james",
        email: "james.ohara@meridian.energy",
        name: "James O'Hara",
        role: "VIEWER",
        organizationId: org.id,
        passwordHash: hash,
      },
    }),
  ]);
  console.log("✅ Users created (5)");

  // ─── Counterparties ────────────────────────────────────────────────────────
  const counterpartyData = [
    { name: "Shell Energy North America", shortName: "SHEL", type: "MARKETER" as CounterpartyType, rating: "AA" as CreditRating, limit: 500_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "BP Energy Company", shortName: "BPEN", type: "MARKETER" as CounterpartyType, rating: "A" as CreditRating, limit: 400_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "Calpine Corporation", shortName: "CALP", type: "GENERATOR" as CounterpartyType, rating: "BB" as CreditRating, limit: 100_000_000, naesb: true, isda: false, city: "Houston", state: "TX" },
    { name: "NRG Energy Inc.", shortName: "NRG", type: "GENERATOR" as CounterpartyType, rating: "BB_PLUS" as CreditRating, limit: 150_000_000, naesb: true, isda: true, city: "Princeton", state: "NJ" },
    { name: "Vitol Inc.", shortName: "VITOL", type: "MARKETER" as CounterpartyType, rating: "A_MINUS" as CreditRating, limit: 300_000_000, naesb: false, isda: true, city: "Houston", state: "TX" },
    { name: "Trafigura LLC", shortName: "TRAF", type: "MARKETER" as CounterpartyType, rating: "BBB" as CreditRating, limit: 250_000_000, naesb: false, isda: true, city: "Stamford", state: "CT" },
    { name: "NextEra Energy Marketing", shortName: "NEE", type: "GENERATOR" as CounterpartyType, rating: "A_PLUS" as CreditRating, limit: 200_000_000, naesb: true, isda: true, city: "Juno Beach", state: "FL" },
    { name: "Constellation Energy", shortName: "CEG", type: "UTILITY" as CounterpartyType, rating: "BBB_PLUS" as CreditRating, limit: 175_000_000, naesb: true, isda: true, city: "Baltimore", state: "MD" },
    { name: "MPLX LP", shortName: "MPLX", type: "PRODUCER" as CounterpartyType, rating: "BBB_MINUS" as CreditRating, limit: 120_000_000, naesb: true, isda: false, city: "Findlay", state: "OH" },
    { name: "Freeport LNG Development", shortName: "FLNG", type: "MARKETER" as CounterpartyType, rating: "BBB" as CreditRating, limit: 200_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "Cheniere Energy", shortName: "LNG", type: "PRODUCER" as CounterpartyType, rating: "BB_PLUS" as CreditRating, limit: 180_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "TotalEnergies Trading USA", shortName: "TTE", type: "MARKETER" as CounterpartyType, rating: "AA_MINUS" as CreditRating, limit: 350_000_000, naesb: false, isda: true, city: "Houston", state: "TX" },
    { name: "Equinor Energy LLC", shortName: "EQNR", type: "PRODUCER" as CounterpartyType, rating: "AA" as CreditRating, limit: 300_000_000, naesb: true, isda: true, city: "Stamford", state: "CT" },
    { name: "EDF Trading North America", shortName: "EDF", type: "MARKETER" as CounterpartyType, rating: "A" as CreditRating, limit: 150_000_000, naesb: false, isda: true, city: "Houston", state: "TX" },
    { name: "Mercuria Energy America", shortName: "MERC", type: "MARKETER" as CounterpartyType, rating: "BBB_PLUS" as CreditRating, limit: 200_000_000, naesb: false, isda: true, city: "Geneva", state: "" },
    { name: "Engie Resources LLC", shortName: "ENGI", type: "RETAIL_PROVIDER" as CounterpartyType, rating: "A_MINUS" as CreditRating, limit: 100_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "Castleton Commodities", shortName: "CAST", type: "FINANCIAL" as CounterpartyType, rating: "UNRATED" as CreditRating, limit: 50_000_000, naesb: false, isda: true, city: "Stamford", state: "CT" },
    { name: "Macquarie Energy LLC", shortName: "MQG", type: "FINANCIAL" as CounterpartyType, rating: "A" as CreditRating, limit: 175_000_000, naesb: true, isda: true, city: "Houston", state: "TX" },
    { name: "Hartree Partners LP", shortName: "HART", type: "MARKETER" as CounterpartyType, rating: "BBB" as CreditRating, limit: 125_000_000, naesb: false, isda: true, city: "New York", state: "NY" },
    { name: "DTE Energy Trading", shortName: "DTE", type: "UTILITY" as CounterpartyType, rating: "BBB_PLUS" as CreditRating, limit: 130_000_000, naesb: true, isda: true, city: "Detroit", state: "MI" },
  ];

  const counterparties = [];
  for (let i = 0; i < counterpartyData.length; i++) {
    const cp = counterpartyData[i];
    const exposure = rand(0, cp.limit * 0.9);
    const created = await prisma.counterparty.upsert({
      where: { id: `cp_${cp.shortName.toLowerCase()}` },
      update: {},
      create: {
        id: `cp_${cp.shortName.toLowerCase()}`,
        organizationId: org.id,
        name: cp.name,
        shortName: cp.shortName,
        type: cp.type,
        creditRating: cp.rating,
        creditLimit: cp.limit,
        currentExposure: exposure,
        isdaMasterAgreement: cp.isda,
        isdaDate: cp.isda ? subMonths(new Date(), randInt(6, 36)) : null,
        naesb: cp.naesb,
        naesbDate: cp.naesb ? subMonths(new Date(), randInt(6, 36)) : null,
        primaryContactName: `${["John","Mike","Lisa","Robert","Jennifer"][randInt(0,5)]} ${["Smith","Johnson","Williams","Brown","Davis"][randInt(0,5)]}`,
        primaryContactEmail: `trading@${cp.name.toLowerCase().replace(/\s+/g, "").slice(0, 10)}.com`,
        primaryContactPhone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
        city: cp.city,
        state: cp.state,
        country: "USA",
        status: "ACTIVE" as CounterpartyStatus,
        tags: ["energy", pick(["gas", "power", "crude", "trading"])],
      },
    });
    counterparties.push(created);
  }
  console.log("✅ Counterparties created (20)");

  // ─── Market Prices (90 days) ───────────────────────────────────────────────
  const indices = [
    { commodity: "NATURAL_GAS" as Commodity, deliveryPoint: "Henry Hub", indexName: "HH Prompt Month", basePrice: 3.20, source: "EIA" as PriceSource, volatility: 0.08 },
    { commodity: "CRUDE_OIL_WTI" as Commodity, deliveryPoint: "Cushing, OK", indexName: "NYMEX WTI CL1", basePrice: 72.50, source: "CME_DELAYED" as PriceSource, volatility: 0.02 },
    { commodity: "CRUDE_OIL_BRENT" as Commodity, deliveryPoint: "North Sea", indexName: "ICE Brent CO1", basePrice: 76.80, source: "ICE_DELAYED" as PriceSource, volatility: 0.02 },
    { commodity: "POWER" as Commodity, deliveryPoint: "ERCOT North Hub", indexName: "ERCOT RT LZ_NORTH", basePrice: 45.00, source: "ERCOT" as PriceSource, volatility: 0.15 },
    { commodity: "POWER" as Commodity, deliveryPoint: "PJM Western Hub", indexName: "PJM DA Western Hub", basePrice: 52.00, source: "MANUAL" as PriceSource, volatility: 0.12 },
    { commodity: "NATURAL_GAS" as Commodity, deliveryPoint: "Waha", indexName: "NGI Waha", basePrice: 1.80, source: "MANUAL" as PriceSource, volatility: 0.20 },
  ];

  for (const idx of indices) {
    let price = idx.basePrice;
    for (let d = 90; d >= 0; d--) {
      const date = subDays(new Date(), d);
      date.setHours(0, 0, 0, 0);
      const change = (Math.random() - 0.48) * price * idx.volatility;
      const newPrice = Math.max(price + change, 0.1);
      const changeAbs = newPrice - price;
      const changePct = (changeAbs / price) * 100;
      price = newPrice;

      await prisma.marketPrice.upsert({
        where: {
          commodity_deliveryPoint_date: {
            commodity: idx.commodity,
            deliveryPoint: idx.deliveryPoint,
            date,
          },
        },
        update: {},
        create: {
          commodity: idx.commodity,
          deliveryPoint: idx.deliveryPoint,
          indexName: idx.indexName,
          date,
          settlementPrice: newPrice,
          changeAbsolute: changeAbs,
          changePercent: changePct,
          source: idx.source,
        },
      });
    }
  }
  console.log("✅ Market prices created (90 days × 6 indices)");

  // ─── Deals ─────────────────────────────────────────────────────────────────
  const stages: DealStage[] = ["ORIGINATION","INDICATIVE","FIRM_BID","CREDIT_REVIEW","LEGAL_REVIEW","EXECUTED","DELIVERING","SETTLED","DEAD"];
  const commodities: Commodity[] = ["NATURAL_GAS","CRUDE_OIL_WTI","CRUDE_OIL_BRENT","POWER","NGLS","REFINED_PRODUCTS"];
  const directions: DealDirection[] = ["BUY","SELL"];
  const deliveryPoints: Record<string, string[]> = {
    NATURAL_GAS: ["Henry Hub","Houston Ship Channel","Waha","Chicago Citygate"],
    CRUDE_OIL_WTI: ["Cushing, OK","Midland, TX","Houston, TX"],
    CRUDE_OIL_BRENT: ["North Sea","Rotterdam"],
    POWER: ["ERCOT North Hub","ERCOT Houston Hub","PJM Western Hub","MISO Indiana Hub"],
    NGLS: ["Mont Belvieu","Conway"],
    REFINED_PRODUCTS: ["NYMEX RBOB","Colonial Pipeline"],
  };
  const probByStage: Record<DealStage, number> = {
    ORIGINATION: 10, INDICATIVE: 25, FIRM_BID: 50, CREDIT_REVIEW: 70,
    LEGAL_REVIEW: 85, EXECUTED: 100, DELIVERING: 100, SETTLED: 100, DEAD: 0,
  };
  const priceByComm: Record<string, number> = {
    NATURAL_GAS: 3.20, CRUDE_OIL_WTI: 72.50, CRUDE_OIL_BRENT: 76.80,
    POWER: 45.00, NGLS: 28.50, REFINED_PRODUCTS: 2.85,
  };
  const unitByComm: Record<string, VolumeUnit> = {
    NATURAL_GAS: "MMBTU", CRUDE_OIL_WTI: "BBL", CRUDE_OIL_BRENT: "BBL",
    POWER: "MWH", NGLS: "BBL", REFINED_PRODUCTS: "GAL",
  };

  const userIds = users.map(u => u.id);
  const deals = [];

  for (let i = 1; i <= 50; i++) {
    const stage = pick(stages);
    const commodity = pick(commodities);
    const direction = pick(directions);
    const dp = pick(deliveryPoints[commodity] ?? ["TBD"]);
    const basePrice = priceByComm[commodity] ?? 50;
    const volume = commodity === "NATURAL_GAS"
      ? randInt(10_000, 500_000)
      : commodity === "POWER"
      ? randInt(5_000, 100_000)
      : randInt(1_000, 50_000);
    const fixedPrice = parseFloat((basePrice * rand(0.9, 1.1)).toFixed(4));
    const mktPrice = parseFloat((basePrice * rand(0.85, 1.15)).toFixed(4));
    const unit = unitByComm[commodity] ?? "CONTRACTS";
    const notional = volume * fixedPrice;
    const pnl = (mktPrice - fixedPrice) * volume * (direction === "BUY" ? 1 : -1);
    const prob = probByStage[stage];
    const counterparty = pick(counterparties);
    const createdAt = subDays(new Date(), randInt(1, 180));
    const startDate = addDays(new Date(), randInt(1, 90));
    const endDate = addDays(startDate, randInt(30, 365));

    const deal = await prisma.deal.create({
      data: {
        organizationId: org.id,
        counterpartyId: counterparty.id,
        assignedUserId: pick(userIds),
        dealNumber: `DEHY-2026-${String(i).padStart(5, "0")}`,
        direction,
        commodity,
        deliveryPoint: dp,
        product: pick(["PHYSICAL","FINANCIAL_SWAP","BASIS_SWAP","PPA"] as ProductType[]),
        startDate,
        endDate,
        volume,
        volumeUnit: unit,
        priceType: pick(["FIXED","INDEX_PLUS","INDEX_MINUS"] as PriceType[]),
        fixedPrice,
        indexName: commodity === "NATURAL_GAS" ? "HH Prompt Month" : null,
        currency: "USD" as Currency,
        totalNotionalValue: notional,
        currentMarketPrice: mktPrice,
        unrealizedPnl: ["EXECUTED","DELIVERING"].includes(stage) ? pnl : 0,
        stage,
        probability: prob,
        weightedValue: notional * prob / 100,
        source: pick(["DIRECT","BROKER","REFERRAL"] as DealSource[]),
        tags: [commodity.toLowerCase().replace(/_/g, "-"), direction.toLowerCase()],
        createdAt,
        updatedAt: createdAt,
        closedAt: ["SETTLED","DEAD"].includes(stage) ? randomDate(createdAt, new Date()) : null,
      },
    });
    deals.push(deal);

    // Milestones
    const stageOrder: DealStage[] = ["ORIGINATION","INDICATIVE","FIRM_BID","CREDIT_REVIEW","LEGAL_REVIEW","EXECUTED","DELIVERING","SETTLED"];
    const stageIdx = stageOrder.indexOf(stage);
    let stageDate = createdAt;
    for (let s = 0; s <= stageIdx && s < stageOrder.length; s++) {
      const entered = new Date(stageDate);
      const exited = s < stageIdx ? new Date(stageDate.getTime() + randInt(1, 10) * 24 * 60 * 60 * 1000) : null;
      const duration = exited ? Math.floor((exited.getTime() - entered.getTime()) / 60000) : null;
      await prisma.dealMilestone.create({
        data: {
          dealId: deal.id,
          stage: stageOrder[s],
          enteredAt: entered,
          exitedAt: exited,
          durationMinutes: duration,
        },
      });
      if (exited) stageDate = exited;
    }
  }
  console.log("✅ Deals created (50)");

  // ─── Contracts ─────────────────────────────────────────────────────────────
  const contractTypes: ContractType[] = ["ISDA_MASTER","NAESB","PPA","CUSTOM","AMENDMENT"];
  const contractStatuses: ContractStatus[] = ["ACTIVE","ACTIVE","ACTIVE","DRAFT","EXPIRED","EXPIRED"];

  for (let i = 1; i <= 15; i++) {
    const cp = pick(counterparties);
    const type = pick(contractTypes);
    const status = pick(contractStatuses);
    const effectiveDate = subMonths(new Date(), randInt(6, 36));
    const expirationDate = addDays(new Date(), randInt(-30, 365));

    await prisma.contract.create({
      data: {
        organizationId: org.id,
        counterpartyId: cp.id,
        contractNumber: `MERT-${type.slice(0,4)}-${String(i).padStart(4,"0")}`,
        type,
        status,
        effectiveDate,
        expirationDate,
        autoRenew: Math.random() > 0.5,
        noticePeriodDays: pick([30, 60, 90]),
        alertDaysBefore: 30,
        keyTerms: {
          jurisdiction: "Texas",
          governingLaw: "New York",
          nettingProvision: true,
          creditSupportAnnex: type === "ISDA_MASTER",
        },
      },
    });
  }
  console.log("✅ Contracts created (15)");

  // ─── Activities ────────────────────────────────────────────────────────────
  const activityTypes: ActivityType[] = ["NOTE","CALL","EMAIL","MEETING","STAGE_CHANGE","DOCUMENT_UPLOAD"];
  const notes = [
    "Discussed Q2 pricing with counterparty desk",
    "Confirmed delivery logistics via email",
    "Credit review completed — approved",
    "Legal team reviewing confirmation draft",
    "Counterparty requested extension on delivery window",
    "Updated market price benchmarks",
    "Broker confirmed bid/offer spread",
    "Internal risk review scheduled",
    "Margin call discussed — no action required",
    "Deal terms finalized, awaiting signature",
    "Price check against PJM day-ahead",
    "Volume adjustment requested",
    "Counterparty credit limit approaching — flagged",
    "New trader contact established",
    "Term sheet sent for review",
  ];

  for (let i = 0; i < 100; i++) {
    const type = pick(activityTypes);
    const deal = pick(deals);
    const user = pick(users);
    await prisma.activity.create({
      data: {
        organizationId: org.id,
        dealId: deal.id,
        counterpartyId: deal.counterpartyId,
        userId: user.id,
        type,
        title: `${type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")} — ${deal.dealNumber}`,
        description: pick(notes),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: (type === "STAGE_CHANGE"
          ? { fromStage: "INDICATIVE", toStage: "FIRM_BID" }
          : undefined) as any,
        createdAt: subDays(new Date(), randInt(0, 30)),
      },
    });
  }
  console.log("✅ Activities created (100)");

  // ─── Alerts ────────────────────────────────────────────────────────────────
  const alertData = [
    { type: "CONTRACT_EXPIRING" as AlertType, title: "ISDA Master Expiring Soon", message: "Your ISDA Master Agreement with Shell Energy expires in 18 days. Initiate renewal process.", severity: "WARNING" as AlertSeverity },
    { type: "CREDIT_LIMIT_BREACH" as AlertType, title: "Credit Limit Approaching — Vitol", message: "Vitol Inc. credit exposure at 87% of limit ($261M / $300M). Consider reducing new activity.", severity: "CRITICAL" as AlertSeverity },
    { type: "DEAL_STALE" as AlertType, title: "Stale Deal — DEHY-2026-00003", message: "Deal DEHY-2026-00003 has been in INDICATIVE stage for 14 days with no activity.", severity: "WARNING" as AlertSeverity },
    { type: "PRICE_MOVE" as AlertType, title: "Henry Hub Spike +8.3%", message: "HH Prompt Month moved +$0.27/MMBtu today. Review open natural gas positions.", severity: "INFO" as AlertSeverity },
    { type: "CONTRACT_EXPIRING" as AlertType, title: "NAESB Agreement Expiring — NRG Energy", message: "NAESB with NRG Energy expires in 45 days. Auto-renew is disabled.", severity: "WARNING" as AlertSeverity },
    { type: "CREDIT_LIMIT_BREACH" as AlertType, title: "Credit Limit Breached — Calpine", message: "Calpine Corporation has exceeded its $100M credit limit. All new trades require credit approval.", severity: "CRITICAL" as AlertSeverity },
    { type: "PRICE_MOVE" as AlertType, title: "WTI Drop -3.2%", message: "NYMEX WTI fell $2.32/bbl. Review crude oil hedge positions.", severity: "INFO" as AlertSeverity },
    { type: "DEAL_STALE" as AlertType, title: "Deal Approaching Deadline — DEHY-2026-00017", message: "DEHY-2026-00017 start date is in 7 days but deal is still in FIRM_BID.", severity: "WARNING" as AlertSeverity },
    { type: "CONTRACT_EXPIRING" as AlertType, title: "PPA Expiring — NextEra", message: "Power Purchase Agreement with NextEra Energy expires in 28 days.", severity: "WARNING" as AlertSeverity },
    { type: "CUSTOM" as AlertType, title: "Q1 Pipeline Review Meeting", message: "Scheduled pipeline review meeting tomorrow at 8:00 AM CT. Prepare deal status summaries.", severity: "INFO" as AlertSeverity },
  ];

  for (let i = 0; i < alertData.length; i++) {
    const alert = alertData[i];
    await prisma.alert.create({
      data: {
        organizationId: org.id,
        userId: users[0].id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isRead: i > 5,
        createdAt: subDays(new Date(), randInt(0, 7)),
      },
    });
  }
  console.log("✅ Alerts created (10)");

  console.log("\n🎉 Seed complete! Login with:");
  console.log("  Email: zayd@meridian.energy");
  console.log("  Password: dehy2026!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
