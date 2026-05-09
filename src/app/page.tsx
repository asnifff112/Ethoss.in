"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, MoveRight, Star } from "lucide-react";
import db from "@/data/db.json";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ limitCallbacks: true });

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text fade-in
      gsap.fromTo(
        ".hero-line",
        { yPercent: 50, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.18,
          ease: "power3.out",
          delay: 0.2,
          force3D: true,
        }
      );
      gsap.fromTo(
        ".hero-sub",
        { yPercent: 20, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.9, force3D: true }
      );
      gsap.fromTo(
        ".hero-cta",
        { yPercent: 20, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 1.2, force3D: true }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Scroll-triggered fade-in for the brand story section using ScrollTrigger
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        storyRef.current?.children || [],
        { yPercent: 20, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power2.out",
          force3D: true,
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    });

    // Refresh ScrollTrigger after loads for mobile layouts
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // GSAP scroll animation for categories
  useEffect(() => {
    const ctx = gsap.context(() => {
      categoryRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  // Fetch feedbacks from MongoDB
  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const res = await fetch("/api/admin/feedback");
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data.filter((f: any) => !f.status || f.status === "approved").slice(0, 6));
        }
      } catch { /* silent fail */ }
    }
    loadFeedbacks();
  }, []);

  // GSAP scroll animation for testimonials
  useEffect(() => {
    if (feedbacks.length === 0 || !feedbackRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".feedback-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: feedbackRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [feedbacks]);

  return (
    <>
      {/* ─── SECTION 1 : HERO ─── */}
      <section
        ref={heroRef}
        className="relative flex flex-col justify-center min-h-[100svh] sm:min-h-[85vh] px-6 sm:px-12 lg:px-20 overflow-hidden pointer-events-auto"
      >
        <div className="absolute top-20 right-0 w-[60vw] h-[60vw] max-w-xl max-h-xl rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

        <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-serif text-primary uppercase leading-[0.95] tracking-wide">
          <span className="hero-line block">Crafted</span>
          <span className="hero-line block">by Hand.</span>
        </h1>

        <p className="hero-sub mt-8 text-primary/60 max-w-md text-sm sm:text-base tracking-widest uppercase leading-relaxed">
          Minimalist jewellery born in Kerala — where tradition meets modern
          design.
        </p>

        <Link
          href="/shop"
          className="hero-cta mt-10 inline-flex items-center gap-3 bg-primary text-background px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors w-fit rounded-sm"
        >
          Explore Collections
          <MoveRight size={18} />
        </Link>
      </section>

      {/* ─── SECTION 2 : CATEGORIES ─── */}
      <section id="collections" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 mb-2">
            The Collections
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-primary uppercase tracking-wider">
            Shop by Series
          </h2>
        </div>

        <div className="space-y-12 sm:space-y-20">
          {db.categories.map((category, idx) => (
            <Link
              key={category.id}
              href={(category as any).link || `/category/${category.id}`}
              ref={(el) => { categoryRefs.current[idx] = el; }}
              className={`flex flex-col gap-6 sm:gap-12 items-center group/card transition-all duration-500 ${
                idx % 2 !== 0 ? "sm:flex-row-reverse" : "sm:flex-row"
              }`}
            >
              {/* Category Image */}
              <div
                className="w-full sm:w-1/2 min-h-[50vh] sm:min-h-[70vh] relative group overflow-hidden bg-background rounded-xl block p-8 sm:p-12"
              >
                <Image
                  src={category.image_url}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Category Info */}
              <div className="w-full sm:w-1/2 flex flex-col justify-center sm:px-10">
                <h3 className="text-3xl sm:text-5xl font-serif text-primary uppercase mb-4 sm:mb-6">
                  {category.title}
                </h3>
                <p className="text-primary/60 text-sm sm:text-base leading-relaxed tracking-wide mb-8 max-w-md">
                  {category.description}
                </p>
                <div
                  className="inline-flex items-center gap-3 text-sm tracking-widest uppercase text-primary border-b border-primary/30 pb-2 group-hover/card:border-primary transition-colors w-fit group"
                >
                  Discover Collection{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SECTION 3 : BRAND STORY ─── */}
      <section className="py-24 sm:py-32 bg-primary/[0.03]">
        <div
          ref={storyRef}
          className="max-w-3xl mx-auto px-6 text-center space-y-8"
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary/40">
            Our Philosophy
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif text-primary leading-tight">
            100% Handcrafted.
            <br />
            Built to Last.
          </h2>
          <p className="text-primary/60 leading-relaxed max-w-lg mx-auto">
            Every Ethoss piece is made by hand in small workshops across Kerala
            — using sustainably sourced materials, traditional techniques, and a
            deep respect for slow craftsmanship. No factories. No shortcuts.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors"
          >
            Read Our Story <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ─── SECTION 4 : TESTIMONIALS ─── */}
      {feedbacks.length > 0 && (
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[0.35em] uppercase text-primary/40 mb-3">
              What People Say
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif text-primary uppercase tracking-wider mb-4">
              Customer Voices
            </h2>
            <p className="text-sm text-primary/50 max-w-md mx-auto leading-relaxed">
              Real feedback from our community. Every voice shapes what we create next.
            </p>
          </div>

          <div ref={feedbackRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((fb: any) => (
              <div
                key={fb.id}
                className="feedback-card p-6 sm:p-8 bg-white border border-primary/5 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        strokeWidth={1.5}
                        className={s <= fb.rating ? "text-amber-500 fill-amber-500" : "text-primary/10"}
                      />
                    ))}
                  </div>
                  {/* Comment */}
                  <p className="text-[13px] text-primary/65 leading-relaxed tracking-wide italic">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                </div>
                {/* Author */}
                <div className="mt-6 pt-4 border-t border-primary/5">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    {fb.userName}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors"
            >
              Leave Your Review <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
