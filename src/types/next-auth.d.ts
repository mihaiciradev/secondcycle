import type { DefaultSession } from "next-auth";

type Role = "customer" | "admin" | "workshop";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: Role;
    sv?: number;
  }
}
