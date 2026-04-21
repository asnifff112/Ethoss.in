"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MessageCircle } from "lucide-react";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-primary text-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif tracking-[0.2em] text-background uppercase mb-4">
              Ethoss
            </h3>
            <p className="text-sm leading-relaxed text-background/60 max-w-xs">
              Handcrafted jewellery rooted in Kerala&apos;s heritage.
              Minimalist. Sustainable. Built to last.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-background/40 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Products", href: "/shop" },
                { label: "Our Story", href: "/about" },
                { label: "Feedback", href: "/feedback" },
                { label: "Contact", href: "/about" },
                // ============================================================
                // SHOWCASE MODE — Cart link hidden. Restore when backend ready:
                // { label: "Cart", href: "/cart" },
                // ============================================================
              ].map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-background/40 mb-5">
              Connect
            </h4>
            
            <div className="space-y-4">
              <a
                href="https://instagram.com/ethoss.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-background transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-background/20 flex items-center justify-center bg-background/5">
                  <InstagramIcon />
                </div>
                <span>@ethoss.in</span>
              </a>

              <a
                href="mailto:ethoss.in@gmail.com"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-background transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-background/20 flex items-center justify-center bg-background/5">
                  <Mail size={14} />
                </div>
                <span>ethoss.in@gmail.com</span>
              </a>

              <a
                href="https://wa.me/919497716349"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-background/60 hover:text-background transition-colors"
              >
                <div className="w-8 h-8 rounded-full border border-background/20 flex items-center justify-center bg-background/5">
                  <MessageCircle size={14} />
                </div>
                <span>Chat with Us</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-background/10 text-center space-y-3">
          <p className="text-xs text-background/30 tracking-widest uppercase">
            ETHOSS.IN | UDYAM-KL-09-0103809 | anappadi Chettippadi pin code 676303
          </p>
          <p className="text-[10px] text-background/20 tracking-widest uppercase">
            © {new Date().getFullYear()} Ethoss.in — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
