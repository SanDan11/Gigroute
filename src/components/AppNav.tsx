"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import {
  IconRoute,
  IconMap,
  IconCalendar,
  IconCrown,
  IconSettings,
  IconLogout,
  IconMenu,
  IconX,
  IconBrand,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tours", icon: IconRoute },
  { href: "/dashboard/map", label: "Map", icon: IconMap },
  { href: "/dashboard/schedule", label: "Schedule", icon: IconCalendar },
  { href: "/dashboard/upgrade", label: "Upgrade", icon: IconCrown },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
              active
                ? "bg-primary/15 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function AppNav({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railExpanded, setRailExpanded] = useState(true);
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen">
      {/* Desktop side rail */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background transition-all sm:flex ${
          railExpanded ? "w-48" : "w-16"
        }`}
      >
        <button
            onClick={() => setRailExpanded((v) => !v)}
            className="flex items-center gap-2 px-3 py-4 text-left"
            >
            <IconBrand className="shrink-0 text-primary" />.
            {railExpanded && (
                <span className="text-sm font-bold tracking-tight">
                Gigroutes
                </span>
            )}
            </button>

        <nav className="flex-1 px-2">
          {railExpanded ? (
            <NavLinks />
          ) : (
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-center rounded-md px-3 py-2 text-muted-foreground hover:bg-muted"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-border px-2 py-2">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted ${
              !railExpanded && "justify-center"
            }`}
          >
            <IconSettings className="shrink-0" />
            {railExpanded && "Settings"}
          </Link>
          <div
            className={`flex items-center gap-3 px-3 py-2 ${
              !railExpanded && "justify-center"
            }`}
          >
            <UserButton />
            {railExpanded && user && (
              <span className="text-sm text-muted-foreground">
                {user.firstName ?? "Account"}
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 ${
              !railExpanded && "justify-center"
            }`}
          >
            <IconLogout className="shrink-0" />
            {railExpanded && "Log off"}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background px-4 py-3 sm:hidden">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <IconMenu />
          </button>
          <IconBrand className="shrink-0 text-primary" />
          <span className="text-base font-bold tracking-tight">
            Gigroutes
          </span>
        </header>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-30 sm:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-background px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserButton />
                  {user && (
                    <div>
                      <p className="text-sm font-medium">
                        {user.firstName ?? "Account"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Free plan
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <IconX />
                </button>
              </div>

              <NavLinks onNavigate={() => setDrawerOpen(false)} />

              <div className="flex-1" />

              <div className="border-t border-border pt-2">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  <IconSettings className="shrink-0" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <IconLogout className="shrink-0" />
                  Log off
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}