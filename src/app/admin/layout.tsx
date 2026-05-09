"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    const role = (session?.user as any)?.role;
    if (status === "unauthenticated" || role !== "ADMIN") {
      router.replace("/login");
    }
  }, [status, session, router]);

  // ── Phase 1: Spinner while localStorage is being read ──
  // ── Phase 1: Spinner while session is loading ──
  if (status === "loading") {
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

  // ── Phase 2: Not authenticated — show redirect screen ──
  const role = (session?.user as any)?.role;
  if (status === "unauthenticated" || role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
          <Loader2 size={24} className="text-primary/30 animate-spin" />
        </div>
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest mb-3">
          Access Denied
        </h1>
        <p className="text-primary/50 text-xs uppercase tracking-widest">
          Redirecting to Login...
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
