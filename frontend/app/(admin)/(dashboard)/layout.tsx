"use client";

import { AdminAuthGuard } from "@/components/admin/admin-auth-guard";
import {
  AdminLanguageProvider,
  useAdminI18n,
} from "@/components/admin/admin-language-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_ADMIN_LANGUAGE } from "@/lib/admin-i18n";

function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  const { dictionary, language } = useAdminI18n();

  return (
    <div
      lang={language === "np" ? "ne" : "en"}
      className="admin-font flex h-screen overflow-hidden bg-muted/30"
    >
      <div className="hidden w-60 shrink-0 border-r lg:block">
        <AdminSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          userName="Admin"
          logoutButton={<LogoutButton label={dictionary.nav.logout} />}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminLanguageProvider initialLanguage={DEFAULT_ADMIN_LANGUAGE}>
        <AdminDashboardShell>{children}</AdminDashboardShell>
      </AdminLanguageProvider>
    </AdminAuthGuard>
  );
}
