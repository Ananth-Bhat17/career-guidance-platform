"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "career-guidance-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 240;
const MAX_WIDTH = 440;

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_WIDTH);

  // Restore sidebar width from localStorage on mount
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(STORAGE_KEY);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Handle pointer/mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidthRef.current + deltaX)
    );
    setSidebarWidth(newWidth);
  }, []);

  // Handle pointer/mouse up to end drag
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  // Save to localStorage when resize finishes
  useEffect(() => {
    if (!isResizing) {
      try {
        localStorage.setItem(STORAGE_KEY, sidebarWidth.toString());
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [isResizing, sidebarWidth]);

  // Start resize drag handler
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/onboarding" },
    { label: "Skills", href: "/skills" },
  ];

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className="relative shrink-0 hidden md:flex flex-col min-h-screen bg-[#fffefa] border-r border-[#d8d8d2] font-sans select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#d8d8d2] flex items-center gap-2.5">
        <span className="w-[3px] h-5 bg-[#285ca8] inline-block shrink-0" />
        <Link href="/" className="font-serif text-lg font-bold text-[#20201e] tracking-tight">
          Career Guidance
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#585854] px-3 py-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm rounded-[2px] transition-colors ${
                isActive
                  ? "bg-[#285ca8]/10 text-[#285ca8] font-semibold border-l-2 border-[#285ca8]"
                  : "text-[#585854] hover:bg-[#f4f6f9] hover:text-[#20201e]"
              }`}
            >
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      {userEmail && (
        <div className="p-4 border-t border-[#d8d8d2] bg-[#f4f6f9]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#585854] mb-1">
            Signed in as
          </div>
          <div className="text-xs text-[#20201e] font-mono truncate">{userEmail}</div>
        </div>
      )}

      {/* Resizable Drag Handle */}
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuenow={sidebarWidth}
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        tabIndex={0}
        onMouseDown={startResizing}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            setSidebarWidth((w) => Math.max(MIN_WIDTH, w - 10));
          } else if (e.key === "ArrowRight") {
            setSidebarWidth((w) => Math.min(MAX_WIDTH, w + 10));
          }
        }}
        className={`absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-[#285ca8]/30 transition-colors z-20 group flex items-center justify-center ${
          isResizing ? "bg-[#285ca8]/40" : ""
        }`}
      >
        <div className="w-[2px] h-8 bg-[#d8d8d2] group-hover:bg-[#285ca8] rounded-[1px] transition-colors" />
      </div>
    </aside>
  );
}
