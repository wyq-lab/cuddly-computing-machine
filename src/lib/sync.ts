import { prisma } from "./db";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface KaodianFrontmatter {
  code: string;
  title: string;
  subject: string;
  keywords: string[];
  examType: string;
  answerTemplate: string;
}

interface QuestionFrontmatter {
  kaodianCode: string;
  type: string;
  answer: string;
  difficulty: number;
}

export async function syncContent() {
  const contentDir = path.join(process.cwd(), "content");

  // Sync kaodian
  const kaodianDir = path.join(contentDir, "kaodian");
  for (const subject of ["suzhi", "jiaoyu", "xinxi"]) {
    const dir = path.join(kaodianDir, subject);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;

      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      const fm = data as KaodianFrontmatter;

      const kaodian = await prisma.kaodian.upsert({
        where: { code: fm.code },
        update: {
          title: fm.title,
          subject: fm.subject,
          content,
          keywords: JSON.stringify(fm.keywords),
        },
        create: {
          code: fm.code,
          title: fm.title,
          subject: fm.subject,
          content,
          keywords: JSON.stringify(fm.keywords),
        },
      });

      await prisma.kaodianVariant.deleteMany({
        where: { kaodianId: kaodian.id },
      });

      await prisma.kaodianVariant.create({
        data: {
          kaodianId: kaodian.id,
          stage: "highschool",
          examType: fm.examType,
          answerTemplate: fm.answerTemplate,
        },
      });
    }
  }

  // Sync timu
  const timuDir = path.join(contentDir, "timu");
  for (const subject of ["suzhi", "jiaoyu", "xinxi"]) {
    const dir = path.join(timuDir, subject);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;

      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data, content } = matter(raw);
      const fm = data as QuestionFrontmatter;

      const kaodian = await prisma.kaodian.findUnique({
        where: { code: fm.kaodianCode },
      });
      if (!kaodian) {
        console.warn(`Kaodian ${fm.kaodianCode} not found for question in ${file}`);
        continue;
      }

      const [stemPart, optionsPart, analysisPart] = content.split("\n---\n");

      await prisma.question.upsert({
        where: { id: file.replace(".md", "") },
        update: {
          kaodianId: kaodian.id,
          type: fm.type,
          stem: stemPart?.trim() ?? "",
          options: fm.type === "single" || fm.type === "multi"
            ? JSON.stringify(optionsPart?.trim().split("\n").filter(Boolean) ?? [])
            : null,
          answer: fm.answer,
          analysis: analysisPart?.trim() ?? "",
          difficulty: fm.difficulty,
        },
        create: {
          id: file.replace(".md", ""),
          kaodianId: kaodian.id,
          type: fm.type,
          stem: stemPart?.trim() ?? "",
          options: fm.type === "single" || fm.type === "multi"
            ? JSON.stringify(optionsPart?.trim().split("\n").filter(Boolean) ?? [])
            : null,
          answer: fm.answer,
          analysis: analysisPart?.trim() ?? "",
          difficulty: fm.difficulty,
        },
      });
    }
  }

  console.log("Content sync complete");
}
