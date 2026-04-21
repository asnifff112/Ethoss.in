"use client";

import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    comment: "",
    rating: 0,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: "pending",
          createdAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Could not reach the server. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80svh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-6">
          <CheckCircle size={28} className="text-primary/60" strokeWidth={1.5} />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 mb-2">Thank You</p>
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest mb-4">
          Feedback Received
        </h1>
        <p className="text-sm text-primary/50 tracking-wide max-w-xs leading-relaxed">
          We truly appreciate your words. Your voice helps us craft better pieces.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({ userName: "", userEmail: "", comment: "", rating: 0 });
          }}
          className="mt-10 text-[10px] tracking-[0.2em] uppercase font-bold text-primary/40 hover:text-primary transition-colors border-b border-current pb-0.5"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#faf5ec] py-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary/40 mb-3">Share Your Experience</p>
          <h1 className="text-3xl sm:text-4xl font-serif text-primary uppercase tracking-widest mb-4">
            Feedback
          </h1>
          <p className="text-sm text-primary/50 tracking-wide leading-relaxed max-w-sm mx-auto">
            Your words mean everything to us. Tell us about your experience with Ethoss.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Star Rating */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-primary/50 font-bold">
              How was your experience?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={32}
                    strokeWidth={1.5}
                    className={`transition-colors ${
                      star <= (hoveredRating || formData.rating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-primary/20"
                    }`}
                  />
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-[10px] tracking-widest uppercase text-primary/40">
                {["", "Poor", "Fair", "Good", "Great", "Excellent"][formData.rating]}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] uppercase text-primary/50 font-bold">
              Your Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Aisha Riyaz"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full bg-transparent border-b border-primary/20 focus:border-primary py-3 text-sm text-primary placeholder:text-primary/25 outline-none transition-colors tracking-wide"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] uppercase text-primary/50 font-bold">
              Email Address
            </label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full bg-transparent border-b border-primary/20 focus:border-primary py-3 text-sm text-primary placeholder:text-primary/25 outline-none transition-colors tracking-wide"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] uppercase text-primary/50 font-bold">
              Your Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell us what you love, or how we can improve..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full bg-transparent border-b border-primary/20 focus:border-primary py-3 text-sm text-primary placeholder:text-primary/25 outline-none transition-colors resize-none tracking-wide leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-primary text-[#faf5ec] text-[11px] tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all duration-300 rounded-[2px] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <Send size={14} strokeWidth={2} />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        {/* Bottom note */}
        <p className="text-center text-[10px] text-primary/30 tracking-widest uppercase mt-10">
          Your feedback is private and will only be used to improve our craftsmanship.
        </p>
      </div>
    </div>
  );
}
