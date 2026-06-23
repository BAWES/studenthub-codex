-- AlterTable: add employee_role column to employee table
ALTER TABLE `employee`
    ADD COLUMN `employee_role` VARCHAR(60) NULL DEFAULT 'staff' AFTER `employee_status`;
