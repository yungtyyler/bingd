import { getMobileUser, serializeUser } from "@/app/api/mobile/_helpers";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { normalizeUsername, validateUsername } from "@/lib/usernames";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  return NextResponse.json({ user: serializeUser(dbUser) });
}

export async function PATCH(request: NextRequest) {
  const { dbUser, response } = await getMobileUser();

  if (!dbUser) {
    return response;
  }

  const body = (await request.json()) as { username?: unknown };
  const cleanUsername = normalizeUsername(
    typeof body.username === "string" ? body.username : null,
  );
  const validationError = validateUsername(cleanUsername);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { username: cleanUsername },
    });

    return NextResponse.json({ user: serializeUser(updatedUser) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Could not save username." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    confirmation?: unknown;
  } | null;

  if (body?.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Type DELETE to confirm account deletion." },
      { status: 400 },
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { authUserId: userId },
      select: { id: true },
    });

    if (dbUser) {
      await prisma.user.delete({
        where: { id: dbUser.id },
      });
    }

    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete mobile account:", error);
    return NextResponse.json(
      { error: "Could not delete your account. Please try again." },
      { status: 500 },
    );
  }
}
