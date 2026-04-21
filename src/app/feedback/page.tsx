"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, CheckCircle, X, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feedback {
  id: string;
  userName: string;
  userEmail?: string;
  comment: string;
  rating: number;
  createdAt: string;
  status?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Star Row (read-only) ─────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          strokeWidth={1.5}
          className={s <= rating ? "text-amber-500 fill-amber-500" : "text-primary/15"}
        />
      ))}
    </div>
  );
}

// ─── View-All Modal ───────────────────────────────────────────────────────────
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Fetch all feedbacks
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/feedback");
        if (!res.ok) throw new Error();
        const data: Feedback[] = await res.json();
        // Only show approved / show all if status field absent
        setFeedbacks(data.filter((f) => !f.status || f.status === "approved"));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[999] bg-primary/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative bg-[#faf5ec] w-full sm:max-w-lg sm:rounded-[4px] max-h-[85svh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-primary/10 flex-shrink-0">
          <div>
            <p className="text-[9px] tracking-[0.35em] uppercase text-primary/40 mb-0.5">
              Community
            </p>
            <h2 className="text-lg font-serif text-primary uppercase tracking-widest">
              All Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-primary/40 hover:text-primary transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary/60 rounded-full animate-spin" />
              <p className="text-[10px] tracking-widest uppercase text-primary/40">Loading…</p>
            </div>
          )}

          {error && !loading && (
            <p className="text-center text-sm text-primary/40 py-12 tracking-wide">
              Could not load feedback. Please try again later.
            </p>
          )}

          {!loading && !error && feedbacks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <MessageSquareQuote size={32} strokeWidth={1} className="text-primary/20" />
              <p className="text-sm text-primary/50 tracking-wide leading-relaxed max-w-[220px]">
                No feedbacks yet. Be the first to share your thoughts! ✨
              </p>
            </div>
          )}

          {!loading && !error && feedbacks.length > 0 && (
            <ul className="space-y-0">
              {feedbacks.map((fb, idx) => (
                <li
                  key={fb.id}
                  className={`py-5 ${idx !== feedbacks.length - 1 ? "border-b border-primary/[0.07]" : ""}`}
                >
                  {/* Top row: name + time */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-[13px] font-bold text-primary tracking-wide uppercase leading-none">
                      {fb.userName}
                    </p>
                    <span className="text-[10px] text-primary/30 tracking-widest flex-shrink-0 mt-0.5">
                      {timeAgo(fb.createdAt)}
                    </span>
                  </div>

                  {/* Star rating */}
                  <StarRow rating={fb.rating} />

                  {/* Comment */}
                  <p className="text-[13px] text-primary/65 leading-relaxed tracking-wide mt-2">
                    {fb.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer count */}
        {!loading && !error && feedbacks.length > 0 && (
          <div className="px-6 py-3 border-t border-primary/10 flex-shrink-0">
            <p className="text-[10px] text-primary/30 tracking-widest uppercase text-center">
              {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"} from our community
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = useCallback(() => setModalOpen(false), []);

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
          status: "approved",
          createdAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        // Non-2xx response — surface the real server message
        let serverMessage = "Server error. Please try again.";
        try {
          const errBody = await res.json();
          serverMessage = errBody?.message || serverMessage;
        } catch { /* ignore JSON parse failure */ }
        console.error(`[Feedback Submit] HTTP ${res.status}:`, serverMessage);
        toast.error(serverMessage);
      }
    } catch (error) {
      // Network-level failure (offline, DNS, CORS, etc.)
      console.error("[Feedback Submit] Network error:", error);
      toast.error("Could not reach the server. Check your connection and try again.");
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
        <div className="mt-10 flex items-center gap-6">
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ userName: "", userEmail: "", comment: "", rating: 0 });
            }}
            className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary/40 hover:text-primary transition-colors border-b border-current pb-0.5"
          >
            Submit Another
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary hover:text-primary/60 transition-colors border-b border-current pb-0.5"
          >
            View All ↗
          </button>
        </div>
        {modalOpen && <FeedbackModal onClose={closeModal} />}
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#faf5ec] py-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-primary/40 mb-3">
            Share Your Experience
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-primary uppercase tracking-widest mb-4">
            Feedback
          </h1>
          <p className="text-sm text-primary/50 tracking-wide leading-relaxed max-w-sm mx-auto">
            Your words mean everything to us. Tell us about your experience with Ethoss.
          </p>

          {/* View All Button */}
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 border border-primary/20 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold text-primary/60 hover:border-primary hover:text-primary transition-all duration-300"
          >
            <MessageSquareQuote size={12} strokeWidth={2} />
            View All Reviews
          </button>
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

      {/* Modal */}
      {modalOpen && <FeedbackModal onClose={closeModal} />}
    </div>
  );
}
