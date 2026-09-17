import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import SignOutButton from "./sign-out-button";
import {
  getCareerRecommendations,
  CareerRecommendation,
} from "@/lib/recommendations";

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

  // Fetch career recommendations if user has completed skills assessment
  let recommendations: CareerRecommendation[] = [];
  let recsError: string | null = null;

  if (hasSkills) {
    try {
      const recResult = await getCareerRecommendations();
      if (recResult.error) {
        console.error("Error fetching career recommendations:", recResult.error);
        recsError = "Unable to load career recommendations right now.";
      } else {
        recommendations = recResult.recommendations || [];
      }
    } catch (err) {
      console.error("Unexpected error in recommendations retrieval:", err);
      recsError = "Unable to load career recommendations right now.";
    }
  }

  const topRecommendations = recommendations.slice(0, 3);

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

        {/* Skills Section */}
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

        {/* Career Recommendations Section */}
        <div className="space-y-4">
          {!hasSkills ? (
            /* No-Skills State Card */
            <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
              <div>
                <h2 className="text-lg font-serif font-semibold text-[#20201e] mb-1">
                  Discover your career path
                </h2>
                <p className="text-sm text-[#585854] leading-relaxed">
                  Add your skills to receive personalized career recommendations.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/skills"
                  className="inline-block bg-[#1e437e] hover:bg-[#163565] text-white text-xs font-medium px-4 py-2 rounded-[2px] transition-colors cursor-pointer"
                >
                  Start skill assessment &rarr;
                </Link>
              </div>
            </div>
          ) : (
            /* User Has Skills: Show Recommendations */
            <div className="space-y-4">
              <div className="border-b border-[#d8d8d2] pb-3">
                <h2 className="text-lg font-serif font-semibold text-[#20201e]">
                  Recommended careers
                </h2>
                <p className="text-xs text-[#585854] mt-0.5">
                  Based on your profile and current skills.
                </p>
              </div>

              {recsError ? (
                /* Fallback Error Card */
                <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 text-center text-xs text-[#585854]">
                  Unable to load career recommendations right now.
                </div>
              ) : topRecommendations.length === 0 ? (
                /* Empty Fallback Card */
                <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 text-center text-xs text-[#585854]">
                  No career recommendations found.
                </div>
              ) : (
                /* Top 3 Career Cards */
                <div className="space-y-4">
                  {topRecommendations.map((rec) => {
                    const displayMatched = rec.matchedSkills.slice(0, 4);
                    const displayMissing = rec.missingSkills.slice(0, 4);

                    return (
                      <div
                        key={rec.id}
                        className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#d8d8d2]/60 pb-3">
                          <div>
                            <h3 className="text-base font-serif font-semibold text-[#20201e]">
                              {rec.name}
                            </h3>
                            <p className="text-xs text-[#585854] mt-1 leading-relaxed max-w-2xl">
                              {rec.description}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <span className="inline-block bg-[#285ca8]/10 text-[#285ca8] font-mono text-xs font-semibold px-2.5 py-1 rounded-[2px] border border-[#285ca8]/20">
                              {rec.matchScore}% match
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Matched Skills */}
                          {rec.matchedSkills.length > 0 && (
                            <div className="space-y-1.5 bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-3">
                              <span className="font-semibold text-[#20201e] block">
                                Matched skills:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[#585854]">
                                {displayMatched.map((s, idx) => (
                                  <span
                                    key={s.skillId || idx}
                                    className="bg-white border border-[#d8d8d2] px-2 py-0.5 rounded-[2px] text-[11px] font-medium text-[#20201e]"
                                  >
                                    {s.skillName} · <span className="text-[#285ca8]">{s.userProficiency}</span>
                                  </span>
                                ))}
                                {rec.matchedSkills.length > 4 && (
                                  <span className="text-[11px] text-[#585854] self-center">
                                    +{rec.matchedSkills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Skill Gaps */}
                          {rec.missingSkills.length > 0 && (
                            <div className="space-y-1.5 bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-3">
                              <span className="font-semibold text-[#20201e] block">
                                Skill gaps:
                              </span>
                              <div className="flex flex-wrap gap-1.5 text-[#585854]">
                                {displayMissing.map((s, idx) => (
                                  <span
                                    key={s.skillId || idx}
                                    className="bg-white border border-[#d8d8d2] px-2 py-0.5 rounded-[2px] text-[11px] text-[#585854]"
                                  >
                                    {s.skillName}
                                  </span>
                                ))}
                                {rec.missingSkills.length > 4 && (
                                  <span className="text-[11px] text-[#585854] self-center">
                                    +{rec.missingSkills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-1 flex justify-end">
                          <Link
                            href={`/careers/${rec.id}`}
                            className="text-xs font-medium text-[#285ca8] hover:underline inline-flex items-center gap-1"
                          >
                            View career &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
