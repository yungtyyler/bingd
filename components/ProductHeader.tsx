"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const ProductHeader = () => {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="max-w-15 bg-white rounded-full p-1">
          <Link href="/">
            <Image
              width={750}
              height={750}
              className="object-contain rounded-full"
              src="/bingd_logo.png"
              alt="Bingd Logo"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className={
              isActive("/dashboard")
                ? "text-black"
                : "text-gray-500 hover:text-black"
            }
          >
            Dashboard
          </Link>
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
