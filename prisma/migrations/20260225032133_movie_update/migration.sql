/*
  Warnings:

  - Added the required column `duration_minutes` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "duration_minutes" INTEGER NOT NULL,
ALTER COLUMN "view_count" SET DEFAULT 0;
