import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// WHATSAPP CHECKOUT MODE — User accounts are removed.
// Only /login (admin) and /admin/* are gated routes.
// All old user-specific routes redirect to home.
// ============================================================

const DISABLED_ROUTES = [
  "/login",
  "/register",
  "/cart",
  "/checkout",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect all deprecated user routes to home
  const isDisabled = DISABLED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isDisabled) {
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
