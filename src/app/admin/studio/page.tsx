"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Info, CheckCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StudioSubmission {
  id: string;
  userName: string;
  userEmail: string;
  requestType: string;
  details: string;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Completed' | 'Rejected';
  createdAt: string;
}

export default function AdminStudioPage() {
  const [submissions, setSubmissions] = useState<StudioSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<StudioSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("http://localhost:5000/studio_submissions");
      const data = await res.json();
      if (res.ok) setSubmissions(data);
    } catch (err) {
      toast.error("Failed to load studio requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/studio_submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Request marked as ${newStatus}`);
        fetchSubmissions();
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Remove this request?")) return;
    try {
      const res = await fetch(`http://localhost:5000/studio_submissions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSubmissions(submissions.filter(s => s.id !== id));
        toast.success("Request removed");
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Ethoss Studio</h1>
        <div className="bg-primary/5 px-4 py-2 rounded-full flex items-center gap-2">
            <Sparkles size={14} className="text-primary/40 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary/60">{submissions.length} Total Requests</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-primary/20" size={32} />
            <span className="text-[10px] tracking-widest uppercase text-primary/40">Searching for inspiration...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest font-bold border-b border-primary/10">
                <th className="p-4">Customer</th>
                <th className="p-4">Request Type</th>
                <th className="p-4">Submission Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-primary/30 uppercase tracking-[0.2em] font-medium">
                     No custom requests currently
                   </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-primary uppercase tracking-wider">{s.userName}</span>
                            <span className="text-[10px] text-primary/40">{s.userEmail}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className="px-3 py-1 bg-primary/5 text-primary/70 rounded-full font-medium italic">{s.requestType}</span>
                    </td>
                    <td className="p-4 text-primary/40 uppercase tracking-widest font-bold">
                        {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                        <select 
                            value={s.status} 
                            onChange={(e) => updateStatus(s.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest outline-none border transition-all ${
                                s.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                                s.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                                'bg-amber-50 text-amber-600 border-amber-100'
                            }`}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => setSelectedSubmission(s)}
                                className="p-2 text-primary/40 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                                title="View details"
                             >
                                <Info size={16} />
                             </button>
                             <button 
                                onClick={() => deleteSubmission(s.id)}
                                className="p-2 text-primary/40 hover:text-red-500 transition-colors hover:bg-red-50 rounded-full"
                                title="Delete"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-bold tracking-widest uppercase text-primary/40">Studio Submission</h2>
                        <span className="text-xl font-serif font-bold text-primary uppercase tracking-widest">#{selectedSubmission.id.slice(-6)}</span>
                    </div>
                    <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-primary/5 rounded-full shadow-sm"><span className="text-xl">×</span></button>
                </div>

                <div className="space-y-6">
                    <div className="p-5 bg-primary/[0.02] border border-primary/5 rounded-2xl">
                        <span className="text-[9px] uppercase tracking-tighter text-primary/40 block mb-2 font-bold">Concept Detail</span>
                        <p className="text-sm text-primary leading-relaxed serif italic">
                           &ldquo;{selectedSubmission.details}&rdquo;
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-tighter text-primary/40 font-bold">Inquiry Status</span>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                <Clock size={12} className="text-amber-500" /> {selectedSubmission.status}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-tighter text-primary/40 font-bold">Contact Channel</span>
                            <span className="text-xs font-medium text-primary mt-1">{selectedSubmission.userEmail}</span>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="mt-10 w-full bg-primary text-background py-4 rounded-xl text-[10px] font-bold tracking-[0.3em] uppercase"
                >
                    Dismiss Analysis
                </button>
             </div>
          </div>
      )}
    </div>
  );
}
