"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  Globe,
  LayoutDashboard,
  PenSquare,
} from "lucide-react";

import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { cn } from "@/frontend/lib/utils";

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { dictionary } = useAdminI18n();
  const navItems = [
    {
      label: dictionary.nav.dashboard,
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: dictionary.nav.articles,
      href: "/admin/articles",
      icon: FileText,
    },
    {
      label: dictionary.nav.newArticle,
      href: "/admin/articles/new",
      icon: PenSquare,
    },
    {
      label: dictionary.nav.categories,
      href: "/admin/categories",
      icon: FolderOpen,
    },
  ];

  return (
    <aside
      className={cn("flex h-full flex-col bg-sidebar", className)}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-semibold text-sidebar-foreground"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            R
          </div>
          <span className="text-sm">Ramailo Admin</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {dictionary.common.content}
        </p>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="py-2">
          <div className="h-px bg-sidebar-border" />
        </div>

        <p className="px-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {dictionary.common.external}
        </p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {dictionary.nav.viewWebsite}
        </Link>
      </nav>
    </aside>
  );
}
