/*
  Warnings:

  - You are about to drop the `semester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `semester` DROP FOREIGN KEY `semesterFkEmail`;

-- AlterTable
ALTER TABLE `model` ADD COLUMN `class` VARCHAR(50) NOT NULL DEFAULT 'Advanced Mammalogy',
    ADD COLUMN `semester` VARCHAR(50) NOT NULL DEFAULT 'SPRING25';

-- DropTable
DROP TABLE `semester`;
