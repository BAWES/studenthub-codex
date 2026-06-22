-- CreateTable
CREATE TABLE `job_listing_application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobListingId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'applied',
    `coverLetter` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `idx-job_listing_application-job_listing_id` ON `job_listing_application`(`jobListingId`);
CREATE INDEX `idx-job_listing_application-candidate_id` ON `job_listing_application`(`candidateId`);
CREATE INDEX `idx-job_listing_application-status` ON `job_listing_application`(`status`);

-- AddForeignKey
ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-job_listing_application-job_listing_id` FOREIGN KEY (`jobListingId`) REFERENCES `job_listing`(`jobListingId`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-job_listing_application-candidate_id` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`candidate_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
