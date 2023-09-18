/*
  Warnings:

  - Added the required column `curso` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semestre` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "curso" TEXT NOT NULL,
ADD COLUMN     "semestre" TEXT NOT NULL;
