/*
  Warnings:

  - A unique constraint covering the columns `[bestAnswerId]` on the table `questions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `questions` ADD COLUMN `bestAnswerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('STUDENT', 'INSTRUCTOR') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `answers` (
    `id` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `questions_bestAnswerId_key` ON `questions`(`bestAnswerId`);

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_bestAnswerId_fkey` FOREIGN KEY (`bestAnswerId`) REFERENCES `answers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `answers_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
