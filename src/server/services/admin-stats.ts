import { and, count, desc, eq, gte, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import type { DB } from "@/server/db/client";
import {
  bikeWatchers,
  bikes,
  emailLog,
  orderItems,
  orders,
  users,
} from "@/server/db/schema";

const num = (v: unknown): number => (v == null ? 0 : Number(v));

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

/**
 * A bundle of admin dashboard metrics, computed with SQL aggregates. Everything
 * here is data we own (no third-party calls); Stripe/live-balance is fetched
 * separately and best-effort so a Stripe hiccup never blocks the page.
 */
export async function getAdminStats(db: DB) {
  const monthStart = sql`date_trunc('month', now())`;

  const [
    bikeRows,
    orderRows,
    paidAgg,
    monthPaid,
    monthlySeries,
    userAgg,
    watchWaiting,
    topWatched,
    emailAgg,
    dbSize,
    recent,
  ] = await Promise.all([
    db.select({ status: bikes.status, n: count() }).from(bikes).groupBy(bikes.status),

    db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status),

    db
      .select({
        n: count(),
        cents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
      })
      .from(orders)
      .where(isNotNull(orders.paidAt)),

    db
      .select({
        n: count(),
        cents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
      })
      .from(orders)
      .where(and(isNotNull(orders.paidAt), gte(orders.paidAt, monthStart))),

    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${orders.paidAt}), 'YYYY-MM')`,
        n: count(),
        cents: sql<number>`coalesce(sum(${orders.totalCents}), 0)`,
      })
      .from(orders)
      .where(
        and(
          isNotNull(orders.paidAt),
          gte(orders.paidAt, sql`date_trunc('month', now()) - interval '5 months'`)
        )
      )
      .groupBy(sql`date_trunc('month', ${orders.paidAt})`)
      .orderBy(sql`date_trunc('month', ${orders.paidAt})`),

    db
      .select({
        total: count(),
        verified: sql<number>`count(*) filter (where ${users.emailVerifiedAt} is not null)`,
        admins: sql<number>`count(*) filter (where ${users.role} = 'admin')`,
        workshops: sql<number>`count(*) filter (where ${users.role} = 'workshop')`,
        newThisMonth: sql<number>`count(*) filter (where ${users.createdAt} >= date_trunc('month', now()))`,
        marketing: sql<number>`count(*) filter (where ${users.marketingOptIn})`,
      })
      .from(users),

    db.select({ n: count() }).from(bikeWatchers).where(isNull(bikeWatchers.notifiedAt)),

    db
      .select({
        bikeId: bikeWatchers.bikeId,
        brand: bikes.brand,
        model: bikes.model,
        sku: bikes.sku,
        status: bikes.status,
        n: count(),
      })
      .from(bikeWatchers)
      .innerJoin(bikes, eq(bikes.id, bikeWatchers.bikeId))
      .where(isNull(bikeWatchers.notifiedAt))
      .groupBy(bikeWatchers.bikeId, bikes.brand, bikes.model, bikes.sku, bikes.status)
      .orderBy(desc(count()))
      .limit(5),

    db
      .select({
        sentMonth: sql<number>`count(*) filter (where ${emailLog.status} = 'sent' and ${emailLog.createdAt} >= date_trunc('month', now()))`,
        sentToday: sql<number>`count(*) filter (where ${emailLog.status} = 'sent' and ${emailLog.createdAt} >= current_date)`,
        failedMonth: sql<number>`count(*) filter (where ${emailLog.status} = 'failed' and ${emailLog.createdAt} >= date_trunc('month', now()))`,
      })
      .from(emailLog),

    db.execute<{ bytes: string }>(sql`select pg_database_size(current_database()) as bytes`),

    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);

  const bikeBy = (s: string) => num(bikeRows.find((r) => r.status === s)?.n);
  const orderBy = (s: string) => num(orderRows.find((r) => r.status === s)?.n);

  // Attach a one-line item label to the recent orders.
  const recentItems = recent.length
    ? await db
        .select({ orderId: orderItems.orderId, brand: orderItems.brand, model: orderItems.model })
        .from(orderItems)
        .where(inArray(orderItems.orderId, recent.map((o) => o.id)))
    : [];
  const firstItem = new Map<string, { brand: string; model: string; count: number }>();
  for (const it of recentItems) {
    const cur = firstItem.get(it.orderId);
    if (cur) cur.count += 1;
    else firstItem.set(it.orderId, { brand: it.brand, model: it.model, count: 1 });
  }

  const u = userAgg[0];
  const e = emailAgg[0];

  return {
    bikes: {
      available: bikeBy("available"),
      reserved: bikeBy("reserved"),
      sold: bikeBy("sold"),
      draft: bikeBy("draft"),
      withdrawn: bikeBy("withdrawn"),
      total: bikeRows.reduce((s, r) => s + num(r.n), 0),
    },
    orders: {
      pending: orderBy("pending"),
      confirmed: orderBy("confirmed"),
      completed: orderBy("completed"),
      cancelled: orderBy("cancelled"),
      total: orderRows.reduce((s, r) => s + num(r.n), 0),
    },
    revenue: {
      allTimeCents: num(paidAgg[0]?.cents),
      paidCount: num(paidAgg[0]?.n),
      thisMonthCents: num(monthPaid[0]?.cents),
      thisMonthCount: num(monthPaid[0]?.n),
      monthly: monthlySeries.map((m) => ({ month: m.month, cents: num(m.cents), n: num(m.n) })),
    },
    users: {
      total: num(u?.total),
      customers: num(u?.total) - num(u?.admins) - num(u?.workshops),
      verified: num(u?.verified),
      newThisMonth: num(u?.newThisMonth),
      marketing: num(u?.marketing),
      workshops: num(u?.workshops),
    },
    watchers: {
      waiting: num(watchWaiting[0]?.n),
      top: topWatched.map((w) => ({
        label: `${w.brand} ${w.model}`,
        sku: w.sku,
        status: w.status,
        count: num(w.n),
      })),
    },
    email: {
      sentMonth: num(e?.sentMonth),
      sentToday: num(e?.sentToday),
      failedMonth: num(e?.failedMonth),
    },
    dbSizeBytes: num(dbSize.rows[0]?.bytes),
    recentOrders: recent.map((o) => {
      const it = firstItem.get(o.id);
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalCents: o.totalCents,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
        label: it ? `${it.brand} ${it.model}` : "-",
        itemCount: it?.count ?? 0,
      };
    }),
  };
}
