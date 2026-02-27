import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface-base/80 backdrop-blur-md py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="max-w-15 bg-brand-primary-hover rounded-full p-1"
        >
          <Image
            width={750}
            height={750}
            className="object-contain rounded-full"
            src="/green_bingd_logo.png"
            alt="Bingd Logo"
          />
        </Link>

        <nav className="flex items-center gap-6">
          <SignInButton mode="modal">
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">
              Log in
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="px-4 py-2 text-sm font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </nav>
      </div>
    </header>
  );
};

export default Header;
