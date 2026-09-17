import Header from "@/components/Header";
import Skeleton from "@/components/ui/Skeleton";

export default function CareerDetailsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading career details"
      className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans"
    >
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Back Link Skeleton */}
        <div>
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Career Heading Section Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#d8d8d2] pb-6">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] block">
              Career Details
            </span>
            <Skeleton className="h-8 md:h-9 w-64" />
            <div className="space-y-1.5 pt-1">
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-3/4 max-w-xl" />
            </div>
          </div>
          <div className="shrink-0">
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        {/* Your Match Section Skeleton */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-3.5 w-full max-w-lg" />
        </div>

        {/* Skills You Already Have Skeleton */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* Skill Gaps Skeleton */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        {/* Career Requirements Skeleton */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
          <Skeleton className="h-5 w-52" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
