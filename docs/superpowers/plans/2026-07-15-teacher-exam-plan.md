# "你的教资过了吗" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a teacher certification exam prep platform for high school IT subject with spaced repetition, chapter isolation, wrong-question traceability, and AI-powered study assistant.

**Architecture:** Next.js 14+ App Router with API Routes, SQLite via Prisma, shadcn/ui + Tailwind, Framer Motion animations. Markdown files are the content source synced to SQLite at startup. No authentication — user identity via localStorage UUID.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Prisma + SQLite, Tailwind CSS, shadcn/ui, Framer Motion, MediaPipe Pose, DeepSeek v4-flash, Zustand, diff-match-patch

## Global Constraints

- No user authentication — localStorage UUID identifies users
- Only high school (高中) stage, three subjects: 综合素质 (suzhi), 教育知识与能力 (jiaoyu), 信息技术 (xinxi)
- Markdown is the content source of truth
- Camera data stays client-side only (MediaPipe Pose)
- All UI text in Chinese
- shadcn/ui components must be added via `npx shadcn-ui@latest add <name>` (do not manually create)
- Package manager: pnpm only; run `pnpm install` after any dependency changes

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Next.js project

**Files:**
- Create: entire project via `create-next-app`

- [ ] **Step 1: Scaffold Next.js with TypeScript**

```bash
cd D:/Users/LENOVO/Desktop/claudeproject/project-root
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git --use-pnpm
```

Expected: Project created with `src/app/layout.tsx`, `src/app/page.tsx`, `tailwind.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add prisma @prisma/client zustand framer-motion diff-match-patch @mediapipe/pose marked
pnpm add -D @types/diff-match-patch
```

Expected: Dependencies installed to `node_modules` and `package.json`.

- [ ] **Step 3: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` and `.env` created.

- [ ] **Step 4: Install shadcn/ui**

```bash
npx shadcn-ui@latest init -d
```

Expected: `components.json` created, `src/lib/utils.ts` created, CSS variables added.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js project with Prisma, Tailwind, shadcn/ui"
```

### Task 2: Add shadcn/ui components

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add needed UI components**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

Expected: Components created in `src/components/ui/`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "chore: add shadcn/ui components"
```

---

## Phase 2: Data Layer

### Task 3: Define Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

**Produces:**
- User, Kaodian, KaodianVariant, Question, UserProgress, WrongQuestion, ReciteRecord, StudySession models

- [ ] **Step 1: Write complete schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id
  stage     String   @default("highschool")
  baseLevel String   @default("beginner")
  createdAt DateTime @default(now())
  planDays  Int?
  planStart DateTime?
  streak    Int      @default(0)
  lastActiveDate DateTime?

  progress    UserProgress[]
  wrongs      WrongQuestion[]
  recite      ReciteRecord[]
  sessions    StudySession[]
  dailyPlans  DailyPlan[]
}

model Kaodian {
  id       String @id @default(cuid())
  code     String @unique
  title    String
  subject  String
  content  String
  keywords String

  variants   KaodianVariant[]
  questions  Question[]
  userWrongs WrongQuestion[]
  userRecites ReciteRecord[]
}

model KaodianVariant {
  id             String  @id @default(cuid())
  kaodianId      String
  kaodian        Kaodian @relation(fields: [kaodianId], references: [id])
  stage          String
  examType       String
  answerTemplate String
}

model Question {
  id         String  @id @default(cuid())
  kaodianId  String
  kaodian    Kaodian @relation(fields: [kaodianId], references: [id])
  type       String
  stem       String
  options    String?
  answer     String
  analysis   String
  difficulty Int     @default(3)
}

model UserProgress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  kaodianId String
  status    Int      @default(0)
  reciteLv  Int      @default(0)
  weight    Float    @default(1.0)
  clickCount Int     @default(0)
  lastWrongAt DateTime?
  updatedAt DateTime @updatedAt

  @@unique([userId, kaodianId])
}

model WrongQuestion {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  questionId  String
  kaodianId   String
  wrongAnswer String
  retryCount  Int      @default(0)
  mastered    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model ReciteRecord {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  kaodianId String
  kaodian   Kaodian  @relation(fields: [kaodianId], references: [id])
  level     Int
  score     Int
  createdAt DateTime @default(now())
}

model StudySession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  startTime DateTime
  endTime   DateTime?
  duration  Int?
  createdAt DateTime @default(now())
}

model DailyPlan {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  dayIndex  Int
  kaodianIds String  // JSON array of kaodian IDs
  completed Boolean  @default(false)
  date      DateTime?

  @@unique([userId, dayIndex])
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration file in `prisma/migrations/`, database created.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Prisma schema with all models"
```

### Task 4: Create DB client singleton

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/user-id.ts`

**Produces:**
- `getDb(): PrismaClient` — singleton
- `getUserId(): string` — reads/writes localStorage UUID

- [ ] **Step 1: Write db.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Save to `src/lib/db.ts`.

- [ ] **Step 2: Write user-id.ts**

```typescript
"use client";

const USER_ID_KEY = "pyte-user-id";

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}
```

Save to `src/lib/user-id.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Prisma singleton and userId helper"
```

### Task 5: Create Markdown sync engine

**Files:**
- Create: `src/lib/sync.ts`

**Produces:**
- `syncContent(): Promise<void>` — reads `content/` Markdown files, upserts to SQLite

- [ ] **Step 1: Write sync.ts**

```typescript
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
```

Save to `src/lib/sync.ts`.

- [ ] **Step 2: Install gray-matter**

```bash
pnpm add gray-matter
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add Markdown-to-SQLite sync engine"
```

### Task 6: Seed initial content (3 kaodian + 5 questions per subject)

**Files:**
- Create: `content/kaodian/suzhi/01-jiaoyuguan.md`
- Create: `content/kaodian/suzhi/02-xueshengguan.md`
- Create: `content/kaodian/suzhi/03-jiaoshiguan.md`
- Create: `content/kaodian/jiaoyu/01-jiaoyu-gailun.md`
- Create: `content/kaodian/jiaoyu/02-jiaoxue-gailun.md`
- Create: `content/kaodian/jiaoyu/03-xuexi-xinli.md`
- Create: `content/kaodian/xinxi/01-jisuanji-jichu.md`
- Create: `content/kaodian/xinxi/02-wangluo-jichu.md`
- Create: `content/kaodian/xinxi/03-shujuku-jichu.md`
- Create: `content/timu/suzhi/sz-q01.md` through `sz-q05.md`
- Create: `content/timu/jiaoyu/jy-q01.md` through `jy-q05.md`
- Create: `content/timu/xinxi/xx-q01.md` through `xx-q05.md`

**Produces:** 9 考点 Markdown files + 15 题目 Markdown files

- [ ] **Step 1: Create kaodian Markdown files**

Create 9 kaodian files. Example `content/kaodian/suzhi/01-jiaoyuguan.md`:

```markdown
---
code: SZ-01
title: 教育观
subject: suzhi
keywords:
  - 素质教育
  - 面向全体学生
  - 全面发展
  - 创新精神
  - 实践能力
