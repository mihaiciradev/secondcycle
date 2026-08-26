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
