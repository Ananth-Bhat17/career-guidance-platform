export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface MatchedSkill {
  skillId: string;
  skillName: string;
  userProficiency: string;
  proficiencyWeight: number;
  careerImportance: number;
  contribution: number;
  maxContribution: number;
}

export interface MissingSkill {
  skillId: string;
  skillName: string;
  careerImportance: number;
}

export interface CareerRecommendation {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
}

export interface UserSkillInput {
  skillId: string;
  skillName?: string;
  proficiency: string;
}

export interface CareerSkillRequirement {
  skillId: string;
  skillName: string;
  importance: number;
}

export interface CareerInput {
  id: string;
  name: string;
  description: string;
  requiredSkills: CareerSkillRequirement[];
}
