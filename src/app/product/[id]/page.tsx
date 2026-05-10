"use client";

import { useState, useRef, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Heart, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (session && product) {
        try {
          const res = await fetch("/api/user/wishlist");
          if (res.ok) {
            const wishlist = await res.json();
            setIsWishlisted(wishlist.some((p: any) => p._id === product._id || p === product._id));
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchWishlist();
  }, [session, product]);

  const toggleWishlist = async () => {
    if (!session) {
      toast.error("Please login to save to wishlist");
      router.push("/login");
      return;
    }
    const wasWishlisted = isWishlisted;
    setIsWishlisted(!isWishlisted);

    // Fire GSAP bounce event on Navbar heart icon
    window.dispatchEvent(new Event("wishlist-updated"));
    toast.success(wasWishlisted ? "Removed from Wishlist" : "Added to Wishlist ♥");

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id })
      });
      if (!res.ok) throw new Error();
    } catch {
      setIsWishlisted(!isWishlisted);
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!session) {
      toast.error("Please login to add items to your cart");
      router.push("/login");
      return;
    }
    setIsAdding(true);
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || ""
    });
    
    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${product.name} added to Cart`);
    }, 500);
  };

  // Auto swiping logic
  useEffect(() => {
    if (!product || !product.images) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % product.images.length;
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
  }, [product]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollX = scrollRef.current.scrollLeft;
      const index = Math.round(scrollX / scrollRef.current.clientWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  useEffect(() => {
    if (!product) return;
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
  }, [product]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-primary/50 text-sm tracking-widest uppercase">Loading...</div>;
  }

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

  const images = product.images || [];
  const isSoldOut = product.is_sold_out;
  const hasDiscount = product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div ref={containerRef} className="pb-32 lg:pb-16 bg-white min-h-[100svh] text-primary">
      <div className="product-anim-item max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-2">
        <Link href={`/shop`} className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-primary/60 hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          
          <div className="product-anim-item w-full flex flex-col items-center relative">
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 z-20 p-3 bg-white/70 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all"
            >
              <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-primary"} />
            </button>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="w-full aspect-[4/5] md:rounded-[4px] overflow-x-auto snap-x snap-mandatory flex hide-scrollbar relative"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img: string, idx: number) => (
                <div key={idx} className="w-full flex-shrink-0 snap-center relative bg-[#EFEFEF]">
                   <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`object-cover ${isSoldOut ? "brightness-[0.6]" : ""}`}
                    />
                </div>
              ))}

              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-red-600/90 backdrop-blur-sm text-white px-8 py-3 rounded-sm shadow-2xl">
                    <span className="text-lg font-black tracking-[0.3em] uppercase">SOLD OUT</span>
                  </div>
                </div>
              )}
            </div>
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="flex justify-center gap-3 mt-4 px-4 md:px-0">
              {images.map((img: string, idx: number) => (
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

          <div className="px-5 md:px-0 py-4 lg:py-8 flex flex-col h-full">
            <div className="product-anim-item mt-2 mb-4">
              <div className="h-6 mb-2">
                {isSoldOut && (
                  <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg border border-red-500/30 animate-status-blink mb-6">
                    SOLD OUT
                  </span>
                )}
                {!isSoldOut && (
                  <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase text-primary/40">
                    LIMITED EDITION
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary uppercase tracking-wider leading-tight mb-2">
                {product.name}
              </h1>
            </div>

            <div className="product-anim-item mb-8">
              <div className="flex items-end gap-3 mb-2">
                {hasDiscount && (
                  <p className="text-[15px] font-bold text-primary/40 line-through decoration-red-400 decoration-2 font-sans">
                    ₹{product.original_price.toLocaleString()}.00
                  </p>
                )}
                <p className={`text-[20px] font-bold font-sans ${isSoldOut ? "text-primary/40" : "text-[#b22222]"}`}>
                  ₹{product.price.toLocaleString()}.00
                </p>
                {hasDiscount && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-6">
                <Truck size={12} className="text-primary/40" />
                <span className="text-[11px] text-primary/50 tracking-wider">
                  {product.delivery_charge > 0 
                    ? `Delivery: ₹${product.delivery_charge}` 
                    : "FREE Delivery"}
                </span>
              </div>
              
              <p className="text-primary/70 text-[13px] tracking-wide leading-relaxed max-w-xl whitespace-pre-line">
                {product.caption}
              </p>
            </div>

            <div className="product-anim-item mt-auto pt-6 flex flex-col gap-5">
              {isSoldOut ? (
                <div className="w-full py-4 text-center text-[11px] tracking-[0.15em] uppercase font-bold text-primary/40 border border-primary/10 rounded-[2px] bg-primary/[0.03]">
                  Currently Unavailable
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full min-h-[48px] py-[18px] flex items-center justify-center gap-3 text-[12px] tracking-[0.2em] uppercase font-bold bg-primary text-background hover:bg-primary/90 transition-all duration-300 rounded-2xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </button>
              )}
            </div>

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
