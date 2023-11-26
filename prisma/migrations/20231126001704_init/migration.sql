/*
  Warnings:

  - You are about to drop the column `metadata` on the `ApplicationActivity` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Commit` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Task` table. All the data in the column will be lost.
  - Added the required column `hours` to the `ApplicationActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `ApplicationActivity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sha` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expirience` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `angry` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationActivity" DROP COLUMN "metadata",
ADD COLUMN     "hours" INTEGER NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Commit" DROP COLUMN "metadata",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "sha" TEXT NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "expirience" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "metadata",
ADD COLUMN     "angry" BOOLEAN NOT NULL,
ADD COLUMN     "length" INTEGER NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "metadata",
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
