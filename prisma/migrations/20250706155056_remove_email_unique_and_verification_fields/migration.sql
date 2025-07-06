/*
  Warnings:

  - You are about to drop the column `emailVerifyToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerifyToken",
DROP COLUMN "isEmailVerified";

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
