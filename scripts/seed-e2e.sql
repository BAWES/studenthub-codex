-- E2E test seed data
-- Inserts mock users for Playwright tests.
-- Idempotent: uses REPLACE INTO so re-running updates existing rows.

-- Admin
REPLACE INTO admin (admin_id, admin_name, admin_email, admin_auth_key, admin_password_hash, admin_status, admin_created_at, admin_updated_at)
VALUES (999999, 'Test Admin', 'test.admin@studenthub.test', 'e2e-auth-key-admin-00001', '$2a$10$dummyhashfordevonly0000000000000000000000', 10, NOW(), NOW());

-- Staff
REPLACE INTO staff (staff_id, staff_name, staff_email, staff_auth_key, staff_password_hash, staff_status, deleted, staff_created_at, staff_updated_at)
VALUES (999998, 'Test Staff', 'test.staff@studenthub.test', 'e2e-auth-key-staff-0001', '$2a$10$dummyhashfordevonly0000000000000000000000', 10, 0, NOW(), NOW());

-- Candidate
REPLACE INTO candidate (candidate_id, candidate_name, candidate_name_ar, candidate_email, candidate_auth_key, candidate_password_hash, candidate_status, approved, deleted, candidate_created_at, candidate_updated_at)
VALUES (999997, 'Test Candidate', 'مستخدم اختبار', 'test.candidate@studenthub.test', 'e2e-auth-key-candidate', '$2a$10$dummyhashfordevonly0000000000000000000000', 10, 1, 0, NOW(), NOW());

-- Contact (for company role)
REPLACE INTO contact (contact_uuid, contact_name, contact_email, contact_auth_key, contact_password_hash, contact_status, contact_created_at, contact_updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Company', 'test.company@studenthub.test', 'e2e-auth-key-contact', '$2a$10$dummyhashfordevonly0000000000000000000000', 10, NOW(), NOW());

-- Company contact (pivots contact to allow_access)
REPLACE INTO company_contact (company_contact_uuid, contact_uuid, allow_access, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', TRUE, NOW(), NOW());

-- Inspector
REPLACE INTO inspector (inspector_uuid, inspector_name, inspector_email, inspector_auth_key, inspector_password_hash, inspector_deleted, inspector_status, inspector_created_at, inspector_updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'Test Inspector', 'test.inspector@studenthub.test', 'e2e-auth-key-inspector', '$2a$10$dummyhashfordevonly0000000000000000000000', 0, 10, NOW(), NOW());
