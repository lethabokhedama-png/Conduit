import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, type?: ToastType, duration?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

let _id = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (message, type = "info", duration = 3000) => {
    const id = String(++_id);
    set((s) => ({ toasts: [...s.toasts, { id, message, type, duration }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

// Convenience helpers
export const toast = {
  success: (msg: string) => useToastStore.getState().push(msg, "success"),
  error:   (msg: string) => useToastStore.getState().push(msg, "error"),
  info:    (msg: string) => useToastStore.getState().push(msg, "info"),
  warn:    (msg: string) => useToastStore.getState().push(msg, "warning"),
};