/*
  Warnings:

  - You are about to drop the `submittalAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submittalSoftware` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submittalTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userSubmittal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `submittalSoftware` DROP FOREIGN KEY `submittalSoftwareFk`;

-- DropForeignKey
ALTER TABLE `submittalTags` DROP FOREIGN KEY `submittalTagsFk`;

-- DropTable
DROP TABLE `submittalAttempt`;

-- DropTable
DROP TABLE `submittalSoftware`;

-- DropTable
DROP TABLE `submittalTags`;

-- DropTable
DROP TABLE `userSubmittal`;
