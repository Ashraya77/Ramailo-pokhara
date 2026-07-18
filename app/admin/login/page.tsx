import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { LoginForm } from "./loginForm";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <LoginForm />
    </main>
  );
}