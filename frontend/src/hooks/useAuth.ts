import { create } from "zustand";
import { api, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "vendedor" | "comprador";
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: api.getUser(),
  isAuthenticated: !!api.getToken() && !!api.getUser(),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<{
        ok: boolean;
        data: { token: string; user: User };
      }>("/api/auth/login", { email, password });

      if (response.ok && response.data) {
        api.setToken(response.data.token);
        api.setUser(response.data.user);
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      // Por defecto el rol es comprador
      const payloadWithRole = { role: "comprador", ...payload };
      const response = await api.post<{
        ok: boolean;
        data: { token: string; user: User };
      }>("/api/auth/register", payloadWithRole);

      if (response.ok && response.data) {
        api.setToken(response.data.token);
        api.setUser(response.data.user);
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    api.clearToken();
    api.clearUser();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const user = api.getUser();
    const token = api.getToken();
    if (user && token) {
      set({ user, isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
