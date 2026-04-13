"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Loader2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: string;
  userName: string;
  userEmail: string;
  comment: string;
  rating: number;
  status: 'approved' | 'pending';
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    comment: "",
    rating: 5
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (res.ok) setFeedbacks(data);
    } catch (err) {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: 'approved',
          createdAt: new Date().toISOString()
        })
      });

      if (res.ok) {
        toast.success("Manual feedback added");
        fetchFeedback();
        setIsModalOpen(false);
        setFormData({ userName: "", userEmail: "", comment: "", rating: 5 });
      }
    } catch (err) {
      toast.error("Failed to save feedback");
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Remove this feedback?")) return;
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setFeedbacks(feedbacks.filter(f => f.id !== id));
        toast.success("Feedback removed");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Feedback Center</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-background px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase flex items-center gap-2"
        >
          <Plus size={18} /> Add Manual Feedback
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-primary/20" size={32} />
            <span className="text-[10px] tracking-widest uppercase text-primary/40">Gathering voices...</span>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.length === 0 ? (
              <div className="col-span-full py-20 text-center text-primary/30 uppercase tracking-widest text-[10px]">No feedback recorded yet</div>
            ) : (
              feedbacks.map((f) => (
                <div key={f.id} className="p-6 bg-primary/[0.02] border border-primary/5 rounded-2xl flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">{f.userName}</span>
                        <span className="text-[10px] text-primary/40">{f.userEmail}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} className={i < f.rating ? "text-amber-500 fill-amber-500" : "text-primary/10"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-primary/70 leading-relaxed italic">&ldquo;{f.comment}&rdquo;</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-primary/5 flex justify-between items-center">
                    <span className="text-[9px] text-primary/30 uppercase tracking-widest font-bold">
                      {new Date(f.createdAt || '').toLocaleDateString()}
                    </span>
                    <button onClick={() => deleteFeedback(f.id)} className="p-2 text-primary/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-6 text-primary">Upload Manual Feedback</h2>
            <form onSubmit={handleAddManual} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-primary/40 tracking-widest block mb-1">Customer Name</label>
                <input required className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm" value={formData.userName} onChange={(e) => setFormData({...formData, userName: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase text-primary/40 tracking-widest block mb-1">Customer Email</label>
                <input required type="email" className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm" value={formData.userEmail} onChange={(e) => setFormData({...formData, userEmail: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] uppercase text-primary/40 tracking-widest block mb-1" >Rating (1-5)</label>
                <input type="number" min="1" max="5" required className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] uppercase text-primary/40 tracking-widest block mb-1">Comment</label>
                <textarea required className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm min-h-[100px]" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest border border-primary/10 font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-background px-6 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
