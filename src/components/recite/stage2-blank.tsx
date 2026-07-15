"use client";
import { useState } from "react";
import { marked } from "marked";
import { motion, AnimatePresence } from "framer-motion";

interface Stage2BlankProps {
  content: string;
  keywords: string[];
}

export function Stage2Blank({ content, keywords }: Stage2BlankProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggleReveal = (word: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  // Replace keywords with blanks
  let blankContent = content;
  keywords.forEach((kw) => {
    const regex = new RegExp(kw, "g");
    blankContent = blankContent.replace(
      regex,
      `<span class="blank-target" data-keyword="${kw}">${kw}</span>`
    );
  });

  const html = marked.parse(blankContent) as string;

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {/* Render content with keyword spans */}
        <div className="space-y-2">
          {content.split("\n").map((line, i) => (
            <p key={i}>
              {line.split(new RegExp(`(${keywords.join("|")})`, "g")).map((part, j) => {
                if (keywords.includes(part)) {
                  return (
                    <AnimatePresence key={`${i}-${j}`} mode="wait">
                      {revealed.has(part) ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline cursor-pointer text-primary font-medium"
                          onClick={() => toggleReveal(part)}
                        >
                          {part}
                        </motion.span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline cursor-pointer bg-muted text-muted rounded px-1 mx-0.5"
                          onClick={() => toggleReveal(part)}
                        >
                          □□
                        </motion.span>
                      )}
                    </AnimatePresence>
                  );
                }
                return <span key={`${i}-${j}`}>{part}</span>;
              })}
            </p>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        点击 □□ 查看关键词，再次点击隐藏
      </p>
      <div className="flex gap-2 flex-wrap">
        {keywords.map((kw) => (
          <button
            key={kw}
            onClick={() => toggleReveal(kw)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              revealed.has(kw)
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {revealed.has(kw) ? kw : "□□"}
          </button>
        ))}
      </div>
    </div>
  );
}
