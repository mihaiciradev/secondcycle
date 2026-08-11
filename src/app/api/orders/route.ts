import type { Order } from "@/lib/domain/types";

/**
 * Stub handler for orders. Order status is a real state machine (see
 * OrderStatus): reservation → payment → repair → handover. The invoice is
 * issued by a Stripe webhook, not here, and the success page triggers nothing.
 * This stub only reads/creates order records.
 */
export async function GET() {
  const orders: Order[] = [];
  return Response.json({ orders });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<Order>;

  const order: Order = {
    id: `o_${Date.now()}`,
    vehicleSerial: body.vehicleSerial ?? "RO-0000",
    repairTier: body.repairTier ?? "basic",
    status: "reserved",
    createdAt: new Date().toISOString(),
  };

  return Response.json({ order }, { status: 201 });
}
