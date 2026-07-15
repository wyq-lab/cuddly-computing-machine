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
