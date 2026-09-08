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
