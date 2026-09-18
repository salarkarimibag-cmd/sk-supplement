"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
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
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((current) => current !== listener);
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

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  function addItem(item: Omit<CartItem, "quantity">) {
    const current = getSnapshot();
    const existing = current.find((cartItem) => cartItem.id === item.id);
    const next = existing
      ? current.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      : [...current, { ...item, quantity: 1 }];
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
      getSnapshot().map((cartItem) => (cartItem.id === id ? { ...cartItem, quantity } : cartItem))
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
