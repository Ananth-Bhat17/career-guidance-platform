import Link from "next/link";

interface HeaderProps {
  userEmail?: string | null;
}

export default function Header({ userEmail }: HeaderProps) {
  return (
    <header className="w-full bg-[#fffefa] border-b border-[#d8d8d2] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-[3px] h-4 bg-[#285ca8] inline-block shrink-0" />
          <span className="font-semibold text-base tracking-tight text-[#20201e]">
            Career Guidance
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-sans">
          <Link
            href="/#how-it-works"
            className="text-[#585854] hover:text-[#20201e] transition-colors hidden sm:inline-block"
          >
            How it works
          </Link>
          <Link
            href="/dashboard"
            className="text-[#585854] hover:text-[#20201e] transition-colors"
          >
            Dashboard
          </Link>

          {userEmail ? (
            <span className="text-xs text-[#585854] font-mono px-2 py-1 bg-[#f4f6f9] border border-[#d8d8d2] rounded-[2px] truncate max-w-[180px]">
              {userEmail}
            </span>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[#585854] hover:text-[#20201e] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#1e437e] hover:bg-[#163565] text-white text-xs font-medium px-3.5 py-1.5 rounded-[2px] transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
