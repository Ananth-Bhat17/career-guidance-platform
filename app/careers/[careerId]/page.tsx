import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { getCareerRecommendations } from "@/lib/recommendations";

interface PageProps {
  params: Promise<{
    careerId: string;
  }>;
}

function formatImportance(importance: number | string): string {
  if (typeof importance === "string" && isNaN(Number(importance))) {
    return importance;
  }
  const num = Number(importance);
  if (num >= 3) return "Highly important";
  if (num === 2) return "Important";
  return "Nice to have";
}

export default async function CareerDetailsPage({ params }: PageProps) {
  const { careerId } = await params;

  if (!careerId) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch selected career from public.careers
  const { data: career, error: careerError } = await supabase
    .from("careers")
    .select("id, name, description")
    .eq("id", careerId)
    .maybeSingle();

  if (careerError || !career) {
    notFound();
  }

  // 3. Check if user has skills saved
  let skillsCount = 0;
  try {
    const { count, error: skillsError } = await supabase
      .from("user_skills")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!skillsError) {
      skillsCount = count ?? 0;
    }
  } catch (err) {
    console.error("Error checking user skills count:", err);
  }

  const hasSkills = skillsCount > 0;

  // 4. Fetch recommendations if user has skills
  let recommendation = null;
  let recsError: string | null = null;

  if (hasSkills) {
    try {
      const recResult = await getCareerRecommendations();
      if (recResult.error) {
        recsError = "Unable to calculate recommendation for this career.";
      } else {
        recommendation =
          recResult.recommendations?.find((r) => r.id === careerId) || null;
      }
    } catch (err) {
      console.error("Error fetching recommendation:", err);
      recsError = "Unable to load recommendation details right now.";
    }
  }

  // 5. Fetch complete career skill requirements (public.career_skills + public.skills)
  let careerRequirements: Array<{
    skillId: string;
    skillName: string;
    importance: number;
    userProficiency: string | null;
    isMatched: boolean;
  }> = [];

  try {
    const { data: requirementsData, error: reqsError } = await supabase
      .from("career_skills")
      .select("skill_id, importance, skills(id, name)")
      .eq("career_id", careerId);

    if (!reqsError && requirementsData) {
      // Map user proficiency for matched skills if recommendation is present
      const matchedMap = new Map<string, string>();
      if (recommendation?.matchedSkills) {
        for (const ms of recommendation.matchedSkills) {
          matchedMap.set(ms.skillId, ms.userProficiency);
        }
      }

      careerRequirements = requirementsData.map((row: any) => {
        const skillId = row.skill_id;
        const skillName = row.skills?.name || "Unknown Skill";
        const importance = row.importance ?? 1;
        const userProf = matchedMap.get(skillId) || null;

        return {
          skillId,
          skillName,
          importance,
          userProficiency: userProf,
          isMatched: matchedMap.has(skillId),
        };
      });
    }
  } catch (err) {
    console.error("Error fetching career requirements:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header userEmail={user.email} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#285ca8] hover:underline"
          >
            &larr; Back to dashboard
          </Link>
        </div>

        {/* Career Heading Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#d8d8d2] pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] mb-1 block">
              Career Details
            </span>
            <h1 className="text-2xl md:text-3xl font-serif text-[#20201e]">
              {career.name}
            </h1>
            <p className="text-sm text-[#585854] mt-2 leading-relaxed max-w-2xl">
              {career.description}
            </p>
          </div>
          {hasSkills && recommendation && (
            <div className="shrink-0 self-start sm:self-auto">
              <span className="inline-block bg-[#285ca8]/10 text-[#285ca8] font-mono text-sm font-semibold px-3 py-1.5 rounded-[2px] border border-[#285ca8]/20">
                {recommendation.matchScore}% match
              </span>
            </div>
          )}
        </div>

        {/* NO-SKILLS STATE */}
        {!hasSkills ? (
          <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-serif font-semibold text-[#20201e] mb-1">
                Career Details
              </h2>
              <p className="text-sm text-[#585854] leading-relaxed">
                Add your skills to see how well this career matches your profile.
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
        ) : recsError ? (
          /* Error Fallback */
          <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 text-center text-xs text-[#585854]">
            {recsError}
          </div>
        ) : recommendation ? (
          /* USER HAS SKILLS & RECOMMENDATION LOADED */
          <div className="space-y-8">
            {/* Your Match Section */}
            <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#285ca8]">
                Your match
              </h2>
              <div className="text-3xl md:text-4xl font-mono font-bold text-[#20201e]">
                {recommendation.matchScore}% Match
              </div>
              <p className="text-xs text-[#585854] leading-relaxed">
                Calculated based on your current skills and proficiency levels compared to the requirements for this career.
              </p>
            </div>

            {/* Skills You Already Have Section */}
            <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
              <div className="border-b border-[#d8d8d2]/60 pb-3">
                <h2 className="text-base font-serif font-semibold text-[#20201e]">
                  Skills you already have
                </h2>
                <p className="text-xs text-[#585854] mt-0.5">
                  Skills from your profile matching this career.
                </p>
              </div>

              {recommendation.matchedSkills.length === 0 ? (
                <p className="text-xs text-[#585854]">
                  You currently have no matched skills for this career.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendation.matchedSkills.map((ms) => (
                    <div
                      key={ms.skillId}
                      className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-3 space-y-1"
                    >
                      <div className="font-semibold text-xs text-[#20201e]">
                        {ms.skillName}
                      </div>
                      <div className="text-xs text-[#285ca8] font-medium">
                        {ms.userProficiency}
                      </div>
                      <div className="text-[11px] text-[#585854]">
                        {formatImportance(ms.careerImportance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Gaps Section */}
            <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
              <div className="border-b border-[#d8d8d2]/60 pb-3">
                <h2 className="text-base font-serif font-semibold text-[#20201e]">
                  Skill gaps
                </h2>
                <p className="text-xs text-[#585854] mt-0.5">
                  Required skills not currently present in your profile.
                </p>
              </div>

              {recommendation.missingSkills.length === 0 ? (
                <p className="text-xs text-[#285ca8] font-medium bg-[#285ca8]/5 border border-[#285ca8]/20 p-3 rounded-[2px]">
                  You currently match all listed skills for this career.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {recommendation.missingSkills.map((ms) => (
                    <div
                      key={ms.skillId}
                      className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-3 space-y-1"
                    >
                      <div className="font-semibold text-xs text-[#20201e]">
                        {ms.skillName}
                      </div>
                      <div className="text-[11px] text-[#585854]">
                        {formatImportance(ms.careerImportance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Career Requirements Section */}
            <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-6 space-y-4">
              <div className="border-b border-[#d8d8d2]/60 pb-3">
                <h2 className="text-base font-serif font-semibold text-[#20201e]">
                  Career requirements
                </h2>
                <p className="text-xs text-[#585854] mt-0.5">
                  All skills required for this career path.
                </p>
              </div>

              {careerRequirements.length === 0 ? (
                <p className="text-xs text-[#585854]">
                  No detailed skill requirements listed for this career.
                </p>
              ) : (
                <div className="divide-y divide-[#d8d8d2]/60 border-t border-b border-[#d8d8d2]/60">
                  {careerRequirements.map((req) => (
                    <div
                      key={req.skillId}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="font-medium text-[#20201e]">
                        {req.skillName}
                      </div>
                      <div className="flex items-center gap-4 text-[#585854]">
                        <span
                          className={`font-mono text-[11px] px-2 py-0.5 rounded-[2px] ${
                            req.isMatched
                              ? "text-[#285ca8] bg-[#285ca8]/10"
                              : "text-[#585854] bg-[#f4f6f9] border border-[#d8d8d2]"
                          }`}
                        >
                          {req.isMatched
                            ? `✓ ${req.userProficiency}`
                            : "Missing"}
                        </span>
                        <span className="w-28 text-right text-[11px]">
                          {formatImportance(req.importance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
