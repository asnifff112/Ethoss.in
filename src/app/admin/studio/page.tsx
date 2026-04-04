"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Calendar, User, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function AdminStudioPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/studio");
      const data = await res.json();
      if (res.ok) setSubmissions(data);
    } catch (err) {
      toast.error("Failed to load studio data");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Studio Submissions</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Search submissions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-primary/20 rounded-full bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="animate-spin text-primary/20" size={32} />
                <span className="text-[10px] tracking-widest uppercase text-primary/40">Fetching Designs...</span>
             </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest font-bold border-b border-primary/10">
                <th className="p-4">Submission ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Customization Details</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-primary/30 uppercase tracking-[0.2em] font-medium">
                    No custom designs submitted yet
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="border-b border-primary/5 hover:bg-primary/10 transition-colors">
                    <td className="p-4 font-mono text-primary/50 text-[10px] uppercase">#{s.id.slice(-6)}</td>
                    <td className="p-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-primary flex items-center gap-1.5"><User size={12} className="text-primary/30" />{s.userName || "Guest User"}</span>
                            <span className="text-[10px] text-primary/40">{s.userEmail || "no-email@ethoss.in"}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="grid grid-cols-1 gap-1">
                            <div className="flex gap-2">
                                <span className="bg-primary/5 text-primary/60 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tighter">Material: {s.material}</span>
                                <span className="bg-primary/5 text-primary/60 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-tighter">Size: {s.size}</span>
                            </div>
                            <div className="text-[10px] text-primary/70 line-clamp-1 italic">
                                Elements: {s.selections?.join(", ") || "Custom Blend"}
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className="text-primary/60 flex items-center gap-1.5 whitespace-nowrap"><Calendar size={12} className="text-primary/30" />{new Date(s.createdAt || Date.now()).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 text-right">
                        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full font-bold text-[9px] uppercase tracking-widest">
                            {s.status || "Pending"}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
