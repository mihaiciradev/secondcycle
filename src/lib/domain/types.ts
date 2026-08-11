/**
 * Domain model for Second Cycle.
 *
 * Deliberately vehicle-neutral: the business sells bicycles today but will add
 * e-bikes and scooters, so the domain layer never hardcodes "bike". UI copy
 * says "bicicletă"; the data shapes say `Vehicle` / `Item`.
 *
 * Legal framing baked in: Second Cycle is the *seller* (consignee selling in
 * its own name), never a marketplace. There is no owner/seller entity exposed
 * here, by design.
 */

export type CurrencyCode = "RON";

/** Every unit is one-of-one, identified by an internal serial (e.g. RO-4471). */
export type VehicleSerial = string;

export type VehicleKind = "bicycle"; // future: | "ebike" | "scooter"

/** Condition is a graded code, not a marketing adjective. */
export type ConditionGrade = "A" | "B" | "C" | "D";

/**
 * A vehicle is a single physical unit. There is no stock count, exactly one
 * of each exists, so availability is a lifecycle state, not a quantity.
 */
export type VehicleAvailability = "available" | "reserved" | "sold";

export interface Money {
  amount: number; // minor-unit-safe integer (bani)
  currency: CurrencyCode;
}

export interface Vehicle {
  serial: VehicleSerial;
  kind: VehicleKind;
  title: string;
  frameSize: string;
  conditionGrade: ConditionGrade;
  price: Money;
  availability: VehicleAvailability;
  /** Frame number checked against the national stolen-vehicle registry. */
  frameNumberChecked: boolean;
}

/** Buyer picks a repair tier at purchase; its price adds to the vehicle price. */
export type RepairTierId = "basic" | "quality" | "premium";

/**
 * Order status is a real state machine, payment happens before repair, and
 * the whole flow can span weeks. The withdrawal clock starts at `handed_over`.
 */
export type OrderStatus =
  | "reserved" // checkout started, vehicle held
  | "paid" // payment captured, invoice issued by webhook
  | "in_repair" // being repaired at the chosen tier
  | "ready" // repaired, awaiting handover
  | "handed_over" // signed handover protocol, legal clocks start
  | "cancelled" // reservation released before payment
  | "returned"; // withdrawal (14 days) or warranty return

export interface Order {
  id: string;
  vehicleSerial: VehicleSerial;
  repairTier: RepairTierId;
  status: OrderStatus;
  createdAt: string; // ISO 8601
}

export interface Quote {
  id: string;
  vehicleSerial: VehicleSerial;
  repairTier: RepairTierId;
  vehiclePrice: Money;
  repairPrice: Money;
  total: Money;
  createdAt: string; // ISO 8601
}