examType: 材料分析
answerTemplate: |
  该老师的行为体现了/违背了素质教育的基本要求。
  首先，素质教育要求面向全体学生，该老师...
  其次，素质教育要求促进学生全面发展，该老师...
  最后，素质教育要求培养学生的创新精神和实践能力，该老师...
  综上所述...
---

## 教育观

### 一、素质教育的基本内涵

1. **素质教育是面向全体学生的教育**
   - 要求教育要面向每一个学生，关注每一个学生的发展
   - 反对只关注少数"尖子生"的教育

2. **素质教育是促进学生全面发展的教育**
   - 德、智、体、美、劳全面发展
   - 反对只重视智育、片面追求升学率

3. **素质教育是促进学生个性发展的教育**
   - 尊重学生的个体差异
   - 因材施教，发展学生特长

4. **素质教育是以培养创新精神和实践能力为重点的教育**
   - 创新精神是素质教育的核心
   - 注重培养学生的动手能力和解决实际问题的能力

### 二、素质教育与应试教育的区别

| 方面 | 素质教育 | 应试教育 |
|------|---------|---------|
| 教育对象 | 面向全体学生 | 面向少数尖子生 |
| 教育内容 | 德智体美劳全面发展 | 偏重智育 |
| 教学方法 | 启发式、探究式 | 灌输式、填鸭式 |
| 评价标准 | 多元化、过程性 | 唯分数论 |

### 三、实施素质教育的基本要求

1. 转变教育观念，树立正确的教育观
2. 改革课程体系，优化课程结构
3. 改革教学方法，倡导启发式教学
4. 建立科学的评价体系
5. 提高教师素质

### 记忆口诀

> 全面个性创新，全体学生实践
```

- [ ] **Step 2: Create remaining kaodian files**

Create similar files for all 9 kaodian (rest abbreviated — follow same pattern with subject-appropriate content).

- [ ] **Step 3: Create timu Markdown files**

Example `content/timu/suzhi/sz-q01.md`:

```markdown
---
kaodianCode: SZ-01
type: single
answer: B
difficulty: 2
---

素质教育的核心是（ ）

---

A. 提高学生成绩
B. 培养创新精神
C. 增加作业量
D. 延长学习时间

---

本题考查素质教育的内涵。素质教育是以培养创新精神和实践能力为重点的教育，创新精神是素质教育的核心。A选项提高成绩是应试教育的导向；C、D选项都是错误的教育观念。因此本题选B。
```

- [ ] **Step 4: Verify sync works**

```bash
npx tsx src/lib/sync.ts
```

Expected: "Content sync complete" with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add seed content — 9 kaodian + 15 questions"
```

---

## Phase 3: API Layer

### Task 7: User API route

**Files:**
- Create: `src/app/api/user/route.ts`

**Interfaces:**
- Produces: `GET /api/user` returns `{ user: User | null }`, `POST /api/user` creates user with `{ stage, baseLevel, planDays }`

- [ ] **Step 1: Write route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const body = await req.json();
  const { stage, baseLevel, planDays } = body;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { stage, baseLevel, planDays, planStart: new Date() },
    create: {
      id: userId,
      stage: stage ?? "highschool",
      baseLevel: baseLevel ?? "beginner",
      planDays: planDays ?? 30,
      planStart: new Date(),
    },
  });

  return NextResponse.json({ user });
}
```

Save to `src/app/api/user/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add user API route"
```

### Task 8: Kaodian API routes

**Files:**
- Create: `src/app/api/kaodian/route.ts`
- Create: `src/app/api/kaodian/[id]/route.ts`

**Interfaces:**
- Produces: `GET /api/kaodian?subject=suzhi` returns `{ kaodian: KaodianWithVariant[] }` sorted by weight DESC
- Produces: `GET /api/kaodian/[id]` returns `{ kaodian: KaodianWithVariant }`

- [ ] **Step 1: Write /api/kaodian/route.ts**

```typescript
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
```

Save to `src/app/api/kaodian/route.ts`.

- [ ] **Step 2: Write /api/kaodian/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const kaodian = await prisma.kaodian.findUnique({
    where: { id: params.id },
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
```

Save to `src/app/api/kaodian/[id]/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add kaodian API routes"
```

### Task 9: Progress API route

**Files:**
- Create: `src/app/api/progress/route.ts`

**Interfaces:**
- Produces: `PATCH /api/progress` updates reciteLv/status/weight, body: `{ kaodianId, status?, reciteLv?, incrementClick? }`

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/progress/route.ts`.

- [ ] **Step 2: Create weight computation in src/lib/weight.ts**

```typescript
interface WeightParams {
  wrongCount: number;
  reciteLevel: number;
  clickCount: number;
  lastWrongAt?: Date;
}

export function computeWeight(params: WeightParams): number {
  const { wrongCount, reciteLevel, clickCount, lastWrongAt } = params;

  let daysSinceLastReview = 30;
  if (lastWrongAt) {
    daysSinceLastReview =
      (Date.now() - new Date(lastWrongAt).getTime()) / (1000 * 60 * 60 * 24);
  }

  let weight =
    1.0 +
    wrongCount * 3 +
    (3 - reciteLevel) * 2 -
    daysSinceLastReview * 0.5 +
    clickCount * 0.1;

  return Math.max(0.1, weight);
}
```

Save to `src/lib/weight.ts`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add progress API and weight algorithm"
```

### Task 10: Cuoti (wrong questions) API route

**Files:**
- Create: `src/app/api/cuoti/route.ts`

**Interfaces:**
- Produces: `GET /api/cuoti` returns wrong questions list; `POST /api/cuoti` records wrong answer + returns kaodian info + similar questions

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/cuoti/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add cuoti (wrong questions) API with reverse traceability"
```

### Task 11: Timu (questions) API route

**Files:**
- Create: `src/app/api/timu/route.ts`

**Interfaces:**
- Produces: `GET /api/timu?kaodianId=X&count=10` returns questions for a kaodian; `GET /api/timu?diagnose=true` returns 30 questions for diagnosis

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/timu/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add timu (questions) API route"
```

### Task 12: AI chat API route (DeepSeek proxy)

**Files:**
- Create: `src/lib/deepseek.ts`
- Create: `src/app/api/ai/chat/route.ts`

**Interfaces:**
- Produces: `POST /api/ai/chat` with `{ messages, kaodianContext? }` → `{ reply: string }`

- [ ] **Step 1: Write deepseek.ts client**

```typescript
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE = "https://api.deepseek.com/v1";

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
```

Save to `src/lib/deepseek.ts`.

- [ ] **Step 2: Write chat route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { chatDeepSeek } from "@/lib/deepseek";

