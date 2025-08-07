/*
  Warnings:

  - You are about to drop the `deactivated` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `authorized` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE `deactivated`;
