import type { Order, Quote, RepairTierId, Vehicle, VehicleSerial } from "@/lib/domain/types";

/**
 * Typed data-access layer. Components call these functions and never build URLs
 * or parse payloads themselves, so replacing the stub route handlers with a real
 * backend touches only this file.
 *
 * Relative paths work for client-side calls; a base URL can be injected here
 * later for server-side fetches without changing any caller.
 */

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function getVehicles(): Promise<{ vehicles: Vehicle[] }> {
  return getJson("/api/bikes");
}

export function getOrders(): Promise<{ orders: Order[] }> {
  return getJson("/api/orders");
}

export function createQuote(input: {
  vehicleSerial: VehicleSerial;
  repairTier: RepairTierId;
}): Promise<{ quote: Quote }> {
  return getJson("/api/quotes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
