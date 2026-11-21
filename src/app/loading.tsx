"use client";

import { Skeleton } from "@/components/ui/skeleton";

const LoadingPage = () => {
  return ( 
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-ivory px-6 py-10" aria-label="Loading workspace">
      <Skeleton className="h-14 w-full bg-navy/10" />
      <Skeleton className="h-48 w-full rounded-xl bg-navy/10" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-xl bg-navy/10" />
        <Skeleton className="h-32 rounded-xl bg-navy/10" />
        <Skeleton className="h-32 rounded-xl bg-navy/10" />
      </div>
    </div>
  );
};
 
export default LoadingPage;
