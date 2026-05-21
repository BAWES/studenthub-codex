CREATE TABLE `candidate_language` (
    `candidate_language_id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidate_id` INTEGER NULL,
    `language` VARCHAR(128) NOT NULL,
    `proficiency` VARCHAR(32) NOT NULL,
    `deleted` SMALLINT NOT NULL DEFAULT 0,
    `candidate_language_created_at` DATETIME(0) NULL,
    INDEX `fk-candidate_language-candidate_id`(`candidate_id`),
    PRIMARY KEY (`candidate_language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `candidate_language` ADD CONSTRAINT `fk-candidate_language-candidate_id` FOREIGN KEY (`candidate_id`) REFERENCES `candidate`(`candidate_id`) ON DELETE CASCADE ON UPDATE RESTRICT;
