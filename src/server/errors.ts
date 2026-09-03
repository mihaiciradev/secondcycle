/** Domain errors. Thin shells (actions/handlers) map these to HTTP/UI. */
export class AppError extends Error {
  constructor(
    public code: string,
    message?: string
  ) {
    super(message ?? code);
    this.name = "AppError";
  }
}

export const Unauthorized = () => new AppError("UNAUTHORIZED", "Autentificare necesară");
export const Forbidden = () => new AppError("FORBIDDEN", "Acces interzis");
export const Conflict = (msg?: string) => new AppError("CONFLICT", msg);
export const NotFound = (msg?: string) => new AppError("NOT_FOUND", msg);
export const Invalid = (msg?: string) => new AppError("INVALID", msg);

/** Readable message for the common Postgres constraint errors. */
function pgFriendly(e: unknown): string | null {
  const code = (e as { code?: string } | null)?.code;
  switch (code) {
    case "23505":
      return "Există deja o înregistrare cu aceste date (valoare duplicată).";
    case "23503":
      return "Operația încalcă o legătură cu alte date.";
    case "23502":
      return "Lipsește un câmp obligatoriu.";
    case "23514":
      return "O valoare nu respectă regulile permise.";
    case "22P02":
    case "22007":
      return "Format de date invalid.";
    default:
      return null;
  }
}

/**
 * Turn any thrown value into a message that actually says what went wrong,
 * instead of a blank "ceva a mers prost".
 *
 * - AppError carries a message written for the user: return it as-is.
 * - Anything else is unexpected: log it in full (so it lands in the server logs
 *   with a stack), map the common Postgres errors to a readable line, and
 *   otherwise surface the real error text. We would rather leak a technical
 *   detail than hide the one thing that lets us fix the problem.
 */
export function actionError(e: unknown, context = "action"): string {
  if (e instanceof AppError) return e.message;
  console.error(`[${context}]`, e);
  const friendly = pgFriendly(e);
  if (friendly) return friendly;
  const detail = e instanceof Error ? e.message : String(e);
  return `Eroare: ${detail}`;
}