const SYSTEM_PROMPT = `你是教资考试辅导老师，专攻高中信息技术科目。
你只回答教育相关的问题。如果用户问无关问题，礼貌拒绝。
回答风格：简洁、准确、鼓励性。

你可以帮用户：
1. 用通俗易懂的方式解释考点
2. 编顺口溜记忆口诀
3. 分析题目为什么选某个答案
4. 扮演考官进行模拟面试`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, kaodianContext } = body;

  const contextPrompt = kaodianContext
    ? `当前用户在学习的考点：${kaodianContext.title}（${kaodianContext.subject}）。请结合这个考点回答。`
    : "";

  const fullMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT + "\n" + contextPrompt },
    ...messages,
  ];

  try {
    const reply = await chatDeepSeek(fullMessages);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: "AI 服务暂时不可用，请稍后再试" },
      { status: 500 }
    );
  }
}
```

Save to `src/app/api/ai/chat/route.ts`.

- [ ] **Step 3: Add DEEPSEEK_API_KEY to .env**

```
DEEPSEEK_API_KEY=your-key-here
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add DeepSeek AI chat proxy API"
```

### Task 13: Recite record API route

**Files:**
- Create: `src/app/api/recite/route.ts`

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/recite/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add recite record API"
```

### Task 14: Study session API route

**Files:**
- Create: `src/app/api/session/route.ts`

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/session/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add study session API with streak tracking"
```

### Task 15: Dashboard stats API route

**Files:**
- Create: `src/app/api/stats/route.ts`

- [ ] **Step 1: Write route.ts**

```typescript
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
```

Save to `src/app/api/stats/route.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add dashboard stats API route"
```

---

## Phase 4: State Management & Hooks

### Task 16: Create Zustand store and shared hooks

**Files:**
- Create: `src/store/study.ts`
- Create: `src/hooks/use-user.ts`
- Create: `src/hooks/use-recite.ts`
- Create: `src/lib/fetcher.ts`

**Produces:**
- `useStudyStore` — user, kaodian list, progress, session state
- `useUser()` — manages userId + user creation
- `useRecite()` — recite stage state machine
- `fetcher()` — fetch wrapper that injects x-user-id header

- [ ] **Step 1: Write fetcher.ts**

```typescript
"use client";
import { getUserId } from "./user-id";

export async function fetcher(url: string, options?: RequestInit) {
  const userId = getUserId();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      ...options?.headers,
    },
  });
  return res.json();
}
```

Save to `src/lib/fetcher.ts`.

- [ ] **Step 2: Write Zustand store**

```typescript
"use client";
import { create } from "zustand";

interface KaodianItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  content: string;
  keywords: string[];
  variant: { examType: string; answerTemplate: string } | null;
  questionCount: number;
  progress: { status: number; reciteLv: number; weight: number } | null;
  weight: number;
}

interface StudyState {
  user: { id: string; stage: string; baseLevel: string; planDays: number | null; planStart: string | null; streak: number } | null;
  kaodianList: KaodianItem[];
  selectedSubject: string | null;
  sessionId: string | null;
  sessionStart: number | null;

  setUser: (user: StudyState["user"]) => void;
  setKaodianList: (list: KaodianItem[]) => void;
  setSelectedSubject: (subject: string | null) => void;
  setSession: (sessionId: string, start: number) => void;
  clearSession: () => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  user: null,
  kaodianList: [],
  selectedSubject: null,
  sessionId: null,
  sessionStart: null,

  setUser: (user) => set({ user }),
  setKaodianList: (list) => set({ kaodianList: list }),
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSession: (sessionId, sessionStart) => set({ sessionId, sessionStart }),
  clearSession: () => set({ sessionId: null, sessionStart: null }),
}));
```

Save to `src/store/study.ts`.

- [ ] **Step 3: Write use-user.ts**

```typescript
"use client";
import { useEffect, useState } from "react";
import { getUserId } from "@/lib/user-id";
import { fetcher } from "@/lib/fetcher";

export function useUser() {
  const [userId, setUserId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    // Hydrate user from server
    fetcher("/api/user")
      .then((data) => {
        if (!data.user) {
          setIsReady(true);
        } else {
          setIsReady(true);
        }
      })
      .catch(() => setIsReady(true));
  }, []);

  const createUser = async (opts: { stage: string; baseLevel: string; planDays: number }) => {
    const data = await fetcher("/api/user", {
      method: "POST",
      body: JSON.stringify(opts),
    });
    return data.user;
  };

  return { userId, isReady, createUser };
}
```

Save to `src/hooks/use-user.ts`.

- [ ] **Step 4: Write use-recite.ts**

```typescript
"use client";
import { useState, useCallback } from "react";

export type ReciteStage = 1 | 2 | 3;

export function useRecite(keywords: string[]) {
  const [stage, setStage] = useState<ReciteStage>(1);
  const [userInput, setUserInput] = useState("");
  const [diffResult, setDiffResult] = useState<{ matched: string[]; missed: string[] } | null>(null);

  const nextStage = useCallback(() => {
    setStage((s) => Math.min(s + 1, 3) as ReciteStage);
  }, []);

  const prevStage = useCallback(() => {
    setStage((s) => Math.max(s - 1, 1) as ReciteStage);
  }, []);

  const checkDictation = useCallback(
    (text: string, fullContent: string) => {
      const matched: string[] = [];
      const missed: string[] = [];

      for (const kw of keywords) {
        if (text.includes(kw)) {
          matched.push(kw);
        } else {
          missed.push(kw);
        }
      }

      setDiffResult({ matched, missed });
      return { matched, missed };
    },
    [keywords]
  );

  return { stage, setStage, nextStage, prevStage, userInput, setUserInput, diffResult, checkDictation, setDiffResult };
}
```

Save to `src/hooks/use-recite.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Zustand store, fetcher, useUser, useRecite hooks"
```

### Task 17: Create use-pose hook

**Files:**
- Create: `src/hooks/use-pose.ts`

- [ ] **Step 1: Write use-pose.ts**

```typescript
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Pose } from "@mediapipe/pose";

interface UsePoseOptions {
  onAbsence?: (absentMinutes: number) => void;
  absenceThreshold?: number; // minutes, default 5
  minSessionDuration?: number; // minutes, default 15
  onShortSession?: () => void;
  onDurationUpdate?: (seconds: number) => void;
}

