"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { LanguageSwitcher } from "@/components/admin/language-switcher";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminHeader({
  userName,
  logoutButton,
}: {
  userName: string;
  logoutButton: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dictionary } = useAdminI18n();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-primary lg:hidden"
              aria-label={dictionary.common.openNavigation}
            >
              <Menu className="h-5 w-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="p-0 w-64">
          <SheetTitle className="sr-only">
            {dictionary.common.navigationMenu}
          </SheetTitle>
          <div onClick={() => setMobileOpen(false)}>
            <AdminSidebar />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {userName}
        </span>
        {logoutButton}
      </div>
    </header>
  );
}
