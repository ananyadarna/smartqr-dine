import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  banner?: string;
  theme?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  restaurant: Restaurant | null;
  setAuth: (user: User, token: string) => void;
  setRestaurant: (restaurant: Restaurant) => void;
  updateUserRestaurantId: (restaurantId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      restaurant: null,

      setAuth: (user, token) => set({ user, token }),
      
      setRestaurant: (restaurant) => set({ restaurant }),

      updateUserRestaurantId: (restaurantId) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              restaurantId,
            },
          };
        }),

      logout: () => set({ user: null, token: null, restaurant: null }),
    }),
    {
      name: "smartqr-auth",
    }
  )
);
