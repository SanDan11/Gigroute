"use client";

import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Gigroutes
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Plan your tour. Route your gigs.
      </p>

      <Show when="signed-out">
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-border px-6 py-3 font-medium"
          >
            Sign In
          </Link>
        </div>
      </Show>

      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="mt-8 rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
        >
          Go to Dashboard
        </Link>
      </Show>
    </main>
  );
}