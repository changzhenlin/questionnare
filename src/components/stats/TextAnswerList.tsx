interface TextAnswer {
  responseId: string;
  textValue: string;
  submittedAt: string;
}

interface TextAnswerListProps {
  answers: TextAnswer[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TextAnswerList({ answers }: TextAnswerListProps) {
  if (answers.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-zinc-500">暂无答案</p>
    );
  }

  return (
    <div className="space-y-2">
      {answers.map((ans, idx) => (
        <div
          key={ans.responseId + idx}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
        >
          <p className="text-sm text-zinc-800">{ans.textValue}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {formatDate(ans.submittedAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
