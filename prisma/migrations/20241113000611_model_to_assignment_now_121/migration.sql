/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `assignment` ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `assignment_uid_key` ON `assignment`(`uid`);
