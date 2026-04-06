"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuthStore } from "@/store/cartStore";
import { toast } from "sonner";
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

  useEffect(() => {
    // ── CRITICAL: Do NOT run any redirect until localStorage has fully hydrated ──
    // Without this, isLoggedIn is false on every refresh and admin gets kicked out.
    if (!hasHydrated) return;

    if (!isLoggedIn) {
      toast.error("Please sign in to access the admin panel.");
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      toast.error("Unauthorized. Admin access required.");
      router.replace("/");
    }
  }, [hasHydrated, isLoggedIn, user, router]);

  // ── Phase 1: Show spinner while localStorage is being read ──
  // This is the key fix: previously this showed "Access Denied" during hydration
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary/40" size={32} strokeWidth={1.5} />
          <p className="text-[10px] text-primary/30 uppercase tracking-[0.4em] font-medium">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  // ── Phase 2: After hydration — not authenticated or not admin ──
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
