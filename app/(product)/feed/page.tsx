import Image from "next/image";
import Link from "next/link";
import { ensureDbUser } from "@/lib/ensure-user";
import prisma from "@/lib/prisma";
import { WatchStatus } from "@/app/generated/prisma/enums";

export const metadata = { title: "Activity Feed | bingd" };

export default async function FeedPage() {
  const dbUser = await ensureDbUser();

  const following = await prisma.follows.findMany({
    where: { followerId: dbUser.id },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const recentActivity = await prisma.userShow.findMany({
    where: {
      userId: { in: followingIds },
    },
    include: {
      show: true,
      user: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
  });

  const getActionText = (status: WatchStatus) => {
    switch (status) {
      case WatchStatus.WATCHING:
        return "started watching";
      case WatchStatus.COMPLETED:
        return "completed";
      case WatchStatus.PLANNED:
        return "wants to watch";
      case WatchStatus.DROPPED:
        return "dropped";
      default:
        return "updated";
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Activity Feed
        </h1>
        <p className="text-gray-400 mt-1">
          See what your network is watching right now.
        </p>
      </header>

      {followingIds.length === 0 ? (
        <div className="text-center p-12 bg-surface-card border border-surface-border rounded-xl">
          <p className="text-gray-400 mb-4">Your feed is a bit quiet.</p>
          <Link
            href="/search"
            className="px-6 py-2 bg-brand-primary text-black font-bold rounded-full hover:bg-brand-primary-hover"
          >
            Find friends to follow
          </Link>
        </div>
      ) : recentActivity.length === 0 ? (
        <div className="text-center p-12 border border-surface-border rounded-xl">
          <p className="text-gray-500">
            No recent activity from your network yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4 p-4 bg-surface-card border border-surface-border rounded-xl shadow-sm"
            >
              <Link href={`/u/${activity.user?.username}`} className="shrink-0">
                <div className="w-10 h-10 rounded-full bg-surface-base border border-surface-border flex items-center justify-center overflow-hidden relative">
                  {activity.user?.profileImageUrl ? (
                    <Image
                      src={activity.user.profileImageUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-400 uppercase">
                      {activity.user?.firstName?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <Link
                    href={`/u/${activity.user?.username}`}
                    className="font-bold text-white hover:text-brand-primary transition-colors"
                  >
                    {activity.user?.firstName} {activity.user?.lastName}
                  </Link>{" "}
                  <span className="text-gray-500">
                    {getActionText(activity.status)}
                  </span>
                </p>

                <Link href={`/shows/${activity.show?.tvmazeId}`}>
                  <div className="mt-3 group flex items-start gap-4 p-3 rounded-lg border border-surface-border bg-surface-base hover:border-brand-primary/50 transition-colors cursor-pointer">
                    <div className="relative w-12 h-16 rounded overflow-hidden shrink-0">
                      {activity.show?.imageUrl ? (
                        <Image
                          src={activity.show.imageUrl}
                          alt={activity.show?.name || "Show"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-brand-primary transition-colors">
                        {activity.show?.name}
                      </h3>
                      {activity.show?.network && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.show.network}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mt-3">
                  {new Date(activity.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
