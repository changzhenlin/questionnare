"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Send,
  CheckCircle2,
  FileX,
  Clock,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

interface OptionData {
  id: string;
  text: string;
  order: number;
}

interface QuestionData {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options: OptionData[];
}

interface SurveyData {
  id: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  questions: QuestionData[];
}

interface AnswerState {
  questionId: string;
  optionId?: string;
  optionIds?: string[];
  textValue?: string;
}

interface SurveyFillFormProps {
  surveyId: string;
}

export function SurveyFillForm({ surveyId }: SurveyFillFormProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [survey, setSurvey] = useState<SurveyData | null>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const fetchSurvey = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/surveys/${surveyId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("问卷不存在");
        if (res.status === 403) throw new Error("该问卷暂不可访问");
        throw new Error("加载失败");
      }
      const data: SurveyData = await res.json();
      setSurvey(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  function setSingleChoice(questionId: string, optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, optionId },
    }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function toggleMultipleChoice(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = prev[questionId]?.optionIds || [];
      const nextIds = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [questionId]: { questionId, optionIds: nextIds },
      };
    });
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function setTextValue(questionId: string, textValue: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, textValue },
    }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }

  function validate(): boolean {
    if (!survey) return false;
    const errors: Record<string, string> = {};

    for (const q of survey.questions) {
      if (!q.required) continue;
      const ans = answers[q.id];
      if (!ans) {
        errors[q.id] = "此题为必填项";
        continue;
      }
      if (q.type === "SINGLE_CHOICE" && !ans.optionId) {
        errors[q.id] = "请选择一个选项";
      }
      if (
        q.type === "MULTIPLE_CHOICE" &&
        (!ans.optionIds || ans.optionIds.length === 0)
      ) {
        errors[q.id] = "请至少选择一个选项";
      }
      if (q.type === "TEXT" && (!ans.textValue || !ans.textValue.trim())) {
        errors[q.id] = "请填写答案";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!survey) return;

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      answers: Object.values(answers).map((ans) => {
        const base = { questionId: ans.questionId };
        if (ans.optionId) return { ...base, optionId: ans.optionId };
        if (ans.optionIds) return { ...base, optionIds: ans.optionIds };
        if (ans.textValue !== undefined)
          return { ...base, textValue: ans.textValue };
        return base;
      }),
    };

    try {
      const res = await fetch(`/api/surveys/${surveyId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.message || "提交失败");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4">
        <FileX className="h-12 w-12 text-zinc-400" />
        <p className="text-zinc-600">{error}</p>
        <Button onClick={fetchSurvey}>重试</Button>
      </div>
    );
  }

  if (!survey) return null;

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">提交成功</h1>
        <p className="mt-2 text-zinc-600">感谢您的参与！</p>
      </div>
    );
  }

  if (survey.status === "DRAFT") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">
        <Clock className="h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-semibold text-zinc-900">问卷未发布</h1>
        <p className="text-zinc-600">该问卷尚在编辑中，暂时无法填写。</p>
      </div>
    );
  }

  if (survey.status === "CLOSED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">
        <FileX className="h-12 w-12 text-zinc-400" />
        <h1 className="text-xl font-semibold text-zinc-900">问卷已结束</h1>
        <p className="text-zinc-600">该问卷已停止回收，感谢您的关注。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Survey Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">{survey.title}</h1>
          {survey.description && (
            <p className="mt-2 text-zinc-600">{survey.description}</p>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {survey.questions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {q.text}
                        {q.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {q.type === "SINGLE_CHOICE" && (
                    <RadioGroup
                      value={answers[q.id]?.optionId || ""}
                      onValueChange={(val) =>
                        setSingleChoice(q.id, val)
                      }
                      className="space-y-2"
                    >
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem
                            value={opt.id}
                            id={`${q.id}-${opt.id}`}
                          />
                          <Label
                            htmlFor={`${q.id}-${opt.id}`}
                            className="cursor-pointer break-words text-sm font-normal text-zinc-700"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {q.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`${q.id}-${opt.id}`}
                            checked={
                              answers[q.id]?.optionIds?.includes(
                                opt.id
                              ) || false
                            }
                            onCheckedChange={() =>
                              toggleMultipleChoice(q.id, opt.id)
                            }
                          />
                          <Label
                            htmlFor={`${q.id}-${opt.id}`}
                            className="cursor-pointer break-words text-sm font-normal text-zinc-700"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "TEXT" && (
                    <Textarea
                      placeholder="请输入您的回答..."
                      value={answers[q.id]?.textValue || ""}
                      onChange={(e) =>
                        setTextValue(q.id, e.target.value)
                      }
                      rows={3}
                    />
                  )}

                  {validationErrors[q.id] && (
                    <p className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {validationErrors[q.id]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit */}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            提交答卷
          </Button>
        </div>
      </div>
    </div>
  );
}
