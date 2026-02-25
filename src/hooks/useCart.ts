import { useState, useCallback, useEffect } from "react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import type { CartItem, Book, CartSummary } from "../types";
import toast from "react-hot-toast";

interface UseCartReturn {
  // Cart state
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  summary: CartSummary;

  // Cart actions
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  clearCart: () => void;

  // Bulk actions
  addMultiple: (
    items: Array<{ book: Book; quantity: number }>,
  ) => Promise<void>;

  // Item management
  isInCart: (bookId: string) => boolean;
  getItemQuantity: (bookId: string) => number;
  getItem: (bookId: string) => CartItem | undefined;

  // Cart validation
  validateCart: () => Promise<{
    valid: boolean;
    invalidItems: Array<{ bookId: string; reason: string }>;
  }>;

  // Sync with server
  syncCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;

  // Loading states
  isUpdating: boolean;
  isSyncing: boolean;
  error: string | null;

  // Price calculations
  calculateSubtotal: () => number;
  calculateTax: (rate?: number) => number;
  calculateShipping: (threshold?: number, rate?: number) => number;
  calculateTotal: (
    taxRate?: number,
    shippingThreshold?: number,
    shippingRate?: number,
  ) => number;

  // Promotions
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
  appliedPromo: { code: string; discount: number } | null;
}

