"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  Loader2,
  Lock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import axios from "axios";
import { toast } from "sonner";

const PHONEPE_MERCHANT_ID = "M2357RW0W64S2";
const PHONEPE_CLIENT_VERSION = "1";

export default function PaymentPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const form = useCheckoutStore((s) => s.form);
  const clearForm = useCheckoutStore((s) => s.clearForm);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "processing" | "verifying">("idle");

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 100;
  const finalTotal = subtotal + shipping;

  // Guard: redirect if no cart or no billing form was filled
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    if (!form) {
      router.push("/checkout");
    }
  }, [items, form, router]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const timeout = setTimeout(() => {
      el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  const handlePayment = async () => {
    if (!form || !user || isProcessing) return;

    setIsProcessing(true);
    setPaymentStep("processing");

    const toastId = toast.loading("Initiating secure PhonePe payment...");

    // Step 1: Simulate PhonePe gateway processing (2.5s)
    await new Promise((r) => setTimeout(r, 1500));
    setPaymentStep("verifying");
    toast.loading("Verifying payment & securing your order...", { id: toastId });
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const orderId = `ord-${Date.now()}`;
      const orderData = {
        id: orderId,
        userId: user.id,
        customerName: `${form.firstName} ${form.lastName}`.trim(),
        customerEmail: user.email,
        phone: form.mobile,
        address: [
          form.addressLine1,
          form.addressLine2,
          form.city,
          form.district,
          form.state,
          form.pincode,
        ]
          .filter(Boolean)
          .join(", "),
        productName:
          items[0].name +
          (items.length > 1 ? ` (+${items.length - 1} more)` : ""),
        quantity: items.reduce((acc, item) => acc + item.quantity, 0),
        totalPrice: finalTotal,
        status: "Processing",
        paymentStatus: "Paid",
        paymentMethod: "PhonePe",
        merchantId: PHONEPE_MERCHANT_ID,
        createdAt: new Date().toISOString(),
        notes: form.notes || "",
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image_url: i.image_url,
          shipping: i.shippingPrice || 0,
        })),
      };

      // 1. POST the order to db.json
      await axios.post("/api/orders", orderData);

      // 2. Exact Stock Deduction — subtract purchased qty for every item
      //    The API auto-toggles isAvailable & showLowStock based on new stock
      await Promise.allSettled(
        items.map((item) =>
          axios.patch(`/api/products/${item.id}`, {
            decrementBy: item.quantity,
          })
        )
      );

      // 3. Clear cart and form state
      clearCart();
      clearForm();

      toast.dismiss(toastId);
      toast.success("Payment Successful! 🎉", {
        description: "Order ID: " + orderId,
      });

      // 4. Redirect to success page
      router.push(
        `/checkout/success?orderId=${orderId}&total=${finalTotal}&name=${encodeURIComponent(orderData.customerName)}`
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Payment processing failed. Please try again.");
      setIsProcessing(false);
      setPaymentStep("idle");
    }
  };

  if (items.length === 0 || !form) return null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-primary pb-24"
    >
      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 pb-4">
        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-primary/50 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Edit Billing Details
        </Link>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span className="text-primary/30 line-through">1. Billing</span>
          <div className="flex-1 h-px bg-primary/10" />
          <span className="font-bold text-primary border-b-2 border-primary pb-0.5">
            2. Payment
          </span>
          <div className="flex-1 h-px bg-primary/10" />
          <span className="text-primary/30">3. Confirm</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 mt-6">

        {/* ── LEFT: PhonePe Payment Panel ── */}
        <div className="flex flex-col gap-6">
          {/* PhonePe branded card */}
          <div
            className="rounded-2xl overflow-hidden border border-primary/10 shadow-xl shadow-primary/5"
            style={{
              background: "linear-gradient(135deg, #1a0a3c 0%, #2d1b69 50%, #3d2494 100%)",
            }}
          >
            {/* Card header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* PhonePe Logo Mock */}
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                    <span className="text-[#5f259f] font-black text-sm tracking-tight">Pe</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm tracking-widest uppercase">PhonePe</p>
                    <p className="text-white/50 text-[10px] tracking-widest">Payment Gateway</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                  <Lock size={10} className="text-green-400" />
                  <span className="text-[10px] text-white/80 font-medium tracking-wider">SSL SECURED</span>
                </div>
              </div>
            </div>

            {/* Merchant Info */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Merchant ID</p>
                  <p className="text-white font-mono text-xs font-bold tracking-wider">{PHONEPE_MERCHANT_ID}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Client Version</p>
                  <p className="text-white font-mono text-xs font-bold tracking-wider">v{PHONEPE_CLIENT_VERSION}</p>
                </div>
              </div>

              {/* Payment amount display */}
              <div className="bg-white/10 rounded-2xl p-5 text-center border border-white/10">
                <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Amount to Pay</p>
                <p className="text-white text-4xl font-bold font-serif">
                  ₹{finalTotal.toLocaleString()}
                  <span className="text-lg text-white/60">.00</span>
                </p>
                <p className="text-white/40 text-[10px] mt-1 tracking-widest">
                  ETHOSS.IN · {items.length} item{items.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* UPI ID display */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white/40 text-[9px] uppercase tracking-widest mb-2">Paying to</p>
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-white/60" />
                  <p className="text-white text-sm font-medium">ethoss@ybl</p>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div className="p-6 pt-0">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                style={{
                  background: isProcessing
                    ? "rgba(255,255,255,0.1)"
                    : "linear-gradient(135deg, #f8f0ff 0%, #fff 100%)",
                  color: isProcessing ? "rgba(255,255,255,0.6)" : "#5f259f",
                  boxShadow: isProcessing ? "none" : "0 4px 20px rgba(95,37,159,0.4)",
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>
                      {paymentStep === "processing"
                        ? "Initiating Payment..."
                        : "Verifying & Securing..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Pay ₹{finalTotal.toLocaleString()} via PhonePe</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {[
              { icon: ShieldCheck, text: "PCI DSS Compliant" },
              { icon: Lock, text: "256-bit SSL" },
              { icon: CheckCircle2, text: "RBI Regulated" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-primary/40">
                <Icon size={13} />
                <span className="text-[9px] uppercase tracking-widest font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="flex flex-col gap-6">
          <div className="border border-primary/10 rounded-2xl overflow-hidden bg-primary/[0.015]">
            <div className="p-6 border-b border-primary/8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary/60">
                Order Summary
              </h2>
            </div>

            {/* Items */}
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold uppercase tracking-wider truncate text-primary">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-primary/40 mt-0.5">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="px-4 pb-4 space-y-2 border-t border-primary/8 pt-4">
              <div className="flex justify-between text-[11px] text-primary/50 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-primary/50 uppercase tracking-widest">
                <span>Shipping</span>
                <span className="font-semibold text-green-700">
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-primary/8 mt-2">
                <span className="uppercase tracking-wider">Total</span>
                <span>₹{finalTotal.toLocaleString()}.00</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border border-primary/8 rounded-xl p-4 space-y-2 bg-primary/[0.01]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary/40 mb-3">
              Delivering To
            </p>
            <p className="text-sm font-medium text-primary">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-xs text-primary/50 leading-relaxed">
              {form.addressLine1}
              {form.addressLine2 && `, ${form.addressLine2}`},<br />
              {form.city}, {form.district}, {form.state} — {form.pincode}
            </p>
            <p className="text-[10px] text-primary/40 flex items-center gap-1 mt-1">
              <Smartphone size={11} />
              {form.mobile}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
