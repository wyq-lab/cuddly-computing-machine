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
