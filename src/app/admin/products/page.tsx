"use client";

import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const products = [
    { id: "P-001", name: "Ethoss Series 01", price: "₹4,500", stock: 12, status: "Active" },
    { id: "P-002", name: "Ethoss Series 02", price: "₹5,000", stock: 0, status: "Sold Out" },
    { id: "P-003", name: "Ethoss Series 03", price: "₹5,500", stock: 8, status: "Active" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Products</h1>
        <button className="bg-primary text-background px-6 py-3 rounded-lg text-sm font-medium tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest text-xs border-b border-primary/10">
              <th className="p-4 font-medium">Product ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                <td className="p-4 text-sm font-medium text-primary">{p.id}</td>
                <td className="p-4 text-sm text-primary">{p.name}</td>
                <td className="p-4 text-sm text-primary/70">{p.price}</td>
                <td className="p-4 text-sm text-primary">{p.stock}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${
                    p.status === "Active" ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                     <button className="p-2 text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 rounded-full">
                        <Edit2 size={16} />
                     </button>
                     <button className="p-2 text-primary/50 hover:text-red-600 transition-colors hover:bg-red-50 rounded-full">
                       <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
