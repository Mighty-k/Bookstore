import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { CartItem, CartSummary, CartState } from "../types";
import { cartAPI } from "../services/api/cart";
import toast from "react-hot-toast";

// Extended store interface
interface CartStore extends CartState {
  // Existing properties from CartState
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string | null;

  // Add these missing properties
  isLoading: boolean;
  error: string | null;
  appliedPromo: { code: string; discount: number } | null;

  // Actions
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Bulk operations
  addMultipleItems: (items: CartItem[]) => Promise<void>;
  updateMultipleItems: (
    updates: Array<{ bookId: string; quantity: number }>,
  ) => Promise<void>;
  removeMultipleItems: (bookIds: string[]) => Promise<void>;

  // Cart management
  mergeCarts: (guestItems: CartItem[]) => Promise<void>;
  syncWithServer: () => Promise<void>;
  validateCart: () => Promise<{
    valid: boolean;
    invalidItems: Array<{
      bookId: string;
      reason: string;
      currentStock?: number;
    }>;
  }>;

  // Promo codes
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;

  // Calculations
  calculateSummary: () => CartSummary;
  getItem: (bookId: string) => CartItem | undefined;
  hasItem: (bookId: string) => boolean;
  getItemQuantity: (bookId: string) => number;

  // Loading states
  clearError: () => void;

  // Persistence
  loadSavedCart: () => void;
  saveCart: () => void;
}

