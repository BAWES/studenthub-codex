-- CreateTable
CREATE TABLE `job_listing_application` (
    `applicationId` INTEGER NOT NULL AUTO_INCREMENT,
    `jobListingId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'new',
    `coverLetter` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME(0) NOT NULL,

    PRIMARY KEY (`applicationId`),
    INDEX `idx-application-job_listing_id`(`jobListingId`),
    INDEX `idx-application-candidate_id`(`candidateId`),
    INDEX `idx-application-status`(`status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-application-job_listing_id` FOREIGN KEY (`jobListingId`) REFERENCES `job_listing`(`jobListingId`) ON DELETE CASCADE ON UPDATE RESTRICT;

ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-application-candidate_id` FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`candidate_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
