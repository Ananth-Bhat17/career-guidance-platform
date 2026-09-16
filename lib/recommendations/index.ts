import { createClient } from "@/utils/supabase/server";
import { CareerInput, CareerRecommendation, UserSkillInput } from "./types";
import { calculateCareerRecommendations } from "./scoring";

export * from "./types";
export * from "./scoring";

/**
 * Service function to retrieve user skills & career requirements from Supabase
 * for the authenticated user and generate ranked career recommendations.
 */
export async function getCareerRecommendations(): Promise<{
  recommendations: CareerRecommendation[];
  user: { id: string; email?: string } | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        recommendations: [],
        user: null,
        error: "Unauthorized: User is not authenticated.",
      };
    }

    // 1. Fetch authenticated user's skills
    const { data: userSkillsData, error: userSkillsError } = await supabase
      .from("user_skills")
      .select("skill_id, proficiency, skills(id, name)")
      .eq("user_id", user.id);

    if (userSkillsError) {
      console.error("Error fetching user_skills:", userSkillsError);
    }

    const userSkills: UserSkillInput[] = (userSkillsData || []).map(
      (row: any) => ({
        skillId: row.skill_id,
        skillName: row.skills?.name || "",
        proficiency: row.proficiency,
      })
    );

    // 2. Fetch all careers
    const { data: careersData, error: careersError } = await supabase
      .from("careers")
      .select("id, name, description")
      .order("name", { ascending: true });

    if (careersError || !careersData) {
      console.error("Error fetching careers:", careersError);
      return {
        recommendations: [],
        user: { id: user.id, email: user.email },
        error: "Failed to load careers from database.",
      };
    }

    // 3. Fetch career_skills mappings
    const { data: careerSkillsData, error: careerSkillsError } = await supabase
      .from("career_skills")
      .select("career_id, skill_id, importance, skills(id, name)");

    if (careerSkillsError) {
      console.error("Error fetching career_skills:", careerSkillsError);
    }

    // Group career_skills by career_id
    const careerSkillsByCareerId = new Map<string, any[]>();
    (careerSkillsData || []).forEach((cs: any) => {
      const list = careerSkillsByCareerId.get(cs.career_id) || [];
      list.push(cs);
      careerSkillsByCareerId.set(cs.career_id, list);
    });

    // 4. Transform into CareerInput array
    const careers: CareerInput[] = careersData.map((c: any) => {
      const reqs = careerSkillsByCareerId.get(c.id) || [];
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        requiredSkills: reqs.map((cs: any) => ({
          skillId: cs.skill_id,
          skillName: cs.skills?.name || "",
          importance: cs.importance,
        })),
      };
    });

    // 5. Calculate pure recommendations
    const recommendations = calculateCareerRecommendations(userSkills, careers);

    return {
      recommendations,
      user: { id: user.id, email: user.email },
    };
  } catch (err) {
    console.error("Unexpected error in getCareerRecommendations:", err);
    return {
      recommendations: [],
      user: null,
      error: "An unexpected error occurred while calculating career recommendations.",
    };
  }
}
