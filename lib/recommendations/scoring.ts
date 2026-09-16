import {
  CareerInput,
  CareerRecommendation,
  MatchedSkill,
  MissingSkill,
  UserSkillInput,
} from "./types";

/**
 * Numerical proficiency weights as defined by the specification:
 * - Beginner: 0.5
 * - Intermediate: 0.75
 * - Advanced: 1.0
 */
export const PROFICIENCY_WEIGHTS: Record<string, number> = {
  Beginner: 0.5,
  Intermediate: 0.75,
  Advanced: 1.0,
};

/**
 * Helper to safely extract proficiency weight.
 * Unknown or missing proficiencies return 0.
 */
export function getProficiencyWeight(proficiency: string): number {
  if (!proficiency) return 0;
  const trimmed = proficiency.trim();
  if (trimmed in PROFICIENCY_WEIGHTS) {
    return PROFICIENCY_WEIGHTS[trimmed];
  }
  const formatted =
    trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  return PROFICIENCY_WEIGHTS[formatted] ?? 0;
}

/**
 * Pure, deterministic scoring function for career recommendations.
 *
 * Calculates a match score (0-100%) for each career:
 * - Skill contribution = proficiency weight * career importance
 * - Max possible contribution = 1.0 * career importance
 * - Match percentage = (total matched contribution / total possible contribution) * 100
 * - Rounded to nearest whole number.
 *
 * Sorts recommendations by:
 * 1. Highest matchScore first
 * 2. Career name alphabetically as a deterministic tie-breaker
 */
export function calculateCareerRecommendations(
  userSkills: UserSkillInput[],
  careers: CareerInput[]
): CareerRecommendation[] {
  // Map user skills by skillId for fast lookup
  const userSkillMap = new Map<string, UserSkillInput>();
  for (const us of userSkills) {
    if (us && us.skillId) {
      userSkillMap.set(us.skillId, us);
    }
  }

  const recommendations: CareerRecommendation[] = careers.map((career) => {
    let totalMatchedContribution = 0;
    let totalPossibleContribution = 0;
    const matchedSkills: MatchedSkill[] = [];
    const missingSkills: MissingSkill[] = [];

    const requiredSkills = career.requiredSkills || [];

    for (const req of requiredSkills) {
      const importance = req.importance ?? 1;
      const maxContrib = 1.0 * importance;
      totalPossibleContribution += maxContrib;

      const userSkill = userSkillMap.get(req.skillId);
      const weight = userSkill ? getProficiencyWeight(userSkill.proficiency) : 0;

      if (userSkill && weight > 0) {
        const contribution = weight * importance;
        totalMatchedContribution += contribution;
        matchedSkills.push({
          skillId: req.skillId,
          skillName: req.skillName || "Unknown Skill",
          userProficiency: userSkill.proficiency,
          proficiencyWeight: weight,
          careerImportance: importance,
          contribution,
          maxContribution: maxContrib,
        });
      } else {
        missingSkills.push({
          skillId: req.skillId,
          skillName: req.skillName || "Unknown Skill",
          careerImportance: importance,
        });
      }
    }

    const rawScore =
      totalPossibleContribution > 0
        ? (totalMatchedContribution / totalPossibleContribution) * 100
        : 0;

    const matchScore = Math.round(rawScore);

    return {
      id: career.id,
      name: career.name,
      description: career.description,
      matchScore,
      matchedSkills,
      missingSkills,
    };
  });

  // Sort recommendations: highest match score first, then career name alphabetically
  recommendations.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.name.localeCompare(b.name);
  });

  return recommendations;
}
