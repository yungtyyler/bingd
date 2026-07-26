UPDATE "User"
SET "username" = 'pending_' || LOWER(REGEXP_REPLACE("authUserId", '[^a-zA-Z0-9_]', '', 'g'))
WHERE "username" IS NULL;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
