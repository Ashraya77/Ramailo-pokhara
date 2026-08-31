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

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-accent)]";

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
            className="h-12 w-12 rounded-none text-white hover:bg-white/10 focus-visible:outline-white"
            aria-label={ui.navOpen}
            aria-expanded={open}
          />
        }
      >
        <MenuIcon size={36} strokeWidth={2.75} />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="public-shell flex w-[88vw] max-w-sm flex-col rounded-none bg-background p-0 text-foreground"
      >
        <SheetHeader className="border-t-[3px] border-white border-b border-white/20 bg-[var(--public-accent)] px-6 py-7">
          <SheetTitle className="font-editorial text-2xl font-black text-white">{siteConfig.name}</SheetTitle>
          <SheetDescription className="text-white/70">{ui.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label={ui.navMobile} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="editorial-kicker mb-3 text-foreground/60">{ui.navNavigate}</p>
          <ul className="flex flex-col">
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className={`font-editorial block border-b border-border py-3 text-xl font-bold text-foreground hover:text-[var(--public-accent)] ${focusRing}`}
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
                  className={`block border-b border-border py-3 text-sm font-semibold text-foreground/70 hover:text-[var(--public-accent)] ${focusRing}`}
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