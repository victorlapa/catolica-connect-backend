-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tag" VARCHAR(18) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);