/**
 * Drizzle schema for the SecondCycle backend.
 *
 * Conventions (from the brief):
 * - uuid PKs via gen_random_uuid() (built into Neon/Postgres 15).
 * - created_at / updated_at timestamptz everywhere.
 * - money as integer bani (RON cents) — never floats.
 * - Postgres enums for every status/kind.
 *
 * NOTE: no repair tiers. A bike carries a single admin-set price; an order
 * snapshots that price as its total.
 */
import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  customType,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Case-insensitive text (requires the citext extension, created in migration). */
const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

/** Postgres inet type, for storing the consent IP address. */
const inet = customType<{ data: string }>({
  dataType() {
    return "inet";
  },
});

const pk = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["customer", "admin", "workshop"]);
export const tokenKindEnum = pgEnum("token_kind", [
  "verify_email",
  "password_reset",
  "newsletter_confirm",
  "newsletter_unsub",
]);
export const bikeCategoryEnum = pgEnum("bike_category", [
  "city",
  "trekking",
  "mtb",
  "road",
  "kids",
  "ebike",
]);
export const conditionGradeEnum = pgEnum("condition_grade", ["A", "B", "C"]);
export const bikeStatusEnum = pgEnum("bike_status", [
  "draft",
  "available",
  "reserved",
  "sold",
  "withdrawn",
]);
export const serviceKindEnum = pgEnum("service_kind", ["intake", "final"]);
export const reservationStatusEnum = pgEnum("reservation_status", [
  "active",
  "expired",
  "cancelled",
  "converted",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);
export const billingTypeEnum = pgEnum("billing_type", ["individual", "company"]);
export const deliveryMethodEnum = pgEnum("delivery_method", ["pickup", "courier"]);
export const emailStatusEnum = pgEnum("email_status", ["sent", "failed"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "sending", "sent"]);
export const recipientStatusEnum = pgEnum("recipient_status", ["pending", "sent", "failed"]);

// ---------------------------------------------------------------------------
// Auth / users
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: pk(),
  email: citext("email").notNull().unique(),
  passwordHash: text("password_hash"), // null for Google-only users
  role: roleEnum("role").notNull().default("customer"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  marketingOptInAt: timestamp("marketing_opt_in_at", { withTimezone: true }),
  // Bumped on password reset to invalidate existing JWT sessions.
  sessionVersion: integer("session_version").notNull().default(0),
  // For role='workshop': the workshop this login belongs to.
  workshopId: uuid("workshop_id").references((): AnyPgColumn => workshops.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Auth.js Drizzle-adapter accounts table — used for the Google link only. */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

/** Single-use email tokens; only the sha256 hash of the value is stored. */
export const tokens = pgTable("tokens", {
  id: pk(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: citext("email"),
  kind: tokenKindEnum("kind").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: pk(),
  email: citext("email").notNull().unique(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Workshops
// ---------------------------------------------------------------------------
export const workshops = pgTable("workshops", {
  id: pk(),
  name: text("name").notNull(),
  location: text("location"),
  workHours: text("work_hours"),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: citext("email"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Bikes
// ---------------------------------------------------------------------------
export const bikes = pgTable("bikes", {
  id: pk(),
  sku: text("sku").notNull().unique(),
  frameNumber: text("frame_number").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  modelYear: integer("model_year"),
  category: bikeCategoryEnum("category").notNull(),
  frameSize: text("frame_size").notNull(),
  wheelSize: text("wheel_size").notNull(),
  conditionGrade: conditionGradeEnum("condition_grade").notNull(),
  priceCents: integer("price_cents").notNull(),
  oldPriceCents: integer("old_price_cents"),
  description: text("description").notNull().default(""),
  workDone: jsonb("work_done").$type<string[]>().notNull().default([]),
  status: bikeStatusEnum("status").notNull().default("draft"),
  photos: jsonb("photos").$type<string[]>().notNull().default([]), // ordered R2 keys
  // Admin assigns the bike to a workshop that files its service papers.
  workshopId: uuid("workshop_id").references(() => workshops.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type ChecklistItem = {
  item: string;
  status: "ok" | "replaced" | "repaired" | "attention";
  note?: string;
};

export const serviceRecords = pgTable(
  "service_records",
  {
    id: pk(),
    bikeId: uuid("bike_id")
      .notNull()
      .references(() => bikes.id, { onDelete: "restrict" }),
    workshopId: uuid("workshop_id")
      .notNull()
      .references(() => workshops.id, { onDelete: "restrict" }),
    kind: serviceKindEnum("kind").notNull(),
    checklist: jsonb("checklist").$type<ChecklistItem[]>().notNull().default([]),
    summary: text("summary"),
    performedBy: text("performed_by").notNull(),
    performedAt: date("performed_at").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  // At most one intake and one final per bike.
  (t) => [uniqueIndex("service_records_bike_kind_uq").on(t.bikeId, t.kind)]
);

// ---------------------------------------------------------------------------
// Reservations (30-minute hold)
// ---------------------------------------------------------------------------
export const reservations = pgTable(
  "reservations",
  {
    id: pk(),
    bikeId: uuid("bike_id")
      .notNull()
      .references(() => bikes.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: reservationStatusEnum("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Last line of defense: one active hold per bike, one active hold per user.
    uniqueIndex("reservations_bike_active_uq")
      .on(t.bikeId)
      .where(sql`status = 'active'`),
    uniqueIndex("reservations_user_active_uq")
      .on(t.userId)
      .where(sql`status = 'active'`),
  ]
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export const orders = pgTable("orders", {
  id: pk(),
  orderNumber: text("order_number")
    .notNull()
    .unique()
    .default(
      sql`'SC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 6, '0')`
    ),
  bikeId: uuid("bike_id")
    .notNull()
    .references(() => bikes.id, { onDelete: "restrict" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  reservationId: uuid("reservation_id").references(() => reservations.id, {
    onDelete: "set null",
  }),
  status: orderStatusEnum("status").notNull().default("pending"),
  // Prices snapshotted at creation — later bike edits must not change orders.
  bikePriceCents: integer("bike_price_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  billingType: billingTypeEnum("billing_type").notNull(),
  billingName: text("billing_name").notNull(),
  billingEmail: citext("billing_email").notNull(),
  billingPhone: text("billing_phone").notNull(),
  billingStreet: text("billing_street").notNull(),
  billingCity: text("billing_city").notNull(),
  billingCounty: text("billing_county").notNull(),
  billingPostalCode: text("billing_postal_code").notNull(),
  billingCountry: text("billing_country").notNull().default("RO"),
  companyName: text("company_name"),
  companyCui: text("company_cui"),
  companyRegCom: text("company_reg_com"),
  deliveryMethod: deliveryMethodEnum("delivery_method").notNull(),
  deliveryStreet: text("delivery_street"),
  deliveryCity: text("delivery_city"),
  deliveryCounty: text("delivery_county"),
  deliveryPostalCode: text("delivery_postal_code"),
  termsVersion: text("terms_version").notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
  termsAcceptedIp: inet("terms_accepted_ip").notNull(),
  customerNote: text("customer_note"),
  adminNote: text("admin_note"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// Email log + campaigns (outbox)
// ---------------------------------------------------------------------------
export const emailLog = pgTable("email_log", {
  id: pk(),
  toEmail: citext("to_email").notNull(),
  template: text("template").notNull(),
  subject: text("subject").notNull(),
  status: emailStatusEnum("status").notNull(),
  providerId: text("provider_id"),
  error: text("error"),
  createdAt: createdAt(),
});

export const campaigns = pgTable("campaigns", {
  id: pk(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  status: campaignStatusEnum("status").notNull().default("draft"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const campaignRecipients = pgTable("campaign_recipients", {
  id: pk(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  email: citext("email").notNull(),
  status: recipientStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Rate limiting (fixed window)
// ---------------------------------------------------------------------------
export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })]
);
