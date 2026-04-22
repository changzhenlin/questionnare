export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <main className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          问卷调查平台
        </h1>
        <p className="text-lg text-zinc-600">
          快速创建问卷、分享链接、收集反馈
        </p>
        <a
          href="/dashboard"
          className="rounded-full bg-zinc-900 px-6 py-3 text-white transition hover:bg-zinc-700"
        >
          开始使用
        </a>
      </main>
    </div>
  );
}
