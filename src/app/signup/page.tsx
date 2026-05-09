"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // GSAP Entrance Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".anim-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // GSAP Shake on error
  const shakeForm = () => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { x: -12 },
        { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    toast.loading("Creating your account...", { id: "signup-toast" });

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong", { id: "signup-toast" });
        setError(data.message || "Something went wrong");
        setLoading(false);
        shakeForm();
      } else {
        toast.success("Account created! Redirecting to login...", { id: "signup-toast" });
        router.push("/login");
      }
    } catch (err) {
      toast.error("Network error. Please try again.", { id: "signup-toast" });
      setError("Failed to register. Please try again later.");
      setLoading(false);
      shakeForm();
    }
  };

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-12 bg-white text-[#1e3a8a]">
      <div ref={containerRef} className="w-full max-w-md space-y-10">
        
        {/* Header */}
        <div className="text-center anim-item">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#1e3a8a]/50 mb-3 font-medium">
            Join Ethoss
          </p>
          <h1 className="text-3xl font-serif text-[#1e3a8a] leading-tight">
            Create Account
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-500 text-xs p-4 rounded-3xl tracking-wide text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 anim-item">
            <label className="text-[11px] tracking-wide font-medium text-[#1e3a8a]/70 pl-4">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#1e3a8a]/[0.03] border border-[#1e3a8a]/10 rounded-3xl px-6 py-4 text-sm text-[#1e3a8a] focus:outline-none focus:border-[#1e3a8a]/40 focus:bg-white transition-all placeholder:text-[#1e3a8a]/25 font-light"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2 anim-item">
            <label className="text-[11px] tracking-wide font-medium text-[#1e3a8a]/70 pl-4">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1e3a8a]/[0.03] border border-[#1e3a8a]/10 rounded-3xl px-6 py-4 text-sm text-[#1e3a8a] focus:outline-none focus:border-[#1e3a8a]/40 focus:bg-white transition-all placeholder:text-[#1e3a8a]/25 font-light"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2 anim-item">
            <label className="text-[11px] tracking-wide font-medium text-[#1e3a8a]/70 pl-4">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#1e3a8a]/[0.03] border border-[#1e3a8a]/10 rounded-3xl px-6 py-4 text-sm text-[#1e3a8a] focus:outline-none focus:border-[#1e3a8a]/40 focus:bg-white transition-all placeholder:text-[#1e3a8a]/25 font-light"
              placeholder="Create a password (min 6 chars)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="anim-item w-full flex items-center justify-center gap-3 py-4 mt-8 min-h-[48px] bg-[#1e3a8a] text-white tracking-widest text-[11px] font-medium rounded-3xl hover:bg-[#1e3a8a]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="anim-item pt-6 text-center">
          <p className="text-[11px] text-[#1e3a8a]/60 tracking-wide font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#1e3a8a] hover:text-[#1e3a8a]/70 transition-colors ml-1 font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
