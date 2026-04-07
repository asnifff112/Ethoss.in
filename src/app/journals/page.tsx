"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, X, Camera, Send, Star } from "lucide-react";
import gsap from "gsap";

// Mock data for initial journals
const INITIAL_JOURNALS = [
  {
    id: "1",
    username: "wanderlust_kerala",
    rating: 5,
    text: "The Onyx Essence bracelet is so minimalist and perfect for daily wear. Love the handcrafted feel!",
    image_url: "/catsection/img2.jpeg", // Using existing images as placeholders
    status: "approved",
  },
  {
    id: "2",
    username: "minimalist_soul",
    rating: 4,
    text: "Truly unique pieces. You can feel the effort put into each bead. Highly recommend Ethoss for quality jewellery.",
    image_url: "/earthbound-soul.png",
    status: "approved",
  },
  {
    id: "3",
    username: "artisan_lover",
    rating: 5,
    text: "Best macrame work I've seen in a while. The colors are so earthy and natural.",
    image_url: "/intricate-weaves.png",
    status: "approved",
  },
  {
    id: "4",
    username: "kerala_diaries",
    rating: 4,
    text: "Bought this for my friend and she's obsessed with it. The packaging was also very premium.",
    status: "approved",
  },
  {
    id: "5",
    username: "craft_junkie",
    rating: 5,
    text: "The attention to detail is insane. Definitely coming back for more!",
    image_url: "/catsection/img2.jpeg",
    status: "approved",
  }
];

export default function JournalsPage() {
  const [journals, setJournals] = useState(INITIAL_JOURNALS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Journals from Backend
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/feedbacks/");
      const data = await res.json();
      if (res.ok) {
        // Filter approved journals and map to frontend format
        const approved = data
          .filter((f: any) => f.status === 'approved')
          .map((f: any) => ({
            id: f.id,
            username: f.userName,
            rating: f.rating,
            text: f.comment,
            image_url: f.image_url,
            status: f.status
          }));
        setJournals(approved.length > 0 ? approved : INITIAL_JOURNALS);
      }
    } catch (err) {
      console.error("Failed to load journals", err);
    }
  };

  // Entrance animations
  useEffect(() => {
    gsap.fromTo(
      ".journal-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );
  }, [journals]);

  // Modal animation
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(modalRef.current, { opacity: 1, duration: 0.3, display: "flex" });
    } else {
      document.body.style.overflow = "";
      gsap.to(modalRef.current, { opacity: 0, duration: 0.3, display: "none" });
    }
  }, [isModalOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim() || rating === 0) {
      alert("Please provide a review and a rating.");
      return;
    }

    const newEntry = {
      id: `f-${Date.now()}`,
      userName: "user_" + Math.floor(Math.random() * 1000),
      userEmail: "guest@ethoss.in",
      rating: rating,
      comment: newReview,
      image_url: selectedImage || "",
      status: "pending",
    };

    try {
      const res = await fetch("http://localhost:8000/api/feedbacks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewReview("");
        setRating(0);
        setSelectedImage(null);
        alert("Journal submitted! It will appear after admin approval.");
      }
    } catch (err) {
      alert("Failed to submit journal");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-8 lg:px-12 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-primary/40 mb-3">Community</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-primary uppercase tracking-wider mb-6">Journals</h1>
          <p className="text-primary/60 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Stories of handcrafted moments shared by our community.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {journals.map((journal) => (
            <div 
              key={journal.id} 
              className="journal-card break-inside-avoid bg-white/50 backdrop-blur-sm border border-primary/5 rounded-2xl overflow-hidden p-6 hover:border-primary/20 transition-all duration-300 group shadow-sm"
            >
              {journal.image_url && (
                <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-primary/5">
                  <Image 
                    src={journal.image_url} 
                    alt="User photo" 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {journal.username[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-medium tracking-widest text-primary/60">
                    @{journal.username}
                  </span>
                </div>
                
                {/* Star Rating Display */}
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={12}
                      className={star <= (journal.rating || 0) ? "fill-primary text-primary" : "text-primary/20"}
                    />
                  ))}
                </div>
              </div>

              {/* Serif Font for Quotes */}
              <blockquote className="font-serif text-lg text-primary/80 leading-relaxed italic">
                &ldquo;{journal.text}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* FAB - Sticky bottom button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-background px-6 py-4 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-xs font-bold tracking-[0.2em] uppercase">Write a Journal</span>
      </button>

      {/* Modal / BottomSheet */}
      <div 
        ref={modalRef}
        className="fixed inset-0 z-50 hidden items-center justify-center bg-primary/20 backdrop-blur-md p-4"
      >
        <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-primary/10 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest uppercase text-primary">Write Your Story</h2>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-primary/5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Star Rating Selector */}
            <div>
              <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-3">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-110"
                  >
                    <Star 
                      size={24}
                      className={`transition-colors ${
                        star <= (hoveredRating || rating) 
                        ? "fill-primary text-primary" 
                        : "text-primary/10"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Your Review</label>
              <textarea 
                required
                className="w-full h-32 bg-primary/[0.03] border border-primary/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/30 transition-colors resize-none font-serif italic text-lg"
                placeholder="How do you feel wearing Ethoss?"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
              />
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Photo (Optional)</label>
              <div 
                className="relative w-full aspect-video bg-primary/[0.03] border-2 border-dashed border-primary/10 rounded-xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImage ? (
                  <>
                    <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full shadow-md"
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera size={24} className="text-primary/20" />
                    <span className="text-[10px] tracking-widest uppercase text-primary/40">Upload Photo</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-background py-4 rounded-xl flex items-center justify-center gap-3 font-bold tracking-[0.2em] uppercase text-xs hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              Submit Journal <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
