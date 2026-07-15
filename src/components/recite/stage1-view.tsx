"use client";
import { marked } from "marked";

interface Stage1ViewProps {
  content: string;
  keywords: string[];
  variant: { examType: string; answerTemplate: string } | null;
}

export function Stage1View({ content, keywords, variant }: Stage1ViewProps) {
  const html = marked.parse(content);

  return (
    <div className="space-y-4">
      {variant && (
        <div className="bg-muted rounded-lg p-3 text-sm">
          <span className="font-medium">考法：</span>{variant.examType}
        </div>
      )}
      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html as string }}
      />
      {variant?.answerTemplate && (
        <div className="border border-border rounded-lg p-4">
          <p className="font-medium text-sm mb-2">答题模板</p>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
            {variant.answerTemplate}
          </pre>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">关键词：</span>
        {keywords.map((kw) => (
          <span key={kw} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
