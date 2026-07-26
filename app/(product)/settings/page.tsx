import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import NotificationHistory from "@/components/NotificationHistory";
import NotificationPreferencesForm from "@/components/NotificationPreferencesForm";
import UsernameForm from "@/components/UsernameForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const dbUser = await ensureDbUser();
  const [notificationPreference, notificationLogs] = await Promise.all([
    prisma.notificationPreference.findUnique({
      where: { userId: dbUser.id },
    }),
    prisma.notificationLog.findMany({
      where: { userId: dbUser.id },
      include: {
        show: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const notificationPreferences = {
    pushEnabled: notificationPreference?.pushEnabled ?? false,
    airingTonightEnabled:
      notificationPreference?.airingTonightEnabled ?? true,
    airingThisWeekEnabled:
      notificationPreference?.airingThisWeekEnabled ?? true,
    newSeasonThisWeekEnabled:
      notificationPreference?.newSeasonThisWeekEnabled ?? true,
    timezone: notificationPreference?.timezone ?? null,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12 sm:p-8">
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

          <section className="bg-surface-card border border-surface-border p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-white mb-2">
              Notifications
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Choose which show alerts belong on this account.
            </p>

            <NotificationPreferencesForm
              preferences={notificationPreferences}
            />
          </section>

          <NotificationHistory logs={notificationLogs} />
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
