"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAuthStore } from "@/store/cartStore";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      toast.error("Unauthorized access.");
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [isLoggedIn, user, router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest mb-4">Access Denied</h1>
        <p className="text-primary/60 text-sm uppercase tracking-widest">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 w-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
