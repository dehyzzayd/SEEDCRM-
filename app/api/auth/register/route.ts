import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  orgName:  z.string().min(2).max(100),
  timezone: z.string().default("America/Chicago"),
  fullName: z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  tier:     z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { orgName, timezone, fullName, email, password, tier } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create org + admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name:             orgName,
          timezone,
          defaultCurrency:  "USD",
          subscriptionTier: tier,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          name:           fullName,
          role:           "ADMIN",
          organizationId: org.id,
          passwordHash,
        },
      });

      return { org, user };
    });

    return NextResponse.json(
      {
        success:        true,
        organizationId: result.org.id,
        userId:         result.user.id,
        orgName:        result.org.name,
        tier,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
