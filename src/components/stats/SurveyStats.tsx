"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  BarChart3,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChoiceChart } from "./ChoiceChart";
import { TextAnswerList } from "./TextAnswerList";
import { ResponseList } from "./ResponseList";

type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

interface OptionStat {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

interface TextAnswer {
  responseId: string;
  textValue: string;
  submittedAt: string;
}

interface TextPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuestionStat {
  questionId: string;
  questionText: string;
  type: QuestionType;
  options?: OptionStat[];
  textAnswers?: TextAnswer[];
  textPagination?: TextPagination;
}

interface StatsData {
  surveyId: string;
  totalResponses: number;
  viewCount: number;
  questions: QuestionStat[];
}

interface SurveyStatsProps {
  surveyId: string;
}

export function SurveyStats({ surveyId }: SurveyStatsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [view, setView] = useState<"overview" | "responses">("overview");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/surveys/${surveyId}/stats`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("问卷不存在");
        if (res.status === 403) throw new Error("无权查看统计");
        throw new Error("加载失败");
      }
      const data: StatsData = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50">
        <p className="text-zinc-600">{error}</p>
        <Button onClick={fetchStats}>重试</Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-sm font-semibold text-zinc-900">
              数据统计
            </span>
          </div>
          <Link href={`/survey/${surveyId}/edit`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              编辑问卷
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* View Switcher */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={view === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("overview")}
          >
            统计概览
          </Button>
          <Button
            variant={view === "responses" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("responses")}
          >
            答卷列表 ({stats?.totalResponses ?? 0})
          </Button>
        </div>

        {view === "overview" ? (
          <>
            {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <BarChart3 className="h-5 w-5 text-zinc-400" />
              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {stats.totalResponses}
              </p>
              <p className="text-xs text-zinc-500">总回收数</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <Eye className="h-5 w-5 text-zinc-400" />
              <p className="mt-2 text-2xl font-bold text-zinc-900">
                {stats.viewCount}
              </p>
              <p className="text-xs text-zinc-500">浏览数</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="flex flex-col items-center py-6">
              <p className="text-2xl font-bold text-zinc-900">
                {stats.totalResponses > 0
                  ? `${Math.round(
                      (stats.totalResponses / Math.max(stats.viewCount, 1)) *
                        1000
                    ) / 10}%`
                  : "0%"}
              </p>
              <p className="text-xs text-zinc-500">回收率</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Stats */}
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-semibold text-zinc-900">
            各题统计 ({stats.questions.length})
          </h2>

          {stats.totalResponses === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-zinc-500">
                  暂无答卷数据，分享问卷后开始收集
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stats.questions.map((q, idx) => (
                <Card key={q.questionId}>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2 text-base">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{q.questionText}</span>
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                        {q.type === "SINGLE_CHOICE"
                          ? "单选"
                          : q.type === "MULTIPLE_CHOICE"
                          ? "多选"
                          : "填空"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(q.type === "SINGLE_CHOICE" ||
                      q.type === "MULTIPLE_CHOICE") &&
                      q.options && (
                        <ChoiceChart
                          options={q.options}
                          totalResponses={stats.totalResponses}
                        />
                      )}
                    {q.type === "TEXT" && q.textAnswers && (
                      <TextAnswerList answers={q.textAnswers} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </>
        ) : (
          <ResponseList
            surveyId={surveyId}
            totalResponses={stats?.totalResponses ?? 0}
          />
        )}
      </main>
    </div>
  );
}
