"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarProps {
  planDays: number;
  planStart: string | null;
  completedDays: number[];
}

export function Calendar({ planDays, planStart, completedDays }: CalendarProps) {
  const dayLabels = Array.from({ length: planDays }, (_, i) => i + 1);

  const getColor = (day: number) => {
    if (completedDays.includes(day)) return "bg-green-500";
    if (planStart) {
      const start = new Date(planStart);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (day <= daysSinceStart && !completedDays.includes(day)) return "bg-red-400";
      if (day === daysSinceStart + 1) return "bg-yellow-400";
    }
    return "bg-muted";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">备考日历</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {dayLabels.map((day) => (
            <div
              key={day}
              className={`aspect-square rounded flex items-center justify-center text-xs font-medium
                ${getColor(day)} ${getColor(day) === "bg-muted" ? "text-muted-foreground" : "text-white"}`}
              title={`第${day}天`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500" /> 完成</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-400" /> 进行中</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400" /> 未开始</span>
        </div>
      </CardContent>
    </Card>
  );
}
