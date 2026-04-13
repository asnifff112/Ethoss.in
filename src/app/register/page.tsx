"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset error whenever any field changes
  const handleChange = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (error) setError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.message || "Registration failed. Please try again.";
        setError(msg);
        toast.error(msg);
      } else {
        toast.success("Account created successfully. Please sign in.");
        router.push("/login");
      }
    } catch (err) {
      const msg =
        err instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : "An unexpected error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2 text-center">
          Join Us
        </h1>
        <p className="text-primary/50 text-xs text-center mb-10 tracking-widest uppercase">
          Start your slow-fashion journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={handleChange(setName)}
              required
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={handleChange(setEmail)}
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
              onChange={handleChange(setPassword)}
              required
              minLength={6}
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword)}
              required
              minLength={6}
              className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center tracking-wide py-2 px-3 bg-red-50/50 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-background py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors rounded-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"} <ArrowRight size={14} />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-primary/50">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline hover:text-primary/80 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
