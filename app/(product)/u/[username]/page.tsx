import { ensureDbUser } from "@/lib/ensure-user";
import FollowButton from "@/components/FollowButton";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { WatchStatus } from "@/app/generated/prisma/enums";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const profileUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      shows: {
        include: { show: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: { followers: true, following: true, shows: true },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }

  const currentUser = await ensureDbUser();
  const isOwnProfile = currentUser.id === profileUser.id;

  const isFollowing = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUser.id,
        followingId: profileUser.id,
      },
    },
  });

  const watching = profileUser.shows.filter(
    (s) => s.status === WatchStatus.WATCHING,
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-surface-card border border-surface-border p-8 rounded-2xl shadow-sm">
        <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-surface-base bg-linear-to-tr from-brand-primary to-green-900 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-white/50 uppercase">
            {profileUser.firstName?.charAt(0) || "U"}
          </span>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {profileUser.firstName} {profileUser.lastName}
            </h1>
            <p className="text-brand-primary font-medium">
              @{profileUser.username}
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-gray-400">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-white font-bold text-lg">
                {profileUser._count.shows}
              </span>
              <span>Shows</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-white font-bold text-lg">
                {profileUser._count.followers}
              </span>
              <span>Followers</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-white font-bold text-lg">
                {profileUser._count.following}
              </span>
              <span>Following</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 mt-4 md:mt-0">
          {isOwnProfile ? (
            <div className="px-6 py-2 bg-surface-base border border-surface-border text-gray-400 font-bold rounded-full cursor-default">
              This is you
            </div>
          ) : (
            <FollowButton
              targetUserId={profileUser.id}
              initialIsFollowing={!!isFollowing}
              username={profileUser.username!}
            />
          )}
        </div>
      </header>

      {watching.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-6 border-b border-surface-border pb-2">
            Currently Watching
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {watching.map((entry) => (
              <Link href={`/shows/${entry.show?.tvmazeId}`} key={entry.id}>
                <div className="relative aspect-2/3 w-full bg-black rounded-md overflow-hidden ring-1 ring-white/5 hover:ring-brand-primary/50 transition-all cursor-pointer">
                  {entry.show?.imageUrl ? (
                    <Image
                      src={entry.show.imageUrl}
                      alt={entry.show.name}
                      fill
                      sizes="(max-width: 768px) 33vw, 20vw"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-600 bg-surface-base">
                      No Image
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
