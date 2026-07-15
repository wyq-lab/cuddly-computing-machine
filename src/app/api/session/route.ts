import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { startTime } = body;

  const session = await prisma.studySession.create({
    data: { userId, startTime: new Date(startTime) },
  });

  return NextResponse.json({ session });
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { sessionId, endTime } = body;

  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const end = new Date(endTime);
  const duration = Math.floor((end.getTime() - session.startTime.getTime()) / 1000);

  const updated = await prisma.studySession.update({
    where: { id: sessionId },
    data: { endTime: end, duration },
  });

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user) {
    const lastActive = user.lastActiveDate;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;
    if (!lastActive) {
      newStreak = 1;
    } else if (lastActive.getTime() === yesterday.getTime()) {
      newStreak += 1;
    } else if (lastActive.getTime() < yesterday.getTime()) {
      newStreak = 1;
    }
    // Same day: no change

    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveDate: today, streak: newStreak },
    });
  }

  return NextResponse.json({ session: updated });
}
