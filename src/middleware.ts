import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow all routes by default, including /login, /profile, /cart.
  // NextAuth will handle authentication within the specific pages if needed.
  return NextResponse.next();
}

export const config = {
  // Match all routes except Next.js internals, static files, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
