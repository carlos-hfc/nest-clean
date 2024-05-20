/*
  Warnings:

  - You are about to drop the column `userId` on the `questions` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_userId_fkey`;

-- AlterTable
ALTER TABLE `questions` DROP COLUMN `userId`,
    ADD COLUMN `authorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
