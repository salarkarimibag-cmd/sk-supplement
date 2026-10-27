"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { syncCartItems, type CartCatalogEntry, type CartSyncResult } from "@/lib/cartSync";
import { capQuantity } from "@/lib/stock";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  /**
   * The product's stock when it was added (or when checkout last refreshed
   * it); the cart never goes above it. Missing on lines saved before carts
   * kept it.
   */
  stock?: number;
}

const STORAGE_KEY = "sk-supplement-cart";
const EMPTY_CART: CartItem[] = [];

let cachedItems: CartItem[] | undefined;
let listeners: (() => void)[] = [];

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  cachedItems = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private browsing, blocked site data, etc.) — ignore.
  }
  notifyListeners();
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

/**
 * Another tab changed the saved cart: drop this tab's copy so the next read
 * picks up the new one. Without this, a stale tab would overwrite the other
 * tab's changes the next time it wrote. (The event never fires in the tab
 * that wrote.)
 */
function handleStorage(event: StorageEvent) {
  // key is null when the other tab cleared all of localStorage.
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  cachedItems = undefined;
  notifyListeners();
}

function subscribe(listener: () => void) {
  if (listeners.length === 0) window.addEventListener("storage", handleStorage);
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((current) => current !== listener);
    if (listeners.length === 0) window.removeEventListener("storage", handleStorage);
  };
}

/** getSnapshot for useSyncExternalStore — only ever called on the client. */
function getSnapshot(): CartItem[] {
  if (cachedItems === undefined) cachedItems = readCart();
  return cachedItems;
}

/** getServerSnapshot — the server has no localStorage, so it always renders an empty cart. */
function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

/**
 * Replaces the saved prices, stock, names and photos with the catalog's,
 * drops products it no longer has (or that sold out) and lowers quantities
 * to the stock; returns what changed. At module level, not inside
 * CartProvider, so it's the same function on every render and an effect can
 * depend on it.
 */
function syncWithCatalog(
  catalog: CartCatalogEntry[]
): Pick<CartSyncResult, "pricesChanged" | "quantitiesChanged"> {
  const { items, pricesChanged, quantitiesChanged } = syncCartItems(getSnapshot(), catalog);
  writeCart(items);
  return { pricesChanged, quantitiesChanged };
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncWithCatalog: typeof syncWithCatalog;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  // Adding a product that's already in the cart also refreshes its saved
  // details (price, stock) from the page it was added on, then adds one
  // unit, up to the stock and MAX_PER_ORDER (see capQuantity).
  function addItem(item: Omit<CartItem, "quantity">) {
    // Sold out: capping to the stock would leave a line with quantity 0.
    if (item.stock !== undefined && item.stock < 1) return;
    const current = getSnapshot();
    const existing = current.find((cartItem) => cartItem.id === item.id);
    const next = existing
      ? current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, ...item, quantity: capQuantity(cartItem.quantity + 1, item.stock) }
            : cartItem
        )
      : [...current, { ...item, quantity: capQuantity(1, item.stock) }];
    writeCart(next);
  }

  function removeItem(id: string) {
    writeCart(getSnapshot().filter((cartItem) => cartItem.id !== id));
  }

  function setQuantity(id: string, quantity: number) {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    writeCart(
      getSnapshot().map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: capQuantity(quantity, cartItem.stock) }
          : cartItem
      )
    );
  }

  function clearCart() {
    writeCart([]);
  }

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        setQuantity,
        clearCart,
        syncWithCatalog,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
