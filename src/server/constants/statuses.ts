/**
 * Allowed status transitions. Enforced in the services; the DB constraints and
 * partial unique indexes are the backstop.
 */
import type { bikeStatusEnum, orderStatusEnum } from "@/server/db/schema";

export type BikeStatus = (typeof bikeStatusEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

/**
 * Transitions an ADMIN may perform directly on a bike.
 * (System transitions — available→reserved on hold, reserved→sold on order
 * confirm, reserved→available on expiry/cancel — happen inside services, not
 * through the admin transition endpoint.)
 * reserved→available is a force-release that also cancels the active hold.
 */
export const ADMIN_BIKE_TRANSITIONS: Record<BikeStatus, BikeStatus[]> = {
  draft: ["available"],
  available: ["withdrawn"],
  withdrawn: ["available"],
  reserved: ["available"],
  sold: [],
};

/** Transitions an admin may perform on an order (with side effects on the bike). */
export const ADMIN_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function canAdminTransitionBike(from: BikeStatus, to: BikeStatus): boolean {
  return ADMIN_BIKE_TRANSITIONS[from].includes(to);
}

export function canAdminTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_ORDER_TRANSITIONS[from].includes(to);
}
