import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { kaodianId, level, score } = body;

  const record = await prisma.reciteRecord.create({
    data: { userId, kaodianId, level, score },
  });

  return NextResponse.json({ record });
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ records: [] });

  const records = await prisma.reciteRecord.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { kaodian: { select: { title: true, subject: true } } },
    take: 50,
  });

  return NextResponse.json({ records });
}
