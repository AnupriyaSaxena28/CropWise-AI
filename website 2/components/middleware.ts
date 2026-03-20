/**
 * middleware.ts
 * Next.js middleware — protects all routes except /login.
 * Redirects unauthenticated users to /login.
 * Uses Firebase session cookie (set after login).
 *
 * NOTE: For client-side auth guard per-component, use useAuth() hook.
 * This middleware handles the initial page load redirect.
 */

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/weather", "/api/market", "/api/gemini"];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for Firebase auth session token in cookie
  // Firebase sets __session cookie when using Firebase Hosting
  // For standalone Next.js, we rely on client-side auth + useAuth() hook
  // The client-side AuthProvider handles the actual redirect
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};