import UsernameForm from "@/components/UsernameForm";
import { ensureDbUser } from "@/lib/ensure-user";
import { isPendingUsername } from "@/lib/usernames";
import { redirect } from "next/navigation";

export const metadata = { title: "Choose Username | bingd" };

export default async function UsernameOnboardingPage() {
  const dbUser = await ensureDbUser();

  if (!isPendingUsername(dbUser.username)) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-lg border border-surface-border bg-surface-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            One Last Step
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Choose your username
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Your username creates your public bingd profile and lets friends
            find you.
          </p>
        </div>

        <UsernameForm
          initialUsername=""
          redirectTo="/dashboard"
          submitLabel="Continue"
        />
      </section>
    </main>
  );
}
