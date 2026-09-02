import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`bg-[#e5e7eb] rounded-[2px] animate-pulse motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}
