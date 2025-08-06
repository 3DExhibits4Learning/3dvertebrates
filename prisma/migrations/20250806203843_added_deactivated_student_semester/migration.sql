-- CreateTable
CREATE TABLE `semester` (
    `email` VARCHAR(191) NOT NULL,
    `semester` VARCHAR(25) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deactivated` (
    `email` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'student',
    `name` VARCHAR(191) NOT NULL DEFAULT '',

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `semester` ADD CONSTRAINT `semesterFkEmail` FOREIGN KEY (`email`) REFERENCES `authorized`(`email`) ON DELETE CASCADE ON UPDATE CASCADE;
