import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">我的问卷</h1>
      <p className="mt-2 text-zinc-600">用户ID: {userId}</p>
    </div>
  );
}
