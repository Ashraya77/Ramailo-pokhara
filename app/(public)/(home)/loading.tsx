import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="public-container flex flex-col gap-14 py-10" aria-busy="true" aria-label="Loading news">
      <div className="grid gap-8 lg:grid-cols-[1.7fr_0.78fr_0.62fr]">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[16/10] w-full animate-none rounded-[2px]" />
          <Skeleton className="h-14 w-full animate-none rounded-none" />
          <Skeleton className="h-14 w-4/5 animate-none rounded-none" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="aspect-[4/3] w-full animate-none rounded-[2px]" />
          <Skeleton className="h-8 w-11/12 animate-none rounded-none" />
          <Skeleton className="h-8 w-3/4 animate-none rounded-none" />
        </div>
        <div className="flex flex-col gap-5 border-l pl-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full animate-none rounded-none" />
          ))}
        </div>
      </div>
      <Skeleton className="h-px w-full animate-none rounded-none" />
    </div>
  );
}
