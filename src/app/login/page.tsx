"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, useCartStore } from "@/store/cartStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setCart = useCartStore((s) => s.setCart);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials");
      } else {
        // Pass the user payload to the Zustand store
        login(data);
        
        // Populate cart store with saved backend cart if available
        // Assuming backend sends users' saved cart in data.cart
        if (data.cart) {
          setCart(data.cart);
        }

        toast.success("Successfully logged in");
        
        // Role-based redirection
        if (data.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-primary/50 text-xs text-center mb-10 tracking-widest uppercase">
          Sign in to your account
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
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="you@example.com"
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
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors rounded-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"} <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-primary/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Create One
          </Link>
        </p>
      </div>
    </div>
  );
}
