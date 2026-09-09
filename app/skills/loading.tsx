import Skeleton from "@/components/ui/Skeleton";
import Header from "@/components/Header";

export default function SkillsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      {/* Mobile Header */}
      <div className="md:hidden">
        <Header />
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col w-[280px] shrink-0 border-r border-[#d8d8d2] p-5 space-y-6 bg-[#fffefa]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-[3px] h-5 bg-[#285ca8]/40 inline-block shrink-0" />
            <Skeleton className="h-6 w-36" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Header Skeleton */}
          <div className="border-b border-[#d8d8d2] pb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-[3px] h-6 bg-[#285ca8]/40 inline-block shrink-0" />
              <Skeleton className="h-8 w-40" />
            </div>
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>

          {/* Search & Count Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Skeleton className="h-10 w-full sm:w-80" />
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Skill Categories & Chips Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((catIndex) => (
              <div
                key={catIndex}
                className="bg-white border border-[#d8d8d2] rounded-[2px] p-5 space-y-3"
              >
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
