"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, User, ArrowRight, Package } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "—";
  const total = searchParams.get("total") || "0";
  const name = searchParams.get("name") || "Valued Customer";

  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t1 = setTimeout(() => setIsVisible(true), 100);

    // SVG checkmark animation
    if (circleRef.current && checkRef.current) {
      const circle = circleRef.current;
      const check = checkRef.current;

      const circleLen = circle.getTotalLength();
      const checkLen = check.getTotalLength();

      // Circle draw-in
      circle.style.strokeDasharray = `${circleLen}`;
      circle.style.strokeDashoffset = `${circleLen}`;
      circle.style.transition = "stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.45, 1) 0.3s";

      // Checkmark draw-in
      check.style.strokeDasharray = `${checkLen}`;
      check.style.strokeDashoffset = `${checkLen}`;
      check.style.transition = "stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.45, 1) 1s";

      const t2 = setTimeout(() => {
        circle.style.strokeDashoffset = "0";
        check.style.strokeDashoffset = "0";
      }, 200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    return () => clearTimeout(t1);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Animated SVG Checkmark */}
      <div className="relative mb-10">
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(26,47,103,0.12) 0%, transparent 70%)",
            transform: "scale(1.4)",
          }}
        />
        <svg
          viewBox="0 0 120 120"
          className="w-32 h-32 relative z-10"
          fill="none"
        >
          {/* Background circle */}
          <circle cx="60" cy="60" r="54" fill="rgba(26,47,103,0.04)" />
          {/* Animated circle stroke */}
          <circle
            ref={circleRef}
            cx="60"
            cy="60"
            r="54"
            stroke="#1a2f67"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
          />
          {/* Animated checkmark */}
          <path
            ref={checkRef}
            d="M38 60 L54 76 L82 44"
            stroke="#1a2f67"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Success Message */}
      <div className="text-center mb-10 max-w-md">
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary/40 font-medium mb-3">
          Payment Confirmed
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-primary uppercase tracking-widest leading-tight mb-4">
          Thank You,<br />{name.split(" ")[0]}
        </h1>
        <p className="text-sm text-primary/50 leading-relaxed">
          Your order has been placed successfully and is now being prepared with care.
          You will receive a confirmation shortly.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="w-full max-w-sm bg-primary/[0.02] border border-primary/8 rounded-2xl p-6 mb-10 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-primary/40" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary/40">
            Order Details
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-primary/6">
          <span className="text-[11px] text-primary/50 uppercase tracking-widest">Order ID</span>
          <span className="text-[11px] font-mono font-bold text-primary truncate max-w-[180px]">
            {orderId}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-primary/6">
          <span className="text-[11px] text-primary/50 uppercase tracking-widest">Amount Paid</span>
          <span className="text-sm font-bold text-primary font-serif">
            ₹{parseInt(total).toLocaleString()}.00
          </span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-[11px] text-primary/50 uppercase tracking-widest">Status</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Processing
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/profile"
          className="flex-1 bg-primary text-background py-3.5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          <User size={14} />
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="flex-1 border border-primary/20 text-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest uppercase hover:bg-primary/5 transition-all"
        >
          <ShoppingBag size={14} />
          Continue Shopping
        </Link>
      </div>

      {/* PhonePe attribution */}
      <div className="mt-12 flex items-center gap-2 text-primary/20">
        <span className="text-[10px] uppercase tracking-widest">Secured by</span>
        <div className="w-6 h-6 rounded bg-[#5f259f]/20 flex items-center justify-center">
          <span className="text-[#5f259f] font-black text-[9px]">Pe</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#5f259f]/40">PhonePe</span>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
