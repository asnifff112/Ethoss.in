import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── Admin User Type ── */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      login: (userData) => set({ user: userData, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "ethoss-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Helper for admin protection logic
export const checkAdmin = () => {
  const user = useAuthStore.getState().user;
  return user?.role === "admin";
};