export const useCartStore = create<CartStore>()(
  immer(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: null,
        isLoading: false,
        error: null,
        appliedPromo: null,

        // Add item
        addItem: async (newItem) => {
          set({ isLoading: true, error: null });

          try {
            const state = get();
            const existingItem = state.items.find(
              (item) => item.bookId === newItem.bookId,
            );

            let updatedItems;
            if (existingItem) {
              // Check stock limit
              const newQuantity = Math.min(
                existingItem.quantity + newItem.quantity,
                existingItem.stock,
              );

              if (newQuantity > existingItem.stock) {
                throw new Error(
                  `Cannot add more than ${existingItem.stock} copies`,
                );
              }

              updatedItems = state.items.map((item) =>
                item.bookId === newItem.bookId
                  ? { ...item, quantity: newQuantity }
                  : item,
              );
            } else {
              // Check stock for new item
              if (newItem.quantity > newItem.stock) {
                throw new Error(`Only ${newItem.stock} copies available`);
              }
              updatedItems = [
                ...state.items,
                {
                  ...newItem,
                  addedAt: new Date().toISOString(),
                },
              ];
            }

            // Update local state
            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            // Sync with server if user is logged in
            await get().syncWithServer();

            toast.success(`Added "${newItem.title}" to cart`);
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Remove item
        removeItem: async (bookId) => {
          set({ isLoading: true, error: null });

          try {
            const state = get();
            const item = state.items.find((i) => i.bookId === bookId);

            if (!item) {
              throw new Error("Item not found in cart");
            }

            const updatedItems = state.items.filter((i) => i.bookId !== bookId);

            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            await get().syncWithServer();
            toast.success(`Removed "${item.title}" from cart`);
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Update quantity
        updateQuantity: async (bookId, quantity) => {
          if (quantity <= 0) {
            await get().removeItem(bookId);
            return;
          }

          set({ isLoading: true, error: null });

          try {
            const state = get();
            const item = state.items.find((i) => i.bookId === bookId);

            if (!item) {
              throw new Error("Item not found in cart");
            }

            if (quantity > item.stock) {
              throw new Error(`Cannot exceed available stock (${item.stock})`);
            }

            const updatedItems = state.items.map((i) =>
              i.bookId === bookId ? { ...i, quantity } : i,
            );

            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            await get().syncWithServer();
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Clear cart
        clearCart: async () => {
          set({ isLoading: true, error: null });

          try {
            set((state) => {
              state.items = [];
              state.totalItems = 0;
              state.totalPrice = 0;
              state.lastUpdated = new Date().toISOString();
              state.appliedPromo = null;
              state.isLoading = false;
            });

            await get().syncWithServer();
            toast.success("Cart cleared");
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Add multiple items
        addMultipleItems: async (items) => {
          set({ isLoading: true, error: null });

          try {
            const state = get();
            let updatedItems = [...state.items];

            for (const newItem of items) {
              const existingIndex = updatedItems.findIndex(
                (i) => i.bookId === newItem.bookId,
              );

              if (existingIndex >= 0) {
                const existing = updatedItems[existingIndex];
                const newQuantity = Math.min(
                  existing.quantity + newItem.quantity,
                  existing.stock,
                );

                if (newQuantity > existing.stock) {
                  throw new Error(
                    `Cannot add more than ${existing.stock} copies of "${newItem.title}"`,
                  );
                }

                updatedItems[existingIndex] = {
                  ...existing,
                  quantity: newQuantity,
                };
              } else {
                if (newItem.quantity > newItem.stock) {
                  throw new Error(
                    `Only ${newItem.stock} copies of "${newItem.title}" available`,
                  );
                }
                updatedItems.push({
                  ...newItem,
                  addedAt: new Date().toISOString(),
                });
              }
            }

            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            await get().syncWithServer();
            toast.success(`Added ${items.length} items to cart`);
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Update multiple items
        updateMultipleItems: async (updates) => {
          set({ isLoading: true, error: null });

          try {
            const state = get();
            let updatedItems = [...state.items];

            for (const update of updates) {
              const itemIndex = updatedItems.findIndex(
                (i) => i.bookId === update.bookId,
              );

              if (itemIndex >= 0) {
                const item = updatedItems[itemIndex];
                if (update.quantity > item.stock) {
                  throw new Error(`Cannot exceed stock for "${item.title}"`);
                }
                updatedItems[itemIndex] = {
                  ...item,
                  quantity: update.quantity,
                };
              }
            }

            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            await get().syncWithServer();
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Remove multiple items
        removeMultipleItems: async (bookIds) => {
          set({ isLoading: true, error: null });

          try {
            const state = get();
            const updatedItems = state.items.filter(
              (i) => !bookIds.includes(i.bookId),
            );

            set((state) => {
              state.items = updatedItems;
              state.totalItems = updatedItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = updatedItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            await get().syncWithServer();
            toast.success(`Removed ${bookIds.length} items from cart`);
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            throw error;
          }
        },

        // Merge carts
        mergeCarts: async (guestItems) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const state = get();
            const currentItems = [...state.items];

            // Merge guest items with current cart items
            for (const guestItem of guestItems) {
              const existingItemIndex = currentItems.findIndex(
                (item) => item.bookId === guestItem.bookId,
              );

              if (existingItemIndex >= 0) {
                // Item exists - merge quantities (but don't exceed stock)
                const existing = currentItems[existingItemIndex];
                const newQuantity = Math.min(
                  existing.quantity + guestItem.quantity,
                  existing.stock,
                );

                currentItems[existingItemIndex] = {
                  ...existing,
                  quantity: newQuantity,
                };
              } else {
                // New item - add it
                currentItems.push({
                  ...guestItem,
                  addedAt: new Date().toISOString(),
                });
              }
            }

            // Update state
            set((state) => {
              state.items = currentItems;
              state.totalItems = currentItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              state.totalPrice = currentItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0,
              );
              state.lastUpdated = new Date().toISOString();
              state.isLoading = false;
            });

            // Sync with server if user is logged in
            await get().syncWithServer();

            toast.success("Cart merged successfully");
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error("Failed to merge cart");
            throw error;
          }
        },

        // Sync with server
        syncWithServer: async () => {
          try {
            const state = get();
            if (state.items.length > 0) {
              await cartAPI.syncCart(state.items);
            }
          } catch (error) {
            console.error("Failed to sync cart with server:", error);
          }
        },

        // Validate cart
        validateCart: async () => {
          const state = get();
          const invalidItems: Array<{
            bookId: string;
            reason: string;
            currentStock?: number;
          }> = [];

          for (const item of state.items) {
            try {
              const validation = await cartAPI.validateItem(item.bookId);

              if (validation.quantity > validation.currentStock) {
                invalidItems.push({
                  bookId: item.bookId,
                  reason: `Only ${validation.currentStock} available`,
                  currentStock: validation.currentStock,
                });
              }

              if (validation.price !== item.price) {
                invalidItems.push({
                  bookId: item.bookId,
                  reason: "Price has changed",
                });
              }
            } catch (error) {
              console.error(`Failed to validate item ${item.bookId}:`, error);
            }
          }

          return {
            valid: invalidItems.length === 0,
            invalidItems,
          };
        },

        // Apply promo code
        // Apply promo code
        applyPromoCode: async (code) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const state = get();
            const subtotal = state.totalPrice;

            // Call the API with the correct signature
            const result = await cartAPI.applyPromoCode(code, subtotal);

            // Check if result has a discount property (it should from our updated API)
            if ("discount" in result) {
              set((state) => {
                state.appliedPromo = {
                  code,
                  discount: (result as any).discount,
                };
                state.isLoading = false;
              });
              toast.success(`Promo code "${code}" applied!`);
              return true;
            } else {
              // Handle CartResponse type (if API returns that)
              console.error("Unexpected response from applyPromoCode:", result);
              throw new Error("Invalid response from server");
            }
          } catch (error: any) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            toast.error(error.message);
            return false;
          }
        },

        // Remove promo code
        removePromoCode: () => {
          set((state) => {
            state.appliedPromo = null;
          });
          toast.success("Promo code removed");
        },

        // Calculate summary
        calculateSummary: () => {
          const state = get();
          const subtotal = state.totalPrice;
          const tax = subtotal * 0.08;
          const shipping = subtotal >= 25 ? 0 : 4.99;
          const discount = state.appliedPromo?.discount || 0;
          const total = subtotal + tax + shipping - discount;

          return {
            subtotal,
            tax,
            shipping,
            total,
            discount: discount > 0 ? discount : undefined,
            itemsCount: state.totalItems,
          };
        },

        // Get single item
        getItem: (bookId) => {
          return get().items.find((item) => item.bookId === bookId);
        },

        // Check if item exists
        hasItem: (bookId) => {
          return get().items.some((item) => item.bookId === bookId);
        },

        // Get item quantity
        getItemQuantity: (bookId) => {
          return (
            get().items.find((item) => item.bookId === bookId)?.quantity || 0
          );
        },

        // Clear error
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        // Load saved cart
        loadSavedCart: () => {
          const saved = localStorage.getItem("cart-storage");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              set((state) => {
                state.items = parsed.state.items || [];
                state.totalItems = parsed.state.totalItems || 0;
                state.totalPrice = parsed.state.totalPrice || 0;
                state.lastUpdated = parsed.state.lastUpdated || null;
              });
            } catch (error) {
              console.error("Failed to load saved cart:", error);
            }
          }
        },

        // Save cart
        saveCart: () => {
          const state = get();
          localStorage.setItem(
            "cart-storage",
            JSON.stringify({
              state: {
                items: state.items,
                totalItems: state.totalItems,
                totalPrice: state.totalPrice,
                lastUpdated: state.lastUpdated,
              },
            }),
          );
        },
      }),
      {
        name: "cart-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state.items,
          totalItems: state.totalItems,
          totalPrice: state.totalPrice,
          lastUpdated: state.lastUpdated,
          appliedPromo: state.appliedPromo,
        }),
      },
    ),
  ),
);
