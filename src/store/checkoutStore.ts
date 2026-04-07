import { create } from "zustand";

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  mobile: string;
  altMobile: string;
  notes: string;
}

interface CheckoutState {
  form: CheckoutForm | null;
  setForm: (form: CheckoutForm) => void;
  clearForm: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  form: null,
  setForm: (form) => set({ form }),
  clearForm: () => set({ form: null }),
}));
