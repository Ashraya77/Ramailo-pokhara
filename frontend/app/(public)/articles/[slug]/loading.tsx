import { Skeleton } from "@/components/ui/skeleton";

const staticSkeleton = "animate-none motion-reduce:animate-none";

export default function ArticleLoading() {
  return (
    <div
      className="public-container flex flex-col gap-8 py-10 sm:py-14"
      aria-busy="true"
      aria-label="Loading article"
    >
      <Skeleton className={`${staticSkeleton} h-4 w-64 max-w-full rounded-none`} />
      <Skeleton className={`${staticSkeleton} h-5 w-28 rounded-none`} />
      <div className="flex flex-col gap-3">
        <Skeleton className={`${staticSkeleton} h-14 w-full rounded-none`} />
        <Skeleton className={`${staticSkeleton} h-14 w-4/5 rounded-none`} />
      </div>
      <Skeleton className={`${staticSkeleton} h-5 w-3/5 rounded-none`} />
      <Skeleton className={`${staticSkeleton} aspect-video w-full rounded-[2px]`} />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Skeleton className={`${staticSkeleton} h-5 w-full rounded-none`} />
        <Skeleton className={`${staticSkeleton} h-5 w-full rounded-none`} />
        <Skeleton className={`${staticSkeleton} h-5 w-11/12 rounded-none`} />
        <Skeleton className={`${staticSkeleton} h-5 w-4/5 rounded-none`} />
      </div>
    </div>
  );
}
