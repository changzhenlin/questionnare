import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold text-zinc-900">问卷调查平台</span>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <SignOutButton redirectUrl="/">
              <button className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
                登出
              </button>
            </SignOutButton>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                登录
              </Link>
              <Link
                href="/sign-up"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          问卷调查平台
        </h1>
        <p className="text-lg text-zinc-600">
          快速创建问卷、分享链接、收集反馈
        </p>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-zinc-900 px-6 py-3 text-white transition hover:bg-zinc-700"
            >
              进入工作台
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="rounded-full bg-zinc-900 px-6 py-3 text-white transition hover:bg-zinc-700"
            >
              开始使用
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
