"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// ============================================================
// WHATSAPP CHECKOUT MODE — No user accounts.
// AuthGuard only enforces admin-specific routing rules.
// ============================================================

const ADMIN_PREFIX = "/admin";

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
    if (!hasHydrated) return;
    if (!isLoggedIn || !user) return;

    const isAdmin = user.role === "admin";

    if (isAdmin) {
      // Admin on home page → redirect to dashboard
      if (pathname === "/") {
        router.replace("/admin");
        return;
      }
    }
  }, [hasHydrated, isLoggedIn, user, pathname, router]);

  return <>{children}</>;
}