export function usePose({
  onAbsence,
  absenceThreshold = 5,
  minSessionDuration = 15,
  onShortSession,
  onDurationUpdate,
}: UsePoseOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPresent, setIsPresent] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);

  const absentSince = useRef<number | null>(null);
  const notifiedAbsence = useRef(false);
  const notifiedShort = useRef(false);
  const startTime = useRef(Date.now());
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 5 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraOn(true);
      startTime.current = Date.now();

      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results) => {
        const hasFace =
          results.poseLandmarks &&
          (results.poseLandmarks[0] || results.poseLandmarks[1]);
        setIsPresent(!!hasFace);

        if (!hasFace) {
          if (!absentSince.current) {
            absentSince.current = Date.now();
            notifiedAbsence.current = false;
          }

          const absentMin =
            (Date.now() - absentSince.current) / 1000 / 60;
          if (absentMin >= absenceThreshold && !notifiedAbsence.current) {
            notifiedAbsence.current = true;
            onAbsence?.(Math.floor(absentMin));
          }
        } else {
          absentSince.current = null;
          notifiedAbsence.current = false;
        }
      });

      // Process frames
      const processFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;
        await pose.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };
      processFrame();

      // Duration timer
      const timer = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        setTotalDuration(duration);
        onDurationUpdate?.(duration);
      }, 1000);

      return () => clearInterval(timer);
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, [absenceThreshold, onAbsence, onDurationUpdate]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);

    const durationMin = totalDuration / 60;
    if (durationMin < minSessionDuration && !notifiedShort.current) {
      notifiedShort.current = true;
      onShortSession?.();
    }
  }, [totalDuration, minSessionDuration, onShortSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isCameraOn,
    isPresent,
    totalDuration,
    startCamera,
    stopCamera,
  };
}
```

Save to `src/hooks/use-pose.ts`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add MediaPipe Pose study monitor hook"
```

---

## Phase 5: Layout & Navigation

### Task 18: Root layout and theme

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --ring: 221 83% 53%;
  }
}
```

- [ ] **Step 2: Update layout.tsx**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "你的教资过了吗 - Passed your teacher exam?",
  description: "高中信息技术教资考试备考平台，学段隔离、脱敏背诵、错题溯源、AI辅助",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "style: set up root layout and blue academic theme"
```

### Task 19: Home page — stage and plan selection

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write home page**

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const BASE_LEVELS = [
  { value: "beginner", label: "零基础", desc: "从零开始系统学习" },
  { value: "intermediate", label: "有基础", desc: "已学过部分内容，需查漏补缺" },
  { value: "sprint", label: "冲刺", desc: "考前突击，重点突破薄弱环节" },
];

const PLAN_DAYS = [7, 14, 30, 60];

