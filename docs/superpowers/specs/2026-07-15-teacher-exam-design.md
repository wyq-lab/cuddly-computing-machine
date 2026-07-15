# 你的教资过了吗 — 设计文档

## 概述

教师资证备考平台，英文名 Passed your teacher exam?。面向高中信息技术学科，提供学段隔离、脱敏背诵、错题溯源、智能权重四大核心功能，辅以自定义备考天数速通系统，帮助用户高效通过教资考试。

- **学段**：高中（信息技术）
- **科目**：综合素质 + 教育知识与能力 + 学科知识与能力（信息技术）
- **入口**：Web 应用，无需登录

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 14+ (App Router) + TypeScript |
| 数据库 | SQLite + Prisma ORM |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| 姿态检测 | MediaPipe Pose（纯前端） |
| AI | DeepSeek v4-flash（Next.js API Route 代理） |
| 动画 | CSS3 + Framer Motion |
| 内容管理 | Markdown 文件 → 启动时同步到 SQLite |

## 架构

```
passed-your-teacher-exam/
├── content/                         # Markdown 内容源（唯一真相源）
│   ├── kaodian/
│   │   ├── suzhi/                   # 综合素质考点
│   │   ├── jiaoyu/                  # 教育知识与能力考点
│   │   └── xinxi/                   # 信息技术考点
│   └── timu/
│       ├── suzhi/
│       ├── jiaoyu/
│       └── xinxi/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # 根布局 + ThemeProvider
│   │   ├── page.tsx                 # 首页：学段选择 + 基础档位
│   │   ├── (study)/
│   │   │   ├── layout.tsx           # 学习区布局（侧边栏导航）
│   │   │   ├── dashboard/           # 学习仪表盘 + 备考日历
│   │   │   ├── kaodian/             # 考点浏览 + 背诵
│   │   │   │   └── [id]/            # 单个考点背诵页
│   │   │   ├── shuati/              # 刷题
│   │   │   ├── cuoti/               # 错题本
│   │   │   └── ai/                  # AI 对话助手
│   │   └── api/
│   │       ├── kaodian/             # 考点查询（按学段+权重排序）
│   │       ├── progress/            # 进度 CRUD
│   │       ├── cuoti/               # 错题 CRUD + 溯源
│   │       ├── timu/                # 题目查询（按考点/类型）
│   │       ├── weights/             # 权重计算 + 排序
│   │       ├── diagnose/            # 摸底诊断
│   │       └── ai/                  # DeepSeek 代理
│   ├── components/
│   │   ├── ui/                      # shadcn/ui 组件
│   │   ├── recite/                  # 三阶段背诵组件
│   │   │   ├── stage1-view.tsx      # 完整展示
│   │   │   ├── stage2-blank.tsx     # 关键词隐藏
│   │   │   └── stage3-dictation.tsx # 空白默写 + diff
│   │   ├── quiz/                    # 刷题组件
│   │   │   ├── question-card.tsx    # 题目卡片
│   │   │   ├── option-list.tsx      # 选项列表
│   │   │   └── result-feedback.tsx  # 答题反馈
│   │   ├── pose/                    # 姿态检测
│   │   │   └── study-monitor.tsx    # 学习时长 + 偷懒提醒
│   │   ├── dashboard/
│   │   │   ├── calendar.tsx         # 备考日历
│   │   │   ├── stats-cards.tsx      # 统计卡片
│   │   │   └── priority-list.tsx    # 优先背诵考点列表
│   │   └── export/
│   │       └── flashcard-pdf.tsx    # 速记卡导出
│   ├── lib/
│   │   ├── db.ts                    # Prisma 单例
│   │   ├── sync.ts                  # Markdown → SQLite 同步
│   │   ├── weight.ts                # 权重算法
│   │   ├── deepseek.ts              # DeepSeek API 客户端
│   │   └── user-id.ts              # localStorage UUID 管理
│   ├── hooks/
│   │   ├── use-user.ts              # 用户状态 hook
│   │   ├── use-recite.ts            # 背诵进度 hook
│   │   └── use-pose.ts              # 姿态检测 hook
│   └── store/
│       └── study.ts                 # Zustand 学习状态管理
├── prisma/
│   └── schema.prisma
```

