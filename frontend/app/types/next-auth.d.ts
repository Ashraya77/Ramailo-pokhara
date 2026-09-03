import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id: string;
    role: UserRole;
  }
}
