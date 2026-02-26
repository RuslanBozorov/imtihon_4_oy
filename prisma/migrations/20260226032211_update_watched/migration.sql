/*
  Warnings:

  - You are about to alter the column `watched_percentage` on the `Watch_histroy` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,1)`.

*/
-- AlterTable
ALTER TABLE "Watch_histroy" ALTER COLUMN "watched_percentage" SET DATA TYPE DECIMAL(5,1);
