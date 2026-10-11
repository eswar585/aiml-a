import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800/80',
      className
    )}
  />
);

export const SubjectCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <Skeleton className="w-16 h-6 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="w-3/4 h-5 rounded-md" />
      <Skeleton className="w-full h-4 rounded-md" />
      <Skeleton className="w-2/3 h-4 rounded-md" />
    </div>
    <div className="flex gap-2 pt-2">
      <Skeleton className="w-20 h-6 rounded-md" />
      <Skeleton className="w-20 h-6 rounded-md" />
    </div>
  </div>
);

export const ResourceCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex gap-3 items-center flex-1">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="w-3/4 h-4 rounded-md" />
          <Skeleton className="w-1/2 h-3 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-16 h-6 rounded-md" />
    </div>
    <Skeleton className="w-full h-3 rounded-md" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="w-24 h-4 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="w-16 h-8 rounded-lg" />
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);
