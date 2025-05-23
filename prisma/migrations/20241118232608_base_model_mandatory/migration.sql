/*
  Warnings:

  - Made the column `base_model` on table `model` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `model` MODIFY `base_model` BOOLEAN NOT NULL DEFAULT true;
