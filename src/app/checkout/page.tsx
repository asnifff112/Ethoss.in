"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useCartStore, useAuthStore } from "@/store/cartStore";
import gsap from "gsap";
import { toast } from "sonner";

export default function CheckoutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  
  const user = useAuthStore((s) => s.user);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 100;
  const finalTotal = subtotal + shipping;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "India - Kerala",
    pincode: "",
    mobile: "",
    altMobile: "",
    notes: "",
  });

  // Smart Auto-Fill
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      const primaryAddress = user.addresses?.[0] || {};
      
      setForm((prev) => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(" ") || prev.lastName,
        mobile: user.phone || prev.mobile,
        addressLine1: primaryAddress.houseNo || primaryAddress.buildingName || prev.addressLine1,
        addressLine2: primaryAddress.area || prev.addressLine2,
        district: primaryAddress.district || prev.district,
        state: primaryAddress.state || prev.state,
        pincode: primaryAddress.pincode || prev.pincode,
        // city might not heavily exist in the interface, we'll map postOffice or area
        city: primaryAddress.postOffice || prev.city,
      }));
    }
  }, [user]);

  // GSAP Entrance
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".checkout-anim", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });
    }, containerRef);
    return () => ctx.revert();
  }, [items.length]);

  const handleRazorpayMock = (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading("Initiating Razorpay gateway...");
    setTimeout(() => {
      toast.dismiss();
      toast.success("Payment successful! Order Placed.");
      clearCart();
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <p className="text-primary/50 text-sm uppercase tracking-widest mb-4">
          Your cart is empty
        </p>
        <Link
          href="/shop"
          className="text-[11px] underline font-bold text-primary tracking-[0.2em] uppercase"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-[100svh] bg-background text-primary pb-32">
      {/* Top Navigation */}
      <div className="checkout-anim max-w-4xl mx-auto px-4 sm:px-8 py-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} /> Back to Cart
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <form onSubmit={handleRazorpayMock} className="grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16">
          
          {/* SECTION 1: Billing Details */}
          <div className="flex flex-col space-y-8">
            <h2 className="checkout-anim text-lg md:text-xl font-bold font-serif uppercase tracking-widest border-b border-primary/10 pb-4">
              Billing Details
            </h2>
            
            <div className="checkout-anim space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="First Name" value={form.firstName} onChange={(v) => setForm({...form, firstName: v})} required />
                <InputField label="Last Name" value={form.lastName} onChange={(v) => setForm({...form, lastName: v})} required />
              </div>

              <InputField label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({...form, addressLine1: v})} required />
              <InputField label="Address Line 2" value={form.addressLine2} onChange={(v) => setForm({...form, addressLine2: v})} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="City" value={form.city} onChange={(v) => setForm({...form, city: v})} required />
                <InputField label="District" value={form.district} onChange={(v) => setForm({...form, district: v})} required />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-primary/70 mb-1 uppercase tracking-widest">State / Province</label>
                <select
                  value={form.state}
                  onChange={(e) => setForm({...form, state: e.target.value})}
                  className="border border-primary/20 bg-transparent p-3 text-sm rounded-none focus:border-primary outline-none appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231a2f67%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
                >
                  <option value="India - Kerala">India - Kerala</option>
                  <option value="India - Karnataka">India - Karnataka</option>
                  <option value="India - Tamil Nadu">India - Tamil Nadu</option>
                  <option value="India - Maharashtra">India - Maharashtra</option>
                  <option value="India - Delhi">India - Delhi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Pincode" value={form.pincode} onChange={(v) => setForm({...form, pincode: v})} required />
                <InputField label="Mobile" value={form.mobile} onChange={(v) => setForm({...form, mobile: v})} required type="tel" />
              </div>

              <InputField label="Alternate Mobile (Optional)" value={form.altMobile} onChange={(v) => setForm({...form, altMobile: v})} type="tel" />

              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-primary/70 mb-1 uppercase tracking-widest">Order Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  className="border border-primary/20 bg-transparent p-3 text-sm rounded-none focus:border-primary outline-none min-h-[100px] resize-y"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                />
              </div>

            </div>
          </div>

          {/* SECTION 2: Order Items & Summary */}
          <div className="flex flex-col space-y-8">
            <h2 className="checkout-anim text-lg md:text-xl font-bold font-serif uppercase tracking-widest border-b border-primary/10 pb-4">
              Order Items ({items.length})
            </h2>
            
            <div className="checkout-anim space-y-4">
              {items.map((i) => (
                <div key={i.id} className="flex gap-4 items-center">
                  <div className="relative w-16 h-20 bg-primary/5 rounded-[2px] overflow-hidden flex-shrink-0">
                    <Image src={i.image_url} alt={i.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-[13px] font-bold tracking-widest uppercase mb-1">{i.name}</h3>
                    <p className="text-[11px] font-sans text-primary/60">QTY: {i.quantity}</p>
                  </div>
                  <div className="text-sm font-sans font-semibold">
                    ₹{(i.price * i.quantity).toLocaleString()}.00
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Box */}
            <div className="checkout-anim bg-primary/[0.03] p-5 border border-primary/10 rounded-[2px] flex flex-col space-y-3">
              <div className="flex justify-between text-xs tracking-widest uppercase text-primary/60">
                <span>Subtotal</span>
                <span className="font-sans font-semibold">₹{subtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-xs tracking-widest uppercase text-primary/60 pb-3 border-b border-primary/10">
                <span>Shipping</span>
                <span className="font-sans font-semibold">
                  {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}.00`}
                </span>
              </div>
              <div className="flex justify-between text-lg md:text-xl font-bold tracking-wider pt-2">
                <span className="uppercase">Total</span>
                <span className="font-sans">₹{finalTotal.toLocaleString()}.00</span>
              </div>
            </div>

            {/* SECTION 3: CTA Container */}
            <div className="checkout-anim w-full mt-6">
              <button
                type="submit"
                className="w-full bg-primary text-background py-4 flex flex-col items-center justify-center transition-all duration-300 hover:bg-primary/90 active:scale-[0.98] lg:active:scale-95 shadow-lg shadow-primary/20 rounded-sm"
              >
                <span className="text-[13px] md:text-sm font-bold tracking-widest uppercase mb-1">PAY & PLACE ORDER</span>
                <span className="text-[10px] md:text-[10.5px] font-serif tracking-widest text-background/80">
                  Secure Checkout • ₹{finalTotal.toLocaleString()}.00
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ── Reusable Input ── */
function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-primary/60 mb-1.5 uppercase tracking-widest">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border border-primary/20 bg-transparent p-3 text-sm rounded-none focus:border-primary focus:ring-1 focus:ring-primary/10 outline-none transition-all placeholder:text-primary/20"
      />
    </div>
  );
}
