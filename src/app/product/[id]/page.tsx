"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import productsData from "@/data/db.json";
import gsap from "gsap";

// ─── WhatsApp Config ──────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "919497716349";
const BASE_URL = "https://ethoss.in";

function buildWhatsAppUrl(productName: string, price: number, imageUrl: string): string {
  const absoluteImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `${BASE_URL}${imageUrl}`;

  const message =
    `Hi Ethoss! ✨ I'm interested in purchasing the following piece:\n\n` +
    `Product: ${productName}\n` +
    `Price: ₹${price.toLocaleString()}.00\n` +
    `Image: ${absoluteImageUrl}\n\n` +
    `Can you guide me on the payment process and shipping details? 🤍`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = productsData.products.find((p) => p.id === id);

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

  // Image gallery from database (new schema: `images`)
  const images = product.images || [];
  const primaryImageUrl = images[0] || "/catsection/img1.jpeg";
  const isSoldOut = product.is_sold_out;
  const hasDiscount = product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const categoryName = productsData.categories.find(c => c.id === product.category_id)?.title || "COLLECTION";

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

  // Build the WhatsApp URL for this product
  const whatsappUrl = buildWhatsAppUrl(product.name, product.price, primaryImageUrl);

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
              className="w-full aspect-[4/5] md:rounded-[4px] overflow-x-auto snap-x snap-mandatory flex hide-scrollbar relative"
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
                      className={`object-cover ${isSoldOut ? "brightness-[0.6]" : ""}`}
                    />
                </div>
              ))}

              {/* SOLD OUT Overlay on gallery */}
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-red-600/90 backdrop-blur-sm text-white px-8 py-3 rounded-sm shadow-2xl">
                    <span className="text-lg font-black tracking-[0.3em] uppercase">SOLD OUT</span>
                  </div>
                </div>
              )}
            </div>
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
              <p className="text-[10px] tracking-[0.25em] font-bold uppercase text-primary/50 mb-1">
                CATEGORY: {categoryName}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-primary uppercase tracking-wider leading-tight mb-2">
                {product.name}
              </h1>
            </div>

            {/* SECTION 3: Price & Description */}
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

              {/* Delivery Charge */}
              <div className="flex items-center gap-1.5 mb-6">
                <Truck size={12} className="text-primary/40" />
                <span className="text-[11px] text-primary/50 tracking-wider">
                  {product.delivery_charge > 0 
                    ? `Delivery: ₹${product.delivery_charge}` 
                    : "FREE Delivery"}
                </span>
              </div>
              
              <p className="text-primary/70 text-[13px] tracking-wide leading-relaxed max-w-xl">
                {product.caption}
              </p>
            </div>

            {/* ─── BUY VIA WHATSAPP CTA ─────────────────────────────────── */}
            <div className="product-anim-item mt-auto pt-6 flex flex-col gap-5">
              {isSoldOut ? (
                <div className="w-full py-4 text-center text-[11px] tracking-[0.15em] uppercase font-bold text-primary/40 border border-primary/10 rounded-[2px] bg-primary/[0.03]">
                  Currently Unavailable
                </div>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-[18px] flex items-center justify-center gap-3 text-[12px] tracking-[0.2em] uppercase font-bold bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-all duration-300 rounded-[2px] active:scale-95 shadow-[0_4px_24px_rgba(37,211,102,0.25)]"
                >
                  {/* WhatsApp Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Buy via WhatsApp
                </a>
              )}
              {!isSoldOut && (
                <p className="text-[10px] text-primary/40 tracking-widest uppercase text-center">
                  Tap to chat with us on WhatsApp
                </p>
              )}
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
