"use client";

import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

interface EditorOption {
  id?: string;
  tempId: string;
  text: string;
  order: number;
}

interface EditorQuestion {
  id?: string;
  tempId: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options: EditorOption[];
}

const typeLabels: Record<QuestionType, string> = {
  SINGLE_CHOICE: "单选题",
  MULTIPLE_CHOICE: "多选题",
  TEXT: "填空题",
};

interface QuestionCardProps {
  question: EditorQuestion;
  index: number;
  total: number;
  readOnly: boolean;
  onChange: (question: EditorQuestion) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuestionCard({
  question,
  index,
  total,
  readOnly,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuestionCardProps) {
  const isChoice =
    question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE";

  function updateText(text: string) {
    onChange({ ...question, text });
  }

  function updateRequired(required: boolean) {
    onChange({ ...question, required });
  }

  function addOption() {
    const newOption: EditorOption = {
      tempId: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: `选项 ${question.options.length + 1}`,
      order: question.options.length,
    };
    onChange({ ...question, options: [...question.options, newOption] });
  }

  function updateOption(idx: number, text: string) {
    const opts = [...question.options];
    opts[idx] = { ...opts[idx], text };
    onChange({ ...question, options: opts });
  }

  function removeOption(idx: number) {
    const opts = question.options.filter((_, i) => i !== idx);
    // 重新计算 order
    const reordered = opts.map((o, i) => ({ ...o, order: i }));
    onChange({ ...question, options: reordered });
  }

  return (
    <Card className="relative">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {/* Drag handle / Index */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600">
              {index + 1}
            </div>
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onMoveUp}
                  disabled={index === 0}
                  title="上移"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onMoveDown}
                  disabled={index === total - 1}
                  title="下移"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {typeLabels[question.type]}
                </span>
                {!readOnly && (
                  <label className="flex items-center gap-1.5 text-sm text-zinc-600">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateRequired(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-300"
                    />
                    必填
                  </label>
                )}
                {readOnly && question.required && (
                  <span className="text-xs text-red-500">* 必填</span>
                )}
              </div>
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onRemove}
                  className="text-zinc-400 hover:text-red-600"
                  title="删除题目"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Question text */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500">题目</Label>
              {readOnly ? (
                <p className="text-sm text-zinc-900">{question.text || "（未填写）"}</p>
              ) : (
                <Input
                  value={question.text}
                  onChange={(e) => updateText(e.target.value)}
                  placeholder="请输入题目"
                  className="text-sm"
                />
              )}
            </div>

            {/* Options */}
            {isChoice && (
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">选项</Label>
                <div className="space-y-2">
                  {question.options.map((opt, optIdx) => (
                    <div key={opt.id || opt.tempId} className="flex items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center">
                        <div
                          className={`${
                            question.type === "SINGLE_CHOICE"
                              ? "h-3.5 w-3.5 rounded-full border border-zinc-300"
                              : "h-3.5 w-3.5 rounded-sm border border-zinc-300"
                          }`}
                        />
                      </div>
                      {readOnly ? (
                        <span className="flex-1 text-sm text-zinc-700">
                          {opt.text}
                        </span>
                      ) : (
                        <>
                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              updateOption(optIdx, e.target.value)
                            }
                            placeholder={`选项 ${optIdx + 1}`}
                            className="flex-1 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeOption(optIdx)}
                            className="text-zinc-400 hover:text-red-600"
                            disabled={question.options.length <= 2}
                            title="删除选项"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {!readOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    添加选项
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
