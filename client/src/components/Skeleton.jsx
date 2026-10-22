import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/80 dark:bg-white/[0.06] rounded-xl ${className}`}
    />
  );
}

export function TeammateCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl glass-card flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-5 rounded-lg" />
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-3" />
        <div className="flex space-x-1.5 mb-3">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function HackathonCardSkeleton() {
  return (
    <div className="rounded-2xl glass-card overflow-hidden flex flex-col justify-between">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="px-5 py-3.5 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl glass-card flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2 mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <div className="flex space-x-1 mb-2">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
        <div className="flex -space-x-1">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export default Skeleton;
