import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kaodian = await prisma.kaodian.findUnique({
    where: { id },
    include: {
      variants: { where: { stage: "highschool" } },
    },
  });

  if (!kaodian) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    kaodian: {
      ...kaodian,
      keywords: JSON.parse(kaodian.keywords) as string[],
      variant: kaodian.variants[0] ?? null,
    },
  });
}
