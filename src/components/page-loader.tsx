import { Skeleton } from "@/components/ui/skeleton";

export const PageLoader = () => {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-5xl flex-col gap-5 py-4" aria-label="Loading page">
      <Skeleton className="h-24 w-full rounded-xl bg-navy/10" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-48 rounded-xl bg-navy/10" />
        <Skeleton className="h-48 rounded-xl bg-navy/10" />
      </div>
    </div>
  );
};
