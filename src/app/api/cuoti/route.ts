import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ wrongs: [] });

  const wrongs = await prisma.wrongQuestion.findMany({
    where: { userId, mastered: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ wrongs });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { questionId, kaodianId, wrongAnswer } = body;

  // Record wrong answer
  const wrong = await prisma.wrongQuestion.create({
    data: { userId, questionId, kaodianId, wrongAnswer },
  });

  // Update progress weight
  await prisma.userProgress.upsert({
    where: { userId_kaodianId: { userId, kaodianId } },
    update: {
      weight: { increment: 3 },
      lastWrongAt: new Date(),
    },
    create: {
      userId,
      kaodianId,
      weight: 4.0,
      lastWrongAt: new Date(),
    },
  });

  // Get kaodian info
  const kaodian = await prisma.kaodian.findUnique({
    where: { id: kaodianId },
    select: { id: true, title: true, code: true },
  });

  // Get similar questions (same kaodian, exclude this one)
  const similarQuestions = await prisma.question.findMany({
    where: { kaodianId, id: { not: questionId } },
    take: 3,
  });

  return NextResponse.json({
    wrong,
    kaodian,
    similarQuestions,
    recommendRecite: true,
  });
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { wrongId, mastered } = body;

  const wrong = await prisma.wrongQuestion.update({
    where: { id: wrongId },
    data: { mastered, retryCount: { increment: 1 } },
  });

  return NextResponse.json({ wrong });
}
