"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            Resume Shapeshifter
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="hidden sm:inline">JD → Resume Tailoring Engine</span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}