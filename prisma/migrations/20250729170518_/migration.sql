/*
  Warnings:

  - You are about to drop the column `annotationsApproved` on the `model` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `model` DROP COLUMN `annotationsApproved`,
    ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT false;
