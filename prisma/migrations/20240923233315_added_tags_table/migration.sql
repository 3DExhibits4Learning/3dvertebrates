-- CreateTable
CREATE TABLE `tags` (
    `uid` VARCHAR(100) NOT NULL,
    `tag` VARCHAR(25) NOT NULL,

    PRIMARY KEY (`uid`, `tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tag_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `model`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;
