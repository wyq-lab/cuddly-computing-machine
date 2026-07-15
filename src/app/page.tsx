"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
            <CardDescription>
              根据你的基础和目标时间，定制专属学习计划
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                基础水平
              </label>
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
              <label className="text-sm font-medium mb-2 block">
                备考天数
              </label>
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
