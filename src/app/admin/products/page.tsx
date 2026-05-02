"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Upload, IndianRupee, Truck, Tag, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  caption: string;
  original_price: number;
  price: number;
  delivery_charge: number;
  category_id: string;
  images: string[];
  is_sold_out: boolean;
}

const CATEGORIES = [
  { id: "onyx-essence", title: "The Onyx Essence" },
  { id: "earthbound-soul", title: "Earthbound Soul" },
  { id: "intricate-weaves", title: "Intricate Weaves" },
  { id: "celestial-duo", title: "Celestial Duo" }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState<number | null>(null); // which slot is uploading

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    caption: "",
    original_price: "",
    price: "",
    delivery_charge: "",
    category_id: "onyx-essence",
    images: ["", "", ""],
    is_sold_out: false,
  });

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

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
      const imgs = [...product.images];
      while (imgs.length < 3) imgs.push("");
      setFormData({
        name: product.name,
        caption: product.caption,
        original_price: product.original_price.toString(),
        price: product.price.toString(),
        delivery_charge: (product.delivery_charge || 0).toString(),
        category_id: product.category_id,
        images: imgs.slice(0, 3),
        is_sold_out: product.is_sold_out ?? false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        caption: "",
        original_price: "",
        price: "",
        delivery_charge: "0",
        category_id: "onyx-essence",
        images: ["", "", ""],
        is_sold_out: false,
      });
    }
    setIsModalOpen(true);
  };

  // ─── Cloudinary Upload Handler ──────────────────────────────────────
  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum 5MB.");
      return;
    }

    setUploading(index);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        const newImages = [...formData.images];
        newImages[index] = data.url;
        setFormData({ ...formData, images: newImages });
        toast.success(`Image ${index + 1} uploaded!`);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed. Check your connection.");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validImages = formData.images.filter((url) => url.trim() !== "");
    if (validImages.length < 2) {
      toast.error("Please upload at least 2 product images.");
      return;
    }

    const method = editingProduct ? "PUT" : "POST";
    const payload = {
      ...formData,
      images: validImages,
      original_price: parseFloat(formData.original_price),
      price: parseFloat(formData.price),
      delivery_charge: parseFloat(formData.delivery_charge) || 0,
      id: editingProduct?.id || `p-${Date.now()}`,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Product deleted");
        fetchProducts();
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const toggleSoldOut = async (product: Product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          is_sold_out: !product.is_sold_out,
        }),
      });

      if (res.ok) {
        toast.success(product.is_sold_out ? "Marked as In Stock" : "Marked as Sold Out");
        fetchProducts();
      }
    } catch (err) {
      toast.error("Toggle failed");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages[index] = "";
    setFormData({ ...formData, images: newImages });
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

      {/* ─── PRODUCT TABLE ─── */}
      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-primary/20" size={32} />
            <span className="text-[10px] tracking-widest uppercase text-primary/40">Inventory Syncing...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Tag className="text-primary/15" size={48} />
            <span className="text-[10px] tracking-widest uppercase text-primary/40">No products yet. Add your first piece.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest font-bold border-b border-primary/10">
                <th className="p-4 w-16">Item</th>
                <th className="p-4">Product</th>
                <th className="p-4">Pricing</th>
                <th className="p-4">Delivery</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const statusStyle = p.is_sold_out
                  ? "bg-red-50 text-red-600 border-red-100 animate-status-blink"
                  : "bg-green-50 text-green-600 border-green-100";
                const statusLabel = p.is_sold_out ? "Sold Out" : "In Stock";

                return (
                  <tr key={p.id} className="border-b border-primary/5 hover:bg-primary/[0.03] transition-colors group">
                    <td className="p-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-primary/10">
                        {p.images?.[0] && (
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary uppercase tracking-wider">{p.name}</span>
                        <span className="text-[10px] text-primary/40 uppercase tracking-widest">
                          {CATEGORIES.find((c) => c.id === p.category_id)?.title}
                        </span>
                        <span className="text-[10px] text-primary/30 mt-0.5 line-clamp-1">{p.caption}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-primary/40 line-through font-mono">₹{p.original_price?.toLocaleString("en-IN")}</span>
                        <span className="font-bold text-primary font-mono">₹{p.price.toLocaleString("en-IN")}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-primary/50 font-mono">
                        {p.delivery_charge > 0 ? `₹${p.delivery_charge}` : "FREE"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleSoldOut(p)}
                        className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 cursor-pointer ${statusStyle}`}
                        title="Toggle availability"
                      >
                        {statusLabel}
                      </button>
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

      {/* ─── ADD / EDIT MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-primary/10 flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
                {editingProduct ? "Modify Product" : "Launch New Product"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-primary/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="col-span-2">
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Product Name</label>
                  <input
                    required
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Caption */}
                <div className="col-span-2">
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Caption / Description</label>
                  <textarea
                    required
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all min-h-[80px]"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  />
                </div>

                {/* Original Price (MRP) */}
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold">
                    <IndianRupee size={10} className="inline mb-0.5 mr-1" />MRP (Original)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold">
                    <IndianRupee size={10} className="inline mb-0.5 mr-1" />Selling Price
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                {/* Delivery Charge */}
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2 font-bold flex items-center gap-1">
                    <Truck size={10} className="text-primary/40" /> Delivery Fee
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all font-mono"
                    value={formData.delivery_charge}
                    onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-2">Collection</label>
                  <select
                    className="w-full bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 transition-all appearance-none"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {/* Sold Out Toggle */}
                <div className="col-span-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.is_sold_out}
                        onChange={(e) => setFormData({ ...formData, is_sold_out: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-red-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60 group-hover:text-primary transition-colors">
                        Mark as Sold Out
                      </span>
                      <span className="text-[9px] text-primary/30 tracking-wide">
                        Product will show a SOLD OUT overlay and disable purchase
                      </span>
                    </div>
                    {formData.is_sold_out && (
                      <AlertCircle size={14} className="text-red-500 ml-auto" />
                    )}
                  </label>
                </div>

                {/* ─── IMAGE UPLOAD SECTION ─── */}
                <div className="col-span-2 space-y-3">
                  <label className="text-[10px] tracking-widest uppercase text-primary/40 block mb-1">
                    Product Images (2–3 required)
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="relative group">
                        {formData.images[idx] ? (
                          /* ── Image Preview ── */
                          <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary/10 bg-gray-100">
                            <Image
                              src={formData.images[idx]}
                              alt={`Product image ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                            {/* Remove button overlay */}
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X size={12} />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                              <span className="text-[8px] text-white font-bold tracking-widest uppercase">Image {idx + 1}</span>
                            </div>
                          </div>
                        ) : (
                          /* ── Upload Button ── */
                          <button
                            type="button"
                            onClick={() => fileInputRefs[idx].current?.click()}
                            disabled={uploading === idx}
                            className="w-full aspect-square rounded-xl border-2 border-dashed border-primary/15 hover:border-primary/30 bg-primary/[0.02] hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                          >
                            {uploading === idx ? (
                              <Loader2 size={20} className="animate-spin text-primary/30" />
                            ) : (
                              <Upload size={20} className="text-primary/25" />
                            )}
                            <span className="text-[8px] tracking-widest uppercase text-primary/30 font-bold">
                              {uploading === idx ? "Uploading..." : `Image ${idx + 1}`}
                            </span>
                          </button>
                        )}

                        {/* Hidden File Input */}
                        <input
                          ref={fileInputRefs[idx]}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(idx, file);
                            e.target.value = ""; // reset input so same file can be re-selected
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-primary/30 tracking-wide">
                    Click each slot to upload from your device. Images are stored securely on Cloudinary.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading !== null}
                className="w-full bg-primary text-background py-4 rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-primary/90 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 disabled:opacity-50"
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
