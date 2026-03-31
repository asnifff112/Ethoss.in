"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, Smartphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore, selectTotal } from "@/store/cartStore";

const UPI_ID = "9746156270@ybl";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore(selectTotal);
  const finalTotal = total >= 2000 ? total : total + 99;

  const [step, setStep] = useState<"shipping" | "payment" | "done">("shipping");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    house_name: "",
    area: "",
    town: "",
    district: "",
    state: "",
    pincode: "",
  });
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Build UPI deep-link
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=ETHOSS&am=${finalTotal}&cu=INR`;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("done");
    clearCart();
  };

  if (items.length === 0 && step !== "done") {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <p className="text-primary/50 text-sm uppercase tracking-widest mb-6">
          Your cart is empty
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 text-sm tracking-widest uppercase rounded-lg"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest mb-4">
          Order Placed!
        </h1>
        <p className="text-primary/60 text-sm mb-8 max-w-xs mx-auto">
          We&apos;ll verify your payment and ship within 3-5 business days. Thank you
          for supporting handmade craft.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-background px-8 py-3 text-sm tracking-widest uppercase rounded-lg"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary/50 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Cart
      </Link>

      <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2">
        Checkout
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        <span
          className={`text-[10px] tracking-widest uppercase ${
            step === "shipping" ? "text-primary font-medium" : "text-primary/40"
          }`}
        >
          1. Shipping
        </span>
        <span className="text-primary/20">→</span>
        <span
          className={`text-[10px] tracking-widest uppercase ${
            step === "payment" ? "text-primary font-medium" : "text-primary/40"
          }`}
        >
          2. Payment
        </span>
      </div>

      {/* ── Step 1: Shipping ── */}
      {step === "shipping" && (
        <form onSubmit={handleShippingSubmit} className="space-y-5">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            required
          />
          <Input
            label="House Name / Flat No."
            value={form.house_name}
            onChange={(v) => setForm({ ...form, house_name: v })}
          />
          <Input
            label="Area / Street"
            value={form.area}
            onChange={(v) => setForm({ ...form, area: v })}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Town / City"
              value={form.town}
              onChange={(v) => setForm({ ...form, town: v })}
            />
            <Input
              label="District"
              value={form.district}
              onChange={(v) => setForm({ ...form, district: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State"
              value={form.state}
              onChange={(v) => setForm({ ...form, state: v })}
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(v) => setForm({ ...form, pincode: v })}
              required
            />
          </div>

          {/* Order summary */}
          <div className="bg-primary/[0.03] border border-primary/8 rounded-xl p-5 mt-6">
            <p className="text-xs tracking-widest uppercase text-primary/40 mb-3">
              Order Summary
            </p>
            {items.map((i) => (
              <div
                key={i.id}
                className="flex justify-between text-sm text-primary/70 py-1"
              >
                <span className="truncate pr-4">
                  {i.name} × {i.quantity}
                </span>
                <span>₹{(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium text-primary pt-3 mt-3 border-t border-primary/10">
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-background py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors rounded-lg mt-4"
          >
            Continue to Payment
          </button>
        </form>
      )}

      {/* ── Step 2: UPI Payment ── */}
      {step === "payment" && (
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          <div className="bg-primary/[0.03] border border-primary/8 rounded-xl p-6 text-center">
            
            {/* PhonePe QR Code Image */}
            <div className="flex justify-center mb-8">
              <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-primary/20">
                <img 
                  src="/phonepe-qr.png" 
                  alt="PhonePe Scan to Pay QR Code" 
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain" 
                />
              </div>
            </div>

            <p className="text-xs tracking-widest uppercase text-primary/40 mb-1">
              Amount to Pay
            </p>
            <p className="text-3xl font-medium text-primary mb-6">
              ₹{finalTotal.toLocaleString()}
            </p>

            {/* UPI Deep Link Button */}
            <a
              href={upiLink}
              className="inline-flex items-center justify-center gap-3 bg-primary text-background w-full py-4 text-sm tracking-[0.15em] uppercase font-medium rounded-lg hover:bg-primary/90 transition-colors mb-4"
            >
              <Smartphone size={18} /> Pay via GPay / UPI App
            </a>
            <p className="text-[10px] text-primary/40 tracking-widest uppercase">
              Opens your UPI app automatically on mobile devices
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-sm font-medium text-primary">
              After payment, complete below:
            </p>

            {/* Upload Screenshot */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
                Upload Payment Screenshot
              </label>
              <label className="flex items-center justify-center border-2 border-dashed border-primary/20 rounded-xl p-6 cursor-pointer hover:border-primary/40 transition-colors bg-white/50">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setFile(e.target.files[0])
                  }
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="text-green-600" size={22} />
                    <span className="text-xs font-medium text-primary truncate max-w-[200px]">
                      {file.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-primary/50">
                    <UploadCloud size={22} />
                    <span className="text-xs">Tap to upload</span>
                  </div>
                )}
              </label>
            </div>

            {/* UTR Number */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
                12-Digit UTR Number
              </label>
              <input
                type="text"
                maxLength={12}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                className="w-full p-4 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary font-mono text-center tracking-[0.25em] transition-colors placeholder:text-primary/25"
                placeholder="123456789012"
                required
              />
            </div>
          </div>

          {/* Store Policy Notice */}
          <div className="flex items-start gap-3 p-4 mt-8 rounded-lg bg-primary/5 mb-6">
            <div className="mt-0.5 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <p className="text-xs text-primary/80 leading-relaxed font-medium">
              Strictly No Cancellation & No Return. All sales are final.
            </p>
          </div>

          <button
            type="submit"
            disabled={utr.length < 12}
            className="w-full bg-primary text-background py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-primary/90 transition-colors rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Place Order
          </button>
        </form>
      )}
    </div>
  );
}

/* ── Reusable Input ── */
function Input({
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
    <div>
      <label className="block text-xs uppercase tracking-widest text-primary/50 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full p-3.5 bg-background border border-primary/15 rounded-xl outline-none focus:border-primary text-primary text-sm transition-colors placeholder:text-primary/25"
      />
    </div>
  );
}
