"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  
  // Total നേരിട്ട് ഇവിടെ കണക്കാക്കുന്നു
  const total = useCartStore((s) => 
    s.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[60vh]">
      <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-10 text-center sm:text-left">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag
            size={40}
            strokeWidth={1}
            className="mx-auto text-primary/20 mb-6"
          />
          <p className="text-primary/50 text-sm uppercase tracking-widest mb-6 font-medium">
            Your cart is empty
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors rounded-lg font-medium"
          >
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="space-y-5 mb-10">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-primary/[0.03] border border-primary/5 rounded-xl transition-all hover:border-primary/10"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-primary uppercase tracking-wider truncate">
                    {item.name}
                  </h3>
                  <p className="text-primary/50 text-xs mt-1">
                    ₹{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-primary/10 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-background transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium text-primary w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-primary/10 flex items-center justify-center text-primary/60 hover:bg-primary hover:text-background transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-primary/30 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <p className="text-sm font-medium text-primary font-serif">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="border-t border-primary/5 pt-8 space-y-4">
            <div className="flex justify-between text-xs uppercase tracking-widest text-primary/60">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs uppercase tracking-widest text-primary/60">
              <span>Shipping</span>
              <span>{total >= 2000 ? "Complimentary" : "₹99"}</span>
            </div>
            <div className="flex justify-between text-lg font-medium text-primary pt-4 border-t border-primary/5 font-serif">
              <span>Total Amount</span>
              <span>
                ₹{(total >= 2000 ? total : total + 99).toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-10 w-full bg-primary text-background py-4 flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase font-bold hover:bg-primary/90 transition-all rounded-lg shadow-sm"
          >
            Proceed to Checkout <ArrowRight size={14} />
          </Link>
        </>
      )}
    </div>
  );
}