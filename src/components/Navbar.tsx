"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
// ============================================================
// SHOWCASE MODE — Auth/Cart icons removed from imports.
// Re-enable when backend is ready:
import { ShoppingBag, User, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
// ============================================================
import gsap from "gsap";

// SHOWCASE MODE NAV — Only public informational routes
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "Feedback", href: "/feedback" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const mobileNavRef = useRef<HTMLDivElement>(null);
  
  const itemCount = useCartStore((s) => s.items.reduce((total: number, item: any) => total + item.quantity, 0));
  const { data: session } = useSession();
  const isLoggedIn = !!session;

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
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-lg shadow-sm"
            : "bg-background"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-8 relative z-[110]">
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-4 -ml-4 cursor-pointer text-primary relative z-[110]"
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

            <div className="md:absolute md:left-1/2 md:-translate-x-1/2 flex-1 flex justify-center pointer-events-none w-full md:w-auto">
              <Link
                href="/"
                className="text-xl sm:text-2xl font-serif tracking-[0.25em] text-primary uppercase select-none pointer-events-auto"
              >
                Ethoss
              </Link>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-4 ml-auto relative z-[110] pointer-events-auto">
              <Link 
                href={isLoggedIn ? "/profile" : "/login"} 
                className="text-primary hover:text-primary/70 hover:opacity-80 transition-all cursor-pointer pointer-events-auto p-2"
              >
                <User size={20} strokeWidth={1.5} className="cursor-pointer pointer-events-auto" />
              </Link>
              <Link 
                href="/profile" 
                className="text-primary hover:text-primary/70 hover:opacity-80 transition-all cursor-pointer pointer-events-auto p-2"
              >
                <Heart size={20} strokeWidth={1.5} className="cursor-pointer pointer-events-auto" />
              </Link>
              <Link 
                href="/cart" 
                className="text-primary hover:text-primary/70 hover:opacity-80 transition-all cursor-pointer pointer-events-auto relative flex items-center p-2"
              >
                <ShoppingBag size={20} strokeWidth={1.5} className="cursor-pointer pointer-events-auto" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 right-0 bg-primary text-background text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
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