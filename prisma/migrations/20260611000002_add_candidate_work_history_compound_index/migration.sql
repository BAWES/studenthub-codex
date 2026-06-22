-- Add compound index on candidate_work_history(staff_id, candidate_id) for staff search performance
CREATE INDEX `idx-candidate_work_history-staff_id-candidate_id` ON `candidate_work_history` (`staff_id`, `candidate_id`);
