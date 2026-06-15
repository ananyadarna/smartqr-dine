import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  tableCode: string | null;
  tableSessionId: string | null;
  sessionCreatedAt: number | null;
  
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  
  setTableAndRestaurant: (
    tableId: string, 
    restaurantId: string, 
    tableCode: string,
    backendSessionId?: string
  ) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      restaurantId: null,
      tableId: null,
      tableCode: null,
      tableSessionId: null,
      sessionCreatedAt: null,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: 1,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      increaseQuantity: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        })),

      decreaseQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () =>
        set({
          items: [],
          // We preserve table/restaurant context so the diner remains bound to the scan
        }),

      setTableAndRestaurant: (tableId, restaurantId, tableCode, backendSessionId) =>
        set((state) => {
          const now = Date.now();
          const isNewTable = state.tableCode !== tableCode;
          const isExpired = state.sessionCreatedAt 
            ? (now - state.sessionCreatedAt) > 4 * 60 * 60 * 1000 
            : false;

          // Check if backend session ID has changed (indicating the table was cleared/reset)
          const isSessionChanged = !!(backendSessionId && state.tableSessionId && state.tableSessionId !== backendSessionId);

          const shouldReset = !state.tableSessionId || isNewTable || isExpired || isSessionChanged;
          const tableSessionId = shouldReset
            ? (backendSessionId || `sess_${now}_${Math.random().toString(36).substring(2, 11)}`)
            : state.tableSessionId;
          const sessionCreatedAt = shouldReset ? now : state.sessionCreatedAt;

          return {
            tableId,
            restaurantId,
            tableCode,
            tableSessionId,
            sessionCreatedAt,
            items: (isNewTable || isExpired || isSessionChanged) ? [] : state.items,
          };
        }),
    }),
    {
      name: "smartqr-cart",
    }
  )
);