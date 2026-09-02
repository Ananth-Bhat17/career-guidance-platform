import Header from "@/components/Header";
import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans"
    >
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Heading Section Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d8d8d2] pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] mb-1 block">
              Your Dashboard
            </span>
            <Skeleton className="h-8 md:h-9 w-64 mt-1" />
          </div>
          <div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Profile Completion Section Skeleton */}
        <div className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#20201e]">
            <span>Profile completion status</span>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="w-full bg-[#d8d8d2] h-1.5 rounded-[1px] overflow-hidden">
            <Skeleton className="h-full w-1/3 !bg-[#285ca8]/60" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>

        {/* Next Step Section Skeleton */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
            </div>
          </div>

          <div className="pt-2">
            <Skeleton className="h-8 w-44" />
          </div>
        </div>
      </main>
    </div>
  );
}
