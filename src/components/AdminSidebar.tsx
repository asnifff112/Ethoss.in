"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, LogOut, Sparkles, MessageSquare, ShoppingBag } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Studio", href: "/admin/studio", icon: Sparkles },
    { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { label: "Users", href: "/admin/users", icon: Users },
  ];

  return (
    <aside className="hidden sm:flex flex-col w-64 bg-background border-r border-primary/10 h-screen sticky top-0 p-6">
      <div className="mb-10">
        <Link href="/" className="text-2xl font-serif tracking-widest text-primary uppercase">
          Ethoss Admin
        </Link>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                ? "bg-primary text-background font-medium" 
                : "text-primary/70 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-primary/10">
        <button className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
