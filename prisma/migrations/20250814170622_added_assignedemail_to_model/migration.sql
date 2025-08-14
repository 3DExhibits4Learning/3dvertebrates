-- AlterTable
ALTER TABLE `model` ADD COLUMN `assignedEmail` VARCHAR(50) NULL;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `emailfk1` FOREIGN KEY (`assignedEmail`) REFERENCES `authorized`(`email`) ON DELETE NO ACTION ON UPDATE NO ACTION;
