"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export function AppNav() {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
      <Link href="/dashboard" className="text-lg font-bold tracking-tight">
        GigRoute
      </Link>
      <UserButton />
    </nav>
  );
}