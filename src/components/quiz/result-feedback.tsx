"use client";
import { Button } from "@/components/ui/button";

interface ResultFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  analysis: string;
  onNext: () => void;
  similarQuestions?: { id: string; stem: string }[];
  kaodianTitle?: string;
  onGoRecite?: () => void;
}

export function ResultFeedback({
  isCorrect,
  correctAnswer,
  analysis,
  onNext,
  similarQuestions,
  kaodianTitle,
  onGoRecite,
}: ResultFeedbackProps) {
  return (
    <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
      <div className={`text-lg font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
        {isCorrect ? "回答正确" : "回答错误"}
      </div>

      {!isCorrect && (
        <>
          <p className="text-sm">
            <span className="font-medium">正确答案：</span>
            {correctAnswer}
          </p>
          {kaodianTitle && (
            <p className="text-sm text-orange-600">
              这道题考的是「{kaodianTitle}」，建议重新背诵巩固
            </p>
          )}
        </>
      )}

      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
        {analysis}
      </div>

      {!isCorrect && similarQuestions && similarQuestions.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-sm font-medium mb-2">同类题巩固：</p>
          {similarQuestions.map((q) => (
            <p key={q.id} className="text-xs text-muted-foreground">{q.stem}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {!isCorrect && onGoRecite && (
          <Button variant="outline" onClick={onGoRecite}>
            去背诵此考点
          </Button>
        )}
        <Button onClick={onNext} className="flex-1">
          下一题
        </Button>
      </div>
    </div>
  );
}
