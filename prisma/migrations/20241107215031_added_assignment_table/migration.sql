-- CreateTable
CREATE TABLE `assignment` (
    `email` VARCHAR(191) NOT NULL,
    `uid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `assignment_email_uid_key`(`email`, `uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignmentFkEmail` FOREIGN KEY (`email`) REFERENCES `authorized`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `assignmentFkUid` FOREIGN KEY (`uid`) REFERENCES `model`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;
