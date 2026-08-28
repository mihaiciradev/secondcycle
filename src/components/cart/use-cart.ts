"use client";

import { useSyncExternalStore } from "react";
import * as cart from "@/lib/cart";

export function useCart() {
  const items = useSyncExternalStore(cart.subscribe, cart.getItems, cart.getServerItems);
  return {
    items,
    count: items.length,
    add: cart.addItem,
    remove: cart.removeItem,
    clear: cart.clearCart,
    has: cart.hasItem,
  };
}
