"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Home, Library, Radio, Search, Settings, User } from "lucide-react";
import Searchbar from "./Searchbar";

export default function ProductHeader({
  username,
}: {
  username: string | null;
}) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const mobileTabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/library", label: "Library", icon: Library },
    { href: "/search", label: "Search", icon: Search },
    { href: "/feed", label: "Feed", icon: Radio },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-base/90 backdrop-blur-md pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="shrink-0 flex items-center gap-2 font-extrabold text-xl text-white tracking-tight sm:block hover:text-brand-primary transition-colors"
            >
              bingd.
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-bold transition-colors ${isActive("/dashboard") ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/library"
                className={`text-sm font-bold transition-colors ${isActive("/library") ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
              >
                Library
              </Link>
              <Link
                href="/feed"
                className={`text-sm font-bold transition-colors ${isActive("/feed") ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
              >
                Feed
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6 flex-1 justify-end">
            <div className="w-full max-w-xs hidden sm:block">
              <Searchbar variant="header" />
            </div>

            <Link
              href="/settings"
              className={`text-sm font-bold transition-colors hidden md:block ${isActive("/settings") ? "text-brand-primary" : "text-gray-400 hover:text-white"}`}
            >
              Settings
            </Link>

            <UserButton
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox:
                    "w-8 h-8 ring-2 ring-surface-border hover:ring-brand-primary transition-all",
                },
              }}
            >
              <UserButton.MenuItems>
                {username && (
                  <UserButton.Link
                    label="Public Profile"
                    labelIcon={<User className="w-4 h-4" />}
                    href={`/u/${username}`}
                  />
                )}

                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-surface-border bg-surface-base/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition-colors ${
                  active
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
