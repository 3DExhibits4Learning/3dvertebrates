/*
  Warnings:

  - Added the required column `user` to the `model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `model` ADD COLUMN `user` VARCHAR(100) NOT NULL,
    MODIFY `spec_acquis_date` VARCHAR(20) NULL;
