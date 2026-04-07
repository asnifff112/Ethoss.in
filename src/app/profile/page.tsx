"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, Address } from "@/store/cartStore";
import { toast } from "sonner";
import { LogOut, Package, MapPin, Save, Camera, User, Mail, Loader2, ShoppingBag } from "lucide-react";
import axios from "axios";
import Image from "next/image";

const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad", "Outside Kerala"
];

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  shipping: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
  productName: string;
}

const STATUS_STYLES: Record<string, string> = {
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const initialAddress: Address = user?.addresses?.[0] || {};

  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    houseNo: initialAddress.houseNo || "",
    buildingName: initialAddress.buildingName || "",
    area: initialAddress.area || "",
    postOffice: initialAddress.postOffice || "",
    landmark: initialAddress.landmark || "",
    pincode: initialAddress.pincode || "",
    district: initialAddress.district || "",
    state: initialAddress.state || "Kerala",
  });

  // Hydration-aware auth guard
  useEffect(() => {
    if (!hasHydrated) return; // Wait for localStorage to load
    if (!isLoggedIn || !user) {
      router.push("/login");
    }
  }, [hasHydrated, isLoggedIn, user, router]);

  // Sync form when user loads from localStorage
  useEffect(() => {
    if (user) {
      const addr = user.addresses?.[0] || {};
      setProfileData({
        fullName: user.name || "",
        phone: user.phone || "",
        houseNo: addr.houseNo || "",
        buildingName: addr.buildingName || "",
        area: addr.area || "",
        postOffice: addr.postOffice || "",
        landmark: addr.landmark || "",
        pincode: addr.pincode || "",
        district: addr.district || "",
        state: addr.state || "Kerala",
      });
    }
  }, [user]);

  // Fetch orders from db.json via API
  useEffect(() => {
    if (!user?.id || !hasHydrated) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const res = await axios.get(`/api/orders/user/${user.id}`);
        setOrders(res.data || []);
      } catch (err) {
        // Silently fail — no orders is acceptable
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user?.id, hasHydrated]);

  // Show loading shimmer while Zustand hydrates from localStorage
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary/30" size={28} />
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const handleUpdateProfile = async () => {
    if (!profileData.phone || profileData.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const newAddresses: Address[] = [
      {
        houseNo: profileData.houseNo,
        buildingName: profileData.buildingName,
        area: profileData.area,
        postOffice: profileData.postOffice,
        landmark: profileData.landmark,
        pincode: profileData.pincode,
        district: profileData.district,
        state: profileData.state,
      },
    ];

    try {
      const res = await axios.put("/api/auth/profile", {
        userId: user.id,
        name: profileData.fullName,
        phone: profileData.phone,
        addresses: newAddresses,
      });

      updateProfile({
        name: profileData.fullName,
        phone: profileData.phone,
        addresses: newAddresses,
      });

      toast.success("Profile Updated", {
        description: "Shipping details for ETHOSS.IN saved securely.",
      });
    } catch (err) {
      toast.error("Error", {
        description: "Failed to save profile details to the server.",
      });
    }
  };

  const initials = profileData.fullName
    ? profileData.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-20 bg-background min-h-screen font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary text-2xl font-serif tracking-widest">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 bg-background border border-primary/20 rounded-full cursor-pointer shadow-sm">
              <Camera size={14} className="text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-primary uppercase tracking-[0.2em]">Account</h1>
            {user.email && (
              <p className="text-[11px] font-medium text-primary mt-2 flex items-center gap-1.5 opacity-80">
                <Mail size={13} /> {user.email}
              </p>
            )}
            <p className="text-[10px] text-primary/40 uppercase tracking-widest mt-1">Managed securely by ETHOSS</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary/40 hover:text-red-700 transition-colors self-start md:self-center border border-primary/10 px-4 py-2 rounded-full"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">

        {/* ── FORM: Contact & Address ── */}
        <div className="lg:col-span-7 space-y-12">

          {/* Section: Contact */}
          <section>
            <h2 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <User size={15} className="opacity-40" /> Personal & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 border-b border-primary/10">
                <label className="text-[9px] uppercase text-primary/40 tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full bg-transparent py-2 text-sm text-primary outline-none"
                />
              </div>
              <div className="space-y-1 border-b border-primary/10">
                <label className="text-[9px] uppercase text-primary/40 tracking-widest">Contact Phone</label>
                <div className="flex justify-between items-center">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-transparent py-2 text-sm text-primary outline-none"
                  />
                  <button className="text-[8px] uppercase tracking-tighter text-primary/40 hover:text-primary">Verify</button>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Address */}
          <section>
            <h2 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <MapPin size={15} className="opacity-40" /> Postal Address (India Post Ready)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <input placeholder="House / Flat No." value={profileData.houseNo} onChange={(e) => setProfileData({ ...profileData, houseNo: e.target.value })} className="bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20" />
              <input placeholder="Building / Apartment Name" value={profileData.buildingName} onChange={(e) => setProfileData({ ...profileData, buildingName: e.target.value })} className="bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20" />
              <input placeholder="Area / Street / Colony" value={profileData.area} onChange={(e) => setProfileData({ ...profileData, area: e.target.value })} className="md:col-span-2 bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20" />
              <input placeholder="Post Office / City Name" value={profileData.postOffice} onChange={(e) => setProfileData({ ...profileData, postOffice: e.target.value })} className="bg-primary/[0.02] border border-primary/10 p-4 text-sm outline-none focus:border-primary/30 font-medium" />
              <input placeholder="Landmark (Optional)" value={profileData.landmark} onChange={(e) => setProfileData({ ...profileData, landmark: e.target.value })} className="bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20" />
              <input placeholder="Pincode" value={profileData.pincode} onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })} className="bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20" />
              <select
                value={profileData.district}
                onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                className="bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none focus:border-primary/20 appearance-none"
              >
                <option value="" disabled>Select District</option>
                {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={profileData.state}
                onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                className="md:col-span-2 bg-primary/[0.02] border border-primary/5 p-4 text-sm outline-none"
              >
                <option value="Kerala">Kerala</option>
                <option value="Outside Kerala">Outside Kerala</option>
              </select>
            </div>

            <button
              onClick={handleUpdateProfile}
              className="mt-12 w-full md:w-auto px-10 py-4 bg-primary text-white text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 active:scale-95 transition-all shadow-md font-bold"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </section>
        </div>

        {/* ── ORDER HISTORY ── */}
        <div className="lg:col-span-5">
          <div className="bg-primary/[0.01] border border-primary/5 p-8 rounded-xl">
            <h2 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Package size={15} className="opacity-40" /> Order History
            </h2>

            {loadingOrders ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Loader2 size={20} className="animate-spin text-primary/30" />
                <p className="text-[10px] text-primary/30 uppercase tracking-widest">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <ShoppingBag size={32} strokeWidth={1} className="text-primary/15" />
                <p className="text-[10px] text-primary/30 uppercase tracking-widest text-center">
                  No orders placed yet
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => {
                  const firstItem = order.items?.[0];
                  const statusClass = STATUS_STYLES[order.status] || "bg-primary/5 text-primary/50 border-primary/10";

                  return (
                    <div
                      key={order.id}
                      className="border border-primary/8 rounded-xl p-4 bg-background hover:border-primary/20 transition-colors"
                    >
                      {/* Top row */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Product thumbnail */}
                        <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0">
                          {firstItem?.image_url ? (
                            <Image
                              src={firstItem.image_url}
                              alt={firstItem.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={18} className="text-primary/20" />
                            </div>
                          )}
                        </div>

                        {/* Order info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold uppercase tracking-widest text-primary truncate">
                            {order.productName}
                          </p>
                          <p className="text-[10px] text-primary/40 mt-0.5 font-mono">
                            #{order.id.replace("ord-", "")}
                          </p>
                        </div>

                        {/* Status badge */}
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusClass} flex-shrink-0`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                        <div>
                          <p className="text-base font-bold text-primary font-serif">
                            ₹{order.totalPrice.toLocaleString()}.00
                          </p>
                          <p className="text-[10px] text-primary/30">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {order.paymentMethod && (
                          <div className="flex items-center gap-1 bg-[#5f259f]/8 px-2.5 py-1 rounded-full">
                            <span className="text-[#5f259f] font-black text-[9px]">Pe</span>
                            <span className="text-[9px] text-[#5f259f]/70 font-medium uppercase tracking-wider">
                              {order.paymentMethod}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}