### 数据流

```
Markdown 文件 (content/)
  ↓ 应用启动时 sync.ts 解析
SQLite 数据库
  ↓ API Routes 查询
React 组件 ←→ Zustand store ←→ API Routes
  ↓                                      ↓
localStorage (userId)              Prisma → SQLite
```

**核心原则**：Markdown 是内容唯一真相源，SQLite 是运行时查询层，用户数据持久化在 SQLite。

## 数据模型

```prisma
model User {
  id        String   @id                    // localStorage UUID
  stage     String   @default("highschool") // 固定 highschool
  baseLevel String   @default("beginner")   // beginner / intermediate / sprint
  createdAt DateTime @default(now())
  planDays  Int?                    // 自定义备考天数 (7/14/30/60)
  planStart DateTime?
  streak    Int      @default(0)            // 连续学习天数
  
  progress  UserProgress[]
  wrongs    WrongQuestion[]
  recite    ReciteRecord[]
}

model Kaodian {
  id       String @id @default(cuid())
  code     String @unique   // "SZ-01", "JY-12", "XX-05"
  title    String           // "学生观"
  subject  String           // suzhi / jiaoyu / xinxi
  content  String           // Markdown 完整考点内容
  keywords String           // JSON: ["关键词1","关键词2"]
  
  variants KaodianVariant[]
  questions   Question[]
  userWrongs  WrongQuestion[]
  userRecites ReciteRecord[]
}

model KaodianVariant {
  id             String  @id @default(cuid())
  kaodianId      String
  kaodian        Kaodian @relation(fields: [kaodianId], references: [id])
  stage          String  // highschool
  examType       String  // "简答" | "辨析" | "材料分析" | "选择"
  answerTemplate String  // 答题话术模板
}

model Question {
  id         String   @id @default(cuid())
  kaodianId  String
  kaodian    Kaodian  @relation(fields: [kaodianId], references: [id])
  type       String   // single / multi / jianada / bianxi / cailiao
  stem       String   // 题干 Markdown
  options    String?  // JSON: ["A...","B...","C...","D..."]
  answer     String   // 正确答案
  analysis   String   // 解析 Markdown
  difficulty Int      @default(3) // 1-5
}

model UserProgress {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  kaodianId String
  status    Int      @default(0)  // 0未学 1学习中 2已掌握
  reciteLv  Int      @default(0)  // 背诵层级 0未开始 1完整 2关键词隐藏 3默写
  weight    Float    @default(1.0)
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
  level     Int      // 1-3 背诵阶段
  score     Int      // 自我评分 1-5
  createdAt DateTime @default(now())
}

model StudySession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  startTime DateTime
  endTime   DateTime?
  duration  Int?     // 秒
  createdAt DateTime @default(now())
}
```

## 核心功能设计

### 1. 学段隔离智能适配

- 用户首次选择学段，写入 `User.stage`
- 考点列表 API 关联 `KaodianVariant` 过滤 `stage`
- 同一考点 code 在不同学段展示不同 `examType` 和 `answerTemplate`
- 刷题只出该学段匹配的题型

### 2. 考点脱敏背诵系统（三阶段）

前端组件实现，无需 API：

| 阶段 | 展示 | 交互 |
|---|---|---|
| 阶段1 | 完整考点 Markdown 渲染 | 阅读确认"我已记住" |
| 阶段2 | `keywords` 中的词替换为 □□（Framer Motion 渐隐动画） | 点击 □□ 可展开查看原文，再次点击收起 |
| 阶段3 | 只显示考点标题，空文本区 | 打字默写 → 提交 → `diff-match-patch` diff 对比 → 高亮遗漏关键词 |

状态变化通过 API PATCH `/api/progress` 更新 `reciteLv`。

### 3. 错题反向溯源

```
答错 → POST /api/cuoti (questionId + kaodianId + wrongAnswer)
  → 后端自动:
    1. 对应 kaodian 的 UserProgress.weight += 3
    2. 查同一 kaodian 的其他 Question（排除已做对的）
    3. 返回 { kaodian, similarQuestions, recommendRecite: true }
  → 前端展示:
    "这道题考的是「{考点名称}」，你可能需要重新背诵"
    → 一键跳转背诵
    → 同类题巩固（自动出 3 道）
```

