"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { LaravelApiError, get } from "@/lib/apiClient";

type AuthenticatedAdmin = { id: string; name: string; email: string; role: string };

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedAdmin | null>(null);

  useEffect(() => {
    get<{ data: { user: AuthenticatedAdmin } }>("/api/auth/me")
      .then(({ data }) => {
        if (data.user.role !== "ADMIN") {
          router.replace("/login");
          return;
        }
        setUser(data.user);
      })
      .catch((error: unknown) => {
        if (error instanceof LaravelApiError && error.status === 401) {
          router.replace("/login");
          return;
        }
        router.replace("/login");
      });
  }, [router]);

  if (!user) {
    return <div className="min-h-screen bg-muted/30" aria-busy="true" />;
  }

  return <>{children}</>;
}
