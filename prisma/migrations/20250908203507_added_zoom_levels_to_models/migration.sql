-- AlterTable
ALTER TABLE `model` ADD COLUMN `max_zoom_in` CHAR(1) NULL,
    ADD COLUMN `max_zoom_out` CHAR(2) NULL,
    MODIFY `class` VARCHAR(50) NOT NULL DEFAULT 'BIOL-499',
    MODIFY `semester` VARCHAR(50) NOT NULL DEFAULT 'FALL25';
