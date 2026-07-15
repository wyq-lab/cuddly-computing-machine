import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const subject = req.nextUrl.searchParams.get("subject");

  const kaodian = await prisma.kaodian.findMany({
    where: subject ? { subject } : undefined,
    include: {
      variants: { where: { stage: "highschool" } },
      questions: { select: { id: true } },
    },
  });

  const progress = userId
    ? await prisma.userProgress.findMany({ where: { userId } })
    : [];

  const progressMap = new Map(progress.map((p) => [p.kaodianId, p]));

  const list = kaodian.map((k) => {
    const p = progressMap.get(k.id);
    return {
      ...k,
      keywords: JSON.parse(k.keywords) as string[],
      variant: k.variants[0] ?? null,
      questionCount: k.questions.length,
      progress: p ?? null,
      weight: p?.weight ?? 1.0,
    };
  });

  list.sort((a, b) => b.weight - a.weight);

  return NextResponse.json({ kaodian: list });
}
