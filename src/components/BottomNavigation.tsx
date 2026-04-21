"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, MessageCircle } from "lucide-react";
// ============================================================
// SHOWCASE MODE — Cart and Profile icons hidden.
// Restore when backend is ready:
// import { ShoppingCart, User } from "lucide-react";
// ============================================================

export function BottomNavigation() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;

  // SHOWCASE MODE NAV — Only public routes visible
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/shop", icon: Shirt },
    { label: "Feedback", href: "/feedback", icon: MessageCircle },
    // ============================================================
    // SHOWCASE MODE — Disabled nav items. Restore when backend ready:
    // { label: "Cart", href: "/cart", icon: ShoppingCart },
    // { label: "Profile", href: "/profile", icon: User },
    // ============================================================
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-primary/10 pb-safe md:hidden">
      <ul className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? "text-primary font-medium" : "text-primary/50"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
