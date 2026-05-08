"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 text-center">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary/40 mb-4">
            Welcome Back
          </p>
          <h1 className="text-4xl font-serif text-primary uppercase leading-tight">
            Login
          </h1>
        </div>

        {error && (
          <p className="text-sm text-red-500 tracking-wider uppercase">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-primary/60">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-primary/20 pb-2 text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-primary/60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-primary/20 pb-2 text-primary focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-background uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="pt-8 border-t border-primary/10">
          <p className="text-sm text-primary/60">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary tracking-widest uppercase border-b border-primary/30 hover:border-primary transition-colors pb-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
