import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 sm:py-28 px-6 text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-primary/40 mb-4">
          Our Story
        </p>
        <h1 className="text-4xl sm:text-6xl font-serif text-primary uppercase leading-tight max-w-2xl mx-auto">
          100% Handcrafted
          <br />
          in Kerala
        </h1>
      </section>

      {/* Story */}
      <section className="max-w-2xl mx-auto px-6 pb-20 space-y-12">
        <div>
          <h2 className="text-xl font-serif text-primary uppercase tracking-widest mb-4">
            The Beginning
          </h2>
          <p className="text-primary/60 leading-relaxed">
            Ethoss started with a simple question: what if jewellery could tell
            the story of where it came from? We found our answer in the quiet
            workshops of Kerala — where artisans still shape metal by hand, dye
            thread with plants, and carve wood with nothing but patience.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif text-primary uppercase tracking-widest mb-4">
            Slow Craft
          </h2>
          <p className="text-primary/60 leading-relaxed">
            Every piece takes days, sometimes weeks. There are no moulds, no
            assembly lines. Each curve, each texture is the direct imprint of a
            human hand. That&apos;s not inefficiency — that&apos;s intention.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif text-primary uppercase tracking-widest mb-4">
            Sustainability
          </h2>
          <p className="text-primary/60 leading-relaxed">
            We use recycled metals, reclaimed wood, organic cotton, and natural
            dyes. Our packaging is plastic-free. We ship in handmade cotton
            pouches. Because beautiful things shouldn&apos;t cost the earth.
          </p>
        </div>

        <div className="pt-8 text-center border-t border-primary/10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-primary border-b border-primary/30 pb-1 hover:border-primary transition-colors"
          >
            Explore the Collection <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
