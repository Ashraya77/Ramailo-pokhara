import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== "ADMIN"
  ) {
    redirect("/admin/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold">
        Dashboard
      </h1>

      <p className="mt-2 text-neutral-600">
        Welcome, {session.user.name ?? "Admin"}.
      </p>
    </main>
  );
}