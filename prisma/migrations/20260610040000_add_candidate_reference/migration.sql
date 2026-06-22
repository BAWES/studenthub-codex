-- CreateTable
CREATE TABLE `candidate_reference` (
    `reference_uuid` CHAR(60) NOT NULL,
    `candidate_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NULL,
    `position` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `relationship` VARCHAR(255) NULL,
    `deleted` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `idx-candidate_reference-candidate_id`(`candidate_id`),
    PRIMARY KEY (`reference_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `candidate_reference` ADD CONSTRAINT `fk-candidate_reference-candidate_id` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`candidate_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
