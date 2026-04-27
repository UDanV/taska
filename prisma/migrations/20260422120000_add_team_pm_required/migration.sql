-- Add explicit PM relation for every team.
ALTER TABLE "Team" ADD COLUMN "pmId" TEXT;

UPDATE "Team"
SET "pmId" = "createdById"
WHERE "pmId" IS NULL;

ALTER TABLE "Team" ALTER COLUMN "pmId" SET NOT NULL;

ALTER TABLE "Team"
ADD CONSTRAINT "Team_pmId_fkey"
FOREIGN KEY ("pmId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "Team_pmId_idx" ON "Team"("pmId");
