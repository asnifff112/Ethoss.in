"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  ChevronRight,
} from "lucide-react";
// selectItemCount ഒഴിവാക്കി
import { useCartStore, useAuthStore } from "@/store/cartStore";
import gsap from "gsap";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Journals", href: "/journals" },
  { label: "Studio", href: "/studio" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  
  // ഇതാണ് ശരിയായ രീതി
  const itemCount = useCartStore((s) => s.items.reduce((total, item) => total + item.quantity, 0));
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!mobileNavRef.current) return;
      const links = mobileNavRef.current.querySelectorAll(".mobile-nav-link");
      if (open) {
        gsap.fromTo(
          links,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 }
        );
      } else {
        gsap.set(links, { opacity: 0, y: 30 });
      }
    });
    return () => ctx.revert();
  }, [open]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-lg shadow-sm"
            : "bg-background"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-4 -ml-4 cursor-pointer text-primary relative z-[999]"
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>

              <nav className="hidden md:flex items-center gap-8">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${
                      pathname === l.href
                        ? "text-primary font-medium"
                        : "text-primary/60"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Link
              href="/"
              className="md:absolute md:left-1/2 md:-translate-x-1/2 flex-1 text-center md:flex-none text-xl sm:text-2xl font-serif tracking-[0.25em] text-primary uppercase select-none"
            >
              Ethoss
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href={isLoggedIn ? "/profile" : "/login"}
                className="p-2 text-primary/70 hover:text-primary transition-colors"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-primary/70 hover:text-primary transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-[18px] h-[18px] flex items-center justify-center bg-primary text-background text-[10px] font-bold rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-[999] transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-[80%] max-w-xs bg-background shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between p-6 border-b border-primary/10">
            <span className="text-lg font-serif tracking-[0.2em] text-primary uppercase">Ethoss</span>
            <button onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <nav className="p-6 space-y-1" ref={mobileNavRef}>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="mobile-nav-link flex items-center justify-between py-4 border-b border-primary/5 text-sm tracking-widest uppercase">
                {l.label} <ChevronRight size={16} className="text-primary/30" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="h-16 md:h-20" />
    </>
  );
}