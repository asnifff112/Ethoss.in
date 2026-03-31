"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import db from "@/data/db.json";

const ALL_PRODUCTS = db.products;
const CATEGORIES = ["all", ...db.categories.map((c) => c.id)];

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  let filtered =
    category === "all"
      ? [...ALL_PRODUCTS]
      : ALL_PRODUCTS.filter((p) => p.category_id === category);

  if (sortOrder === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary/40 mb-1">
            Collection
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-primary uppercase tracking-wider">
            Shop All
          </h1>
        </div>
        <p className="text-xs text-primary/50 tracking-widest uppercase">
          {filtered.length} pieces
        </p>
      </div>

      {/* Filters and Sorting Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* Category Filter */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <SlidersHorizontal size={14} className="text-primary/40 flex-shrink-0" />
          {CATEGORIES.map((catId) => {
            const catName = catId === "all" ? "All" : db.categories.find(c => c.id === catId)?.title;
            return (
              <button
                key={catId}
                onClick={() => setCategory(catId)}
                className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase flex-shrink-0 border transition-colors ${
                  category === catId
                    ? "bg-primary text-background border-primary"
                    : "border-primary/15 text-primary/60 hover:border-primary/40"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 px-4 sm:px-0">
          <span className="text-[10px] tracking-[0.2em] uppercase text-primary/40 whitespace-nowrap">
            Sort By
          </span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-transparent border border-primary/15 text-primary text-xs tracking-widest uppercase rounded-full px-4 py-2 outline-none focus:border-primary/40 min-w-[160px] cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231a2f67%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem top 50%", backgroundSize: "0.65rem auto" }}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="group"
          >
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-primary/5 relative">
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {p.stock <= 5 && (
                <span className="absolute top-3 left-3 bg-primary/90 text-background text-[9px] tracking-widest uppercase px-2 py-1 rounded-sm">
                  Few Left
                </span>
              )}
            </div>
            <h3 className="mt-3 text-xs sm:text-sm font-medium text-primary tracking-wider uppercase leading-snug line-clamp-1">
              {p.name}
            </h3>
            <p className="text-primary/50 text-xs mt-1">
              ₹{p.price.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
