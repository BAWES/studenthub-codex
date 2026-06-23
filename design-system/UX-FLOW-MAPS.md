# StudentHub Unified UX Flow Maps

## 1. Admin Journey: Approve → Manage → Transfer

```
Dashboard (/app)
  │
  ├─ Approve Candidates
  │   ├─ Workflow card: "46,240 waiting" → Candidate queue
  │   │   └─ Review candidate profile → approve/reject
  │   │       ├─ Approve → auto-updates queue count
  │   │       └─ Reject → requires reason → updates queue
  │   │
  │   ├─ Live queue: "NEEDS REVIEW" → Candidate queue
  │   └─ Search: People scope → candidate detail
  │
  ├─ Manage Requests
  │   ├─ Workflow card: "2,570 requests" → Requests list
  │   │   └─ Select request → view fulfillment / edit
  │   │       ├─ Review company/demand details
  │   │       └─ Match candidates (if staff hasn't)
  │   │
  │   └─ Live queue: "REQUESTS" → Requests list
  │
  └─ Process Transfers
      ├─ Workflow card: "4,369 transfers" → Transfers list
      │   └─ Select transfer → view breakdown
      │       ├─ Review candidate payouts
      │       ├─ Approve invoices
      │       └─ Mark complete
      └─ Live queue: Finance scope
```

**Key screens:** Dashboard, CandidateSearch, RequestDetail, TransferDetail

---

## 2. Staff Journey: Request → Match → Shortlist

```
Staff Workspace (/staff)
  │
  ├─ Receive/Find Request
  │   ├─ Assigned requests → Requests list
  │   └─ Search People scope → candidates
  │
  ├─ Match Candidates
  │   ├─ CandidateSearchOS (with staffId filter)
  │   │   ├─ Filter by: availability, skills, country, gender
  │   │   ├─ View candidate profile → full detail
  │   │   └─ Mark as potential match
  │   └─ Request detail → RequestFulfillmentOS
  │
  └─ Send Shortlist
      ├─ Select matched candidates
      ├─ Generate CV/PDF export (future)
      ├─ Schedule interview
      │   └─ Interviews page → create/edit
      └─ Mark request as delivered
```

**Key screens:** Dashboard, RequestsList, CandidateSearch, RequestDetail, Interviews, InterviewDetail

---

## 3. Candidate Journey: Profile → Invitations → Track

```
Candidate Workspace (/candidate)
  │
  ├─ Complete Profile
  │   ├─ Dashboard → Edit Profile
  │   │   ├─ Personal info (name, contact, civil ID)
  │   │   ├─ Education (degree, majors, university)
  │   │   ├─ Skills, languages, certificates
  │   │   ├─ Work experience
  │   │   └─ Bank details (for payment)
  │   └─ Profile completeness indicator
  │
  ├─ Receive Invitations
  │   ├─ Invitations list → invitations page
  │   │   └─ View invitation detail
  │   │       ├─ Company, role, compensation
  │   │       └─ Accept/reject invitation
  │   └─ Notification badge (future)
  │
  └─ Track Work & Pay
      ├─ Work logs → work-logs page
      │   └─ View work log detail
      │       ├─ Appeal work log (if issue)
      │       └─ Note feedback
      ├─ Payments → payments page
      │   └─ Payment breakdown detail
      │       ├─ Hours, rate, totals
      │       └─ Receipts/invoices
      └─ Dashboard widget: earnings summary
```

**Key screens:** Dashboard, EditProfile, Invitations, InvitationDetail, WorkLogs, WorkLogDetail, Payments

---

## 4. Company Journey: Submit → Review → Approve

```
Company Workspace (/company)
  │
  ├─ Submit Request
  │   ├─ Dashboard → "+ New Request" CTA
  │   │   ├─ Select company from linked companies
  │   │   ├─ Fill: role, seats, compensation, location
  │   │   └─ Submit → request created
  │   └─ Companies management
  │       ├─ View linked companies
  │       ├─ Add store → stores page
  │       └─ Add contact → contacts page
  │
  ├─ Review Candidates
  │   ├─ Requests list → select request
  │   │   └─ View applications + invitations + interviews
  │   │       ├─ Review candidate profiles
  │   │       └─ Approve/reject candidates
  │   └─ Dashboard: recent requests widget
  │
  └─ Approve Work Logs
      ├─ Time reports view (future)
      ├─ Review submitted hours per candidate
      └─ Approve/reject with notes
```

**Key screens:** Dashboard, RequestsList, CreateRequest, RequestDetail, Stores, Contacts

---

## 5. Inspector Journey: Review → Resolve

```
Inspector Workspace (/inspector)
  │
  ├─ Review ID Batches
  │   ├─ Dashboard → ID requests list
  │   │   └─ Select batch → detail
  │   │       ├─ View batch info (candidates, status)
  │   │       ├─ Approve → all IDs verified
  │   │       └─ Reject → requires reason
  │   └─ Search: Compliance scope
  │
  └─ Resolve Documents
      ├─ Document queue (future)
      ├─ Review supporting docs per candidate
      └─ Approve/reject documents
```

**Key screens:** Dashboard, IdRequestsList, IdRequestDetail

---

## Unified Navigation Map

```
PUBLIC: Landing (/) → Login (/login) → Unified Hub (/app)
                                   │
                    ┌──────────────┼──────────────┬──────────────┬──────────────┐
                    ▼              ▼              ▼              ▼              ▼
               /admin         /staff        /candidate     /company      /inspector
                    │              │              │              │              │
              ┌─────┼─────┐  ┌─────┼─┐  ┌─────┼─────┐  ┌─────┼─────┐  ┌─────┼──────┐
              ▼     ▼     ▼  ▼     ▼ ▼  ▼     ▼     ▼  ▼     ▼     ▼  ▼     ▼      ▼
          Candidates Companies  Candidates   Edit  Invitations  Companies   Stores IdRequests
          Requests  Transfers  Requests   Profile WorkLogs   Requests   Contacts
                                Interviews        Payments

     LEGEND:
     ──────── Nav (sidebar) link
     ┄┄┄┄┄┄┄┄ Subnav / page within a section
```

## Unified Route Map (Target — Under /app)

| Current | Target | Reason |
|---------|--------|--------|
| /admin/* | /app/admin/* | Already works |
| /staff/* | /app/staff/* | Works but needs UX cleanup |
| /candidate/* | /app/candidate/* | Works with candidate account |
| /company/* | /app/company/* | Works with company account |
| /inspector/* | /app/inspector/* | Works with inspector account |
| /app | /app (hub) | Unified entry point — already built |

**All routes live under /app/* — the role prefix (admin/staff/candidate/company/inspector) determines the workspace.**
