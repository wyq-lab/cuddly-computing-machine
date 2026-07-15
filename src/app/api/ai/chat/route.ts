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
