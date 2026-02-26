import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get("commodity");
  const deliveryPoint = searchParams.get("deliveryPoint");
  const days = Math.min(parseInt(searchParams.get("days") ?? "30"), 90); // cap at 90 days

  const from = subDays(new Date(), days);

  const prices = await prisma.marketPrice.findMany({
    where: {
      ...(commodity ? { commodity: commodity as never } : {}),
      ...(deliveryPoint ? { deliveryPoint } : {}),
      date: { gte: from },
    },
    orderBy: { date: "asc" },
    take: 500, // hard limit — never return unbounded results
  });

  return NextResponse.json({ data: prices });
}
