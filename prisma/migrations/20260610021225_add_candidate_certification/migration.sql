-- CreateTable
CREATE TABLE `candidate_certification` (
    `certification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidate_id` INTEGER NOT NULL,
    `certification_name` VARCHAR(255) NOT NULL,
    `issuing_organization` VARCHAR(255) NOT NULL,
    `issue_date` DATE NULL,
    `expiry_date` DATE NULL,
    `credential_id` VARCHAR(128) NULL,
    `credential_url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `deleted` SMALLINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`certification_id`),
    INDEX `fk-candidate_certification-candidate_id`(`candidate_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `candidate_certification` ADD CONSTRAINT `fk-candidate_certification-candidate_id` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`candidate_id`) ON DELETE CASCADE ON UPDATE RESTRICT;

