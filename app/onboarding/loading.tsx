import Header from "@/components/Header";
import AuthFormSkeleton from "@/components/AuthFormSkeleton";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <AuthFormSkeleton />
      </main>
    </div>
  );
}
