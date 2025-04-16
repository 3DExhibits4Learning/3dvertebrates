/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `model` ADD COLUMN `comm_name_string` VARCHAR(250) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role`;
