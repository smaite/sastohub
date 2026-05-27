import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  getQuantity: (productId) => {
    const item = get().items.find((i) => i.id === productId);
    return item ? item.quantity : 0;
  },
  addItem: (product, quantity = 1) => {
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
    const maxStock = Number.parseInt(product?.stock_quantity, 10) || 0;
    if (maxStock <= 0) return 0;

    const items = get().items;
    const existingItem = items.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const allowedToAdd = maxStock - currentQty;
    if (allowedToAdd <= 0) return 0;

    const toAdd = Math.min(qty, allowedToAdd);
    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + toAdd }
            : item
        ),
      });
      return toAdd;
    }

    set({ items: [...items, { ...product, quantity: toAdd }] });
    return toAdd;
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    const items = get().items;
    const existingItem = items.find((item) => item.id === productId);
    if (!existingItem) return;

    const maxStock = Number.parseInt(existingItem.stock_quantity, 10) || 0;
    const nextQty = Number.parseInt(quantity, 10) || 0;

    if (nextQty <= 0 || maxStock <= 0) {
      set({ items: items.filter((item) => item.id !== productId) });
      return;
    }

    const safeQty = Math.min(nextQty, maxStock);
    set({
      items: items.map((item) =>
        item.id === productId ? { ...item, quantity: safeQty } : item
      ),
    });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
}));
