"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, X, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Fetch products and wishlist
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCats = Array.from(new Set(data.map((p: any) => p.category_id)));
        setCategories(["all", ...uniqueCats as string[]]);

        if (session) {
          const wlRes = await fetch("/api/user/wishlist");
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            setWishlist(wlData.map((p: any) => p._id || p));
          }
        }
      } catch (error) {
        console.error("Failed to load shop data", error);
      }
    };
    loadData();
  }, [session]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please login to save to wishlist");
      return;
    }

    const wasWishlisted = wishlist.includes(productId);
    
    // Optimistic update
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    // Fire GSAP bounce event on Navbar heart icon
    window.dispatchEvent(new Event("wishlist-updated"));
    toast.success(wasWishlisted ? "Removed from Wishlist" : "Added to Wishlist ♥");

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
    } catch (error) {
      toast.error("Failed to update wishlist");
      // Revert on error
      setWishlist(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    }
  };

  let filtered =
    category === "all"
      ? [...products]
      : products.filter((p) => p.category_id === category);

  if (sortOrder === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Filter Panel Animation
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(filterPanelRef.current, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
    } else {
      document.body.style.overflow = "";
      gsap.to(filterPanelRef.current, { y: "100%", opacity: 0, duration: 0.4, ease: "power3.in" });
    }
  }, [isFilterOpen]);

  // Entrance Animations
  useEffect(() => {
    if (filtered.length === 0) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          onComplete: () => ScrollTrigger.refresh()
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [filtered]);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-0 sm:px-8 py-0 sm:py-6 md:py-16 min-h-[100svh]">
      
      {/* --- DESKTOP HEADER & FILTERS --- */}
      <div className="hidden md:block">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 mb-1">
              Collection
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif text-primary uppercase tracking-wider">
              Shop All
            </h1>
          </div>
          <p className="text-xs text-primary/50 tracking-widest uppercase">
            {filtered.length} pieces
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 px-4 sm:mx-0 sm:px-0">
            <SlidersHorizontal size={14} className="text-primary/40 flex-shrink-0" />
            {categories.map((catId) => {
              const catName = catId === "all" ? "All" : catId;
              return (
                <button
                  key={catId}
                  onClick={() => setCategory(catId)}
                  className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase flex-shrink-0 border transition-colors ${
                    category === catId
                      ? "bg-primary text-background border-primary"
                      : "border-primary/15 text-primary/60 hover:border-primary/40"
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 px-4 sm:px-0">
            <span className="text-[10px] tracking-[0.2em] uppercase text-primary/40 whitespace-nowrap">
              Sort By
            </span>
            <select
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value)}
               className="bg-transparent border border-primary/15 text-primary text-xs tracking-widest uppercase rounded-full px-4 py-2 outline-none focus:border-primary/40 cursor-pointer appearance-none min-w-[160px]"
               style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%221a2f67%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
             >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- MOBILE HEADER & FILTERS --- */}
      <div className="md:hidden flex flex-col pt-4 px-4 bg-background">
        <div className="border-b border-primary/20 pb-4">
          <h1 className="text-[13px] font-bold tracking-widest uppercase">Products</h1>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-primary/10">
          <span className="text-[13px] text-primary/60">{filtered.length} Items</span>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 text-[15px] font-bold uppercase focus:outline-none"
          >
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>
      </div>

      {/* --- PRODUCT GRID --- */}
      {filtered.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1e3a8a]/5 flex items-center justify-center mb-6">
            <SlidersHorizontal size={24} className="text-[#1e3a8a]/30" />
          </div>
          <h3 className="text-lg font-serif text-[#1e3a8a] mb-2">No products found</h3>
          <p className="text-sm text-[#1e3a8a]/50 max-w-xs mb-6">
            We're updating our collection. Check back soon for new handcrafted pieces.
          </p>
          <Link href="/" className="text-[11px] tracking-widest uppercase font-medium text-white bg-[#1e3a8a] px-6 py-3 rounded-3xl hover:bg-[#1e3a8a]/90 transition-all">
            Back to Home
          </Link>
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] md:gap-8 px-[1px] md:px-0 mt-[2px] md:mt-0">
        {filtered.map((p) => {
          const isSoldOut = p.is_sold_out;
          const isWishlisted = wishlist.includes(p._id);

          return (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className="product-card group flex flex-col mb-4 md:mb-0 relative"
            >
              <div className="w-full aspect-[3/4] overflow-hidden bg-[#F1F1F1] relative rounded-2xl md:rounded-2xl">
                <Image
                  src={p.images?.[0] || "/catsection/img1.jpeg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={`object-cover transition-transform duration-700 md:group-hover:scale-105 ${isSoldOut ? "brightness-50" : ""}`}
                />
                
                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleWishlist(e, p._id)}
                  className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors z-20"
                >
                  <Heart 
                    size={16} 
                    className={isWishlisted ? "fill-red-500 text-red-500" : "text-primary/70"} 
                  />
                </button>

                {/* SOLD OUT Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <span className="bg-red-600 text-white text-[11px] font-black px-5 py-2 uppercase tracking-[0.25em] rounded-sm shadow-2xl border border-red-400/30 animate-status-blink">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 px-3 md:px-0 text-left pb-4">
                <h3 className="text-[13px] md:text-sm font-bold text-primary tracking-widest uppercase leading-snug line-clamp-1 mb-1 font-sans">
                  {p.name}
                </h3>
                <div className="flex items-center gap-2 text-[13px] md:text-sm font-sans tracking-tight">
                  {p.original_price > p.price && (
                    <span className="text-primary/50 line-through decoration-red-400 decoration-2">₹{p.original_price.toLocaleString()}</span>
                  )}
                  <span className={`font-semibold ${isSoldOut ? "text-primary/40" : "text-[#b22222]"}`}>
                    ₹{p.price.toLocaleString()}
                  </span>
                  {p.original_price > p.price && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-sm tracking-wider">
                      {Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      )}

      {/* --- MOBILE FILTER SLIDE-IN PANEL --- */}
      <div 
        ref={filterPanelRef}
        className="fixed inset-0 z-[9999] bg-background transform translate-y-full opacity-0 flex flex-col md:hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <span className="text-sm font-bold tracking-widest uppercase">Filter & Sort</span>
          <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Categories */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary/40 mb-4">Categories</h4>
            <div className="flex flex-col items-start gap-4">
              {categories.map((catId) => {
                const catName = catId === "all" ? "All Collections" : catId;
                const isActive = category === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => setCategory(catId)}
                    className={`text-left text-sm tracking-widest uppercase transition-colors ${
                      isActive ? "text-primary font-bold" : "text-primary/60"
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-primary/40 mb-4">Sort By</h4>
            <div className="flex flex-col items-start gap-4">
              {[
                { value: "default", label: "Default" },
                { value: "price-asc", label: "Price: Low to High" },
                { value: "price-desc", label: "Price: High to Low" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortOrder(opt.value)}
                  className={`text-left text-sm tracking-widest uppercase transition-colors ${
                    sortOrder === opt.value ? "text-primary font-bold" : "text-primary/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-primary/10">
          <button 
            onClick={() => setIsFilterOpen(false)}
            className="w-full bg-primary text-background py-4 text-xs font-bold tracking-widest uppercase rounded-2xl min-h-[48px]"
          >
            Apply ({filtered.length})
          </button>
        </div>
      </div>
    </div>
  );
}
