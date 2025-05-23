/*
  Warnings:

  - You are about to drop the `common_names` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `image_set` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `species` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `specimen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `common_names` DROP FOREIGN KEY `common_names_ibfk_1`;

-- DropForeignKey
ALTER TABLE `image_set` DROP FOREIGN KEY `image_set_ibfk_1`;

-- DropForeignKey
ALTER TABLE `image_set` DROP FOREIGN KEY `image_set_ibfk_2`;

-- DropForeignKey
ALTER TABLE `image_set` DROP FOREIGN KEY `image_set_ibfk_3`;

-- DropForeignKey
ALTER TABLE `specimen` DROP FOREIGN KEY `specimen_ibfk_1`;

-- DropTable
DROP TABLE `common_names`;

-- DropTable
DROP TABLE `image_set`;

-- DropTable
DROP TABLE `species`;

-- DropTable
DROP TABLE `specimen`;
