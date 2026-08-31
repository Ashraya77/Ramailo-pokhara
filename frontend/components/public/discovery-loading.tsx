import { Skeleton } from "@/components/ui/skeleton";

export function DiscoveryLoading() {
  return (
    <div className="public-container flex flex-col gap-10 py-10 sm:py-14" aria-busy="true" aria-label="Loading articles">
      <div className="flex flex-col gap-4 border-y border-[var(--public-border-strong)] py-8">
        <Skeleton className="h-3 w-24 animate-none rounded-none" />
        <Skeleton className="h-16 w-3/5 animate-none rounded-none" />
        <Skeleton className="h-5 w-full max-w-2xl animate-none rounded-none" />
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <Skeleton className="aspect-[4/3] w-full animate-none rounded-[2px]" />
            <Skeleton className="h-8 w-full animate-none rounded-none" />
            <Skeleton className="h-8 w-4/5 animate-none rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
