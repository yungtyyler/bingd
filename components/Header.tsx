import {
  SignedOut,
  SignInButton,
  SignUpButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 gap-4">
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

      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="cursor-pointer">Sign In</button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">Dashboard</Link>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
