"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Unified Role-Based Redirect Logic
  useEffect(() => {
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role === "ADMIN") {
        router.push("/admin/users");
      } else {
        router.push("/profile");
      }
    }
  }, [status, session, router]);

  // Premium GSAP Entrance Animation
  useEffect(() => {
    if (status !== "loading" && status !== "authenticated") {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".anim-item",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [status]);

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
    toast.loading("Signing in...", { id: "login-toast" });

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error(res.error, { id: "login-toast" });
      setError(res.error);
      setLoading(false);
      shakeForm();
    } else {
      toast.success("Welcome back!", { id: "login-toast" });
      router.refresh();
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-[100svh] bg-white flex items-center justify-center text-[#1e3a8a]">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-6 bg-white text-[#1e3a8a]">
      <div ref={containerRef} className="w-full max-w-md space-y-10">
        
        {/* Header */}
        <div className="text-center anim-item">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#1e3a8a]/50 mb-3 font-medium">
            Welcome Back
          </p>
          <h1 className="text-3xl font-serif text-[#1e3a8a] leading-tight">
            Login to Ethoss
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1e3a8a]/[0.03] border border-[#1e3a8a]/10 rounded-3xl px-6 py-4 text-sm text-[#1e3a8a] focus:outline-none focus:border-[#1e3a8a]/40 focus:bg-white transition-all placeholder:text-[#1e3a8a]/25"
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
              className="w-full bg-[#1e3a8a]/[0.03] border border-[#1e3a8a]/10 rounded-3xl px-6 py-4 text-sm text-[#1e3a8a] focus:outline-none focus:border-[#1e3a8a]/40 focus:bg-white transition-all placeholder:text-[#1e3a8a]/25"
              placeholder="Enter your password"
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={16} strokeWidth={1.5} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="anim-item pt-6 text-center">
          <p className="text-[11px] text-[#1e3a8a]/60 tracking-wide font-medium">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#1e3a8a] hover:text-[#1e3a8a]/70 transition-colors ml-1 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
