import { NextResponse } from "next/server";
import { auth }         from "@/lib/auth";
import { prisma }       from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q         = searchParams.get("q")?.toLowerCase() ?? "";
  const status    = searchParams.get("status") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const fuel      = searchParams.get("fuel") ?? "";
  const sortBy    = searchParams.get("sortBy") ?? "lotArrivalDate";
  const sortDir   = searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true, stockNumber: true, vin: true,
      year: true, make: true, model: true, trim: true,
      mileage: true, exteriorColor: true, fuelType: true,
      transmission: true, condition: true,
      askingPrice: true, costBasis: true,
      status: true, daysOnLot: true,
      imageUrls: true,
      createdAt: true,
    },
    where: {
      organizationId: session.user.organizationId,
      ...(status    && { status:    status    as any }),
      ...(condition && { condition: condition as any }),
      ...(fuel      && { fuelType:  fuel      as any }),
      ...(q && {
        OR: [
          { make:        { contains: q, mode: "insensitive" } },
          { model:       { contains: q, mode: "insensitive" } },
          { trim:        { contains: q, mode: "insensitive" } },
          { vin:         { contains: q, mode: "insensitive" } },
          { stockNumber: { contains: q, mode: "insensitive" } },
          { exteriorColor: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { [sortBy]: sortDir },
  });

  return NextResponse.json({ vehicles });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();

    // ── Map form fields → exact schema columns ──────────────────────
    // Schema enums:
    //   FuelType:         GASOLINE | DIESEL | HYBRID | ELECTRIC | OTHER
    //   TransmissionType: AUTOMATIC | MANUAL | CVT
    //   DriveTrain:       FWD | RWD | AWD | FOUR_WD
    //   VehicleCondition: NEW | USED_EXCELLENT | USED_GOOD | USED_FAIR | SALVAGE | CPO
    //   VehicleStatus:    AVAILABLE | PENDING | SOLD | IN_SERVICE | WHOLESALE

    // Condition mapping — form sends "USED", "NEW", "CPO", "SALVAGE"
    const conditionMap: Record<string, string> = {
      NEW:     "NEW",
      USED:    "USED_GOOD",
      CPO:     "CPO",
      SALVAGE: "SALVAGE",
    };

    // Drivetrain mapping — form sends free text like "FWD", "AWD", "4WD"
    const drivetrainMap: Record<string, string> = {
      FWD:  "FWD",  FRONT: "FWD",
      RWD:  "RWD",  REAR:  "RWD",
      AWD:  "AWD",  "ALL-WHEEL": "AWD", "ALL WHEEL": "AWD",
      "4WD": "FOUR_WD", "4X4": "FOUR_WD", "FOUR_WD": "FOUR_WD",
    };

    const rawDrive = (body.drivetrain ?? "").toString().toUpperCase().trim();
    const drivetrain = drivetrainMap[rawDrive] ?? "FWD";

    const rawCond = (body.condition ?? "USED").toString().toUpperCase().trim();
    const condition = conditionMap[rawCond] ?? "USED_GOOD";

    // Generate stock number
    const yr = body.year
      ? String(body.year).slice(-2)
      : new Date().getFullYear().toString().slice(-2);
    const count = await prisma.vehicle.count({
      where: { organizationId: session.user.organizationId },
    });
    const stockNumber = `DS-${yr}-${String(count + 1).padStart(4, "0")}`;

    const vehicle = await prisma.vehicle.create({
      data: {
        stockNumber,
        vin:           body.vin           || undefined,   // unique — skip if empty
        year:          body.year          ? Number(body.year)        : new Date().getFullYear(),
        make:          body.make          || "Unknown",
        model:         body.model         || "Unknown",
        trim:          body.trim          || null,
        bodyStyle:     body.bodyStyle     || null,
        exteriorColor: body.exteriorColor || null,
        interiorColor: body.interiorColor || null,
        fuelType:      body.fuelType      || "GASOLINE",
        transmission:  body.transmission  || "AUTOMATIC",
        drivetrain:    drivetrain         as any,
        engineSize:    body.engine        || null,   // form field "engine" → schema "engineSize"
        mileage:       body.mileage       ? Number(body.mileage)     : 0,
        condition:     condition          as any,
        askingPrice:   body.askingPrice   ? Number(body.askingPrice) : 0,
        costBasis:     body.costBasis     ? Number(body.costBasis)   : 0,
        bookValue:     body.msrp          ? Number(body.msrp)        : null,  // msrp → bookValue
        status:        body.status        || "AVAILABLE",
        lotLocation:   body.location      || body.lotSection || null, // location+lotSection → lotLocation
        description:   body.description   || null,
        features:      Array.isArray(body.features) ? body.features : [],
        imageUrls:     [],
        organization: {
          connect: { id: session.user.organizationId },
        },
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });

  } catch (err: any) {
    console.error("[POST /api/inventory]", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
