import type { Quote, RepairTierId, VehicleSerial } from "@/lib/domain/types";

/**
 * Stub handler for quotes. A quote combines a vehicle price with the chosen
 * repair tier price. Prices are quoted per bike, so real figures come from the
 * backend later, this stub just echoes a computed shape.
 */
export async function GET() {
  const quotes: Quote[] = [];
  return Response.json({ quotes });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    vehicleSerial?: VehicleSerial;
    repairTier?: RepairTierId;
  };

  const quote: Quote = {
    id: `q_${Date.now()}`,
    vehicleSerial: body.vehicleSerial ?? "RO-0000",
    repairTier: body.repairTier ?? "basic",
    vehiclePrice: { amount: 0, currency: "RON" },
    repairPrice: { amount: 0, currency: "RON" },
    total: { amount: 0, currency: "RON" },
    createdAt: new Date().toISOString(),
  };

  return Response.json({ quote }, { status: 201 });
}
