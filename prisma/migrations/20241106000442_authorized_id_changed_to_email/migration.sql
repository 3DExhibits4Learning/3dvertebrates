/*
  Warnings:

  - The primary key for the `authorized` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `username` on the `authorized` table. All the data in the column will be lost.
  - Added the required column `email` to the `authorized` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `authorized` DROP PRIMARY KEY,
    DROP COLUMN `username`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`email`);
