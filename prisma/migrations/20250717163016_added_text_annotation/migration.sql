-- CreateTable
CREATE TABLE `text_annotation` (
    `annotation_id` VARCHAR(36) NOT NULL,
    `annotation` VARCHAR(4000) NOT NULL,

    PRIMARY KEY (`annotation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `text_annotation` ADD CONSTRAINT `textFk1` FOREIGN KEY (`annotation_id`) REFERENCES `annotations`(`annotation_id`) ON DELETE CASCADE ON UPDATE CASCADE;
