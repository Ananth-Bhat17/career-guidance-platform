"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="px-3 py-1.5 bg-white hover:bg-[#f4f6f9] text-[#20201e] border border-[#d8d8d2] text-xs font-medium rounded-[2px] transition-colors cursor-pointer disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Log out"}
    </button>
  );
}
