import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminLanguageProvider } from "@/components/admin/admin-language-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { getAdminI18n } from "@/lib/admin-i18n-server";

export const metadata: Metadata = {
  title: {
    template: "%s | Ramailo Admin",
    default: "Ramailo Admin",
  },
  description: "Ramailo Pokhara news portal administration dashboard.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, { dictionary, language }] = await Promise.all([
    auth(),
    getAdminI18n(),
  ]);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <AdminLanguageProvider initialLanguage={language}>
      <div
        lang={language === "np" ? "ne" : "en"}
        className="admin-font flex h-screen overflow-hidden bg-muted/30"
      >
        {/* Desktop sidebar */}
        <div className="hidden w-60 shrink-0 border-r lg:block">
          <AdminSidebar />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader
            userName={session.user.name ?? "Admin"}
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
    </AdminLanguageProvider>
  );
}
