/**
 * Guest basket, stored in the browser (localStorage). Unique second-hand bikes:
 * one of each, so an item is either in the basket or not. A tiny external store
 * (subscribe / getSnapshot) so components can read it via useSyncExternalStore
 * without a React context provider, and it stays in sync across tabs.
 */
export type CartItem = {
  bikeId: string;
  sku: string;
  brand: string;
  model: string;
  priceCents: number;
  photo?: string | null;
};

const KEY = "sc_cart_v1";
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();
let wired = false;

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function ensure(): CartItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function commit(next: CartItem[]): void {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage may be unavailable (private mode) - in-memory cache still works
  }
  for (const l of listeners) l();
}

export function subscribe(cb: () => void): () => void {
  if (!wired && typeof window !== "undefined") {
    wired = true;
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) {
        cache = readStorage();
        for (const l of listeners) l();
      }
    });
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Stable snapshot: same reference until the next mutation (safe for useSES). */
export function getItems(): CartItem[] {
  return ensure();
}

export function getServerItems(): CartItem[] {
  return EMPTY;
}

export function addItem(item: CartItem): void {
  const cur = ensure();
  if (cur.some((x) => x.bikeId === item.bikeId)) return;
  commit([...cur, item]);
}

export function removeItem(bikeId: string): void {
  const cur = ensure();
  if (!cur.some((x) => x.bikeId === bikeId)) return;
  commit(cur.filter((x) => x.bikeId !== bikeId));
}

export function clearCart(): void {
  commit([]);
}

export function hasItem(bikeId: string): boolean {
  return ensure().some((x) => x.bikeId === bikeId);
}
