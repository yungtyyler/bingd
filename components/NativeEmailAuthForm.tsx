"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type NativeEmailAuthFormProps = {
  mode: "sign-in" | "sign-up";
  signInHref?: string;
  signUpHref?: string;
};

type AuthStep = "email" | "code";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors.length > 0
  ) {
    const firstError = error.errors[0] as {
      longMessage?: string;
      message?: string;
    };

    return (
      firstError.longMessage ||
      firstError.message ||
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function NativeEmailAuthForm({
  mode,
  signInHref = "/sign-in",
  signUpHref = "/sign-up",
}: NativeEmailAuthFormProps) {
  const router = useRouter();
  const {
    isLoaded: isSignInLoaded,
    signIn,
    setActive: setActiveSignIn,
  } = useSignIn();
  const {
    isLoaded: isSignUpLoaded,
    signUp,
    setActive: setActiveSignUp,
  } = useSignUp();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoaded = mode === "sign-in" ? isSignInLoaded : isSignUpLoaded;
  const title = mode === "sign-in" ? "Welcome back" : "Create your account";
  const submitLabel =
    step === "email"
      ? mode === "sign-in"
        ? "Email me a code"
        : "Create account"
      : "Continue";
  const alternateHref = mode === "sign-in" ? signUpHref : signInHref;
  const alternateText =
    mode === "sign-in"
      ? "Need an account? Sign up"
      : "Already have an account? Sign in";

  const sendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address.");
      return;
    }

    if (mode === "sign-in") {
      if (!signIn) return;
      await signIn.create({
        strategy: "email_code",
        identifier: normalizedEmail,
      });
    } else {
      if (!signUp) return;
      await signUp.create({ emailAddress: normalizedEmail });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    }

    setEmail(normalizedEmail);
    setStep("code");
  };

  const verifyCode = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Enter the code from your email.");
      return;
    }

    if (mode === "sign-in") {
      if (!signIn || !setActiveSignIn) return;
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: trimmedCode,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActiveSignIn({ session: result.createdSessionId });
        router.replace("/dashboard");
        return;
      }
    } else {
      if (!signUp || !setActiveSignUp) return;
      const result = await signUp.attemptEmailAddressVerification({
        code: trimmedCode,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActiveSignUp({ session: result.createdSessionId });
        router.replace("/dashboard");
        return;
      }
    }

    setError("We could not finish signing you in. Please try again.");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoaded || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      if (step === "email") {
        await sendCode();
      } else {
        await verifyCode();
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tighter text-white"
        >
          bingd.
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-surface-border bg-surface-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm leading-6 text-gray-400">
            {step === "email"
              ? "Use your email to continue in the app."
              : `Enter the code sent to ${email}.`}
          </p>
        </div>

        {step === "email" ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-200">Email</span>
            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-md border border-surface-border bg-surface-base px-4 text-base text-white outline-none transition-colors focus:border-brand-primary"
            />
          </label>
        ) : (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-gray-200">
              Email code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="min-h-12 w-full rounded-md border border-surface-border bg-surface-base px-4 text-center text-xl font-bold tracking-widest text-white outline-none transition-colors focus:border-brand-primary"
            />
          </label>
        )}

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!isLoaded || isSubmitting}
          className="min-h-12 w-full rounded-md bg-brand-primary px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "One moment..." : submitLabel}
        </button>

        {step === "code" && (
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="min-h-10 w-full rounded-md border border-surface-border px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand-primary/50"
          >
            Use a different email
          </button>
        )}

        <Link
          href={alternateHref}
          className="block text-center text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
        >
          {alternateText}
        </Link>
      </form>
    </div>
  );
}
