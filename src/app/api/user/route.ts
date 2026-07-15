import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { stage, baseLevel, planDays } = body;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { stage, baseLevel, planDays, planStart: new Date() },
    create: {
      id: userId,
      stage: stage ?? "highschool",
      baseLevel: baseLevel ?? "beginner",
      planDays: planDays ?? 30,
      planStart: new Date(),
    },
  });

  return NextResponse.json({ user });
}
