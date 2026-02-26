import { NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfMonth, endOfMonth } from "date-fns";


export async function GET() {
  try {
    const ctx   = await requireOrg();
    const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const thirtyDaysForward = subDays(now, -30);

    // ── Run all independent queries in parallel ───────────────────────────────
    const [
      activeDealsCount,
      recentDeals,
      pipelineDeals,
      executingDeals,
      dealsClosingThisMonth,
      expiringContracts,
      counterparties,
      recentActivities,
      dealsByStageRaw,
      positions,
      marketSnapshot,
      upcomingAlerts,
    ] = await Promise.all([
      // 1. Active deals count
      prisma.deal.count({
        where: { organizationId: orgId, stage: { notIn: ["DEAD", "SETTLED"] } },
      }),

      // 2. Sparkline: deals created per day over last 30 days
      prisma.deal.findMany({
        where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),

      // 3. Pipeline value (weighted)
      prisma.deal.findMany({
        where: {
          organizationId: orgId,
          stage: { in: ["ORIGINATION", "INDICATIVE", "FIRM_BID", "CREDIT_REVIEW", "LEGAL_REVIEW"] },
        },
        select: { weightedValue: true },
      }),

      // 4. Unrealized P&L
      prisma.deal.findMany({
        where: { organizationId: orgId, stage: { in: ["EXECUTED", "DELIVERING"] } },
        select: { unrealizedPnl: true },
      }),

      // 5. Deals closing this month
      prisma.deal.count({
        where: {
          organizationId: orgId,
          stage: { in: ["FIRM_BID", "CREDIT_REVIEW", "LEGAL_REVIEW", "EXECUTED"] },
          endDate: { gte: monthStart, lte: monthEnd },
        },
      }),

      // 6. Expiring contracts (next 30 days)
      prisma.contract.count({
        where: {
          organizationId: orgId,
          status: "ACTIVE",
          expirationDate: { gte: now, lte: thirtyDaysForward },
        },
      }),

      // 7. Total exposure vs credit limit
      prisma.counterparty.findMany({
        where: { organizationId: orgId, status: "ACTIVE" },
        select: { currentExposure: true, creditLimit: true },
      }),

      // 8. Recent activities (with user + deal info)
      prisma.activity.findMany({
        where: { organizationId: orgId },
        include: {
          user: { select: { name: true, avatarUrl: true } },
          deal: { select: { dealNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),

      // 9. Deals by stage
      prisma.deal.groupBy({
        by: ["stage"],
        where: { organizationId: orgId, stage: { notIn: ["DEAD"] } },
        _count: { stage: true },
        _sum: { totalNotionalValue: true },
      }),

      // 10. Positions by commodity
      prisma.deal.findMany({
        where: { organizationId: orgId, stage: { notIn: ["DEAD", "SETTLED"] } },
        select: { commodity: true, direction: true, volume: true, volumeUnit: true },
      }),

      // 11. Market snapshot — latest price per index (limited)
      prisma.marketPrice.findMany({
        orderBy: { date: "desc" },
        distinct: ["commodity", "deliveryPoint"],
        take: 6,
      }),

      // 12. Upcoming alerts
      prisma.alert.findMany({
        where: { organizationId: orgId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // ── Post-process in memory (no extra DB round-trips) ──────────────────────

    // Build sparkline map
    const sparklineMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = subDays(now, i);
      sparklineMap[d.toISOString().slice(0, 10)] = 0;
    }
    recentDeals.forEach(d => {
      const key = d.createdAt.toISOString().slice(0, 10);
      if (sparklineMap[key] !== undefined) sparklineMap[key]++;
    });
    const activeDealsSparkline = Object.entries(sparklineMap).map(([date, count]) => ({ date, count }));

    const pipelineValue = pipelineDeals.reduce((s, d) => s + Number(d.weightedValue), 0);
    const unrealizedPnl = executingDeals.reduce((s, d) => s + Number(d.unrealizedPnl), 0);
    const totalExposure = counterparties.reduce((s, c) => s + Number(c.currentExposure), 0);
    const totalCreditLimit = counterparties.reduce((s, c) => s + Number(c.creditLimit), 0);

    const dealsByStage = dealsByStageRaw.map(d => ({
      stage: d.stage,
      count: d._count.stage,
      totalValue: Number(d._sum.totalNotionalValue ?? 0),
    }));

    const posMap: Record<string, { commodity: string; buyVolume: number; sellVolume: number; unit: string }> = {};
    positions.forEach(p => {
      if (!posMap[p.commodity]) {
        posMap[p.commodity] = { commodity: p.commodity, buyVolume: 0, sellVolume: 0, unit: p.volumeUnit };
      }
      if (p.direction === "BUY") posMap[p.commodity].buyVolume += Number(p.volume);
      else posMap[p.commodity].sellVolume += Number(p.volume);
    });
    const positionsByCommodity = Object.values(posMap).map(p => ({
      ...p,
      netVolume: p.buyVolume - p.sellVolume,
    }));

    return NextResponse.json({
      data: {
        activeDeals: activeDealsCount,
        activeDealsSparkline,
        pipelineValue,
        unrealizedPnl,
        dealsClosingThisMonth,
        expiringContracts,
        totalExposure,
        totalCreditLimit,
        recentActivities,
        dealsByStage,
        positionsByCommodity,
        marketSnapshot,
        upcomingAlerts,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
