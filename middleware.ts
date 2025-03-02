import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

//const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

const isPublicRoute = createRouteMatcher([
  "/", // Allow the root landing page to be public
  "/sign-in",
  "/sign-up",
  "/api/thread",
  "/api/openai",
  "/api/message/create",
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
