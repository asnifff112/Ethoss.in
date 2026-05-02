"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Small delay to simulate auth check
    await new Promise((r) => setTimeout(r, 400));

    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASS;

    if (email === validEmail && password === validPass) {
      login({ id: "admin", name: "Ethoss Admin", email, role: "admin" });
      toast.success("Welcome back, Admin!");
      router.replace("/admin");
    } else {
      toast.error("Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Admin Shield Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary/60" />
          </div>
        </div>

        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2 text-center">
          Admin Access
        </h1>
        <p className="text-primary/50 text-xs text-center mb-10 tracking-widest uppercase">
          Authorized personnel only
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="admin@ethoss.in"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors rounded-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
