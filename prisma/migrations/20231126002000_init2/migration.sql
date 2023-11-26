/*
  Warnings:

  - You are about to drop the column `expirience` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `experience` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "expirience",
ADD COLUMN     "experience" INTEGER NOT NULL;