export const useCart = (): UseCartReturn => {
  const {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity: storeUpdateQuantity,
    clearCart: storeClearCart,
  } = useCartStore();

  const { user } = useAuthStore();
  const { getItem, hasItem, mergeCarts } = useCartStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  // Calculate summary
  const calculateSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const calculateTax = useCallback(
    (rate: number = 0.08) => {
      return calculateSubtotal() * rate;
    },
    [calculateSubtotal],
  );

  const calculateShipping = useCallback(
    (threshold: number = 25, rate: number = 4.99) => {
      const subtotal = calculateSubtotal();
      return subtotal >= threshold ? 0 : rate;
    },
    [calculateSubtotal],
  );

  const calculateTotal = useCallback(
    (
      taxRate: number = 0.08,
      shippingThreshold: number = 25,
      shippingRate: number = 4.99,
    ) => {
      const subtotal = calculateSubtotal();
      const tax = subtotal * taxRate;
      const shipping = subtotal >= shippingThreshold ? 0 : shippingRate;
      const discount = appliedPromo?.discount || 0;

      return subtotal + tax + shipping - discount;
    },
    [calculateSubtotal, appliedPromo],
  );

  const summary: CartSummary = {
    subtotal: calculateSubtotal(),
    tax: calculateTax(),
    shipping: calculateShipping(),
    total: calculateTotal(),
    discount: appliedPromo?.discount,
  };

  // Add to cart with validation
  const addToCart = async (book: Book, quantity: number = 1) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Validate stock
      if (book.stock < quantity) {
        throw new Error(`Only ${book.stock} copies available`);
      }

      // Check if item already in cart
      const existingItem = getItem(book.id);
      const newQuantity = (existingItem?.quantity || 0) + quantity;

      if (existingItem && newQuantity > book.stock) {
        throw new Error(`Cannot add more than ${book.stock} copies`);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      addItem({
        bookId: book.id,
        title: book.title,
        price: book.price,
        quantity,
        coverImage: book.coverImage,
        stock: book.stock,
      });

      toast.success(`Added "${book.title}" to cart`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add item to cart";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Add multiple items at once
  const addMultiple = async (
    items: Array<{ book: Book; quantity: number }>,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      for (const { book, quantity } of items) {
        if (book.stock < quantity) {
          throw new Error(`Insufficient stock for "${book.title}"`);
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      items.forEach(({ book, quantity }) => {
        addItem({
          bookId: book.id,
          title: book.title,
          price: book.price,
          quantity,
          coverImage: book.coverImage,
          stock: book.stock,
        });
      });

      toast.success(`Added ${items.length} items to cart`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add items";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update quantity with validation
  const updateQuantity = async (bookId: string, quantity: number) => {
    setIsUpdating(true);
    setError(null);

    try {
      const item = getItem(bookId);
      if (!item) throw new Error("Item not found in cart");

      if (quantity > item.stock) {
        throw new Error(`Cannot exceed available stock (${item.stock})`);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      storeUpdateQuantity(bookId, quantity);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update quantity";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove from cart
  const removeFromCart = (bookId: string) => {
    const item = getItem(bookId);
    removeItem(bookId);
    if (item) {
      toast.success(`Removed "${item.title}" from cart`);
    }
  };

  // Clear cart
  const clearCart = () => {
    storeClearCart();
    setAppliedPromo(null);
    toast.success("Cart cleared");
  };

  // Check if item is in cart
  const isInCart = useCallback(
    (bookId: string) => {
      return hasItem(bookId);
    },
    [hasItem],
  );

  // Get item quantity
  const getItemQuantity = useCallback(
    (bookId: string) => {
      return getItem(bookId)?.quantity || 0;
    },
    [getItem],
  );

  // Validate cart items
  const validateCart = async (): Promise<{
    valid: boolean;
    invalidItems: Array<{ bookId: string; reason: string }>;
  }> => {
    const invalidItems: Array<{ bookId: string; reason: string }> = [];

    for (const item of items) {
      // Simulate API call to check stock
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Mock validation
      if (item.quantity > item.stock) {
        invalidItems.push({
          bookId: item.bookId,
          reason: `Only ${item.stock} available`,
        });
      }
    }

    return {
      valid: invalidItems.length === 0,
      invalidItems,
    };
  };

  // Sync cart with server
  const syncCart = async () => {
    if (!user) return;

    setIsSyncing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, you would:
      // 1. Send cart to server
      // 2. Get updated cart from server
      // 3. Merge any changes

      toast.success("Cart synced");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sync cart";
      toast.error(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Merge guest cart with user cart after login
  const mergeGuestCart = async () => {
    const guestCart = JSON.parse(
      localStorage.getItem("bookstore-cart") || "{}",
    );

    if (guestCart?.state?.items?.length > 0) {
      mergeCarts(guestCart.state.items);
      localStorage.removeItem("bookstore-cart");
      toast.success("Cart merged successfully");
    }
  };

  // Apply promo code
  const applyPromoCode = async (code: string): Promise<boolean> => {
    setIsUpdating(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock promo codes
      const promos: Record<string, number> = {
        SAVE10: 0.1,
        SAVE20: 0.2,
        FREESHIP: 4.99,
      };

      const discount = promos[code.toUpperCase()];

      if (!discount) {
        throw new Error("Invalid promo code");
      }

      setAppliedPromo({
        code: code.toUpperCase(),
        discount: discount * (code === "FREESHIP" ? 1 : calculateSubtotal()),
      });

      toast.success(`Promo code "${code}" applied!`);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to apply promo code";
      toast.error(message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed");
  };

  // Auto-sync cart when user logs in
  useEffect(() => {
    if (user) {
      mergeGuestCart();
    }
  }, [user]);

  // Validate cart periodically
  useEffect(() => {
    const validate = async () => {
      const { valid, invalidItems } = await validateCart();
      if (!valid) {
        // Handle invalid items (e.g., update quantities, remove items)
        invalidItems.forEach(({ bookId /*reason*/ }) => {
          const item = getItem(bookId);
          if (item) {
            storeUpdateQuantity(bookId, item.stock);
          }
        });
      }
    };

    validate();
  }, [items]);

  return {
    items,
    totalItems,
    totalPrice,
    summary,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addMultiple,
    isInCart,
    getItemQuantity,
    getItem,
    validateCart,
    syncCart,
    mergeGuestCart,
    isUpdating,
    isSyncing,
    error,
    calculateSubtotal,
    calculateTax,
    calculateShipping,
    calculateTotal,
    applyPromoCode,
    removePromoCode,
    appliedPromo,
  };
};
