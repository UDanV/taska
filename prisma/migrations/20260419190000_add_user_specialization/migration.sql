CREATE TYPE "UserSpecialization" AS ENUM ('FRONTEND', 'BACKEND', 'DEVOPS', 'PM');

ALTER TABLE "User"
ADD COLUMN "specialization" "UserSpecialization";
