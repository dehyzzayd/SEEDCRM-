import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, title } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Check email not taken by someone else
  if (email && email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name:  name.trim(),
      email: email?.trim() || session.user.email,
      ...(title !== undefined && { title: title.trim() }),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
