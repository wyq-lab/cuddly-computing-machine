"use client";
import { Button } from "@/components/ui/button";

interface FlashcardPDFProps {
  title: string;
  code: string;
  keywords: string[];
  answerTemplate: string;
  examType: string;
}

export function FlashcardPDF({ title, code, keywords, answerTemplate, examType }: FlashcardPDFProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        打印速记卡
      </Button>

      {/* Hidden print-only content */}
      <div className="hidden print:block print:m-4">
        <div className="border-2 border-gray-300 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">{title}</h2>
          <p className="text-sm text-gray-500 mb-4">{code} · {examType}</p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="font-medium text-sm mb-2">关键词</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <span key={kw} className="bg-white border px-2 py-1 rounded text-sm">{kw}</span>
              ))}
            </div>
          </div>
          {answerTemplate && (
            <div>
              <p className="font-medium text-sm mb-2">答题模板</p>
              <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                {answerTemplate}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
