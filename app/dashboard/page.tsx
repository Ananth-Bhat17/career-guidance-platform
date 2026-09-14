import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import SignOutButton from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to verify if user has completed basic onboarding
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  // If query succeeded without error and user does not have a profile row, redirect to /onboarding
  if (!profileError && !profile) {
    redirect("/onboarding");
  }

  const hasProfile = !!profile;

  // Fetch user_skills count to check skills assessment completion
  let skillsCount = 0;
  try {
    const { count, error: skillsError } = await supabase
      .from("user_skills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (skillsError) {
      console.error("Error fetching user skills count:", skillsError);
    } else {
      skillsCount = count ?? 0;
    }
  } catch (err) {
    console.error("Unexpected error fetching user skills count:", err);
  }

  const hasSkills = skillsCount > 0;

  const displayName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Simple Heading Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#d8d8d2] pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] mb-1 block">
              Your Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-serif text-[#20201e]">
              Welcome, {displayName}
            </h1>
          </div>
          <div>
            <SignOutButton />
          </div>
        </div>

        {/* Profile Completion Section */}
        <div className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-[#20201e]">
            <span>Profile completion</span>
            <span
              className={`font-mono px-2 py-0.5 rounded-[2px] ${
                hasProfile
                  ? "text-[#285ca8] bg-[#285ca8]/10"
                  : "text-amber-800 bg-amber-100 border border-amber-200"
              }`}
            >
              {hasProfile ? "Basic profile completed" : "Action required"}
            </span>
          </div>
          <div className="w-full bg-[#d8d8d2] h-1.5 rounded-[1px] overflow-hidden">
            <div
              className={`bg-[#285ca8] h-full ${
                hasProfile ? "w-full" : "w-0"
              }`}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-xs text-[#585854] leading-relaxed">
              {hasProfile
                ? "Your basic profile details are saved. You can edit your information at any time."
                : "Complete your basic profile to help us personalize your career guidance."}
            </p>
            <Link
              href="/onboarding"
              className={
                hasProfile
                  ? "inline-flex items-center gap-1 text-xs font-medium text-[#285ca8] hover:underline shrink-0"
                  : "inline-flex items-center gap-1 text-xs font-medium bg-[#1e437e] hover:bg-[#163565] text-white px-3.5 py-1.5 rounded-[2px] transition-colors shrink-0"
              }
            >
              {hasProfile ? "Edit profile \u2192" : "Complete your profile \u2192"}
            </Link>
          </div>
        </div>

        {/* Next Step Section: Start with your skills */}
        <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
          <div>
            <h2 className="text-lg font-serif font-semibold text-[#20201e] mb-1">
              {hasSkills ? "Your skills" : "Build your skill profile"}
            </h2>
            <p className="text-sm text-[#585854] leading-relaxed">
              {hasSkills
                ? `You\u2019ve added ${skillsCount} ${skillsCount === 1 ? "skill" : "skills"} to your profile.`
                : "Add your technical and professional skills to help us personalize your career recommendations."}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/skills"
              className="inline-block bg-[#1e437e] hover:bg-[#163565] text-white text-xs font-medium px-4 py-2 rounded-[2px] transition-colors cursor-pointer"
            >
              {hasSkills ? "Edit skills \u2192" : "Begin skill assessment \u2192"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
