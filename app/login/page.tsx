"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "@/components/Header";
import AuthFormSkeleton from "@/components/AuthFormSkeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setErrorMsg(urlError);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white border border-[#d8d8d2] rounded-[2px] p-6 md:p-8">
      {/* Form Heading Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-[3px] h-5 bg-[#285ca8] inline-block shrink-0" />
          <h1 className="text-2xl font-serif text-[#20201e]">Sign in</h1>
        </div>
        <p className="text-xs text-[#585854] font-sans">
          Access your personalized career guidance dashboard.
        </p>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px]">
          {errorMsg}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4 font-sans">
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#1e437e] hover:bg-[#163565] text-white font-medium text-sm rounded-[2px] transition-colors disabled:opacity-60 cursor-pointer mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Footer Link */}
      <div className="mt-6 border-t border-[#d8d8d2] pt-4 text-center text-xs text-[#585854]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[#285ca8] hover:underline font-medium"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffefa] text-[#20201e] font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<AuthFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
