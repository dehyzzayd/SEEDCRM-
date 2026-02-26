import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json();
  const tempPassword = randomBytes(6).toString("hex");
  const hashed       = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data:  { password: hashed },
  });

  return NextResponse.json({ tempPassword });
}
