# Initial Domain Map

Generated from repository inspection and the production SQL schema.

## Identity And Access

- `admin`, `staff`, `candidate`, `company_contact`, `contact`, `inspector`, `fulltimer`
- Token tables exist per role and should be replaced by one modern session/auth system.
- Permission tables: `permission_section`, `permission_sub_section`, `permission_user`

## Candidate Domain

- `candidate`
- `candidate_education`
- `candidate_experience`
- `candidate_skill`
- `candidate_work_history`
- `candidate_working_date`
- `candidate_working_hour`
- `candidate_notification`
- `candidate_note`
- `candidate_tag`
- `candidate_id_card`
- `candidate_id_request`
- `candidate_evaluation`

## Company And Contacts

- `company`
- `company_contact`
- `contact`
- `contact_email`
- `contact_phone`
- `contact_invitation`
- `store`
- `brand`
- `mall`

## Work Requests And Jobs

- `request`
- `request_activity`
- `request_application`
- `request_checklist`
- `request_interview`
- `request_skill`
- `job`
- `job_interest`
- `job_skills`
- `invitation`

## Payroll And Finance

- `transfer`
- `transfer_candidate`
- `transfer_file`
- `transfer_file_entry`
- `transfer_bank_advice`
- `transfer_cost`
- `staff_salary`
- `invoice`
- `expense`
- `staff_expenses`
- `bank_transaction`
- `bank_transaction_line_item`

## Content, Support, And Comms

- `chat`
- `chat_message`
- `ticket`
- `ticket_comment`
- `ticket_attachment`
- `mail_log`
- `email_campaign`
- `notification` style tables

## External Integrations To Keep Behind Modules

- Algolia search
- AWS/S3 file upload
- Cloudinary media
- Xero accounting
- Sentry error reporting
- Mixpanel/Segment analytics
- Redis/runtime cache
