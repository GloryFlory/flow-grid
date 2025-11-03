-- Enable CITEXT extension for case-insensitive emails
CREATE EXTENSION IF NOT EXISTS citext;

-- Add email case-insensitive index (note: we'll keep the column as text for now to avoid disruption)
-- In production, you'd want to ALTER COLUMN type, but for existing data this is safer:
-- CREATE UNIQUE INDEX IF NOT EXISTS "users_email_ci_idx" ON "users"(LOWER("email"));

-- Create WebAuthn credentials table
CREATE TABLE IF NOT EXISTS "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- Create unique index on credentialId
CREATE UNIQUE INDEX IF NOT EXISTS "webauthn_credentials_credentialId_key" ON "webauthn_credentials"("credentialId");

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS "webauthn_credentials_userId_idx" ON "webauthn_credentials"("userId");

-- Add foreign key constraint
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
