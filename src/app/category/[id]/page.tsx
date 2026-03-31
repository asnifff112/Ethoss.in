import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import db from "@/data/db.json";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const p = await params;
  const category = db.categories.find((c) => c.id === p.id);

  if (!category) {
    notFound();
  }

  const products = db.products.filter((prod) => prod.category_id === category.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/#collections"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-primary/50 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Collections
        </Link>
        <h1 className="text-4xl sm:text-6xl font-serif text-primary uppercase tracking-wide mb-4">
          {category.title}
        </h1>
        <p className="text-primary/60 max-w-2xl leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p className="text-primary/50 italic py-10">
          New pieces coming to this collection soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group block relative"
            >
              <div className="aspect-[4/5] bg-primary/[0.03] rounded-xl overflow-hidden mb-4 relative">
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary/40 mb-1">
                  Ethoss
                </p>
                <h3 className="text-sm font-medium text-primary tracking-wide uppercase line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-primary/60 text-xs mt-1">
                  ₹{p.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
