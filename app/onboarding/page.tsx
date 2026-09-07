"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "@/components/Header";
import AuthFormSkeleton from "@/components/AuthFormSkeleton";

const EDUCATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Other",
];

const EXPERIENCE_OPTIONS = [
  "Student",
  "Entry Level",
  "1–3 Years",
  "3–5 Years",
  "5+ Years",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [education, setEducation] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [location, setLocation] = useState("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserAndProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        if (!isMounted) return;

        setUserEmail(user.email || null);
        const defaultName = user.user_metadata?.full_name || "";

        // Fetch existing profile if present
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, education, field_of_study, experience_level, location")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && isMounted) {
          setFullName(profile.full_name || defaultName);
          setEducation(profile.education || "");
          setFieldOfStudy(profile.field_of_study || "");
          setExperienceLevel(profile.experience_level || "");
          setLocation(profile.location || "");
        } else if (isMounted) {
          setFullName(defaultName);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadUserAndProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedFullName = fullName.trim();
    const trimmedEducation = education.trim();
    const trimmedFieldOfStudy = fieldOfStudy.trim();
    const trimmedExperienceLevel = experienceLevel.trim();
    const trimmedLocation = location.trim();

    // Validation: All five fields are required and must not be empty or whitespace-only
    if (!trimmedFullName) {
      setErrorMsg("Please enter your Full Name.");
      return;
    }
    if (!trimmedEducation) {
      setErrorMsg("Please select your Education.");
      return;
    }
    if (!trimmedFieldOfStudy) {
      setErrorMsg("Please enter your Field of Study.");
      return;
    }
    if (!trimmedExperienceLevel) {
      setErrorMsg("Please select your Experience Level.");
      return;
    }
    if (!trimmedLocation) {
      setErrorMsg("Please enter your Location.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMsg("Authentication session expired. Please log in again.");
        router.push("/login");
        return;
      }

      // Upsert profile into public.profiles using authenticated user's ID
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name: trimmedFullName,
          education: trimmedEducation,
          field_of_study: trimmedFieldOfStudy,
          experience_level: trimmedExperienceLevel,
          location: trimmedLocation,
        },
        { onConflict: "id" }
      );

      if (error) {
        setErrorMsg(error.message || "Failed to save profile. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred while saving your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header userEmail={userEmail} />

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {initialLoading ? (
          <AuthFormSkeleton />
        ) : (
          <div className="w-full max-w-[480px] bg-white border border-[#d8d8d2] rounded-[2px] p-6 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-[3px] h-5 bg-[#285ca8] inline-block shrink-0" />
                <h1 className="text-2xl font-serif text-[#20201e]">
                  Complete Your Profile
                </h1>
              </div>
              <p className="text-xs text-[#585854] font-sans leading-relaxed">
                Tell us a little about yourself so we can personalize your career guidance.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px]">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              {/* 1. Full Name */}
              <div>
                <label
                  htmlFor="full-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
                />
              </div>

              {/* 2. Education */}
              <div>
                <label
                  htmlFor="education"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5"
                >
                  Education
                </label>
                <select
                  id="education"
                  required
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Education
                  </option>
                  {EDUCATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Field of Study */}
              <div>
                <label
                  htmlFor="field-of-study"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5"
                >
                  Field of Study
                </label>
                <input
                  id="field-of-study"
                  type="text"
                  required
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
                />
              </div>

              {/* 4. Experience Level */}
              <div>
                <label
                  htmlFor="experience-level"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5"
                >
                  Experience Level
                </label>
                <select
                  id="experience-level"
                  required
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Select Experience Level
                  </option>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5"
                >
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-[#1e437e] hover:bg-[#163565] text-white font-medium text-sm rounded-[2px] transition-colors disabled:opacity-60 cursor-pointer mt-2"
              >
                {submitting ? "Saving..." : "Save & Continue"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
