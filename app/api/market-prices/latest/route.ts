import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const latest = await prisma.marketPrice.findMany({
    orderBy: { date: "desc" },
    distinct: ["commodity", "deliveryPoint"],
    take: 20,
  });
  return NextResponse.json({ data: latest });
}
