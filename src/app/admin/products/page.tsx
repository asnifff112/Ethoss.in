"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Image as ImageIcon, IndianRupee, Truck } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  shippingPrice: number;
  category_id: string;
  stock: number;
  image_urls: string[];
  isAvailable: boolean;
  showLowStock: boolean;
}

const CATEGORIES = [
  { id: "onyx-essence", title: "The Onyx Essence" },
  { id: "earthbound-soul", title: "Earthbound Soul" },
  { id: "intricate-weaves", title: "Intricate Weaves" }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    shippingPrice: "",
    category_id: "onyx-essence",
    stock: "",
    image_urls: ["", "", ""],
    isAvailable: true,
    showLowStock: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        shippingPrice: (product.shippingPrice || 0).toString(),
        category_id: product.category_id,
        stock: product.stock.toString(),
        image_urls: product.image_urls.length >= 3 ? product.image_urls : [...product.image_urls, "", "", ""].slice(0, 3),
        isAvailable: product.isAvailable ?? true,
        showLowStock: product.showLowStock ?? false
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        shippingPrice: "0",
        category_id: "onyx-essence",
        stock: "",
        image_urls: ["", "", ""],
        isAvailable: true,
        showLowStock: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? "PUT" : "POST";
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      shippingPrice: parseFloat(formData.shippingPrice) || 0,
      stock: parseInt(formData.stock),
      id: editingProduct?.id
    };

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingProduct ? "Product updated" : "Product added");
        fetchProducts();
        setIsModalOpen(false);
      } else {
        toast.error("Save failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        toast.success("Product deleted");
        fetchProducts();
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const updateImageUrl = (index: number, val: string) => {
    const newUrls = [...formData.image_urls];
    newUrls[index] = val;
    setFormData({ ...formData, image_urls: newUrls });
  }

  const toggleAvailability = async (product: Product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          isAvailable: !product.isAvailable
        })
      });

      if (res.ok) {
        toast.success(product.isAvailable ? "Marked as Sold Out" : "Marked as In Stock");
        fetchProducts();
      }
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Products</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-background px-6 py-3 rounded-lg text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="animate-spin text-primary/20" size={32} />
                <span className="text-[10px] tracking-widest uppercase text-primary/40">Inventory Syncing...</span>
             </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest font-bold border-b border-primary/10">
                <th className="p-4 w-16">Item</th>
                <th className="p-4">Product Details</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Urgency</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const getStatus = () => {
                    if (!p.isAvailable || p.stock <= 0) return { label: "Sold Out", color: "bg-red-50 text-red-600 border-red-100 animate-status-blink" };
                    if (p.showLowStock || (p.stock > 0 && p.stock <= 5)) return { label: "Low Stock", color: "bg-blue-50 text-blue-600 border-blue-100 animate-status-pulse" };
                    return { label: "In Stock", color: "bg-green-50 text-green-600 border-green-100" };
                }
                const status = getStatus();

                return (
                    <tr key={p.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                      <td className="p-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary/10">
                            <Image src={p.image_urls?.[0]} alt={p.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary uppercase tracking-wider">{p.name}</span>
                            <span className="text-[10px] text-primary/40 uppercase tracking-widest">{CATEGORIES.find(c => c.id === p.category_id)?.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-primary">₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-primary/40 uppercase tracking-widest font-bold">Ship: ₹{p.shippingPrice || 0}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-primary/60">{p.stock} units</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => toggleAvailability(p)}
                                className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${status.color}`}
                                title="Quick toggle availability"
                            >
                                {status.label}
                            </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                            onClick={() => handleOpenModal(p)}
                            className="p-2 text-primary/40 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                           >
                              <Edit2 size={16} />
                           </button>
                           <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-primary/40 hover:text-red-600 transition-colors hover:bg-red-50 rounded-full"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
                        {editingProduct ? "Modify Product" : "Launch New Product"}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Product Name</label>
                            <input 
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2">
                             <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Description</label>
                             <textarea 
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all min-h-[100px]"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                             />
                        </div>

                        <div>
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold group">
                                <IndianRupee size={10} className="inline mb-0.5 mr-1" />Price (INR)
                            </label>
                            <input 
                                type="number"
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold flex items-center gap-1">
                                <Truck size={10} className="text-primary/40" /> Shipping Fee
                            </label>
                            <input 
                                type="number"
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                                value={formData.shippingPrice}
                                onChange={(e) => setFormData({...formData, shippingPrice: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold">Inventory Count</label>
                            <input 
                                type="number"
                                required
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                                value={formData.stock}
                                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            />
                        </div>

                        {/* Status Overrides */}
                        <div className="col-span-2 grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                                    className="w-4 h-4 rounded border-primary/20 accent-primary"
                                />
                                <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60 group-hover:text-primary transition-colors">Is Available</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={formData.showLowStock}
                                    onChange={(e) => setFormData({...formData, showLowStock: e.target.checked})}
                                    className="w-4 h-4 rounded border-primary/20 accent-primary"
                                />
                                <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60 group-hover:text-primary transition-colors">Force Low Stock</span>
                            </label>
                        </div>

                        <div className="col-span-2">
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Collection</label>
                            <select 
                                className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all appearance-none"
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                            >
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div className="col-span-2 space-y-3">
                            <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Visual Content (Exactly 3 URLs)</label>
                            {[0, 1, 2].map((idx) => (
                                <div key={idx} className="relative">
                                    <input 
                                        required
                                        className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all pl-10"
                                        placeholder={`Image URL ${idx + 1}`}
                                        value={formData.image_urls[idx]}
                                        onChange={(e) => updateImageUrl(idx, e.target.value)}
                                    />
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" size={16} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-primary text-background py-4 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-primary/90 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20"
                    >
                        {editingProduct ? "Synchronize Changes" : "Confirm Launch"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
