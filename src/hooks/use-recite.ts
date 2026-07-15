"use client";
import { useState, useCallback } from "react";

export type ReciteStage = 1 | 2 | 3;

export function useRecite(keywords: string[]) {
  const [stage, setStage] = useState<ReciteStage>(1);
  const [userInput, setUserInput] = useState("");
  const [diffResult, setDiffResult] = useState<{ matched: string[]; missed: string[] } | null>(null);

  const nextStage = useCallback(() => {
    setStage((s) => Math.min(s + 1, 3) as ReciteStage);
  }, []);

  const prevStage = useCallback(() => {
    setStage((s) => Math.max(s - 1, 1) as ReciteStage);
  }, []);

  const checkDictation = useCallback(
    (text: string, fullContent: string) => {
      const matched: string[] = [];
      const missed: string[] = [];

      for (const kw of keywords) {
        if (text.includes(kw)) {
          matched.push(kw);
        } else {
          missed.push(kw);
        }
      }

      setDiffResult({ matched, missed });
      return { matched, missed };
    },
    [keywords]
  );

  return { stage, setStage, nextStage, prevStage, userInput, setUserInput, diffResult, checkDictation, setDiffResult };
}
