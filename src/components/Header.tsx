"use client";

import Link from "next/link";
// ============================================================
// SHOWCASE MODE — Cart icon hidden from Header.
// Re-enable when backend is ready:
// import { ShoppingBag } from "lucide-react";
// import { useCartStore } from "@/store/cartStore";
// ============================================================

export function Header() {
  // ============================================================
  // SHOWCASE MODE — Cart count disabled.
  // Restore when backend is ready:
  // const itemCount = useCartStore((s) => s.items.reduce((total, item) => total + item.quantity, 0));
  // ============================================================

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-primary/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between xl:justify-around">
        {/* Empty placeholder for flex alignment */}
        <div className="w-10 sm:hidden"></div>

        <Link href="/" className="text-2xl font-serif tracking-widest text-primary uppercase relative group">
          Ethoss.in
          <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
        </Link>
        
        {/* ============================================================
          SHOWCASE MODE — Cart link hidden.
          Restore when backend is ready:
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-primary p-2">
              <ShoppingBag strokeWidth={1.5} size={24} />
              {itemCount > 0 && (
                <span className="...">.....</span>
              )}
            </Link>
          </div>
        ============================================================ */}
        <div className="w-10" />
      </div>
    </header>
  );
}
