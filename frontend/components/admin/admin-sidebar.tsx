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
import { cn } from "@/lib/utils";

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
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: dictionary.nav.articles,
      href: "/articles",
      icon: FileText,
    },
    {
      label: dictionary.nav.newArticle,
      href: "/articles/new",
      icon: PenSquare,
    },
    {
      label: dictionary.nav.categories,
      href: "/categories",
      icon: FolderOpen,
    },
  ];

  return (
    <aside
      className={cn("flex h-full flex-col bg-[#0F172A]", className)}
    >
      <div className="flex h-14 items-center border-b border-[#1E293B] px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-slate-200"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1E293B] text-slate-200 text-xs font-bold">
            R
          </div>
          <span className="text-sm">Ramailo Admin</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        <p className="px-2 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                active
                  ? "bg-[#1E293B] text-slate-100"
                  : "text-slate-300 hover:bg-[#172033] hover:text-slate-200",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="py-2">
          <div className="h-px bg-[#1E293B]" />
        </div>

        <p className="px-2 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
          {dictionary.common.external}
        </p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-[#172033] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <Globe className="h-4 w-4 shrink-0" />
          {dictionary.nav.viewWebsite}
        </Link>
      </nav>
    </aside>
  );
}
