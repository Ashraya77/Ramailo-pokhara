import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/app/lib/prisma";
import { loginSchema } from "@/app/lib/validations/auth";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },

  providers: [
    Credentials({
      name: "Admin credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email,
          },

          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (
        session.user &&
        typeof token.id === "string" &&
        token.role === "ADMIN"
      ) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },

    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = Boolean(session?.user);
      const isAdminRoute = pathname.startsWith("/admin");
      const isLoginRoute = pathname === "/admin/login";

      if (isLoginRoute) {
        return true;
      }

      if (isAdminRoute) {
        return isLoggedIn && session?.user.role === "ADMIN";
      }

      return true;
    },
  },
});
