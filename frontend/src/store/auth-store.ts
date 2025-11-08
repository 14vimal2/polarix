import { create } from "zustand";
import type { User } from "../lib/api-client";


// Define the shape of your store's state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions (functions that update the state)
  setUser: (user: User | null) => void;
  setAuthentication: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // A combined action for a successful login
  loginSuccess: (user: User) => void;
  // An action to clear state on logout
  logout: () => void;
}

// Create the store with `create` from zustand
export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions (simply update the state)
  setUser: (user) => set({ user }),
  setAuthentication: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  loginSuccess: (user) => set({ user, isAuthenticated: true, isLoading: false, error: null }),
  logout: () => set({ user: null, isAuthenticated: false, error: null }),
}));