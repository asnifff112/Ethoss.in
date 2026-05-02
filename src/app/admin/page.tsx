"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, MessageSquare, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error("Failed to sync dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm animate-pulse h-40" />
             ))
        ) : (
          stats.map((stat, i) => {
            const icons: Record<string, any> = {
                "Total Products": Package,
                "Sold Out Items": AlertTriangle,
                "Total Feedbacks": MessageSquare
            };
            const Icon = icons[stat.label] || Package;
            
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                 <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                     <Icon size={24} />
                   </div>
                   <div className="flex items-center text-[10px] font-bold text-primary/50 bg-primary/5 px-3 py-1 rounded-full gap-1 tracking-widest uppercase">
                     {stat.change}
                   </div>
                 </div>
                 <div>
                    <h2 className="text-4xl font-medium text-primary mb-1 tracking-tight">{stat.value}</h2>
                    <p className="text-[10px] text-primary/40 uppercase tracking-[0.3em] font-bold">{stat.label}</p>
                 </div>
                 
                 {/* Decorative background accent */}
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              </div>
            );
          })
        )}
      </div>
      
      {/* Quick Actions Panel */}
      <div className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden group">
         <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-primary/40 mb-6">Quick Actions</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <a href="/admin/products" className="flex items-center gap-4 p-4 rounded-2xl border border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group/item">
             <Package size={20} className="text-primary/40 group-hover/item:text-primary transition-colors" />
             <div>
               <span className="text-sm font-medium text-primary">Manage Products</span>
               <p className="text-[10px] text-primary/40 tracking-wider">Add, edit, or remove items</p>
             </div>
             <ArrowUpRight size={14} className="ml-auto text-primary/20 group-hover/item:text-primary/60 transition-colors" />
           </a>
           <a href="/admin/feedback" className="flex items-center gap-4 p-4 rounded-2xl border border-primary/10 hover:border-primary/30 hover:bg-primary/[0.02] transition-all group/item">
             <MessageSquare size={20} className="text-primary/40 group-hover/item:text-primary transition-colors" />
             <div>
               <span className="text-sm font-medium text-primary">Customer Feedback</span>
               <p className="text-[10px] text-primary/40 tracking-wider">View messages & reviews</p>
             </div>
             <ArrowUpRight size={14} className="ml-auto text-primary/20 group-hover/item:text-primary/60 transition-colors" />
           </a>
         </div>
      </div>
    </div>
  );
}
