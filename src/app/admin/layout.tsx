"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();

  // The login page lives inside /admin but should NOT be protected
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!hasHydrated) return;
    if (isLoginPage) return; // never redirect away from login page

    if (!isLoggedIn || user?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [hasHydrated, isLoggedIn, user, router, isLoginPage, pathname]);

  // ── Phase 1: Spinner while localStorage is being read ──
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary/40" size={32} strokeWidth={1.5} />
          <p className="text-[10px] text-primary/30 uppercase tracking-[0.4em] font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Login page: render without sidebar/protection ──
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ── Phase 2: Not authenticated — show redirect screen ──
  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
          <Loader2 size={24} className="text-primary/30 animate-spin" />
        </div>
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest mb-3">
          Access Denied
        </h1>
        <p className="text-primary/50 text-xs uppercase tracking-widest">
          Redirecting...
        </p>
      </div>
    );
  }

  // ── Phase 3: Fully authorized admin ──
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
