import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/server/db/client";
import { rateLimit } from "@/server/services/rate-limit";
import {
  authenticateCredentials,
  getAuthUserByEmail,
  getSessionVersion,
  upsertGoogleUser,
} from "@/server/services/auth";

function ipFrom(request?: Request): string {
  const xff = request?.headers?.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "local";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds, request) => {
        const email = String(creds?.email ?? "");
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        // Rate limit by IP (identical failure for wrong email/password/unverified).
        if (!(await rateLimit(db, `login:${ipFrom(request)}`, 5, 60))) return null;
        const user = await authenticateCredentials(db, email, password);
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          sessionVersion: user.sessionVersion,
        } as unknown as { id: string };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (account?.provider === "google") {
        if (!profile?.email || profile.email_verified !== true) return false;
        const linked = await upsertGoogleUser(db, {
          email: String(profile.email),
          verified: true,
          providerAccountId: String(account.providerAccountId),
        });
        return Boolean(linked);
      }
      return true;
    },
    jwt: async ({ token, user, account, profile }) => {
      // Initial Google sign-in: resolve our DB user by the verified email.
      if (account?.provider === "google" && profile?.email) {
        const u = await getAuthUserByEmail(db, String(profile.email));
        if (u) {
          token.userId = u.id;
          token.role = u.role;
          token.sv = u.sessionVersion;
        }
        return token;
      }
      // Initial credentials sign-in.
      if (user) {
        const u = user as unknown as { id: string; role: "customer" | "admin"; sessionVersion: number };
        token.userId = u.id;
        token.role = u.role;
        token.sv = u.sessionVersion;
        return token;
      }
      // Subsequent requests: invalidate if session_version was bumped.
      if (token.userId) {
        const sv = await getSessionVersion(db, token.userId as string);
        if (sv === null || sv !== token.sv) return {};
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.role = (token.role as "customer" | "admin" | undefined) ?? "customer";
      }
      return session;
    },
  },
});
