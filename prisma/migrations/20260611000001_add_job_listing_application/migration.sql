-- CreateTable: job_listing_application
-- Connects candidates to job listings with status tracking

CREATE TABLE `job_listing_application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobListingId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'applied',
    `coverLetter` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `idx-job_listing_application-job_listing_id`(`jobListingId`),
    INDEX `idx-job_listing_application-candidate_id`(`candidateId`),
    INDEX `idx-job_listing_application-status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create foreign keys manually (Prisma doesn't manage FKs for MySQL with this setup)
ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-job_listing_application-job_listing_id`
    FOREIGN KEY (`jobListingId`) REFERENCES `job_listing`(`jobListingId`)
    ON DELETE CASCADE ON UPDATE RESTRICT;

ALTER TABLE `job_listing_application` ADD CONSTRAINT `fk-job_listing_application-candidate_id`
    FOREIGN KEY (`candidateId`) REFERENCES `candidate`(`candidate_id`)
    ON DELETE CASCADE ON UPDATE RESTRICT;
