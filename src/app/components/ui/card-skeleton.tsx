"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/app/components/ui/skeleton";

type CardSkeletonProps = {
  height?: string;
};

export function CardSkeleton({ height = "300px" }: CardSkeletonProps) {
  return (
    <div
      className="animate-pulse-subtle relative w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm"
      style={{ height }}
    >
      {/* Shimmer effect overlay */}
      <div className="shimmer-effect"></div>

      {/* Image skeleton */}
      <div className="h-1/2 w-full rounded-t-xl bg-gray-200" />

      {/* Content area */}
      <div className="space-y-3 p-4">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Details skeleton */}
        <div className="flex items-center space-x-2 pt-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
