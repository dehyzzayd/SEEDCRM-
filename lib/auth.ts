import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * JWT-only auth — NO PrismaAdapter.
 *
 * Removing the adapter is the single biggest speed fix:
 *  - With adapter attached, NextAuth makes 1-2 extra DB round-trips on EVERY
 *    /api/auth/session call (getSessionAndUser, getUserByAccount …) even when
 *    strategy is "jwt" and those tables are unused.
 *  - Without adapter, the JWT is verified from the signed cookie entirely in
 *    memory — zero DB calls per session check → 3 000 ms → ~5 ms.
 *
 * The Prisma adapter is only needed for OAuth providers (Google, GitHub, etc.)
 * where tokens must be persisted. For Credentials + JWT we don't need it.
 */

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ↑ No `adapter` — JWT is stateless, session lives in a signed cookie.
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error:  "/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Single DB call — only on actual sign-in, never on session refresh
        const user = await prisma.user.findUnique({
          where:   { email: parsed.data.email },
          include: { organization: { select: { id: true, name: true, subscriptionTier: true } } },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
          image:          user.avatarUrl ?? null,
          role:           user.role,
          organizationId: user.organizationId,
          orgName:        user.organization.name,
          tier:           user.organization.subscriptionTier,
        };
      },
    }),
  ],
  callbacks: {
    // jwt() runs once at sign-in (user is populated) then on every request (user is undefined)
    async jwt({ token, user }) {
      if (user) {
        // Stamp all custom fields into the JWT at sign-in time
        token.id             = user.id;
        token.role           = (user as Record<string, unknown>).role           as string;
        token.organizationId = (user as Record<string, unknown>).organizationId as string;
        token.orgName        = (user as Record<string, unknown>).orgName        as string;
        token.tier           = (user as Record<string, unknown>).tier           as string;
      }
      return token;
    },
    // session() runs on every /api/auth/session call — reads from token (cookie), no DB
    async session({ session, token }) {
      if (token) {
        session.user.id                                                      = token.id             as string;
        (session.user as Record<string, unknown>).role           = token.role;
        (session.user as Record<string, unknown>).organizationId = token.organizationId;
        (session.user as Record<string, unknown>).orgName        = token.orgName;
        (session.user as Record<string, unknown>).tier           = token.tier;
      }
      return session;
    },
  },
});
