"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { siteConfig } from "@/app/lib/site-config";
import { ui } from "@/app/lib/ui-text";
import type { PublicCategory } from "@/components/public/category-navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileNavigationProps = {
  categories: readonly PublicCategory[];
};

export function MobileNavigation({ categories }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-none border-l border-[var(--public-border)] lg:hidden"
            aria-label={open ? ui.navClose : ui.navOpen}
          />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="public-shell w-[88vw] max-w-sm rounded-none bg-[var(--public-background)] p-0">
        <SheetHeader className="border-t-[3px] border-[var(--public-accent)] border-b border-[var(--public-border-strong)] px-6 py-7">
          <SheetTitle className="font-editorial text-2xl font-black">{siteConfig.name}</SheetTitle>
          <SheetDescription className="text-[var(--public-muted)]">{ui.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label={ui.navMobile} className="overflow-y-auto px-6 py-5">
          <p className="editorial-kicker mb-3">{ui.navNavigate}</p>
          <ul className="flex flex-col">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="font-editorial block border-b border-[var(--public-border)] py-3 text-xl font-bold hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-accent)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${encodeURIComponent(category.slug)}`}
                  onClick={closeMenu}
                  className="block border-b border-[var(--public-border)] py-3 text-sm font-semibold text-[var(--public-muted)] hover:text-[var(--public-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-accent)]"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
