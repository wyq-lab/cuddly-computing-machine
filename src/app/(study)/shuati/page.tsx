"use client";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher";
import { QuestionCard } from "@/components/quiz/question-card";
import { OptionList } from "@/components/quiz/option-list";
import { ResultFeedback } from "@/components/quiz/result-feedback";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  kaodianId: string;
  type: string;
  stem: string;
  options: string | null;
  answer: string;
  analysis: string;
  difficulty: number;
}

interface WrongResult {
  kaodian?: { id: string; title: string };
  similarQuestions?: { id: string; stem: string }[];
}

export default function ShuatiPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongResult, setWrongResult] = useState<WrongResult | null>(null);

  useEffect(() => {
    fetcher("/api/timu?count=20").then((data) => {
      setQuestions(data.questions ?? []);
    });
  }, []);

  const question = questions[currentIdx];
  if (!question) {
    return <p className="text-muted-foreground">加载题目中...</p>;
  }

  const options: string[] = question.options ? JSON.parse(question.options) : [];
  const isMulti = question.type === "multi";

  const handleSelect = (opt: string) => {
    if (showResult) return;
    if (isMulti) {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    } else {
      setSelected([opt]);
    }
  };

  const handleSubmit = async () => {
    const correct = selected.join("") === question.answer || selected[0] === question.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (!correct) {
      const data = await fetcher("/api/cuoti", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          kaodianId: question.kaodianId,
          wrongAnswer: selected.join(","),
        }),
      });
      setWrongResult(data);
    }
  };

  const handleNext = () => {
    setSelected([]);
    setShowResult(false);
    setIsCorrect(false);
    setWrongResult(null);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      fetcher("/api/timu?count=20").then((data) => {
        setQuestions(data.questions ?? []);
        setCurrentIdx(0);
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">刷题练习</h1>
        <span className="text-sm text-muted-foreground">
          {currentIdx + 1}/{questions.length}
        </span>
      </div>

      <QuestionCard question={question}>
        {options.length > 0 ? (
          <>
            <OptionList
              options={options}
              selected={selected}
              onSelect={handleSelect}
              multi={isMulti}
              showResult={showResult}
              correctAnswer={question.answer}
            />
            {!showResult && (
              <button
                onClick={handleSubmit}
                className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
                disabled={selected.length === 0}
              >
                提交答案
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <textarea
              className="w-full h-32 p-3 border border-border rounded-lg"
              placeholder="输入你的答案..."
              onChange={(e) => setSelected([e.target.value])}
            />
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              提交
            </button>
          </div>
        )}
      </QuestionCard>

      {showResult && (
        <ResultFeedback
          isCorrect={isCorrect}
          correctAnswer={question.answer}
          analysis={question.analysis}
          onNext={handleNext}
          similarQuestions={wrongResult?.similarQuestions}
          kaodianTitle={wrongResult?.kaodian?.title}
          onGoRecite={
            wrongResult?.kaodian
              ? () => router.push(`/kaodian/${wrongResult.kaodian!.id}`)
              : undefined
          }
        />
      )}
    </div>
  );
}
