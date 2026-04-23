"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

interface AnswerItem {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  optionId: string | null;
  optionText: string | null;
  textValue: string | null;
}

interface ResponseItem {
  id: string;
  submittedAt: string;
  ipAddress: string | null;
  answers: AnswerItem[];
}

interface ResponseListProps {
  surveyId: string;
  totalResponses: number;
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

export function ResponseList({ surveyId, totalResponses }: ResponseListProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailResponse, setDetailResponse] = useState<ResponseItem | null>(
    null
  );

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/surveys/${surveyId}/responses?page=${page}&limit=${limit}`
      );
      if (!res.ok) throw new Error("获取答卷列表失败");
      const json = await res.json();
      setResponses(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取失败");
    } finally {
      setLoading(false);
    }
  }, [surveyId, page, limit]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  function openDetail(response: ResponseItem) {
    setDetailResponse(response);
    setDetailOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-zinc-600">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResponses}
          className="mt-2"
        >
          重试
        </Button>
      </div>
    );
  }

  if (totalResponses === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-zinc-500">暂无答卷数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Response Cards */}
      <div className="space-y-3">
        {responses.map((resp, idx) => (
          <Card
            key={resp.id}
            className="cursor-pointer transition hover:shadow-sm"
            onClick={() => openDetail(resp)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                  {(page - 1) * limit + idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    答卷 #{resp.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(resp.submittedAt)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm">
                <Eye className="h-4 w-4 text-zinc-400" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-600">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              答卷详情 #{detailResponse?.id.slice(-6).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {detailResponse && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500">
                提交时间：{formatDate(detailResponse.submittedAt)}
              </p>
              {detailResponse.answers.map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <p className="text-sm font-medium text-zinc-900">
                    {idx + 1}. {ans.questionText}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    {ans.questionType === "TEXT"
                      ? ans.textValue || "（未填写）"
                      : ans.optionText || "（未选择）"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