### 4. 考点星级权重排序

权重公式（`lib/weight.ts`）：

```
weight = 1.0 (base)
  + wrongCount × 3
  + (3 - reciteLevel) × 2
  - daysSinceLastReview × 0.5
  + clickCount × 0.1
```

考点列表 API 按 weight DESC 排序，越薄弱越靠前。每完成一轮背诵 `reciteLevel++`，权重自然下降。

### 5. 智能诊断摸底

```
首次使用 → 选择档位(零基础/有基础/冲刺) + 自定义备考天数(7/14/30/60)
→ 按学段抽取高频考点，每考点 1 题，共 30 题
→ 答题后 AI 分析薄弱科目和考点
→ 生成个性化 N 天学习计划：
  - 总考点数 / 自定义天数 = 每日最低考点数
  - 薄弱科目优先排在前面天数
  - 每天 = N 背 + M 题
  - 用户可随时在设置中调整剩余天数，计划自动重算
```

### 6. 自定义备考日历

- 日历组件：根据用户选择的天数动态展示
- 绿=完成，黄=进行中(>50%)，红=未开始
- 点击每天查看当日学习报告（背了多少、对错多少、薄弱点）
- 自动计算剩余天数 / 剩余考点 = 每日需要完成量

### 7. 学习时长检测（MediaPipe Pose）

- 学习页面进入时启动摄像头
- MediaPipe Pose 检测人脸关键点
- 连续 5 分钟未检测到人脸 → 浏览器通知 "该回来了，你离开 5 分钟了"
- 单次学习 < 15 分钟退出 → 提示 "建议至少学满 15 分钟"
- 学习时长写入 `StudySession`

### 8. AI 备考助手（DeepSeek）

API Route: `POST /api/ai/chat`

```
System Prompt:
你是教资考试辅导老师，专攻高中信息技术科目。
你只回答教育相关的问题。
回答风格：简洁、准确、鼓励性。

功能:
  1. 考点解释："用通俗易懂的方式解释{考点}"
  2. 记忆口诀："给{考点}编一个顺口溜记忆口诀"
  3. 题目解析："这道题为什么选{答案}，其他选项错在哪"
  4. 模拟面试："你来扮演考官，针对{考点}提问，我回答后你打分"
```

前端携带当前考点上下文，让 AI 回答有针对性。

### 9. 学习数据看板

Dashboard 统计卡片：

- 总进度环形图（已掌握/总考点 × 3 科）
- 今日学习时长
- 连续学习天数（streak）
- 错题消灭率（已纠正/总错题）
- 科目薄弱预警（每科掌握率 < 50% 高亮）

### 10. 速记卡片导出

- 考点背诵页 → "打印速记卡"按钮
- 提取当前考点核心内容（标题 + keywords + 答题模板）
- 生成简洁 A4 布局 → `window.print()` 或浏览器 PDF 导出
- 适合通勤碎片时间复习

## UI 设计方向

- **布局**：左侧导航 + 右侧内容区
- **风格**：清爽学院风，浅色背景，蓝色系主色调
- **字体**：系统默认中文字体，代码块等宽
- **动效**：背诵阶段切换用 Framer Motion 渐变过渡，日历完成用弹性动画
- **移动端**：响应式布局，折叠侧边栏为底部 tab

## 内容策略

- 首期：每个科目 30-50 个高频考点 + 200-500 道题
- 后续：逐步扩充到完整题库（~300 考点 + ~2500 题）
- 题目来源：教资考试大纲 + 历年真题整理
- 内容格式：Markdown，统一模板结构

## 非功能需求

- **离线体验**：学习进度本地缓存，网络恢复后同步
- **性能**：考点列表虚拟滚动（> 100 个考点时）
- **隐私**：摄像头数据纯前端处理，不上传服务器
- **SEO**：静态首页 + 动态学习区，学段选择页可 SEO 优化

## 不做的

- 用户认证/登录系统
- 管理后台（Markdown 直接编辑）
- 社交功能（排行榜、分享）
- 移动端原生 App
- 多学段（首期只做高中信息技术）
- 支付/付费功能
