import Skeleton from "@/components/ui/Skeleton";

export default function AuthFormSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading sign in form"
      className="w-full max-w-[440px] bg-white border border-[#d8d8d2] rounded-[2px] p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-[3px] h-5 bg-[#285ca8]/40 inline-block shrink-0" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-3.5 w-64 mt-1" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4 font-sans">
        <div>
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-[38px] w-full" />
        </div>

        <div>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-[38px] w-full" />
        </div>

        <Skeleton className="h-[42px] w-full mt-2" />
      </div>

      {/* Footer Link Skeleton */}
      <div className="mt-6 border-t border-[#d8d8d2] pt-4 flex justify-center">
        <Skeleton className="h-3.5 w-48" />
      </div>
    </div>
  );
}
