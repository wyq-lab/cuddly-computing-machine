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
