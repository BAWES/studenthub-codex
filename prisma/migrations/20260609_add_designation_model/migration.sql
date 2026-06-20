-- CreateTable
CREATE TABLE `designation` (
    `designation_uuid` CHAR(60) NOT NULL,
    `designation_name_en` VARCHAR(255) NOT NULL,
    `designation_name_ar` VARCHAR(255) NULL,
    `designation_created_at` DATETIME(0) NULL,
    `designation_updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`designation_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
