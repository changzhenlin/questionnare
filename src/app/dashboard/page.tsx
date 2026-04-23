import Link from "next/link";
import { SignOutAction } from "@/components/auth/SignOutAction";
import { SurveyList } from "@/components/survey/SurveyList";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold text-zinc-900 hover:text-zinc-700"
          >
            问卷调查平台
          </Link>
          <SignOutAction className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            登出
          </SignOutAction>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <SurveyList />
        </div>
      </main>
    </div>
  );
}
