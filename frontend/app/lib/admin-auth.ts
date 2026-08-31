import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

export type AdminAuthorization =
  | { authorized: true; userId: string }
  | {
      authorized: false;
      reason: "UNAUTHENTICATED" | "FORBIDDEN" | "ERROR";
    };

export async function authorizeAdmin(): Promise<AdminAuthorization> {
  const session = await auth();

  if (!session?.user) {
    return { authorized: false, reason: "UNAUTHENTICATED" };
  }

  if (session.user.role !== "ADMIN") {
    return { authorized: false, reason: "FORBIDDEN" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive || user.role !== "ADMIN") {
      return { authorized: false, reason: "FORBIDDEN" };
    }

    return { authorized: true, userId: user.id };
  } catch (error: unknown) {
    console.error("Unexpected admin authorization error:", error);
    return { authorized: false, reason: "ERROR" };
  }
}
