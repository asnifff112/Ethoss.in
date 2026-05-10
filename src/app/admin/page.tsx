"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, MessageSquare, ArrowUpRight, Loader2, Users, Banknote, Calendar, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    customerName: "",
    quantity: "1",
    saleDate: new Date().toISOString().split('T')[0],
    status: "Completed"
  });

  useEffect(() => {
    fetchStats();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.price || !formData.customerName) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        })
      });
      if (res.ok) {
        toast.success("Sale recorded successfully");
        setFormData({
            productName: "",
            price: "",
            customerName: "",
            quantity: "1",
            saleDate: new Date().toISOString().split('T')[0],
            status: "Completed"
        });
        fetchStats(); // Refresh revenue card
      } else {
        toast.error("Failed to record sale");
      }
    } catch (err) {
      toast.error("Error submitting sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading ? (
             Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm animate-pulse h-40" />
             ))
        ) : (
          stats.map((stat, i) => {
            const icons: Record<string, any> = {
                "Total Revenue": Banknote,
                "Total Products": Package,
                "Total Feedbacks": MessageSquare,
                "Total Users": Users
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Sales Logger Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-primary/10 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary">
               <Plus size={20} />
             </div>
             <div>
               <h2 className="text-sm font-bold tracking-widest uppercase text-primary">Record New Sale</h2>
               <p className="text-[10px] text-primary/40 uppercase tracking-widest">Manual entry for offline orders</p>
             </div>
          </div>

          <form onSubmit={handleSaleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary/50 uppercase tracking-widest ml-1">Product Name</label>
              <select 
                value={formData.productName}
                onChange={(e) => setFormData({...formData, productName: e.target.value})}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-primary/30 transition-all appearance-none"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p.name}>{p.name}</option>
                ))}
                <option value="Custom">Custom / Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary/50 uppercase tracking-widest ml-1">Price (₹)</label>
              <input 
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary/50 uppercase tracking-widest ml-1">Customer Name</label>
              <input 
                type="text"
                placeholder="Enter name"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-primary/30 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary/50 uppercase tracking-widest ml-1">Qty</label>
                <input 
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-primary/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary/50 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                  className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSubmitting ? "Recording..." : "Record Sale"}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips or Small Info */}
        <div className="space-y-6">
           <div className="bg-primary text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xs font-bold tracking-widest uppercase mb-4 opacity-60">Revenue Insight</h3>
               <p className="text-xl font-serif mb-4 italic">"Growth is a process of small, consistent actions."</p>
               <p className="text-[10px] tracking-widest uppercase opacity-40">Your turnover is updated in real-time as you log sales.</p>
             </div>
             <Banknote className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
           </div>
           
           <div className="bg-white p-8 rounded-3xl border border-primary/10 shadow-sm">
             <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/40 mb-4">Inventory Tip</h3>
             <p className="text-xs text-primary/70 leading-relaxed italic">
               Remember to update product stock manually in the 'Manage Products' section if a sale reduces inventory.
             </p>
           </div>
        </div>
      </div>
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
