import { getMobileUser, serializeUser } from "@/app/api/mobile/_helpers";
import { Prisma } from "@/app/generated/prisma/client";
import { searchShows } from "@/actions/shows";
import prisma from "@/lib/prisma";
import { PENDING_USERNAME_PREFIX } from "@/lib/usernames";
import { NextRequest, NextResponse } from "next/server";

type UserSearchResult = {
  username: string;
  firstName: string | null;
  lastName: string | null;
};

function getSearchTokens(query: string) {
  return Array.from(
    new Set(query.split(/\s+/).map((token) => token.trim()).filter(Boolean)),
  ).slice(0, 5);
}

function buildUserSearchWhere(query: string): Prisma.UserWhereInput {
  const compactQuery = query.replace(/\s+/g, "");
  const tokens = getSearchTokens(query);
  const wholeQueryMatches: Prisma.UserWhereInput[] = [
    { username: { contains: query, mode: "insensitive" } },
    { firstName: { contains: query, mode: "insensitive" } },
    { lastName: { contains: query, mode: "insensitive" } },
  ];

  if (compactQuery !== query) {
    wholeQueryMatches.push({
      username: { contains: compactQuery, mode: "insensitive" },
    });
  }

  if (tokens.length > 1) {
    wholeQueryMatches.push({
      AND: tokens.map((token) => ({
        OR: [
          { username: { contains: token, mode: "insensitive" } },
          { firstName: { contains: token, mode: "insensitive" } },
          { lastName: { contains: token, mode: "insensitive" } },
        ],
      })),
    });
  }

  return {
    NOT: { username: { startsWith: PENDING_USERNAME_PREFIX } },
    OR: wholeQueryMatches,
  };
}

function scoreUserSearchResult(user: UserSearchResult, query: string) {
  const normalizedQuery = query.toLowerCase();
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const username = user.username.toLowerCase();
  const firstName = user.firstName?.toLowerCase() || "";
  const lastName = user.lastName?.toLowerCase() || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const compactFullName = fullName.replace(/\s+/g, "");
  const tokens = getSearchTokens(normalizedQuery);

  let score = 0;

  if (username === normalizedQuery || username === compactQuery) score += 100;
  if (fullName === normalizedQuery || compactFullName === compactQuery) {
    score += 90;
  }
  if (username.startsWith(compactQuery)) score += 50;
  if (fullName.startsWith(normalizedQuery)) score += 45;
  if (username.includes(compactQuery)) score += 25;
  if (fullName.includes(normalizedQuery)) score += 20;

  for (const token of tokens) {
    if (username.includes(token)) score += 8;
    if (firstName.includes(token)) score += 8;
    if (lastName.includes(token)) score += 8;
  }

  return score;
}

export async function GET(request: NextRequest) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({ shows: [], users: [] });
  }

  const [shows, fetchedUsers] = await Promise.all([
    searchShows(query),
    prisma.user.findMany({
      where: buildUserSearchWhere(query),
      take: 20,
    }),
  ]);

  const users = fetchedUsers
    .sort((a, b) => scoreUserSearchResult(b, query) - scoreUserSearchResult(a, query))
    .slice(0, 8);

  const follows =
    users.length > 0
      ? await prisma.follows.findMany({
          where: {
            followerId: dbUser.id,
            followingId: { in: users.map((user) => user.id) },
          },
        })
      : [];
  const followingIds = new Set(follows.map((follow) => follow.followingId));

  return NextResponse.json({
    shows,
    users: users.map((user) => ({
      ...serializeUser(user),
      isCurrentUser: user.id === dbUser.id,
      isFollowing: followingIds.has(user.id),
    })),
  });
}
