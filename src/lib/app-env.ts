import { SITE_URL } from "@/lib/content/site";

export type AppEnv = "prod" | "preprod" | "local";

/**
 * Which environment this instance runs in. Vercel sets VERCEL_ENV at runtime:
 * "production" for prod, "preview" for the preprod branch, undefined locally.
 */
export function appEnv(): AppEnv {
  const v = process.env.VERCEL_ENV;
  if (v === "production") return "prod";
  if (v === "preview") return "preprod";
  return "local";
}

/** True everywhere except production (used to show the env chip). */
export function isNonProd(): boolean {
  return appEnv() !== "prod";
}

/**
 * Canonical base URL for links we hand to users: emails, invoices, redirects.
 *
 * Production ALWAYS uses the real domain (SITE_URL) and never a Vercel URL, so a
 * per-deployment host (e.g. secondcycle-xxxxx.vercel.app) can never reach a
 * customer even if AUTH_URL is misconfigured. Preprod uses the STABLE per-branch
 * URL (VERCEL_BRANCH_URL), not the ephemeral per-deployment VERCEL_URL. Local
 * uses AUTH_URL or localhost.
 */
export function appBaseUrl(): string {
  if (appEnv() === "prod") return SITE_URL;
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3082";
}
