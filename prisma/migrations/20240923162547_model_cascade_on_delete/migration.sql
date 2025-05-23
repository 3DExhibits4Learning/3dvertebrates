-- DropForeignKey
ALTER TABLE `model` DROP FOREIGN KEY `model_ibfk_1`;

-- DropForeignKey
ALTER TABLE `model` DROP FOREIGN KEY `model_ibfk_2`;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `model_ibfk_1` FOREIGN KEY (`spec_name`) REFERENCES `species`(`spec_name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `model` ADD CONSTRAINT `model_ibfk_2` FOREIGN KEY (`spec_acquis_date`, `spec_name`) REFERENCES `specimen`(`spec_acquis_date`, `spec_name`) ON DELETE CASCADE ON UPDATE CASCADE;
