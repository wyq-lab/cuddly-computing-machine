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
