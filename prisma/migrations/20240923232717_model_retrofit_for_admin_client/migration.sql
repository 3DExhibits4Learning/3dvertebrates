/*
  Warnings:

  - Added the required column `email` to the `model` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `model_ibfk_2` ON `model`;

-- DropIndex
DROP INDEX `spec_acquis_date` ON `model`;

-- DropIndex
DROP INDEX `spec_name` ON `model`;

-- AlterTable
ALTER TABLE `model` ADD COLUMN `email` VARCHAR(100) NOT NULL,
    ADD COLUMN `lat` DECIMAL(65, 30) NULL,
    ADD COLUMN `lng` DECIMAL(65, 30) NULL,
    MODIFY `spec_acquis_date` DATE NULL;
