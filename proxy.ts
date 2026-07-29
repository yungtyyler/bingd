import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/feed(.*)",
  "/library(.*)",
  "/onboarding(.*)",
  "/search(.*)",
  "/settings(.*)",
  "/u(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { isAuthenticated } = await auth();

  if (!isAuthenticated && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
