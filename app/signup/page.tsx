"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Header from "@/components/Header";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Form Validation
    if (!fullName || !fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setErrorMsg(
            "An account with this email already exists. Try logging in."
          );
        } else {
          setSuccessMsg(
            "Account created successfully! Please check your email inbox to confirm your account before logging in."
          );
          setFullName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white border border-[#d8d8d2] rounded-[2px] p-6 md:p-8">
          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-[3px] h-5 bg-[#285ca8] inline-block shrink-0" />
              <h1 className="text-2xl font-serif text-[#20201e]">
                Create account
              </h1>
            </div>
            <p className="text-xs text-[#585854] font-sans">
              Start your career guidance journey today.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[2px]">
              {successMsg}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
              />
              <p className="text-[11px] text-[#585854] mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#585854] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-[#d8d8d2] text-[#20201e] text-sm rounded-[2px] focus:outline-none focus:border-[#285ca8] focus:ring-1 focus:ring-[#285ca8] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#1e437e] hover:bg-[#163565] text-white font-medium text-sm rounded-[2px] transition-colors disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 border-t border-[#d8d8d2] pt-4 text-center text-xs text-[#585854]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#285ca8] hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
