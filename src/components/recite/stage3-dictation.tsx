"use client";
import { useState } from "react";

interface Stage3DictationProps {
  title: string;
  content: string;
  keywords: string[];
  onCheck: (result: { matched: string[]; missed: string[] }) => void;
}

export function Stage3Dictation({ title, content, keywords, onCheck }: Stage3DictationProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ matched: string[]; missed: string[] } | null>(null);

  const handleCheck = () => {
    const matched: string[] = [];
    const missed: string[] = [];

    for (const kw of keywords) {
      if (input.includes(kw)) {
        matched.push(kw);
      } else {
        missed.push(kw);
      }
    }

    setResult({ matched, missed });
    onCheck({ matched, missed });
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-sm text-muted-foreground">请默写以下考点</p>
        <p className="text-lg font-bold mt-1">{title}</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="在此默写考点内容..."
        className="w-full h-64 p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />

      <button
        onClick={handleCheck}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        disabled={!input.trim()}
      >
        提交默写
      </button>

      {result && (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          {result.matched.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-600">
                正确 ({result.matched.length}/{keywords.length})
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {result.matched.map((kw) => (
                  <span key={kw} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.missed.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">
                遗漏 ({result.missed.length}/{keywords.length})
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {result.missed.map((kw) => (
                  <span key={kw} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
