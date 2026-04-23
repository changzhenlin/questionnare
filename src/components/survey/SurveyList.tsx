"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  BarChart3,
  Trash2,
  MoreHorizontal,
  Loader2,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "@/components/layout/EmptyState";

type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: SurveyStatus;
  userId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const filterTabs: { label: string; value: SurveyStatus | "ALL" }[] = [
  { label: "全部", value: "ALL" },
  { label: "草稿", value: "DRAFT" },
  { label: "已发布", value: "PUBLISHED" },
  { label: "已结束", value: "CLOSED" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SurveyList() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SurveyStatus | "ALL">("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        filterStatus === "ALL"
          ? "/api/surveys"
          : `/api/surveys?status=${filterStatus}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取问卷列表失败");
      const json = await res.json();
      setSurveys(json.data || []);
    } catch {
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError("");
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    if (!title.trim()) {
      setCreateError("请输入问卷标题");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "创建失败");
      }
      const survey = await res.json();
      setCreateDialogOpen(false);
      router.push(`/survey/${survey.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!surveyToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/surveys/${surveyToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      setDeleteDialogOpen(false);
      setSurveyToDelete(null);
      fetchSurveys();
    } catch {
      setDeleting(false);
    }
  }

  function confirmDelete(survey: Survey) {
    setSurveyToDelete(survey);
    setDeleteDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          我的问卷
        </h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              新建问卷
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>新建问卷</DialogTitle>
                <DialogDescription>
                  输入问卷标题，创建后即可添加题目。
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">问卷标题</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="例如：课程满意度调查"
                    maxLength={200}
                    autoFocus
                  />
                </div>
                {createError && (
                  <p className="text-sm text-red-600">{createError}</p>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  取消
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "创建"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={filterStatus === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Survey List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : surveys.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              title={
                filterStatus === "ALL"
                  ? "还没有问卷"
                  : filterTabs.find((t) => t.value === filterStatus)?.label +
                    "问卷为空"
              }
              description={
                filterStatus === "ALL"
                  ? "点击右上角「新建问卷」开始创建"
                  : "切换筛选条件或创建新问卷"
              }
              action={
                filterStatus === "ALL" ? (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    新建问卷
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <Card
              key={survey.id}
              className="transition hover:shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-zinc-900">
                        {survey.title}
                      </h3>
                      <StatusBadge status={survey.status} />
                    </div>
                    {survey.description && (
                      <p className="truncate text-sm text-zinc-500">
                        {survey.description}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400">
                      创建于 {formatDate(survey.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {survey.status === "PUBLISHED" && (
                      <Link href={`/survey/${survey.id}/results`} title="查看统计">
                        <Button variant="ghost" size="icon-sm">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/survey/${survey.id}/edit`} title="编辑问卷">
                      <Button variant="ghost" size="icon-sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {survey.status === "PUBLISHED" && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/survey/${survey.id}`, "_blank")
                            }
                          >
                            <ClipboardList className="mr-2 h-4 w-4" />
                            预览填写页
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => confirmDelete(survey)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除问卷
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后，问卷及其所有题目、答卷数据将被永久清除，不可恢复。
            </DialogDescription>
          </DialogHeader>
          {surveyToDelete && (
            <p className="text-sm font-medium text-zinc-900">
              「{surveyToDelete.title}」
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