export default function HomePage() {
  const router = useRouter();
  const { createUser } = useUser();
  const [baseLevel, setBaseLevel] = useState("beginner");
  const [planDays, setPlanDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const user = await createUser({
      stage: "highschool",
      baseLevel,
      planDays,
    });
    if (user) {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">
          你的教资过了吗
        </h1>
        <p className="text-muted-foreground">
          高中信息技术 · 备考助手 · 科学速通
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>选择你的学习模式</CardTitle>
            <CardDescription>根据你的基础和目标时间，定制专属学习计划</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">基础水平</label>
              <div className="grid grid-cols-3 gap-2">
                {BASE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setBaseLevel(level.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      baseLevel === level.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {level.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">备考天数</label>
              <div className="grid grid-cols-4 gap-2">
                {PLAN_DAYS.map((days) => (
                  <button
                    key={days}
                    onClick={() => setPlanDays(days)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      planDays === days
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium">{days}天</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? "正在生成计划..." : "开始学习"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
```

Save to `src/app/page.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add home page with stage and plan selection"
```

### Task 20: Study layout with sidebar navigation

**Files:**
- Create: `src/app/(study)/layout.tsx`

- [ ] **Step 1: Write study layout**

```typescript
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "学习看板", icon: "□" },
  { href: "/kaodian", label: "考点背诵", icon: "▣" },
  { href: "/shuati", label: "刷题练习", icon: "✎" },
  { href: "/cuoti", label: "错题本", icon: "✗" },
  { href: "/ai", label: "AI助手", icon: "◈" },
];

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex-shrink-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-lg font-bold text-primary">
            教资过了吗
          </Link>
          <p className="text-xs text-muted-foreground mt-1">高中信息技术</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card flex justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs px-2 py-1 rounded",
              pathname === item.href
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

Save to `src/app/(study)/layout.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add study layout with sidebar and mobile tabs"
```

---

## Phase 6: Core Feature Pages

### Task 21: Dashboard page with stats and calendar

**Files:**
- Create: `src/app/(study)/dashboard/page.tsx`
- Create: `src/components/dashboard/stats-cards.tsx`
- Create: `src/components/dashboard/calendar.tsx`
- Create: `src/components/dashboard/priority-list.tsx`

**Interfaces:**
- Consumes: `GET /api/stats`, `GET /api/kaodian`
- Produces: dashboard UI

- [ ] **Step 1: Write stats-cards.tsx**

```typescript
"use client";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalKaodian: number;
    mastered: number;
    todayDuration: number;
    streak: number;
    wrongMastered: number;
    totalWrongs: number;
    subjectStats: { subject: string; total: number; mastered: number; rate: number }[];
  } | null;
}

const SUBJECT_LABELS: Record<string, string> = {
  suzhi: "综合素质",
  jiaoyu: "教育知识与能力",
  xinxi: "信息技术",
};

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const overallRate = stats.totalKaodian > 0
    ? ((stats.stats?.[0]?.mastered ?? 0) / stats.totalKaodian * 100).toFixed(1)
    : "0";

  const wrongRate = stats.totalWrongs > 0
    ? ((stats.wrongMastered / stats.totalWrongs) * 100).toFixed(0)
    : "100";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">总进度</p>
          <p className="text-2xl font-bold">{stats.mastered}/{stats.totalKaodian}</p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(stats.mastered / Math.max(stats.totalKaodian, 1)) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">今日学习</p>
          <p className="text-2xl font-bold">{Math.floor(stats.todayDuration / 60)}分钟</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">连续学习</p>
          <p className="text-2xl font-bold">{stats.streak}天</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">错题消灭率</p>
          <p className="text-2xl font-bold">{wrongRate}%</p>
        </CardContent>
      </Card>

      {stats.subjectStats.map((s) => (
        <Card key={s.subject} className={s.rate < 0.5 ? "border-orange-400" : ""}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              {SUBJECT_LABELS[s.subject] ?? s.subject}
              {s.rate < 0.5 && <span className="text-orange-500 ml-1">⚠薄弱</span>}
            </p>
            <p className="text-2xl font-bold">{s.mastered}/{s.total}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

Save to `src/components/dashboard/stats-cards.tsx`.

- [ ] **Step 2: Write calendar.tsx**

```typescript
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarProps {
  planDays: number;
  planStart: string | null;
  completedDays: number[];
}

export function Calendar({ planDays, planStart, completedDays }: CalendarProps) {
  const dayLabels = Array.from({ length: planDays }, (_, i) => i + 1);

  const getColor = (day: number) => {
    if (completedDays.includes(day)) return "bg-green-500";
    // Check if today's day is past
    if (planStart) {
      const start = new Date(planStart);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (day <= daysSinceStart && !completedDays.includes(day)) return "bg-red-400";
      if (day === daysSinceStart + 1) return "bg-yellow-400";
    }
    return "bg-muted";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">备考日历</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {dayLabels.map((day) => (
            <div
              key={day}
              className={`aspect-square rounded flex items-center justify-center text-xs font-medium
                ${getColor(day)} ${getColor(day) === "bg-muted" ? "text-muted-foreground" : "text-white"}`}
              title={`第${day}天`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> 完成</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400" /> 进行中</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> 未开始</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

Save to `src/components/dashboard/calendar.tsx`.

- [ ] **Step 3: Write priority-list.tsx**

```typescript
"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KaodianItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  weight: number;
  progress: { status: number; reciteLv: number } | null;
  variant: { examType: string } | null;
}

const SUBJECT_LABELS: Record<string, string> = {
  suzhi: "综合素质",
  jiaoyu: "教育知识",
  xinxi: "信息技术",
};

export function PriorityList({ kaodian }: { kaodian: KaodianItem[] }) {
  const top10 = kaodian.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">优先背诵（权重排序）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top10.map((k) => (
          <Link
            key={k.id}
            href={`/kaodian/${k.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="outline" className="text-xs">
                {SUBJECT_LABELS[k.subject] ?? k.subject}
              </Badge>
              <span className="text-sm truncate">{k.title}</span>
              {k.variant && (
                <span className="text-xs text-muted-foreground">{k.variant.examType}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {k.progress?.reciteLv ? (
                <span>背诵Lv{k.progress.reciteLv}</span>
              ) : (
                <span className="text-orange-500">未开始</span>
              )}
              <span className="font-mono">w{k.weight.toFixed(1)}</span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
```

Save to `src/components/dashboard/priority-list.tsx`.

- [ ] **Step 4: Write dashboard page.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { useStudyStore } from "@/store/study";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Calendar } from "@/components/dashboard/calendar";
import { PriorityList } from "@/components/dashboard/priority-list";

export default function DashboardPage() {
  const { user, kaodianList, setKaodianList, setUser } = useStudyStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetcher("/api/stats"),
      fetcher("/api/kaodian"),
      fetcher("/api/user"),
    ]).then(([statsData, kaodianData, userData]) => {
      setStats(statsData);
      setKaodianList(kaodianData.kaodian ?? []);
      if (userData.user) setUser(userData.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">学习看板</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.planDays ? `备考计划 ${user.planDays} 天 · 剩余 ${Math.max(0, (user.planDays ?? 0) - (stats?.mastered ?? 0))} 个考点` : "开始你的备考之旅"}
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Calendar
          planDays={user?.planDays ?? 30}
          planStart={user?.planStart ?? null}
          completedDays={[]}
        />
        <PriorityList kaodian={kaodianList} />
      </div>
    </div>
  );
}
```

Save to `src/app/(study)/dashboard/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add dashboard with stats, calendar, and priority list"
```

### Task 22: Kaodian list page with subject filter

**Files:**
- Create: `src/app/(study)/kaodian/page.tsx`

- [ ] **Step 1: Write kaodian list page**

```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const SUBJECTS = [
  { key: "all", label: "全部" },
  { key: "suzhi", label: "综合素质" },
  { key: "jiaoyu", label: "教育知识" },
  { key: "xinxi", label: "信息技术" },
];

interface KaodianItem {
  id: string;
  code: string;
  title: string;
  subject: string;
  weight: number;
  progress: { status: number; reciteLv: number } | null;
  variant: { examType: string } | null;
}

export default function KaodianPage() {
  const [kaodian, setKaodian] = useState<KaodianItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher("/api/kaodian").then((data) => {
      setKaodian(data.kaodian ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "all"
    ? kaodian
    : kaodian.filter((k) => k.subject === filter);

  if (loading) {
    return <p className="text-muted-foreground">加载中...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">考点背诵</h1>
        <p className="text-muted-foreground text-sm mt-1">按权重排序，越薄弱越靠前</p>
      </div>

      <div className="flex gap-2">
        {SUBJECTS.map((s) => (
          <Badge
            key={s.key}
            variant={filter === s.key ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(s.key)}
          >
            {s.label}
          </Badge>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3 pr-4">
          {filtered.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/kaodian/${k.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground font-mono">{k.code}</span>
                      <div>
                        <p className="font-medium">{k.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {k.variant?.examType ?? ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      {k.progress?.reciteLv ? (
                        <span>Lv{k.progress.reciteLv}</span>
                      ) : (
                        <span className="text-orange-500">待背诵</span>
                      )}
                      <span className="font-mono">权重 {k.weight.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

Save to `src/app/(study)/kaodian/page.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add kaodian list page with subject filter"
```

### Task 23: Kaodian recite page — 3-stage system

**Files:**
- Create: `src/app/(study)/kaodian/[id]/page.tsx`
- Create: `src/components/recite/stage1-view.tsx`
- Create: `src/components/recite/stage2-blank.tsx`
- Create: `src/components/recite/stage3-dictation.tsx`

**Interfaces:**
- Consumes: `GET /api/kaodian/[id]`, `PATCH /api/progress`
- Produces: 3-stage recite UI

- [ ] **Step 1: Write stage1-view.tsx**

```typescript
"use client";
import { marked } from "marked";

interface Stage1ViewProps {
  content: string;
  keywords: string[];
  variant: { examType: string; answerTemplate: string } | null;
}

export function Stage1View({ content, keywords, variant }: Stage1ViewProps) {
  const html = marked.parse(content);

  return (
    <div className="space-y-4">
      {variant && (
        <div className="bg-muted rounded-lg p-3 text-sm">
          <span className="font-medium">考法：</span>{variant.examType}
        </div>
      )}
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
      {variant?.answerTemplate && (
        <div className="border border-border rounded-lg p-4">
          <p className="font-medium text-sm mb-2">答题模板</p>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
            {variant.answerTemplate}
          </pre>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">关键词：</span>
        {keywords.map((kw) => (
          <span key={kw} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
```

Save to `src/components/recite/stage1-view.tsx`.

- [ ] **Step 2: Write stage2-blank.tsx**

```typescript
"use client";
import { useState } from "react";
import { marked } from "marked";
import { motion, AnimatePresence } from "framer-motion";

interface Stage2BlankProps {
  content: string;
  keywords: string[];
}

export function Stage2Blank({ content, keywords }: Stage2BlankProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggleReveal = (word: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  // Replace keywords with blanks
  let blankContent = content;
  keywords.forEach((kw) => {
    const regex = new RegExp(kw, "g");
    blankContent = blankContent.replace(
      regex,
      `<span class="blank-target" data-keyword="${kw}">${kw}</span>`
    );
  });

  const html = marked.parse(blankContent) as string;

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {/* Render content with keyword spans */}
        <div className="space-y-2">
          {content.split("\n").map((line, i) => (
            <p key={i}>
              {line.split(new RegExp(`(${keywords.join("|")})`, "g")).map((part, j) => {
                if (keywords.includes(part)) {
                  return (
                    <AnimatePresence key={`${i}-${j}`} mode="wait">
                      {revealed.has(part) ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline cursor-pointer text-primary font-medium"
                          onClick={() => toggleReveal(part)}
                        >
                          {part}
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline cursor-pointer bg-muted text-muted rounded px-1 mx-0.5"
                          onClick={() => toggleReveal(part)}
                        >
                          □□
                        </motion.span>
                      )}
                    </AnimatePresence>
                  );
                }
                return <span key={`${i}-${j}`}>{part}</span>;
              })}
            </p>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        点击 □□ 查看关键词，再次点击隐藏
      </p>
      <div className="flex gap-2 flex-wrap">
        {keywords.map((kw) => (
          <button
            key={kw}
            onClick={() => toggleReveal(kw)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              revealed.has(kw)
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {revealed.has(kw) ? kw : "□□"}
          </button>
        ))}
      </div>
    </div>
  );
}
```

Save to `src/components/recite/stage2-blank.tsx`.

- [ ] **Step 3: Write stage3-dictation.tsx**

```typescript
"use client";
import { useState } from "react";

interface Stage3DictationProps {
  title: string;
  content: string;
  keywords: string[];
  onCheck: (result: { matched: string[]; missed: string[] }) => void;
}

export function Stage3Dictation({ title, content, keywords, onCheck }: Stage3DictationProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ matched: string[]; missed: string[] } | null>(null);

  const handleCheck = () => {
    const matched: string[] = [];
    const missed: string[] = [];

    for (const kw of keywords) {
      if (input.includes(kw)) {
        matched.push(kw);
      } else {
        missed.push(kw);
      }
    }

    setResult({ matched, missed });
    onCheck({ matched, missed });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">请默写以下考点</p>
        <p className="text-lg font-bold mt-1">{title}</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="在此默写考点内容..."
        className="w-full h-64 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />

      <button
        onClick={handleCheck}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        disabled={!input.trim()}
      >
        提交默写
      </button>

      {result && (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          {result.matched.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-600">
                正确 ({result.matched.length}/{keywords.length})
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {result.matched.map((kw) => (
                  <span key={kw} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.missed.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">
                遗漏 ({result.missed.length}/{keywords.length})
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {result.missed.map((kw) => (
                  <span key={kw} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

Save to `src/components/recite/stage3-dictation.tsx`.

- [ ] **Step 4: Write kaodian [id] page.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Stage1View } from "@/components/recite/stage1-view";
import { Stage2Blank } from "@/components/recite/stage2-blank";
import { Stage3Dictation } from "@/components/recite/stage3-dictation";

const STAGE_LABELS = ["", "完整阅读", "关键词隐藏", "默写检测"];

export default function KaodianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [kaodian, setKaodian] = useState<any>(null);
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetcher(`/api/kaodian/${params.id}`).then((data) => {
      setKaodian(data.kaodian);
      setLoading(false);
    });
  }, [params.id]);

  const advanceStage = async () => {
    if (stage < 3) {
      setStage(stage + 1);
    }
    await fetcher("/api/progress", {
      method: "PATCH",
      body: JSON.stringify({
        kaodianId: params.id,
        reciteLv: stage + 1,
        incrementClick: true,
      }),
    });
  };

  const handleDictationCheck = async (result: { matched: string[]; missed: string[] }) => {
    const score = Math.round((result.matched.length / (result.matched.length + result.missed.length || 1)) * 5);
    await fetcher("/api/recite", {
      method: "POST",
      body: JSON.stringify({ kaodianId: params.id, level: 3, score }),
    });
  };

  if (loading) return <p className="text-muted-foreground">加载中...</p>;
  if (!kaodian) return <p className="text-red-500">考点未找到</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground mb-1"
          >
            ← 返回考点列表
          </button>
          <h1 className="text-xl font-bold">{kaodian.title}</h1>
          <p className="text-xs text-muted-foreground">
            {kaodian.code} · {STAGE_LABELS[stage]}
          </p>
        </div>
      </div>

      {/* Stage progress indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${
              s <= stage ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <motion.div
        key={stage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {stage === 1 && (
          <Stage1View
            content={kaodian.content}
            keywords={kaodian.keywords}
            variant={kaodian.variant}
          />
        )}
        {stage === 2 && (
          <Stage2Blank content={kaodian.content} keywords={kaodian.keywords} />
        )}
        {stage === 3 && (
          <Stage3Dictation
            title={kaodian.title}
            content={kaodian.content}
            keywords={kaodian.keywords}
            onCheck={handleDictationCheck}
          />
        )}
      </motion.div>

      <div className="flex justify-between pt-4 border-t border-border">
        {stage > 1 && (
          <Button variant="outline" onClick={() => setStage(stage - 1)}>
            上一阶段
          </Button>
        )}
        {stage < 3 ? (
          <Button className="ml-auto" onClick={advanceStage}>
            进入下一阶段
          </Button>
        ) : (
          <Button
            className="ml-auto"
            onClick={() => {
              fetcher("/api/progress", {
                method: "PATCH",
                body: JSON.stringify({ kaodianId: params.id, status: 2 }),
              }).then(() => router.push("/kaodian"));
            }}
          >
            标记已掌握
          </Button>
        )}
      </div>
    </div>
  );
}
```

Save to `src/app/(study)/kaodian/[id]/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add 3-stage recite system (view, blank, dictation)"
```

### Task 24: Shuati (quiz) page

**Files:**
- Create: `src/app/(study)/shuati/page.tsx`
- Create: `src/components/quiz/question-card.tsx`
- Create: `src/components/quiz/option-list.tsx`
- Create: `src/components/quiz/result-feedback.tsx`

- [ ] **Step 1: Write question-card.tsx**

```typescript
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  single: "单选",
  multi: "多选",
  jianada: "简答",
  bianxi: "辨析",
  cailiao: "材料分析",
};

interface QuestionCardProps {
  question: {
    stem: string;
    type: string;
    difficulty: number;
  };
  children: React.ReactNode;
}

export function QuestionCard({ question, children }: QuestionCardProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>
          <Badge variant="secondary">难度 {question.difficulty}/5</Badge>
        </div>
        <CardTitle className="text-base font-normal leading-relaxed">
          {question.stem}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

Save to `src/components/quiz/question-card.tsx`.

- [ ] **Step 2: Write option-list.tsx**

```typescript
"use client";
import { cn } from "@/lib/utils";

interface OptionListProps {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
  multi: boolean;
  showResult?: boolean;
  correctAnswer?: string;
}

export function OptionList({ options, selected, onSelect, multi, showResult, correctAnswer }: OptionListProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isCorrect = showResult && correctAnswer?.includes(opt);
        const isWrong = showResult && isSelected && !isCorrect;

        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={showResult}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all text-sm",
              isSelected && !showResult && "border-primary bg-primary/5",
              isCorrect && "border-green-500 bg-green-50 text-green-700",
              isWrong && "border-red-500 bg-red-50 text-red-700",
              !isSelected && !showResult && "border-border hover:border-primary/50",
              !isSelected && showResult && !isCorrect && "opacity-50"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
```

Save to `src/components/quiz/option-list.tsx`.

- [ ] **Step 3: Write result-feedback.tsx**

```typescript
"use client";
import { Button } from "@/components/ui/button";

interface ResultFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  analysis: string;
  onNext: () => void;
  similarQuestions?: { id: string; stem: string }[];
  kaodianTitle?: string;
  onGoRecite?: () => void;
}

export function ResultFeedback({
  isCorrect,
  correctAnswer,
  analysis,
  onNext,
  similarQuestions,
  kaodianTitle,
  onGoRecite,
}: ResultFeedbackProps) {
  return (
    <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
      <div className={`text-lg font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
        {isCorrect ? "回答正确" : "回答错误"}
      </div>

      {!isCorrect && (
        <>
          <p className="text-sm">
            <span className="font-medium">正确答案：</span>
            {correctAnswer}
          </p>
          {kaodianTitle && (
            <p className="text-sm text-orange-600">
              这道题考的是「{kaodianTitle}」，建议重新背诵巩固
            </p>
          )}
        </>
      )}

      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
        {analysis}
      </div>

      {!isCorrect && similarQuestions && similarQuestions.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-sm font-medium mb-2">同类题巩固：</p>
          {similarQuestions.map((q) => (
            <p key={q.id} className="text-xs text-muted-foreground">{q.stem}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {!isCorrect && onGoRecite && (
          <Button variant="outline" onClick={onGoRecite}>
            去背诵此考点
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          下一题
        </Button>
      </div>
    </div>
  );
}
```

Save to `src/components/quiz/result-feedback.tsx`.

- [ ] **Step 4: Write shuati page.tsx**

```typescript
"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { QuestionCard } from "@/components/quiz/question-card";
import { OptionList } from "@/components/quiz/option-list";
import { ResultFeedback } from "@/components/quiz/result-feedback";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  kaodianId: string;
  type: string;
  stem: string;
  options: string | null;
  answer: string;
  analysis: string;
  difficulty: number;
}

interface WrongResult {
  kaodian?: { id: string; title: string };
  similarQuestions?: { id: string; stem: string }[];
}

export default function ShuatiPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongResult, setWrongResult] = useState<WrongResult | null>(null);

  useEffect(() => {
    fetcher("/api/timu?count=20").then((data) => {
      setQuestions(data.questions ?? []);
    });
  }, []);

  const question = questions[currentIdx];
  if (!question) {
    return <p className="text-muted-foreground">加载题目中...</p>;
  }

  const options: string[] = question.options ? JSON.parse(question.options) : [];
  const isMulti = question.type === "multi";

  const handleSelect = (opt: string) => {
    if (showResult) return;
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    } else {
      setSelected([opt]);
    }
  };

  const handleSubmit = async () => {
    const correct = selected.join("") === question.answer || selected[0] === question.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (!correct) {
      const data = await fetcher("/api/cuoti", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          kaodianId: question.kaodianId,
          wrongAnswer: selected.join(","),
        }),
      });
      setWrongResult(data);
    }
  };

  const handleNext = () => {
    setSelected([]);
    setShowResult(false);
    setIsCorrect(false);
    setWrongResult(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      fetcher("/api/timu?count=20").then((data) => {
        setQuestions(data.questions ?? []);
        setCurrentIdx(0);
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">刷题练习</h1>
        <span className="text-sm text-muted-foreground">
          {currentIdx + 1}/{questions.length}
        </span>
      </div>

      <QuestionCard question={question}>
        {options.length > 0 ? (
          <>
            <OptionList
              options={options}
              selected={selected}
              onSelect={handleSelect}
              multi={isMulti}
              showResult={showResult}
              correctAnswer={question.answer}
            />
            {!showResult && (
              <button
                onClick={handleSubmit}
                className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                disabled={selected.length === 0}
              >
                提交答案
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full h-32 p-3 border border-border rounded-lg"
              placeholder="输入你的答案..."
              onChange={(e) => setSelected([e.target.value])}
            />
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              提交
            </button>
          </div>
        )}
      </QuestionCard>

      {showResult && (
        <ResultFeedback
          isCorrect={isCorrect}
          correctAnswer={question.answer}
          analysis={question.analysis}
          onNext={handleNext}
          similarQuestions={wrongResult?.similarQuestions}
          kaodianTitle={wrongResult?.kaodian?.title}
          onGoRecite={
            wrongResult?.kaodian
              ? () => router.push(`/kaodian/${wrongResult.kaodian!.id}`)
              : undefined
          }
        />
      )}
    </div>
  );
}
```

Save to `src/app/(study)/shuati/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add quiz page with wrong-question traceability"
```

### Task 25: Cuoti (wrong questions) page

**Files:**
- Create: `src/app/(study)/cuoti/page.tsx`

- [ ] **Step 1: Write cuoti page**

```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WrongItem {
  id: string;
  questionId: string;
  kaodianId: string;
  wrongAnswer: string;
  retryCount: number;
  mastered: boolean;
  createdAt: string;
  kaodian?: { id: string; title: string; code: string };
}

export default function CuotiPage() {
  const [wrongs, setWrongs] = useState<WrongItem[]>([]);

  const loadWrongs = () => {
    fetcher("/api/cuoti").then((data) => {
      setWrongs(data.wrongs ?? []);
    });
  };

  useEffect(loadWrongs, []);

  const markMastered = async (id: string) => {
    await fetcher("/api/cuoti", {
      method: "PATCH",
      body: JSON.stringify({ wrongId: id, mastered: true }),
    });
    loadWrongs();
  };

  if (wrongs.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-2"></p>
        <p className="text-lg font-medium">暂无错题</p>
        <p className="text-muted-foreground">继续刷题，答错的题目会自动收集到这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">错题本</h1>
        <p className="text-muted-foreground text-sm mt-1">
          已收集 {wrongs.length} 道错题
        </p>
      </div>

      <div className="space-y-3">
        {wrongs.map((w) => (
          <Card key={w.id} className={w.mastered ? "opacity-50" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {w.kaodian && (
                    <Badge variant="outline" className="text-xs">
                      {w.kaodian.title}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    重试 {w.retryCount} 次
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  错误答案：{w.wrongAnswer}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(w.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex gap-2">
                {w.kaodian && (
                  <Link href={`/kaodian/${w.kaodian.id}`}>
                    <Button variant="outline" size="sm">去背诵</Button>
                  </Link>
                )}
                {!w.mastered && (
                  <Button size="sm" onClick={() => markMastered(w.id)}>
                    已掌握
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

Save to `src/app/(study)/cuoti/page.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add cuoti (wrong questions) page"
```

### Task 26: AI chat page

**Files:**
- Create: `src/app/(study)/ai/page.tsx`

- [ ] **Step 1: Write AI chat page**

```typescript
"use client";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "解释考点", prompt: "请用通俗易懂的方式解释我正在学习的考点" },
  { label: "记忆口诀", prompt: "请给我的考点编一个顺口溜记忆口诀" },
  { label: "模拟面试", prompt: "请你扮演教资考试考官，针对我的考点提问，我回答后你打分" },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是你的教资备考AI助手。我可以帮你解释考点、编记忆口诀、模拟面试。有什么想了解的吗？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await fetcher("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
      });
      setMessages([...newMessages, { role: "assistant", content: data.reply ?? "抱歉，暂时无法回复。" }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "AI服务暂时不可用，请稍后再试。" }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">AI备考助手</h1>

      {/* Quick actions */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
            onClick={() => sendMessage(action.prompt)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
              <CardContent className="p-3 text-sm whitespace-pre-wrap">
                {msg.content}
              </CardContent>
            </Card>
          </div>
        ))}
        {loading && <p className="text-xs text-muted-foreground">AI思考中...</p>}
      </div>

      {/* Input */}
      <div className="flex gap-2 pb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="输入你的问题..."
          className="flex-1 p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={() => sendMessage(input)} disabled={loading}>
          发送
        </Button>
      </div>
    </div>
  );
}
```

Save to `src/app/(study)/ai/page.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add AI chat assistant page"
```

### Task 27: Study monitor (pose) integration in layout

**Files:**
- Modify: `src/app/(study)/layout.tsx`
- Create: `src/components/pose/study-monitor.tsx`

- [ ] **Step 1: Write study-monitor.tsx**

```typescript
"use client";
import { useEffect, useRef } from "react";
import { usePose } from "@/hooks/use-pose";
import { fetcher } from "@/lib/fetcher";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function StudyMonitor() {
  const sessionRef = useRef<string | null>(null);
  const [showAbsentWarning, setShowAbsentWarning] = useState(false);
  const [showShortWarning, setShowShortWarning] = useState(false);

  const {
    videoRef,
    isCameraOn,
    isPresent,
    totalDuration,
    startCamera,
    stopCamera,
  } = usePose({
    onAbsence: (minutes) => {
      setShowAbsentWarning(true);
    },
    onShortSession: () => {
      setShowShortWarning(true);
    },
  });

  // Start session on mount
  useEffect(() => {
    startCamera();
    fetcher("/api/session", {
      method: "POST",
      body: JSON.stringify({ startTime: new Date().toISOString() }),
    }).then((data) => {
      if (data.session) sessionRef.current = data.session.id;
    });

    // End session on unmount
    return () => {
      if (sessionRef.current) {
        fetcher("/api/session", {
          method: "PATCH",
          body: JSON.stringify({
            sessionId: sessionRef.current,
            endTime: new Date().toISOString(),
          }),
        });
      }
      stopCamera();
    };
  }, []);

  return (
    <>
      <video ref={videoRef} className="hidden" />
      <Dialog open={showAbsentWarning} onOpenChange={setShowAbsentWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>检测到离开</DialogTitle>
            <DialogDescription>
              你已离开学习页面超过 5 分钟。快回来继续学习，坚持就是胜利！
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showShortWarning} onOpenChange={setShowShortWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学习时长提醒</DialogTitle>
            <DialogDescription>
              本次学习不足 15 分钟，建议至少完成今天的背诵任务再结束。短暂的坚持也能积累成习惯！
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

Save to `src/components/pose/study-monitor.tsx`. Fix: add missing `import { useState } from "react"`.

- [ ] **Step 2: Update study layout to include StudyMonitor**

Add `<StudyMonitor />` inside the layout component.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add pose-based study time monitor"
```

---

## Phase 7: Polish & Export

### Task 28: Flashcard PDF export component

**Files:**
- Create: `src/components/export/flashcard-pdf.tsx`

- [ ] **Step 1: Write flashcard-pdf.tsx**

```typescript
"use client";
import { Button } from "@/components/ui/button";

interface FlashcardPDFProps {
  title: string;
  code: string;
  keywords: string[];
  answerTemplate: string;
  examType: string;
}

export function FlashcardPDF({ title, code, keywords, answerTemplate, examType }: FlashcardPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        打印速记卡
      </Button>

      {/* Hidden print-only content */}
      <div className="hidden print:block print:m-4">
        <div className="border-2 border-gray-300 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-4">{code} · {examType}</p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-medium text-sm mb-2">关键词</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="bg-white border px-2 py-1 rounded text-sm">{kw}</span>
              ))}
            </div>
          </div>
          {answerTemplate && (
            <div>
              <p className="font-medium text-sm mb-2">答题模板</p>
              <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {answerTemplate}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

Save to `src/components/export/flashcard-pdf.tsx`.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add flashcard PDF export component"
```

---

## Phase 8: Final Integration

### Task 29: Startup sync script and dev script

**Files:**
- Modify: `package.json`
- Create: `src/app/api/sync/route.ts`

- [ ] **Step 1: Add sync API route for manual trigger**

```typescript
import { NextResponse } from "next/server";
import { syncContent } from "@/lib/sync";

export async function POST() {
  try {
    await syncContent();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

Save to `src/app/api/sync/route.ts`.

- [ ] **Step 2: Add startup sync to next.config**

Not needed — instead add a one-time dev script.

Add to package.json scripts:

```json
"sync": "tsx src/lib/sync.ts",
"dev": "pnpm sync && next dev"
```

- [ ] **Step 3: Install tsx**

```bash
pnpm add -D tsx
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add sync API route and dev startup script"
```

### Task 30: Verify full app runs

- [ ] **Step 1: Run sync**

```bash
pnpm sync
```

Expected: "Content sync complete"

- [ ] **Step 2: Run dev server**

```bash
pnpm dev
```

Expected: Next.js dev server on localhost:3000

- [ ] **Step 3: Manual smoke test**
  - Open localhost:3000 → home page shows stage/plan selector
  - Click 开始学习 → redirects to dashboard
  - Navigate to 考点背诵 → see kaodian list
  - Click a kaodian → see 3-stage recite
  - Navigate to 刷题 → see questions
  - Answer wrong → see traceability result
  - Navigate to 错题本 → see recorded wrong question
  - Navigate to AI助手 → send message → get reply

- [ ] **Step 4: Commit final state**

```bash
git add -A && git commit -m "chore: final integration and verification"
```

---

## Implementation Order

Tasks must be executed in numbered order. Each phase depends on the previous:

1. Phase 1 (Tasks 1-2): Scaffolding
2. Phase 2 (Tasks 3-6): Data Layer
3. Phase 3 (Tasks 7-15): API Routes
4. Phase 4 (Tasks 16-17): State & Hooks
5. Phase 5 (Tasks 18-20): Layout & Navigation
6. Phase 6 (Tasks 21-27): Feature Pages
7. Phase 7 (Task 28): Export
8. Phase 8 (Tasks 29-30): Integration & Verify

**Total: 30 tasks** covering scaffold → data → API → state → layout → features → polish → verify.
