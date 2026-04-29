# Legacy UX Audit

## Repos Reviewed

- `studenthub-admin`: broad admin console for candidates, companies, requests, transfers, notes, marketing, permissions, reports, support, and configuration.
- `studenthub-staff`: mobile staff operations app focused on requests, stores, work logs, transfers, contracts, chat, candidates, and company contacts.
- `studenthub-candidate`: mobile candidate app with onboarding/profile steps, invitations, payments, work history, civil ID, CV/video/photo, and personal info.
- `studenthub-company`: employer app for requests, stores, staff, transfers, chats, contracts, account, company editing, and candidate assignment.
- `studenthub-inspector`: civil ID/verification focused app.
- `studenthub`: Yii2 backend with matching role modules and shared domains.

## Product Lessons

- The old system is not one generic dashboard. It is a set of role-specific task apps.
- Mobile use is central. Candidate/company/staff apps are Ionic apps with tab navigation, modal pickers, quick action screens, and focused task flows.
- Operational work clusters around:
  - request pipeline
  - candidate profile and review
  - work logs and approvals
  - company account/request management
  - transfers/payroll
  - civil ID verification
  - notes, chat, and support
- Many workflows use focused modal actions rather than large edit pages.
- Search/filtering is deeply important, especially candidates, requests, work logs, companies, and transfers.

## Design Direction For The New App

- Keep one codebase, but preserve role-native experiences.
- Mobile first:
  - sticky/fixed role navigation
  - card rows instead of horizontal tables
  - large tap targets
  - fast drill-downs
  - fewer generic dashboards
- Desktop should remain dense and scannable for admin operations.
- Every list should become actionable:
  - open detail
  - filter/search
  - show status/owner/next action
  - expose the primary action for that role

## Immediate UX Work

- Convert table rows into mobile cards. Done.
- Add fixed mobile tab navigation. Done.
- Add transfer detail because payroll is high risk. Done.
- Next:
  - add search/filter controls to core lists
  - add mobile summary/action panels to request and candidate detail
  - implement first read-only parity dashboards for old tab roots:
    - staff requests/work logs/transfers
    - candidate invitations/profile/payments
    - company requests/staff/transfers/account
