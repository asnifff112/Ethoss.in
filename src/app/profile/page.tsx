"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/wishlist")
        .then((res) => res.json())
        .then((data) => {
          setWishlist(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-primary/50 text-sm tracking-widest uppercase">Loading Profile...</div>;
  }

  return (
    <div className="min-h-[100svh] bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
          <div>
            <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2">
              My Profile
            </h1>
            <p className="text-sm text-primary/60 tracking-widest uppercase">
              Welcome back, {session?.user?.name || "Customer"}
            </p>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-5 py-2.5 border border-primary/20 hover:border-primary text-xs font-bold tracking-widest uppercase text-primary/70 hover:text-primary transition-all rounded-full"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/5 mb-12">
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-6 border-b border-primary/10 pb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] text-primary/40 tracking-[0.2em] uppercase font-bold mb-1">Name</p>
              <p className="text-sm text-primary font-medium">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-primary/40 tracking-[0.2em] uppercase font-bold mb-1">Email</p>
              <p className="text-sm text-primary font-medium">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Wishlist Section */}
        <div>
          <h2 className="text-sm font-bold tracking-widest uppercase text-primary mb-6 flex items-center gap-2 border-b border-primary/10 pb-4">
            <Heart size={16} /> My Wishlist
          </h2>

          {wishlist.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-primary/5">
              <Heart size={32} strokeWidth={1} className="mx-auto text-primary/20 mb-4" />
              <p className="text-sm text-primary/50 mb-6">Your wishlist is currently empty.</p>
              <Link href="/shop" className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] font-bold uppercase text-primary border-b border-primary pb-1">
                Explore Collection <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {wishlist.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product._id}`}
                  className="group block"
                >
                  <div className="w-full aspect-[3/4] relative bg-[#EFEFEF] overflow-hidden mb-3">
                    <Image
                      src={product.images?.[0] || "/catsection/img1.jpeg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="text-[11px] sm:text-xs font-bold text-primary tracking-widest uppercase line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[13px] font-sans text-primary/70">
                    ₹{product.price?.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
