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
