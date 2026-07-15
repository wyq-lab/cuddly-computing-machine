import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const kc = await prisma.kaodian.count();
  const qc = await prisma.question.count();
  const vc = await prisma.kaodianVariant.count();
  console.log("kaodian:", kc);
  console.log("questions:", qc);
  console.log("variants:", vc);

  const kList = await prisma.kaodian.findMany({
    select: { code: true, title: true, subject: true },
    orderBy: { code: "asc" },
  });
  console.log("\nKaodian:");
  for (const k of kList) {
    console.log(`  ${k.code} - ${k.title} (${k.subject})`);
  }

  const qList = await prisma.question.findMany({
    select: { id: true, kaodianId: true, type: true, difficulty: true },
    orderBy: { id: "asc" },
  });
  console.log("\nQuestions:");
  for (const q of qList) {
    console.log(`  ${q.id} - type:${q.type} difficulty:${q.difficulty}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
