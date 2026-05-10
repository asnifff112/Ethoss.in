"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowLeft, Send } from "lucide-react";
import { useSession } from "next-auth/react";

const WHATSAPP_NUMBER = "919497716349";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  
  const { data: session } = useSession();

  const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    let message = `Hi Ethoss! ✨ I'd like to place an order:\n\n`;
    
    items.forEach((item: any, idx: number) => {
      message += `${idx + 1}. *${item.name}* (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
      message += `Link: https://ethoss.in/product/${item.id}\n\n`;
    });

    message += `*Total Amount: ₹${total}*\n\n`;
    
    if (session?.user?.name) {
      message += `My Name: ${session.user.name}\n`;
    }
    
    message += `Please let me know how to proceed with the payment and shipping details. 🤍`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    // Clear cart locally and in DB after redirect
    clearCart();
    if (session) {
      fetch("/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: [] }),
      }).catch(err => console.error("Failed to clear DB cart", err));
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80svh] flex flex-col items-center justify-center px-6 bg-[#faf5ec]">
        <p className="text-primary/50 text-sm uppercase tracking-widest mb-6">Your cart is empty</p>
        <Link href="/shop" className="text-[10px] tracking-[0.2em] font-bold uppercase text-primary border-b border-primary pb-1">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#faf5ec] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl sm:text-3xl font-serif text-primary uppercase tracking-widest">
            Your Cart
          </h1>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-primary/60 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-6">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-4 sm:gap-6 pb-6 border-b border-primary/10 relative">
                <Link href={`/product/${item.id}`} className="block w-24 sm:w-32 aspect-[3/4] relative bg-[#EFEFEF] flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </Link>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start pr-8">
                    <Link href={`/product/${item.id}`} className="text-sm font-bold uppercase tracking-widest text-primary mb-1 hover:underline">
                      {item.name}
                    </Link>
                  </div>
                  <p className="text-sm text-primary/70 mb-4 font-sans">₹{item.price.toLocaleString()}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-primary/20 rounded-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-primary/60 hover:bg-primary/5 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-primary min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-primary/60 hover:bg-primary/5 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-0 right-0 p-2 text-primary/40 hover:text-red-500 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={clearCart}
              className="text-[10px] tracking-widest uppercase font-bold text-red-500/70 hover:text-red-500 mt-4"
            >
              Clear Cart
            </button>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 sm:p-8 rounded-sm shadow-sm border border-primary/5 sticky top-24">
              <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm text-primary/70 border-b border-primary/10 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-[10px] uppercase tracking-widest">Calculated on WhatsApp</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-primary mb-8 font-sans">
                <span className="uppercase tracking-widest text-sm">Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-[16px] flex items-center justify-center gap-3 text-[12px] tracking-[0.2em] uppercase font-bold bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-all duration-300 rounded-[2px] active:scale-95 shadow-[0_4px_24px_rgba(37,211,102,0.25)]"
              >
                <Send size={16} />
                Checkout via WhatsApp
              </button>
              
              <p className="text-center text-[10px] text-primary/40 tracking-widest uppercase mt-4 leading-relaxed">
                You will be redirected to WhatsApp to confirm shipping details and finalize your order.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
