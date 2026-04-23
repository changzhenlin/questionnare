"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Loader2,
  Rocket,
  Ban,
  RotateCcw,
  Send,
  Link as LinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { QuestionCard } from "./QuestionCard";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

interface SurveyData {
  id: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  questions: QuestionData[];
}

interface QuestionData {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options: OptionData[];
}

interface OptionData {
  id: string;
  text: string;
  order: number;
}

// 前端编辑器内部类型
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

function toEditorQuestion(q: QuestionData): EditorQuestion {
  return {
    id: q.id,
    tempId: q.id || `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: q.text,
    type: q.type,
    order: q.order,
    required: q.required,
    options: q.options.map((o) => ({
      id: o.id,
      tempId: o.id || `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: o.text,
      order: o.order,
    })),
  };
}

function fromEditorQuestion(q: EditorQuestion): {
  id?: string;
  text: string;
  type: QuestionType;
  order: number;
  required: boolean;
  options: { id?: string; text: string; order: number }[];
} {
  return {
    ...(q.id ? { id: q.id } : {}),
    text: q.text,
    type: q.type,
    order: q.order,
    required: q.required,
    options: q.options.map((o) => ({
      ...(o.id ? { id: o.id } : {}),
      text: o.text,
      order: o.order,
    })),
  };
}

interface SurveyEditorProps {
  surveyId: string;
}

export function SurveyEditor({ surveyId }: SurveyEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<SurveyStatus>("DRAFT");
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const readOnly = status === "CLOSED";

  const fetchSurvey = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/surveys/${surveyId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("问卷不存在");
        if (res.status === 403) throw new Error("无权访问此问卷");
        throw new Error("加载失败");
      }
      const data: SurveyData = await res.json();
      setTitle(data.title);
      setDescription(data.description || "");
      setStatus(data.status);
      setQuestions(data.questions.map(toEditorQuestion));
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  function addQuestion(type: QuestionType) {
    const newQuestion: EditorQuestion = {
      tempId: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: "",
      type,
      order: questions.length,
      required: false,
      options:
        type === "TEXT"
          ? []
          : [
              { tempId: `opt-1`, text: "选项 1", order: 0 },
              { tempId: `opt-2`, text: "选项 2", order: 1 },
            ],
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setHasChanges(true);
  }

  function updateQuestion(index: number, updated: EditorQuestion) {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
    setHasChanges(true);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // 重新计算 order
      return next.map((q, i) => ({ ...q, order: i }));
    });
    setHasChanges(true);
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    setQuestions((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((q, i) => ({ ...q, order: i }));
    });
    setHasChanges(true);
  }

  async function handleSave() {
    if (!title.trim()) {
      setSaveError("请输入问卷标题");
      return;
    }

    // 校验题目
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setSaveError(`第 ${i + 1} 题题目不能为空`);
        return;
      }
      if (
        (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") &&
        q.options.some((o) => !o.text.trim())
      ) {
        setSaveError(`第 ${i + 1} 题存在空选项`);
        return;
      }
    }

    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map(fromEditorQuestion),
      };

      const res = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "保存失败");
      }

      const data: SurveyData = await res.json();
      setTitle(data.title);
      setDescription(data.description || "");
      setQuestions(data.questions.map(toEditorQuestion));
      setHasChanges(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/publish`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "发布失败");
      }
      const data = await res.json();
      setStatus(data.status);
      setShareUrl(`${window.location.origin}/survey/${surveyId}`);
      setShareDialogOpen(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setPublishing(false);
    }
  }

  async function handleClose() {
    setClosing(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/close`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("结束失败");
      const data = await res.json();
      setStatus(data.status);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "结束失败");
    } finally {
      setClosing(false);
    }
  }

  async function handleReopen() {
    setReopening(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/reopen`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("重新发布失败");
      const data = await res.json();
      setStatus(data.status);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "重新发布失败");
    } finally {
      setReopening(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50"
      >
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50"
      >
        <p className="text-zinc-600">{error}</p>
        <Button onClick={fetchSurvey}>重试</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3"
        >
          <div className="flex items-center gap-3"
          >
            <Link href="/dashboard">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2"
            >
              <span className="text-sm font-semibold text-zinc-900"
              >
                编辑问卷
              </span>
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="flex items-center gap-2"
          >
            {status === "DRAFT" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  保存
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishing || questions.length === 0}
                >
                  {publishing ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Rocket className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  发布
                </Button>
              </>
            )}
            {status === "PUBLISHED" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  保存
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShareUrl(`${window.location.origin}/survey/${surveyId}`);
                    setShareDialogOpen(true);
                  }}
                >
                  <LinkIcon className="mr-1.5 h-3.5 w-3.5" />
                  分享
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClose}
                  disabled={closing}
                >
                  {closing ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  结束
                </Button>
              </>
            )}
            {status === "CLOSED" && (
              <Button
                size="sm"
                onClick={handleReopen}
                disabled={reopening}
              >
                {reopening ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                )}
                重新发布
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-8"
      >
        {saveError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {saveError}
          </div>
        )}

        {status === "PUBLISHED" && hasChanges && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            问卷已发布，修改后需要保存才能生效。已分享的链接会同步更新。
          </div>
        )}

        {readOnly && (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-600"
          >
            问卷已结束，不可编辑。点击「重新发布」恢复回收。
          </div>
        )}

        {/* Survey Meta */}
        <div className="space-y-4"
        >
          <div className="space-y-1.5"
          >
            <Label htmlFor="survey-title">问卷标题</Label>
            <Input
              id="survey-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasChanges(true);
              }}
              placeholder="请输入问卷标题"
              disabled={readOnly}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5"
          >
            <Label htmlFor="survey-desc">问卷描述（可选）</Label>
            <Textarea
              id="survey-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="描述问卷目的，帮助填写者理解..."
              disabled={readOnly}
              maxLength={1000}
              rows={3}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="mt-8 space-y-4"
        >
          <div className="flex items-center justify-between"
          >
            <h2 className="text-sm font-semibold text-zinc-900"
            >
              题目 ({questions.length})
            </h2>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center"
            >
              <p className="text-sm text-zinc-500">
                暂无题目，点击下方按钮添加
              </p>
            </div>
          ) : (
            <div className="space-y-4"
            >
              {questions.map((q, idx) => (
                <QuestionCard
                  key={q.tempId}
                  question={q}
                  index={idx}
                  total={questions.length}
                  readOnly={readOnly}
                  onChange={(updated) => updateQuestion(idx, updated)}
                  onRemove={() => removeQuestion(idx)}
                  onMoveUp={() => moveQuestion(idx, "up")}
                  onMoveDown={() => moveQuestion(idx, "down")}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Question Buttons */}
        {!readOnly && (
          <div className="mt-6 flex flex-wrap gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("SINGLE_CHOICE")}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              单选题
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("MULTIPLE_CHOICE")}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              多选题
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addQuestion("TEXT")}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              填空题
            </Button>
          </div>
        )}
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享问卷</DialogTitle>
            <DialogDescription>
              问卷已发布，复制下方链接分享给填写者。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center gap-2">
            <Input value={shareUrl} readOnly className="flex-1 text-sm"
            />
            <Button onClick={copyLink}>
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShareDialogOpen(false)}
            >
              关闭
            </Button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground transition hover:bg-primary/80"
            >
              <Send className="h-3.5 w-3.5" />
              预览
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
