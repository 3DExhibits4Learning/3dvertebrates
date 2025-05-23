/*
  Warnings:

  - Made the column `annotated` on table `model` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `model` ADD COLUMN `annotationsApproved` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `annotated` BOOLEAN NOT NULL DEFAULT false;
