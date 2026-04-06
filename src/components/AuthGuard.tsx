"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/cartStore";

// Routes that are accessible regardless of role
const PUBLIC_ROUTES = ["/login", "/register"];
// Routes only admin can enter (handled by admin/layout.tsx itself)
const ADMIN_PREFIX = "/admin";
// Routes that admins must NOT access — they belong to the user-side UI
const USER_ONLY_PREFIXES = [
  "/cart",
  "/checkout",
  "/profile",
  "/shop",
  "/product",
  "/category",
  "/journals",
  "/studio",
  "/about",
];

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    // ── Wait for Zustand to hydrate from localStorage before any decision ──
    if (!hasHydrated) return;

    const isPublic = PUBLIC_ROUTES.some(
      (r) => pathname === r || pathname?.startsWith(r + "/")
    );
    const isAdminRoute = pathname?.startsWith(ADMIN_PREFIX);
    const isHomePage = pathname === "/";

    // ── Not logged in: nothing to enforce at this level ──
    if (!isLoggedIn || !user) return;

    const isAdmin = user.role === "admin";

    if (isAdmin) {
      // Admin landed on home page → send to dashboard immediately
      if (isHomePage) {
        router.replace("/admin");
        return;
      }
      // Admin on a user-only route → send to dashboard
      const isUserOnlyRoute = USER_ONLY_PREFIXES.some((prefix) =>
        pathname?.startsWith(prefix)
      );
      if (isUserOnlyRoute && !isPublic) {
        router.replace("/admin");
      }
    }
  }, [hasHydrated, isLoggedIn, user, pathname, router]);

  return <>{children}</>;
}
