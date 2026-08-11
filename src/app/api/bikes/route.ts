import type { Vehicle } from "@/lib/domain/types";

/**
 * Stub handler for the vehicle catalogue. Returns mock data now; swapping in a
 * real backend should touch only this file, never the components that fetch it.
 * The route is named /api/bikes for the current UI vocabulary, but the payload
 * is the vehicle-neutral `Vehicle` shape.
 */
const MOCK_VEHICLES: Vehicle[] = [
  {
    serial: "RO-4471",
    kind: "bicycle",
    title: "Trekking urban, cadru aluminiu",
    frameSize: "M / 54",
    conditionGrade: "B",
    price: { amount: 145000, currency: "RON" },
    availability: "available",
    frameNumberChecked: true,
  },
  {
    serial: "RO-4472",
    kind: "bicycle",
    title: "MTB hardtail 29\"",
    frameSize: "L / 19",
    conditionGrade: "C",
    price: { amount: 98000, currency: "RON" },
    availability: "reserved",
    frameNumberChecked: true,
  },
];

export async function GET() {
  return Response.json({ vehicles: MOCK_VEHICLES });
}
