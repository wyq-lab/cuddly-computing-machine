import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const kaodianId = req.nextUrl.searchParams.get("kaodianId");
  const count = parseInt(req.nextUrl.searchParams.get("count") ?? "10");
  const diagnose = req.nextUrl.searchParams.get("diagnose");

  if (diagnose === "true") {
    // Diagnostic: pick 10 kaodian per subject, 1 question each = 30 total
    const subjects = ["suzhi", "jiaoyu", "xinxi"];
    const questions = [];

    for (const subject of subjects) {
      const kaodian = await prisma.kaodian.findMany({
        where: { subject },
        take: 10,
        include: { questions: { take: 1 } },
      });

      for (const k of kaodian) {
        if (k.questions[0]) questions.push(k.questions[0]);
      }
    }

    return NextResponse.json({ questions });
  }

  if (kaodianId) {
    const questions = await prisma.question.findMany({
      where: { kaodianId },
      take: count,
    });
    return NextResponse.json({ questions });
  }

  // Random questions across all kaodian
  const questions = await prisma.question.findMany({
    take: count,
  });
  return NextResponse.json({ questions });
}
