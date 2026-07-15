"use client";
import { cn } from "@/lib/utils";

interface OptionListProps {
  options: string[];
  selected: string[];
  onSelect: (option: string) => void;
  multi: boolean;
  showResult?: boolean;
  correctAnswer?: string;
}

export function OptionList({ options, selected, onSelect, multi, showResult, correctAnswer }: OptionListProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isCorrect = showResult && correctAnswer?.includes(opt);
        const isWrong = showResult && isSelected && !isCorrect;

        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            disabled={showResult}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all text-sm",
              isSelected && !showResult && "border-primary bg-primary/5",
              isCorrect && "border-green-500 bg-green-50 text-green-700",
              isWrong && "border-red-500 bg-red-50 text-red-700",
              !isSelected && !showResult && "border-border hover:border-primary/50",
              !isSelected && showResult && !isCorrect && "opacity-50"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
