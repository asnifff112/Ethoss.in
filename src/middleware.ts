import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// SHOWCASE MODE — ROUTE REDIRECT MIDDLEWARE
// All e-commerce transactional routes are disabled.
// Re-enable these when the backend is ready by removing the
// redirect logic below (keep DISABLED_ROUTES for reference).
// ============================================================

const DISABLED_ROUTES = [
  "/login",
  "/register",
  "/cart",
  "/checkout",
  "/wishlist",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is a disabled route
  const isDisabled = DISABLED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isDisabled) {
    // Redirect to home page
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals, static files, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
