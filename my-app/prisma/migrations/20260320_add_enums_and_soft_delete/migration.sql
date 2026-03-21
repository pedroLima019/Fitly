-- CreateEnum for UserType
CREATE TYPE "UserType" AS ENUM ('personal', 'student');

-- CreateEnum for RequestStatus
CREATE TYPE "RequestStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable for User - Change userType to UserType enum
ALTER TABLE "User" DROP COLUMN "userType";
ALTER TABLE "User" ADD COLUMN "userType" "UserType";

-- AlterTable for ClientRequest - Change status to RequestStatus enum
ALTER TABLE "ClientRequest" DROP COLUMN "status";
ALTER TABLE "ClientRequest" ADD COLUMN "status" "RequestStatus" NOT NULL DEFAULT 'pending';

-- AlterTable for ClientRequest - Add soft delete field
ALTER TABLE "ClientRequest" ADD COLUMN "deletedAt" TIMESTAMP(3);
