import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 仅保护页面路由，API 路由在 handler 中自行校验 auth()
const isProtectedPage = createRouteMatcher([
  "/dashboard",
  "/survey/:id/edit",
  "/survey/:id/results",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
