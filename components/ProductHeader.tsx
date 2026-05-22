"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { User } from "lucide-react";
import Searchbar from "./Searchbar";

export default function ProductHeader({
  username,
}: {
  username: string | null;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-surface-base/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2 font-extrabold text-xl text-white tracking-tight sm:block hover:text-brand-primary transition-colors"
          >
            bingd
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
  );
}
