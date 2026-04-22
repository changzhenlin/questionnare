import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/survey/:id/edit",
  "/survey/:id/results",
  "/api/surveys",
  "/api/surveys/:id",
  "/api/surveys/:id/publish",
  "/api/surveys/:id/close",
  "/api/surveys/:id/reopen",
  "/api/surveys/:id/stats",
  "/api/responses/:id",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
