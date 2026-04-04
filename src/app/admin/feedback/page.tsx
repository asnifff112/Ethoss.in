"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, MessageSquare, User, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Feedback {
  id: string;
  userName: string;
  userEmail: string;
  comment: string;
  rating: number;
  image_url?: string;
  status: 'pending' | 'approved';
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    comment: "",
    rating: 5,
    image_url: "",
    status: 'approved' as const
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (res.ok) setFeedbacks(data);
    } catch (err) {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Feedback added successfully");
        fetchFeedbacks();
        setIsModalOpen(false);
        setFormData({ userName: "", userEmail: "", comment: "", rating: 5, image_url: "", status: 'approved' });
      } else {
        toast.error("Failed to add feedback");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Feedback & Reviews</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-6 py-3 rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus size={18} /> New Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm animate-pulse h-48" />
             ))
        ) : (
          feedbacks.length === 0 ? (
            <div className="col-span-full py-20 text-center text-primary/30 uppercase tracking-[0.2em] font-medium border-2 border-dashed border-primary/10 rounded-3xl bg-white">
                No feedback entries found
            </div>
          ) : (
            feedbacks.map((f) => (
              <div key={f.id} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm flex flex-col justify-between group transition-all hover:bg-primary/5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/5">
                            {f.image_url ? (
                                <Image src={f.image_url} alt={f.userName} width={40} height={40} className="object-cover" />
                            ) : (
                                <User size={18} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{f.userName}</span>
                            <span className="text-[10px] text-primary/40 leading-none">{f.userEmail}</span>
                        </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold ml-1">{f.rating}</span>
                    </div>
                </div>
                
                <p className="text-xs text-primary/70 leading-relaxed italic mb-6">"{f.comment}"</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                        {f.status}
                    </span>
                    <button className="text-primary/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                    </button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Manual Feedback Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">New Testimonial</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold">User Name</label>
                            <input 
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                                value={formData.userName}
                                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold">Email Address</label>
                            <input 
                                required
                                type="email"
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all"
                                value={formData.userEmail}
                                onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                            />
                        </div>

                        <div>
                             <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold font-serif">Original Message</label>
                             <textarea 
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all min-h-[100px] resize-none font-serif italic"
                                value={formData.comment}
                                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                             />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold tracking-widest">Rating (1-5)</label>
                                <select 
                                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all appearance-none"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                                >
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold tracking-widest">User Photo URL</label>
                                <input 
                                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all"
                                    placeholder="https://"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                />
                             </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-primary text-background py-4 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
                    >
                        Confirm Submission
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
