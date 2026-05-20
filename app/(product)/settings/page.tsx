import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ensureDbUser } from "@/lib/ensure-user";
import UsernameForm from "@/components/UsernameForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const dbUser = await ensureDbUser();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your public profile and account details.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-surface-card border border-surface-border p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-white mb-2">
              Public Profile
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Claim a unique username so your friends can find your library.
            </p>

            <UsernameForm initialUsername={dbUser.username} />
          </section>
        </div>

        <div className="lg:col-span-2 flex justify-center lg:justify-start">
          <UserProfile
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#22c55e" },
            }}
            routing="hash"
          />
        </div>
      </div>
    </div>
  );
}
