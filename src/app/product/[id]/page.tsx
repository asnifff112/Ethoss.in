"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import productsData from "@/data/db.json";
import { useCartStore } from "@/store/cartStore";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = productsData.products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <p className="text-primary/50 text-sm uppercase tracking-widest mb-4">
          Product not found
        </p>
        <Link
          href="/shop"
          className="text-sm underline text-primary tracking-widest uppercase"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    toast.success("Added to Cart", {
      description: `${qty}x ${product.name}`,
    });
    setTimeout(() => setAdded(false), 2200);
  };

  // Similar products (same category, different id)
  const similar = productsData.products
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 3);

  // Link to collection
  const categoryLink = `/category/${product.category_id}`;

  return (
    <div className="pb-32 lg:pb-16">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href={categoryLink}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Collection
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-primary/5 relative lg:sticky lg:top-24">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="py-4 lg:py-8 flex flex-col">
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 mb-3">
              Ethoss Series
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif text-primary uppercase tracking-wider leading-tight mb-4">
              {product.name}
            </h1>
            <p className="text-2xl text-primary font-medium mb-6">
              ₹{product.price.toLocaleString()}
            </p>

            <p className="text-primary/60 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Stock */}
            <p className="text-xs text-primary/40 tracking-widest uppercase mb-8">
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Out of stock"}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs tracking-widest uppercase text-primary/50">
                Qty
              </span>
              <div className="flex items-center border border-primary/15 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2.5 text-primary/60 hover:bg-primary/5 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 text-sm font-medium text-primary min-w-[40px] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2.5 text-primary/60 hover:bg-primary/5 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-full xl:w-80 py-4 flex items-center justify-center gap-3 text-sm tracking-[0.2em] uppercase font-medium transition-all duration-300 rounded-lg ${
                added
                  ? "bg-green-700 text-white"
                  : "bg-primary text-background hover:bg-primary/90"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {added ? (
                <>
                  <Check size={16} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Cart
                </>
              )}
            </button>

            {/* Details list */}
            <div className="mt-10 pt-8 border-t border-primary/10 space-y-4">
              {[
                "Handmade in Kerala",
                "Sustainably sourced materials",
                "Free shipping on orders above ₹2,000",
              ].map((d) => (
                <p
                  key={d}
                  className="text-xs text-primary/50 tracking-widest uppercase flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/30" />
                  {d}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-20 sm:mt-28">
            <h2 className="text-xl font-serif text-primary uppercase tracking-wider mb-8">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {similar.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-primary/5 relative">
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="mt-3 text-xs font-medium text-primary tracking-wider uppercase line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-primary/50 text-xs mt-1">
                    ₹{p.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/90 backdrop-blur-lg border-t border-primary/10 p-4 z-40">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full py-3.5 flex items-center justify-center gap-2 text-sm tracking-[0.15em] uppercase font-medium rounded-lg transition-all duration-300 ${
            added
              ? "bg-green-700 text-white"
              : "bg-primary text-background"
          } disabled:opacity-40`}
        >
          {added
            ? "Added ✓"
            : `Add to Cart — ₹${(product.price * qty).toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
