"use client";

import { toggleFollow } from "@/actions/social";
import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  username: string;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
  username,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);

    setIsFollowing(!isFollowing);

    const result = await toggleFollow(targetUserId, `/u/${username}`);

    if (result?.error) {
      setIsFollowing(initialIsFollowing);
    }

    setIsPending(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-6 py-2 font-bold rounded-full transition-all disabled:opacity-50 ${
        isFollowing
          ? "bg-surface-border text-white hover:bg-red-500/20 hover:text-red-500 hover:border-red-500 border border-transparent"
          : "bg-brand-primary text-black hover:bg-brand-primary-hover"
      }`}
    >
      {isPending ? "Updating..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
