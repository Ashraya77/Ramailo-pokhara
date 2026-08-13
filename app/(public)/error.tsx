"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type PublicErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PublicError({ error, reset }: PublicErrorProps) {
  useEffect(() => {
    console.error("Public route rendering failed", error);
  }, [error]);

  return (
    <div className="public-container flex max-w-3xl flex-col items-start gap-5 py-20 sm:py-28">
      <p className="editorial-kicker">
        केही समस्या भयो
      </p>
      <h1 className="font-editorial text-4xl font-black tracking-tight sm:text-5xl">यो पृष्ठ लोड गर्न सकिएन।</h1>
      <p className="text-[var(--public-muted)]">
        कृपया फेरि प्रयास गर्नुहोस्। समस्या रहिरहे गृहपृष्ठमा फर्कनुहोस्।
      </p>
      <div className="flex flex-wrap gap-3">
        <Button className="rounded-none" type="button" onClick={reset}>फेरि प्रयास गर्नुहोस्</Button>
        <Button className="rounded-none" variant="outline" render={<Link href="/" />}>गृहपृष्ठमा जानुहोस्</Button>
      </div>
    </div>
  );
}
