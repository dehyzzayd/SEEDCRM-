import { NextRequest, NextResponse } from "next/server";
import { requireOrg, isAuthError, DEMO_ORG_ID } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const ctx   = await requireOrg();
  const orgId = isAuthError(ctx) ? DEMO_ORG_ID : ctx.organizationId;

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : subDays(new Date(), 90);
  const dateTo   = searchParams.get("dateTo")   ? new Date(searchParams.get("dateTo")!)   : new Date();

  switch (params.type) {
    case "pipeline": {
      const deals = await prisma.deal.groupBy({
        by:    ["stage", "commodity"],
        where: { organizationId: orgId, createdAt: { gte: dateFrom, lte: dateTo } },
        _count: { id: true },
        _sum:   { totalNotionalValue: true, weightedValue: true },
      });
      return NextResponse.json({ data: deals });
    }

    case "exposure": {
      const cps = await prisma.counterparty.findMany({
        where:   { organizationId: orgId, status: "ACTIVE" },
        select:  { id: true, name: true, shortName: true, creditLimit: true, currentExposure: true, creditRating: true, type: true },
        orderBy: { currentExposure: "desc" },
      });
      return NextResponse.json({ data: cps });
    }

    case "pnl": {
      const deals = await prisma.deal.findMany({
        where:   { organizationId: orgId, stage: { in: ["EXECUTED","DELIVERING","SETTLED"] } },
        select:  { id: true, dealNumber: true, commodity: true, direction: true, totalNotionalValue: true, unrealizedPnl: true, counterparty: { select: { name: true, shortName: true } }, startDate: true, endDate: true },
        orderBy: { unrealizedPnl: "desc" },
      });
      return NextResponse.json({ data: deals });
    }

    case "velocity": {
      const milestones = await prisma.dealMilestone.findMany({
        where:  { deal: { organizationId: orgId }, exitedAt: { not: null } },
        select: { stage: true, durationMinutes: true },
      });
      const byStage: Record<string, { total: number; count: number }> = {};
      milestones.forEach(m => {
        if (!byStage[m.stage]) byStage[m.stage] = { total: 0, count: 0 };
        byStage[m.stage].total += m.durationMinutes ?? 0;
        byStage[m.stage].count++;
      });
      const velocity = Object.entries(byStage).map(([stage, { total, count }]) => ({
        stage, avgMinutes: count > 0 ? total / count : 0, count,
      }));
      return NextResponse.json({ data: velocity });
    }

    case "contracts": {
      const contracts = await prisma.contract.findMany({
        where:   { organizationId: orgId, status: "ACTIVE" },
        include: { counterparty: { select: { name: true, shortName: true } } },
        orderBy: { expirationDate: "asc" },
      });
      return NextResponse.json({ data: contracts });
    }

    default:
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }
}
