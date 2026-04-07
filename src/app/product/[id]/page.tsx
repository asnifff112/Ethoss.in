"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import productsData from "@/data/db.json";
import { useCartStore, useAuthStore } from "@/store/cartStore";
import gsap from "gsap";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = productsData.products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <p className="text-primary/50 text-sm uppercase tracking-widest mb-4">Product not found</p>
        <Link href="/shop" className="text-sm underline text-primary tracking-widest uppercase">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Image gallery from database
  const images = product.image_urls || [];
  const primaryImageUrl = images[0] || "/catsection/img1.jpeg";
  const oldPrice = product.price + 300; 
  
  // Refined Status Logic
  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const isLowStock = !isOutOfStock && (product.showLowStock || (product.stock > 0 && product.stock <= 3));
  const isLimitedEdition = !isOutOfStock && !isLowStock;

  const categoryName = productsData.categories.find(c => c.id === product.category_id)?.title || "COLLECTION";
  
  // ... (auto-swipe and GSAP effects remain the same)

  // Auto swiping logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % images.length;
        if (scrollRef.current) {
          const scrollWidth = scrollRef.current.clientWidth;
          scrollRef.current.scrollTo({
            left: scrollWidth * next,
            behavior: "smooth"
          });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Handle manual scroll snapping updates
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollX = scrollRef.current.scrollLeft;
      const index = Math.round(scrollX / scrollRef.current.clientWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  // GSAP Entrance
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".product-anim-item", 
        { y: 20, opacity: 0 }, 
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [id]);

  const handleAdd = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to continue shopping.", {
        description: "You need an account to add items to your cart.",
      });
      router.push("/login");
      return;
    }
    for (let i = 0; i < qty; i++) addItem({ ...product, image_url: primaryImageUrl });
    setAdded(true);
    toast.success("Added to Cart", { description: `${qty}x ${product.name}` });
    setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error("Please sign in to continue shopping.", {
        description: "You need an account to add items to your cart.",
      });
      router.push("/login");
      return;
    }
    handleAdd();
    toast.success("Proceeding to Checkout...");
    router.push("/cart");
  };

  return (
    <div ref={containerRef} className="pb-32 lg:pb-16 bg-[#faf5ec] min-h-[100svh] text-primary">
      {/* Top Bar */}
      <div className="product-anim-item max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-2">
        <Link href={`/shop`} className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-primary/60 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* SECTION 1: Image Gallery */}
          <div className="product-anim-item w-full flex flex-col items-center relative">
            {/* Main Slider */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="w-full aspect-[4/5] md:rounded-[4px] overflow-x-auto snap-x snap-mandatory flex hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="w-full flex-shrink-0 snap-center relative bg-[#EFEFEF]">
                   <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                </div>
              ))}
            </div>
            {/* JSX styling for webkit hide-scrollbar if not in global css */}
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Thumbnails */}
            <div className="flex justify-center gap-3 mt-4 px-4 md:px-0">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setActiveIndex(idx);
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * idx, behavior: "smooth" });
                    }
                  }}
                  className={`w-12 h-14 md:w-16 md:h-20 relative rounded-sm overflow-hidden transition-all ${
                    activeIndex === idx ? "border-2 border-primary" : "border border-transparent opacity-60"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="px-5 md:px-0 py-4 lg:py-8 flex flex-col h-full">
            
            {/* SECTION 2: Badges & Title */}
            <div className="product-anim-item mt-2 mb-4">
              <div className="h-6 mb-2">
                {(!product.isAvailable || product.stock <= 0) && (
                  <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg border border-red-500/30 animate-status-blink mb-6">
                    OUT OF STOCK
                  </span>
                )}
                {product.isAvailable && product.stock > 0 && (product.showLowStock || product.stock <= 3) && (
                  <span className="inline-block bg-amber-500 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg border border-amber-400/30 animate-status-pulse mb-6">
                    RUNNING OUT OF STOCK
                  </span>
                )}
                {isLimitedEdition && (
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-primary/40">
                    LIMITED EDITION
                  </span>
                )}
              </div>
              <p className="text-[10px] tracking-[0.25em] font-bold uppercase text-primary/50 mb-1">
                CATEGORY: {categoryName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary uppercase tracking-wider leading-tight mb-2">
                {product.name}
              </h1>
            </div>

            {/* SECTION 3: Price & Description */}
            <div className="product-anim-item mb-8">
              <div className="flex items-end gap-3 mb-6">
                <p className="text-[15px] font-bold text-primary/40 line-through font-sans">
                  ₹{oldPrice.toLocaleString()}.00
                </p>
                <p className="text-[20px] font-bold font-sans text-[#b22222]">
                  ₹{product.price.toLocaleString()}.00
                </p>
              </div>
              
              <p className="text-primary/70 text-[13px] tracking-wide leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            {/* SECTION 4: Actions (Quantity & Buttons) */}
            <div className="product-anim-item mt-auto pt-6 flex flex-col gap-5">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary/50 w-8">
                  QTY:
                </span>
                <div className="flex items-center border border-primary/20 bg-transparent rounded-[2px] overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-3 text-primary hover:bg-primary/5 transition-colors active:scale-95 disabled:opacity-30"
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="px-4 py-3 text-sm font-bold text-primary min-w-[40px] text-center font-sans">
                    {isOutOfStock ? 0 : qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    disabled={isOutOfStock || qty >= product.stock}
                    className="px-4 py-3 text-primary hover:bg-primary/5 transition-colors active:scale-95 disabled:opacity-30"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Side-by-side CTA Buttons */}
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 py-[16px] flex items-center justify-center gap-2 text-[11px] tracking-[0.15em] uppercase font-bold transition-all duration-300 rounded-[2px] active:scale-95 ${
                    added
                      ? "bg-[#183a21] text-[#faf5ec] border border-[#183a21]"
                      : "bg-transparent border border-primary text-primary hover:bg-primary/5"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {added ? <Check size={16} strokeWidth={1.5} /> : <ShoppingBag size={14} strokeWidth={2} />} 
                  {added ? "Added" : "Add to Bag"}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-[16px] flex items-center justify-center text-[11px] tracking-[0.15em] uppercase font-bold bg-primary text-[#faf5ec] hover:bg-primary/90 transition-all duration-300 rounded-[2px] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-primary"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Delivery/Policy standard texts */}
            <div className="product-anim-item mt-10 pt-6 border-t border-primary/10 space-y-3">
              {[
                "100% Secure Checkout",
                "Priority Insured Shipping",
                "Handcrafted in Kerala",
              ].map((d) => (
                <p key={d} className="text-[10px] text-primary/60 font-bold tracking-widest uppercase flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {d}
                </p>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
