import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 md:py-20 flex flex-col justify-center">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
          {/* Left Column: Hero Content */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#285ca8] mb-3 block">
                Career Planning &amp; Guidance
              </span>
              <h1 className="text-3xl md:text-4xl font-serif text-[#20201e] leading-tight mb-4">
                Clear directions for your professional future.
              </h1>
              <p className="text-[#585854] text-base leading-relaxed max-w-lg">
                Structured assessments, tailored skill roadmaps, and actionable career pathways designed to help you make informed professional decisions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="bg-[#1e437e] hover:bg-[#163565] text-white px-5 py-2.5 text-sm font-medium rounded-[2px] transition-colors"
              >
                Get started
              </Link>
              <Link
                href="/dashboard"
                className="text-[#285ca8] hover:underline text-sm font-medium transition-colors"
              >
                See an example plan &rarr;
              </Link>
            </div>
          </div>

          {/* Right Column: "What you will get" Panel */}
          <div className="md:col-span-5">
            <div className="bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] p-6 space-y-5">
              <h2 className="text-base font-serif font-semibold text-[#20201e] border-b border-[#d8d8d2] pb-3">
                What you will get
              </h2>

              <div className="space-y-4 text-sm">
                {/* Row 1 */}
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#285ca8] font-bold shrink-0 pt-0.5">
                    01
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#20201e]">
                      Career directions
                    </h3>
                    <p className="text-[#585854] text-xs mt-0.5 leading-normal">
                      Targeted recommendations aligned with your skills, interests, and experience level.
                    </p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-start gap-3 border-t border-[#d8d8d2]/60 pt-3">
                  <span className="font-mono text-xs text-[#285ca8] font-bold shrink-0 pt-0.5">
                    02
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#20201e]">
                      A learning path
                    </h3>
                    <p className="text-[#585854] text-xs mt-0.5 leading-normal">
                      Sequential step-by-step milestones to acquire core competencies and fill skill gaps.
                    </p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-start gap-3 border-t border-[#d8d8d2]/60 pt-3">
                  <span className="font-mono text-xs text-[#285ca8] font-bold shrink-0 pt-0.5">
                    03
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#20201e]">
                      Useful opportunities
                    </h3>
                    <p className="text-[#585854] text-xs mt-0.5 leading-normal">
                      Curated project ideas, certifications, and industry roles matching your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Anchor Section for "How it works" */}
        <section id="how-it-works" className="mt-20 pt-10 border-t border-[#d8d8d2]">
          <h2 className="text-xl font-serif text-[#20201e] mb-3">
            How it works
          </h2>
          <p className="text-[#585854] text-sm max-w-2xl leading-relaxed">
            Create an account, complete your profile details, and receive personalized career recommendations and structured milestones immediately.
          </p>
        </section>
      </main>
    </div>
  );
}
