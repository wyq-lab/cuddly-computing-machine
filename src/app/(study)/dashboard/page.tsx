"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { useStudyStore } from "@/store/study";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Calendar } from "@/components/dashboard/calendar";
import { PriorityList } from "@/components/dashboard/priority-list";

interface DashboardStats {
  totalKaodian: number;
  mastered: number;
  todayDuration: number;
  streak: number;
  wrongMastered: number;
  totalWrongs: number;
  subjectStats: { subject: string; total: number; mastered: number; rate: number }[];
}

export default function DashboardPage() {
  const { user, kaodianList, setKaodianList, setUser } = useStudyStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetcher("/api/stats"),
      fetcher("/api/kaodian"),
      fetcher("/api/user"),
    ]).then(([statsData, kaodianData, userData]) => {
      setStats(statsData);
      setKaodianList(kaodianData.kaodian ?? []);
      if (userData.user) setUser(userData.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">学习看板</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.planDays ? `备考计划 ${user.planDays} 天 · 剩余 ${Math.max(0, (user.planDays ?? 0) - (stats?.mastered ?? 0))} 个考点` : "开始你的备考之旅"}
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Calendar
          planDays={user?.planDays ?? 30}
          planStart={user?.planStart ?? null}
          completedDays={[]}
        />
        <PriorityList kaodian={kaodianList} />
      </div>
    </div>
  );
}
