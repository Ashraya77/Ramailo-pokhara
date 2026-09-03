import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/app/lib/validations/auth";

declare module "next-auth" {
  interface User {
    accessToken: string;
  }

  interface Session {
    accessToken: string;
  }
}

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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: parsed.data.email,
              password: parsed.data.password,
            }),
          },
        );

        if (!response.ok) {
          return null;
        }

        const { data } = (await response.json()) as {
          success: boolean;
          data: {
            user: {
              id: string;
              name: string;
              email: string;
              role: "ADMIN";
            };
            token: string;
          };
        };

        const { user } = data;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accessToken: data.token,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
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

      session.accessToken = token.accessToken as string;

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
