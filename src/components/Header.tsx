"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function Header() {
  const itemCount = useCartStore((s) => s.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-primary/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between xl:justify-around">
        {/* Empty placeholder for flex alignment */}
        <div className="w-10 sm:hidden"></div>

        <Link href="/" className="text-2xl font-serif tracking-widest text-primary uppercase relative group">
          Ethoss.in
          <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-primary p-2">
            <ShoppingBag strokeWidth={1.5} size={24} />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-primary text-background text-[10px] font-bold rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
