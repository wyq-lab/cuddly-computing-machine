import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeWeight } from "@/lib/weight";

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { kaodianId, status, reciteLv, incrementClick } = body;

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId },
  });

  const existing = await prisma.userProgress.findUnique({
    where: { userId_kaodianId: { userId, kaodianId } },
  });

  const wrongCount = await prisma.wrongQuestion.count({
    where: { userId, kaodianId, mastered: false },
  });

  const newReciteLv = reciteLv ?? existing?.reciteLv ?? 0;
  const newClickCount = incrementClick
    ? (existing?.clickCount ?? 0) + 1
    : (existing?.clickCount ?? 0);

  const weight = computeWeight({
    wrongCount,
    reciteLevel: newReciteLv,
    clickCount: newClickCount,
    lastWrongAt: existing?.lastWrongAt ?? undefined,
  });

  const progress = await prisma.userProgress.upsert({
    where: { userId_kaodianId: { userId, kaodianId } },
    update: {
      status: status ?? existing?.status ?? 0,
      reciteLv: newReciteLv,
      weight,
      clickCount: newClickCount,
    },
    create: {
      userId,
      kaodianId,
      status: status ?? 0,
      reciteLv: newReciteLv,
      weight,
    },
  });

  return NextResponse.json({ progress });
}
