"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, User, Package, Calendar, MoreHorizontal, CheckCircle2, Truck, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  address: string;
  productName: string; // for list view
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  createdAt: string;
  items?: { name: string; quantity: number; price: number; shipping: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/orders");
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders();
        if (selectedOrder?.id === id) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        toast.error("Status update failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'Shipped': return <Truck size={14} className="text-blue-500" />;
      case 'Out for Delivery': return <Package size={14} className="text-purple-500" />;
      case 'Pending': 
      case 'Processing': return <Clock size={14} className="text-amber-500" />;
      case 'Cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  const steps = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Order Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Search orders..." 
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
                <span className="text-[10px] tracking-widest uppercase text-primary/40">Loading Transactions...</span>
             </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest font-bold border-b border-primary/10">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Product Info</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-primary/30 uppercase tracking-[0.2em] font-medium">
                    No orders recorded yet
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr 
                    key={o.id} 
                    className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedOrder(o); setIsModalOpen(true); }}
                  >
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-mono text-primary/50 text-[10px] uppercase font-bold tracking-tighter">#{o.id.slice(-6)}</span>
                            <span className="text-[9px] text-primary/30 mt-1 flex items-center gap-1"><Calendar size={10} />{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-primary flex items-center gap-1.5 group-hover:text-amber-600 transition-colors"><User size={12} className="text-primary/30" />{o.customerName}</span>
                            <span className="text-[10px] text-primary/40">{o.customerEmail}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary/40">
                                <Package size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-primary">{o.productName}</span>
                                <span className="text-[10px] text-primary/40">Qty: {o.quantity}</span>
                            </div>
                        </div>
                    </td>
                    <td className="p-4 font-bold text-primary">
                        ₹{o.totalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border
                                ${o.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                                  o.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                  o.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                                  'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {getStatusIcon(o.status)}
                                {o.status}
                            </span>
                            
                            <select 
                                className="bg-primary/5 border border-primary/10 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer"
                                value={o.status}
                                onChange={(e) => updateStatus(o.id, e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detailed Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-background w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-primary/2">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40">Order Dossier</h2>
                        <span className="text-sm font-serif font-bold text-primary tracking-widest uppercase">#{selectedOrder.id.slice(-8)}</span>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full transition-colors"><XCircle size={20} className="text-primary/40 group-hover:text-primary" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Visual Timeline */}
                    <div className="relative pt-6 pb-2">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-primary/5 -translate-y-1/2" />
                        <div className="flex justify-between relative z-10">
                            {steps.map((step, idx) => {
                                const isCompleted = steps.indexOf(selectedOrder.status) >= idx;
                                const isCurrent = selectedOrder.status === step;
                                return (
                                    <div key={step} className="flex flex-col items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                            isCompleted ? 'bg-primary border-primary text-background' : 'bg-background border-primary/10 text-primary/20'
                                        } ${isCurrent ? 'ring-4 ring-primary/10 animate-status-pulse' : ''}`}>
                                            {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase tracking-widest text-center max-w-[60px] ${
                                            isCompleted ? 'text-primary' : 'text-primary/30'
                                        }`}>{step}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 pt-4">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/40 border-b border-primary/5 pb-2">Customer Intelligence</h3>
                            <div className="space-y-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-tighter text-primary/40">Legal Name</span>
                                    <span className="text-sm font-bold text-primary">{selectedOrder.customerName}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-tighter text-primary/40">Electronic Mail</span>
                                    <span className="text-xs font-medium text-primary underline decoration-primary/10 cursor-pointer">{selectedOrder.customerEmail}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-tighter text-primary/40">Contact Terminal</span>
                                    <span className="text-xs font-medium text-primary">{selectedOrder.phone || "+91 94977 16349"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Bloc */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/40 border-b border-primary/5 pb-2">Shipping Terminal</h3>
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-[11px] leading-relaxed text-primary font-serif italic text-primary/70">
                                    {selectedOrder.address}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Basket Analysis */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold tracking-widest uppercase text-primary/40 border-b border-primary/5 pb-2">Basket Analysis</h3>
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 text-[9px] font-bold uppercase tracking-widest text-primary/30 px-2">
                                <div className="col-span-2">Item Description</div>
                                <div className="text-center">Qty</div>
                                <div className="text-right">Valuation</div>
                            </div>
                            <div className="p-4 bg-white border border-primary/10 rounded-2xl flex flex-col gap-4">
                                {(selectedOrder.items || [{ name: selectedOrder.productName, quantity: selectedOrder.quantity, price: selectedOrder.totalPrice / selectedOrder.quantity, shipping: 50 }]).map((item, i) => (
                                    <div key={i} className="grid grid-cols-4 items-center">
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.name}</span>
                                            <span className="text-[9px] text-primary/40">Ship: ₹{item.shipping || 0}</span>
                                        </div>
                                        <div className="text-center text-xs font-mono text-primary/60">x{item.quantity}</div>
                                        <div className="text-right text-xs font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-primary/10">
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-widest text-primary/40 font-bold mb-1">Financial State</span>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase inline-block border
                                    ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {selectedOrder.paymentStatus || 'Paid'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                           <span className="text-[9px] uppercase tracking-widest text-primary/40 font-bold block mb-1">Grand Total</span>
                           <span className="text-2xl font-serif font-bold text-primary tracking-wider">₹{selectedOrder.totalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
