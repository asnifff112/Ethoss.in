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
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useCartStore, useAuthStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import axios from "axios";
import { toast } from "sonner";

// ─── Real UPI ID ───────────────────────────────────────────────
const UPI_ID = "9746156270@ybl";
const UPI_NAME = "ETHOSS";

// ─── UPI App Definitions ───────────────────────────────────────
const UPI_APPS = [
  {
    name: "GPay",
    color: "#4285F4",
    bg: "#e8f0fe",
    label: "G",
    scheme: (link: string) => link,
  },
  {
    name: "PhonePe",
    color: "#5f259f",
    bg: "#f3eeff",
    label: "Pe",
    scheme: (link: string) => link.replace("upi://", "phonepe://"),
  },
  {
    name: "Paytm",
    color: "#00BAF2",
    bg: "#e0f7fe",
    label: "Pt",
    scheme: (link: string) => link.replace("upi://", "paytmmp://"),
  },
  {
    name: "BHIM",
    color: "#1a2f67",
    bg: "#eef0f8",
    label: "B",
    scheme: (link: string) => link,
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const orderId = useRef(`ord-${Date.now()}`);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const form = useCheckoutStore((s) => s.form);
  const clearForm = useCheckoutStore((s) => s.clearForm);

  const [step, setStep] = useState<"select" | "upi_pending" | "confirming">("select");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 100;
  const finalTotal = subtotal + shipping;

  // Guard: redirect if no cart or no billing form
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

  // ─── Generate UPI Deep Link ────────────────────────────────
  const generateUpiLink = (oid: string) => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      am: finalTotal.toString(),
      cu: "INR",
      tn: `ETHOSS Order ${oid}`,
    });
    return `upi://pay?${params.toString()}`;
  };

  // ─── Open UPI App ──────────────────────────────────────────
  const handleOpenApp = (app: (typeof UPI_APPS)[0]) => {
    setSelectedApp(app.name);
    const upiLink = generateUpiLink(orderId.current);
    const appLink = app.scheme(upiLink);

    // Open the UPI deep link — phone handles which app to use
    window.location.href = appLink;

    // After 2s the user has (likely) switched to the UPI app — show confirm
    setTimeout(() => {
      setStep("upi_pending");
    }, 2000);
  };

  // ─── Confirm Payment (after user returns from UPI app) ────
  const handleConfirmPayment = async () => {
    if (!form || !user) return;
    setStep("confirming");

    try {
      const orderData = {
        id: orderId.current,
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
          items[0].name + (items.length > 1 ? ` (+${items.length - 1} more)` : ""),
        quantity: items.reduce((acc, item) => acc + item.quantity, 0),
        totalPrice: finalTotal,
        status: "Processing",
        paymentStatus: "Paid",
        paymentMethod: selectedApp || "UPI",
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

      // 1. Save order to db.json
      await axios.post("/api/orders", orderData);

      // 2. Deduct stock for each purchased item
      await Promise.allSettled(
        items.map((item) =>
          axios.patch(`/api/products/${item.id}`, { decrementBy: item.quantity })
        )
      );

      // 3. Clear cart and form state
      clearCart();
      clearForm();

      toast.success("Order Placed Successfully! 🎉");
      router.push(
        `/checkout/success?orderId=${orderId.current}&total=${finalTotal}&name=${encodeURIComponent(orderData.customerName)}`
      );
    } catch (err) {
      toast.error("Something went wrong. Please contact support.");
      setStep("upi_pending");
    }
  };

  if (items.length === 0 || !form) return null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-primary pb-24"
    >
      {/* ── Progress Bar ── */}
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

        {/* ── LEFT: UPI Payment Panel ── */}
        <div className="flex flex-col gap-6">

          {/* ────────── STEP 1: Choose App ────────── */}
          {step === "select" && (
            <div className="rounded-2xl border border-primary/10 overflow-hidden shadow-lg shadow-primary/5">
              {/* Header */}
              <div className="p-6 border-b border-primary/8 bg-primary/[0.02]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary/40 mb-1">
                      Secure UPI Payment
                    </p>
                    <h2 className="text-lg font-serif font-bold text-primary uppercase tracking-wider">
                      Choose Payment App
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
                    <Lock size={10} className="text-green-600" />
                    <span className="text-[9px] text-green-700 font-bold tracking-wider uppercase">Secured</span>
                  </div>
                </div>
              </div>

              {/* Amount display */}
              <div className="px-6 pt-6 pb-2">
                <div className="bg-primary/[0.03] border border-primary/8 rounded-2xl p-5 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-1">Amount to Pay</p>
                  <p className="text-4xl font-bold font-serif text-primary">
                    ₹{finalTotal.toLocaleString()}
                    <span className="text-xl text-primary/40">.00</span>
                  </p>
                  <p className="text-[10px] text-primary/30 mt-1 tracking-widest uppercase">
                    ETHOSS.IN · {items.length} item{items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* UPI ID pill */}
              <div className="px-6 pt-3 pb-2">
                <div className="flex items-center gap-2 text-[10px] text-primary/40 uppercase tracking-widest">
                  <Smartphone size={11} />
                  <span>Paying to:</span>
                  <span className="font-mono font-bold text-primary/70">{UPI_ID}</span>
                </div>
              </div>

              {/* App Grid */}
              <div className="p-6 grid grid-cols-2 gap-3">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.name}
                    onClick={() => handleOpenApp(app)}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-200 active:scale-[0.97] text-left"
                  >
                    {/* App Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm shadow-sm"
                      style={{ background: app.bg, color: app.color }}
                    >
                      {app.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-primary tracking-wide">{app.name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-primary/40 group-hover:text-primary/60 transition-colors">
                        Open App →
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-primary/20 group-hover:text-primary/50 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              <p className="px-6 pb-6 text-[10px] text-primary/30 text-center tracking-wide">
                Tap an app — your UPI app will open automatically to complete payment.
              </p>
            </div>
          )}

          {/* ────────── STEP 2: Awaiting Payment Confirmation ────────── */}
          {step === "upi_pending" && (
            <div className="rounded-2xl border border-primary/10 overflow-hidden shadow-lg shadow-primary/5">
              <div className="p-8 flex flex-col items-center text-center gap-5">
                {/* Check circle */}
                <div className="w-20 h-20 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-primary" strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/40 mb-2">
                    Complete Payment in
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-primary uppercase tracking-wider">
                    {selectedApp}
                  </h2>
                </div>

                {/* Amount reminder */}
                <div className="bg-primary/[0.03] border border-primary/8 rounded-2xl px-8 py-4 w-full">
                  <p className="text-[9px] uppercase tracking-widest text-primary/40 mb-1">Pay exactly</p>
                  <p className="text-3xl font-bold font-serif text-primary">
                    ₹{finalTotal.toLocaleString()}<span className="text-lg text-primary/40">.00</span>
                  </p>
                </div>

                <p className="text-[11px] text-primary/50 leading-relaxed max-w-xs">
                  After paying <strong>₹{finalTotal.toLocaleString()}</strong> in {selectedApp}, come back here and tap{" "}
                  <strong>Confirm Order</strong>.
                </p>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmPayment}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-widest uppercase rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                >
                  <CheckCircle2 size={18} />
                  I have Paid — Confirm Order
                </button>

                {/* Try another app */}
                <button
                  onClick={() => setStep("select")}
                  className="text-[10px] text-primary/40 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Didn&apos;t work? Try another app
                </button>
              </div>
            </div>
          )}

          {/* ────────── STEP 3: Placing Order ────────── */}
          {step === "confirming" && (
            <div className="rounded-2xl border border-primary/10 overflow-hidden shadow-lg shadow-primary/5">
              <div className="p-16 flex flex-col items-center text-center gap-6">
                <Loader2 size={40} className="animate-spin text-primary/40" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">
                    Placing your order...
                  </p>
                  <p className="text-[10px] text-primary/40 mt-2 tracking-wide">
                    Saving your order securely. Please don&apos;t close this page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            {[
              { icon: ShieldCheck, text: "UPI Secured" },
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

        {/* ── RIGHT: Order Summary (unchanged) ── */}
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
