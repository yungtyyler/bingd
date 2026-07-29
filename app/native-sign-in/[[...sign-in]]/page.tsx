import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const nativeAuthAppearance = {
  elements: {
    cardBox:
      "bg-surface-card border border-surface-border shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
    card: "bg-surface-card text-white",
    headerTitle: "text-white",
    headerSubtitle: "text-gray-400",
    formButtonPrimary:
      "bg-brand-primary text-black font-bold hover:bg-brand-primary-hover",
    formFieldLabel: "text-gray-200",
    formFieldInput:
      "bg-surface-base border-surface-border text-white focus:border-brand-primary",
    footerActionText: "text-gray-400",
    footerActionLink: "text-brand-primary hover:text-brand-primary-hover",
    socialButtonsBlockButton: "hidden",
    socialButtonsIconButton: "hidden",
    dividerRow: "hidden",
  },
};

export default function NativeSignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4 py-10 text-white">
      <Link
        href="/"
        className="mb-8 text-2xl font-extrabold tracking-tighter text-white"
      >
        bingd.
      </Link>
      <SignIn
        routing="path"
        path="/native-sign-in"
        signUpUrl="/native-sign-up"
        forceRedirectUrl="/dashboard"
        appearance={nativeAuthAppearance}
      />
    </main>
  );
}
