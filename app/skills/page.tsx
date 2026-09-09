"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SkillsLoading from "./loading";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export default function SkillsPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillsMap, setSelectedSkillsMap] = useState<
    Map<string, ProficiencyLevel>
  >(new Map());

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/login");
          return;
        }

        if (!isMounted) return;
        setUserEmail(user.email || null);

        // Load available skills
        const { data: skillsData, error: skillsErr } = await supabase
          .from("skills")
          .select("id, name, category")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (skillsErr) {
          setErrorMsg("Failed to load skills. Please refresh the page.");
          return;
        }

        // Load user's existing skills selection
        const { data: userSkillsData, error: userSkillsErr } = await supabase
          .from("user_skills")
          .select("skill_id, proficiency")
          .eq("user_id", user.id);

        if (userSkillsErr) {
          setErrorMsg("Failed to load your saved skills. Please try again.");
          return;
        }

        if (isMounted) {
          setSkills(skillsData || []);

          const initialMap = new Map<string, ProficiencyLevel>();
          (userSkillsData || []).forEach((row) => {
            const level = (row.proficiency as ProficiencyLevel) || "Intermediate";
            initialMap.set(row.skill_id, level);
          });
          setSelectedSkillsMap(initialMap);
        }
      } catch (err) {
        console.error("Error initializing skills page:", err);
        setErrorMsg("An unexpected error occurred. Please try refreshing.");
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Skill map for fast lookup by ID
  const skillById = useMemo(() => {
    const map = new Map<string, Skill>();
    skills.forEach((s) => map.set(s.id, s));
    return map;
  }, [skills]);

  // Client-side search filtering & category grouping
  const groupedSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = skills.filter((s) =>
      s.name.toLowerCase().includes(query)
    );

    const categoriesMap = new Map<string, Skill[]>();
    filtered.forEach((skill) => {
      const list = categoriesMap.get(skill.category) || [];
      list.push(skill);
      categoriesMap.set(skill.category, list);
    });

    return categoriesMap;
  }, [skills, searchQuery]);

  const totalMatchingSkills = useMemo(() => {
    let count = 0;
    groupedSkills.forEach((list) => {
      count += list.length;
    });
    return count;
  }, [groupedSkills]);

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setSelectedSkillsMap((prev) => {
      const next = new Map(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        // Default newly selected skills to Intermediate
        next.set(skillId, "Intermediate");
      }
      return next;
    });
    setValidationMsg(null);
  };

  // Change proficiency level for a selected skill
  const setProficiency = (skillId: string, level: ProficiencyLevel) => {
    setSelectedSkillsMap((prev) => {
      const next = new Map(prev);
      if (next.has(skillId)) {
        next.set(skillId, level);
      }
      return next;
    });
  };

  // Remove selected skill
  const removeSkill = (skillId: string) => {
    setSelectedSkillsMap((prev) => {
      const next = new Map(prev);
      next.delete(skillId);
      return next;
    });
  };

  // Handle saving skills selection to Supabase
  const handleSave = async () => {
    setErrorMsg(null);
    setValidationMsg(null);

    // Validation: Require at least 1 selected skill
    if (selectedSkillsMap.size === 0) {
      setValidationMsg("Please select at least one skill to continue.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMsg("Your session has expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Fetch existing user_skills from DB
      const { data: existingUserSkills, error: fetchErr } = await supabase
        .from("user_skills")
        .select("skill_id")
        .eq("user_id", user.id);

      if (fetchErr) {
        setErrorMsg("Failed to synchronize skills. Please try again.");
        setSaving(false);
        return;
      }

      const existingSkillIds = new Set(
        (existingUserSkills || []).map((r) => r.skill_id)
      );
      const currentSelectedIds = new Set(selectedSkillsMap.keys());

      // Skills to delete (deselected by user)
      const skillIdsToDelete = Array.from(existingSkillIds).filter(
        (id) => !currentSelectedIds.has(id)
      );

      if (skillIdsToDelete.length > 0) {
        const { error: deleteErr } = await supabase
          .from("user_skills")
          .delete()
          .eq("user_id", user.id)
          .in("skill_id", skillIdsToDelete);

        if (deleteErr) {
          setErrorMsg("Failed to update skill selections. Please try again.");
          setSaving(false);
          return;
        }
      }

      // Skills to upsert
      const rowsToUpsert = Array.from(selectedSkillsMap.entries()).map(
        ([skill_id, proficiency]) => ({
          user_id: user.id,
          skill_id,
          proficiency,
        })
      );

      if (rowsToUpsert.length > 0) {
        const { error: upsertErr } = await supabase
          .from("user_skills")
          .upsert(rowsToUpsert, { onConflict: "user_id,skill_id" });

        if (upsertErr) {
          setErrorMsg("Failed to save skill choices. Please try again.");
          setSaving(false);
          return;
        }
      }

      // Navigate to dashboard on success
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Error saving user skills:", err);
      setErrorMsg("An unexpected error occurred while saving. Please try again.");
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <SkillsLoading />;
  }

  const selectedCount = selectedSkillsMap.size;
  const proficiencyLevels: ProficiencyLevel[] = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden">
        <Header userEmail={userEmail} />
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Resizable Sidebar */}
        <Sidebar userEmail={userEmail} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8 space-y-8 pb-28 md:pb-12">
          {/* Header Section */}
          <div className="border-b border-[#d8d8d2] pb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-[3px] h-6 bg-[#285ca8] inline-block shrink-0" />
              <h1 className="text-2xl md:text-3xl font-serif text-[#20201e]">
                Your Skills
              </h1>
            </div>
            <p className="text-xs md:text-sm text-[#585854] leading-relaxed">
              Tell us what you&apos;re already good at. This helps us personalize your career recommendations.
            </p>
          </div>

          {/* Search & Selection Counter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-4">
            <div className="relative flex-1 max-w-md">
              <label htmlFor="skill-search" className="sr-only">
                Search skills
              </label>
              <input
                id="skill-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
              />
            </div>
            <div className="text-xs font-medium text-[#20201e] font-mono px-3 py-1 bg-white border border-[#d8d8d2] rounded-[2px] shrink-0 self-start sm:self-auto">
              {selectedCount} skill{selectedCount === 1 ? "" : "s"} selected
            </div>
          </div>

          {/* Error / Validation Feedback */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px]">
              {errorMsg}
            </div>
          )}

          {validationMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-[2px]">
              {validationMsg}
            </div>
          )}

          {/* Two Column Grid: Left Skills Explorer, Right Selected Skills Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Skills Catalog Column */}
            <div className="lg:col-span-7 space-y-6">
              {totalMatchingSkills === 0 ? (
                <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-8 text-center text-xs text-[#585854]">
                  No skills found
                </div>
              ) : (
                Array.from(groupedSkills.entries()).map(([category, categorySkills]) => (
                  <div
                    key={category}
                    className="bg-white border border-[#d8d8d2] rounded-[2px] p-5 space-y-3"
                  >
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] border-b border-[#d8d8d2]/60 pb-2">
                      {category}
                    </h2>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categorySkills.map((skill) => {
                        const isSelected = selectedSkillsMap.has(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 text-xs font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[#285ca8] ${
                              isSelected
                                ? "bg-[#285ca8]/10 text-[#285ca8] border border-[#285ca8]"
                                : "bg-white text-[#20201e] border border-[#d8d8d2] hover:border-[#285ca8] hover:bg-[#f4f6f9]"
                            }`}
                          >
                            <span>{skill.name}</span>
                            {isSelected && (
                              <span className="font-bold text-[#285ca8] text-xs">
                                {"\u2713"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected Skills & Proficiency Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#d8d8d2] rounded-[2px] p-5 space-y-4 sticky top-6">
                <div className="flex items-center justify-between border-b border-[#d8d8d2] pb-3">
                  <h2 className="font-serif font-semibold text-base text-[#20201e]">
                    Selected Skills
                  </h2>
                  <span className="text-xs font-mono text-[#585854]">
                    {selectedCount} total
                  </span>
                </div>

                {selectedCount === 0 ? (
                  <div className="py-8 text-center text-xs text-[#585854] bg-[#f4f6f9] border border-dashed border-[#d8d8d2] rounded-[2px] p-4">
                    Click skills from the catalog to select them and set your proficiency level.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {Array.from(selectedSkillsMap.entries()).map(([skillId, proficiency]) => {
                      const skill = skillById.get(skillId);
                      if (!skill) return null;

                      return (
                        <div
                          key={skillId}
                          className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#20201e]">
                              {skill.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skillId)}
                              aria-label={`Remove ${skill.name}`}
                              className="text-xs text-[#585854] hover:text-red-700 font-bold px-1"
                            >
                              {"\u00D7"}
                            </button>
                          </div>

                          {/* Proficiency Level Selector */}
                          <div className="grid grid-cols-3 gap-1 pt-1">
                            {proficiencyLevels.map((lvl) => {
                              const isCurrent = proficiency === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setProficiency(skillId, lvl)}
                                  className={`py-1 px-1.5 text-[11px] font-medium rounded-[2px] transition-colors cursor-pointer text-center ${
                                    isCurrent
                                      ? "bg-[#1e437e] text-white"
                                      : "bg-white text-[#585854] border border-[#d8d8d2] hover:text-[#20201e]"
                                  }`}
                                >
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Primary Save Action */}
                <div className="pt-2 border-t border-[#d8d8d2]">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2.5 px-4 bg-[#1e437e] hover:bg-[#163565] text-white font-medium text-sm rounded-[2px] transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save & Continue \u2192"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
