export const PENDING_USERNAME_PREFIX = "pending_";

export function createPendingUsername(authUserId: string) {
  const safeId = authUserId.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return `${PENDING_USERNAME_PREFIX}${safeId}`;
}

export function isPendingUsername(username: string | null) {
  return !username || username.startsWith(PENDING_USERNAME_PREFIX);
}

export function normalizeUsername(rawUsername: FormDataEntryValue | null) {
  if (typeof rawUsername !== "string") return "";

  return rawUsername.toLowerCase().trim().replace(/^@/, "").replace(/\s+/g, "");
}

export function validateUsername(username: string) {
  if (username.length < 3 || username.length > 24) {
    return "Username must be between 3 and 24 characters.";
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return "Use only letters, numbers, and underscores.";
  }

  if (username.startsWith(PENDING_USERNAME_PREFIX)) {
    return "Choose a different username.";
  }

  return null;
}
