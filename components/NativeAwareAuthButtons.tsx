"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { useIsNativeApp } from "./useIsNativeApp";

type NativeAwareAuthButtonsProps = {
  variant?: "hero" | "compact";
  primaryLabel?: string;
  secondaryLabel?: string;
};

const styles = {
  hero: {
    wrapper: "flex flex-col sm:flex-row items-center justify-center gap-4 pt-4",
    primary:
      "cursor-pointer w-full sm:w-auto px-8 py-4 text-base font-bold text-black bg-brand-primary rounded-full hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]",
    secondary:
      "cursor-pointer w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-surface-border rounded-full hover:bg-gray-800 transition-all",
  },
  compact: {
    wrapper: "grid gap-3 sm:grid-cols-2",
    primary:
      "min-h-10 rounded-md bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover",
    secondary:
      "min-h-10 rounded-md border border-surface-border bg-surface-base px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50",
  },
};

export default function NativeAwareAuthButtons({
  variant = "hero",
  primaryLabel = "Get Started for Free",
  secondaryLabel = "Sign In",
}: NativeAwareAuthButtonsProps) {
  const isNativeApp = useIsNativeApp();
  const style = styles[variant];

  if (isNativeApp === null) {
    return (
      <div aria-hidden="true" className={style.wrapper}>
        <span className={`${style.primary} pointer-events-none opacity-0`}>
          {primaryLabel}
        </span>
        <span className={`${style.secondary} pointer-events-none opacity-0`}>
          {secondaryLabel}
        </span>
      </div>
    );
  }

  if (isNativeApp) {
    return (
      <div className={style.wrapper}>
        <Link href="/native-sign-up" className={style.primary}>
          {primaryLabel}
        </Link>
        <Link href="/native-sign-in" className={style.secondary}>
          {secondaryLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className={style.wrapper}>
      <SignUpButton mode="modal">
        <button className={style.primary}>{primaryLabel}</button>
      </SignUpButton>

      <SignInButton mode="modal">
        <button className={style.secondary}>{secondaryLabel}</button>
      </SignInButton>
    </div>
  );
}
