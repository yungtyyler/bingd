"use client";

import { UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader({ username }: { username: string | null }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-base/80 backdrop-blur-md">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-extrabold text-xl tracking-tighter text-white hover:text-brand-primary transition-colors"
        >
          bingd.
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-brand-primary ${
              isActive("/dashboard") ? "text-brand-primary" : "text-gray-400"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/library"
            className={`transition-colors hover:text-brand-primary ${
              isActive("/library") ? "text-brand-primary" : "text-gray-400"
            }`}
          >
            Library
          </Link>
          <Link
            href="/search"
            className={`transition-colors hover:text-brand-primary ${
              isActive("/search") ? "text-brand-primary" : "text-gray-400"
            }`}
          >
            Search
          </Link>
          <Link
            href="/feed"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors mr-4"
          >
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 ring-2 ring-surface-border hover:ring-brand-primary transition-all",
              },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Public Profile"
                labelIcon={<User className="w-4 h-4" />}
                href={`/u/${username}`}
              />

              <UserButton.Action label="manageAccount" />
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>
    </header>
  );
}
