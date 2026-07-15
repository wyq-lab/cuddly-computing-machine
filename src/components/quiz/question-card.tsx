"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  single: "单选",
  multi: "多选",
  jianada: "简答",
  bianxi: "辨析",
  cailiao: "材料分析",
};

interface QuestionCardProps {
  question: {
    stem: string;
    type: string;
    difficulty: number;
  };
  children: React.ReactNode;
}

export function QuestionCard({ question, children }: QuestionCardProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>
          <Badge variant="secondary">难度 {question.difficulty}/5</Badge>
        </div>
        <CardTitle className="text-base font-normal leading-relaxed">
          {question.stem}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
