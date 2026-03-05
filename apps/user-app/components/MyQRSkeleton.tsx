export function MyQRSkeleton() {
  return (
    <div className="animate-pulse">
      
      {/* QR Placeholder */}
      <div className="flex justify-center">
        <div className="h-56 w-56 rounded-xl bg-slate-200"></div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-4 mt-6 justify-center">
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

    </div>
  );
}