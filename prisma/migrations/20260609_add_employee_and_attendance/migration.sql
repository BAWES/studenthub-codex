-- CreateTable
CREATE TABLE `employee` (
    `employee_uuid` CHAR(60) NOT NULL,
    `employee_name` VARCHAR(255) NOT NULL,
    `employee_email` VARCHAR(255) NOT NULL,
    `employee_phone` VARCHAR(45) NULL,
    `employee_salary` DECIMAL(10, 3) NULL DEFAULT 0.000,
    `employee_status` SMALLINT NOT NULL DEFAULT 10,
    `employee_created_at` DATETIME(0) NOT NULL,
    `employee_updated_at` DATETIME(0) NOT NULL,
    `deleted` SMALLINT NOT NULL DEFAULT 0,
    `designation_uuid` CHAR(60) NULL,
    `department_uuid` CHAR(60) NULL,

    PRIMARY KEY (`employee_uuid`),
    INDEX `idx-employee-designation_uuid`(`designation_uuid`),
    INDEX `idx-employee-department_uuid`(`department_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance` (
    `attendance_uuid` CHAR(60) NOT NULL,
    `employee_uuid` CHAR(60) NULL,
    `date` DATE NOT NULL,
    `clock_in` DATETIME(0) NULL,
    `clock_out` DATETIME(0) NULL,
    `total_hours` DECIMAL(5, 2) NULL,
    `status` SMALLINT NOT NULL,
    `note` VARCHAR(500) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`attendance_uuid`),
    INDEX `idx-attendance-employee_uuid`(`employee_uuid`),
    INDEX `idx-attendance-date`(`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `fk-employee-designation_uuid` FOREIGN KEY (`designation_uuid`) REFERENCES `designation`(`designation_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `employee` ADD CONSTRAINT `fk-employee-department_uuid` FOREIGN KEY (`department_uuid`) REFERENCES `department`(`department_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `fk-attendance-employee_uuid` FOREIGN KEY (`employee_uuid`) REFERENCES `employee`(`employee_uuid`) ON DELETE RESTRICT ON UPDATE RESTRICT;
