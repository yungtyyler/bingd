"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

const Header = () => {
  const { openSignIn, openSignUp, signOut, user } = useClerk();

  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-base/80 backdrop-blur-md py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-extrabold text-xl tracking-tighter text-white hover:text-brand-primary transition-colors"
        >
          bingd.
        </Link>

        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <p>Hey, {user?.firstName}!</p>
              <Link href="/dashboard">
                <button className="px-4 py-2 text-sm font-bold text-black bg-white border-black rounded-full hover:bg-brand-primary-hover hover:text-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer">
                  Dashboard
                </button>
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openSignIn({ forceRedirectUrl: "/dashboard" })}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Log in
              </button>

              <button
                onClick={() => openSignUp({ forceRedirectUrl: "/dashboard" })}
                className="px-4 py-2 text-sm font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
