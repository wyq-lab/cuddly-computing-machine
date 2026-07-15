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
    ? ((stats.mastered / stats.totalKaodian) * 100).toFixed(1)
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
