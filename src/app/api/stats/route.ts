import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({
      totalKaodian: 0,
      mastered: 0,
      todayDuration: 0,
      streak: 0,
      wrongMastered: 0,
      totalWrongs: 0,
      subjectStats: [],
    });
  }

  const [totalKaodian, progress, user, todaySessions, wrongs] = await Promise.all([
    prisma.kaodian.count(),
    prisma.userProgress.findMany({ where: { userId, status: 2 } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.studySession.findMany({
      where: {
        userId,
        startTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.wrongQuestion.findMany({ where: { userId } }),
  ]);

  const mastered = progress.length;
  const todayDuration =
    todaySessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const wrongMastered = wrongs.filter((w) => w.mastered).length;
  const totalWrongs = wrongs.length;

  // Subject breakdown
  const allKaodian = await prisma.kaodian.findMany({
    select: { id: true, subject: true },
  });
  const progressMap = new Map(progress.map((p) => [p.kaodianId, true]));

  const subjectGroups: Record<string, { total: number; mastered: number }> = {};
  for (const k of allKaodian) {
    if (!subjectGroups[k.subject]) {
      subjectGroups[k.subject] = { total: 0, mastered: 0 };
    }
    subjectGroups[k.subject].total++;
    if (progressMap.has(k.id)) subjectGroups[k.subject].mastered++;
  }

  const subjectStats = Object.entries(subjectGroups).map(([subject, stats]) => ({
    subject,
    total: stats.total,
    mastered: stats.mastered,
    rate: stats.total > 0 ? stats.mastered / stats.total : 0,
  }));

  return NextResponse.json({
    totalKaodian,
    mastered,
    todayDuration,
    streak: user?.streak ?? 0,
    wrongMastered,
    totalWrongs,
    subjectStats,
  });
}
