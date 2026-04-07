"use client";

import { useState, useEffect } from "react";
import { Package, Users, IndianRupee, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/stats/");
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
                "Total Sales": IndianRupee,
                "Pending Orders": Package,
                "Active Users": Users
            };
            const Icon = icons[stat.label] || Package;
            
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
                 <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                     <Icon size={24} />
                   </div>
                   <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full gap-1 tracking-widest uppercase">
                     <ArrowUpRight size={12} /> {stat.change}
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
      
      {/* Visual Data Representation Placeholder */}
      <div className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm h-96 flex flex-col justify-center items-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/[0.01] group-hover:bg-transparent transition-colors" />
         <div className="flex flex-col items-center gap-4 relative z-10">
            <Loader2 className="text-primary/10 animate-spin-slow" size={48} strokeWidth={1} />
            <p className="text-[10px] text-primary/30 uppercase tracking-[0.5em] font-bold animate-pulse">
               Visualizing Growth Trends...
            </p>
         </div>
      </div>
    </div>
  );
}
