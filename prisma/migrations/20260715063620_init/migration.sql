-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL DEFAULT 'highschool',
    "baseLevel" TEXT NOT NULL DEFAULT 'beginner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planDays" INTEGER,
    "planStart" DATETIME,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME
);

-- CreateTable
CREATE TABLE "Kaodian" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "KaodianVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kaodianId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "answerTemplate" TEXT NOT NULL,
    CONSTRAINT "KaodianVariant_kaodianId_fkey" FOREIGN KEY ("kaodianId") REFERENCES "Kaodian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kaodianId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "options" TEXT,
    "answer" TEXT NOT NULL,
    "analysis" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 3,
    CONSTRAINT "Question_kaodianId_fkey" FOREIGN KEY ("kaodianId") REFERENCES "Kaodian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kaodianId" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "reciteLv" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastWrongAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WrongQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "kaodianId" TEXT NOT NULL,
    "wrongAnswer" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "mastered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WrongQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WrongQuestion_kaodianId_fkey" FOREIGN KEY ("kaodianId") REFERENCES "Kaodian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReciteRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kaodianId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReciteRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReciteRecord_kaodianId_fkey" FOREIGN KEY ("kaodianId") REFERENCES "Kaodian" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "kaodianIds" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME,
    CONSTRAINT "DailyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Kaodian_code_key" ON "Kaodian"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_kaodianId_key" ON "UserProgress"("userId", "kaodianId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPlan_userId_dayIndex_key" ON "DailyPlan"("userId", "dayIndex");
