"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export default function CartSync() {
  const { status } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const setCart = useCartStore((s) => s.setCart);
  const isInitialMount = useRef(true);
  const hasFetched = useRef(false);

  // Handle Authentication Changes (Logout & Initial Login Fetch)
  useEffect(() => {
    if (status === "unauthenticated") {
      clearCart();
      hasFetched.current = false;
    } else if (status === "authenticated" && !hasFetched.current) {
      const fetchCart = async () => {
        try {
          const res = await fetch("/api/user/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart && data.cart.length > 0) {
              setCart(data.cart);
            }
            hasFetched.current = true;
          }
        } catch (error) {
          console.error("Failed to fetch cart from DB", error);
        }
      };
      fetchCart();
    }
  }, [status, clearCart, setCart]);

  // Sync to DB when local items change (only after initial fetch or if not logging in)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only sync if authenticated and we have either fetched or confirmed it's a new session
    if (status === "authenticated" && hasFetched.current) {
      const syncCart = async () => {
        try {
          await fetch("/api/user/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart: items }),
          });
        } catch (error) {
          console.error("Failed to sync cart to DB", error);
        }
      };
      
      const timer = setTimeout(syncCart, 2000); // 2s debounce
      return () => clearTimeout(timer);
    }
  }, [items, status]);

  return null;
}
