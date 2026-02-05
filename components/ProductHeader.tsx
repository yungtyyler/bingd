"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ProductHeader = () => {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/dashboard" className="font-bold text-xl tracking-tight">
          Bingd
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/library"
            className={
              isActive("/library")
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }
          >
            Library
          </Link>
          <Link
            href="/search"
            className={
              isActive("/search")
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }
          >
            Search
          </Link>
        </nav>

        {/* User Profile (Clerk) */}
        <div className="flex items-center gap-4">
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default ProductHeader;
