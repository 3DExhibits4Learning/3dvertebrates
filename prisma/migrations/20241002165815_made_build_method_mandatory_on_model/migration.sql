/*
  Warnings:

  - Made the column `build_process` on table `model` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `model` MODIFY `build_process` VARCHAR(50) NOT NULL DEFAULT 'Photogrammetry';
