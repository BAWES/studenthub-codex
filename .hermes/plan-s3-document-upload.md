# Plan: Migrate Candidate Document Upload to S3/MinIO

## Problem
`uploadCandidateDocument` writes files to local disk (`public/uploads/candidates/`). In production, this doesn't scale — files must go to S3/MinIO.

## Changes Needed

### 1. Add `uploadBufferToS3` to `src/modules/aws/actions.ts`
- Uses existing S3Client singleton and config validation
- Takes `(buffer, key, contentType)` and calls `PutObjectCommand`
- Returns the S3 key on success, `{ error }` on failure
- Output validation with a new Zod schema

### 2. Modify `uploadCandidateDocument` in `src/modules/candidates/documents/actions.ts`
- Replace `fs.mkdir` + `fs.writeFile` with `uploadBufferToS3`
- Store S3 key in DB instead of local path
- S3 key format: `uploads/candidates/{candidateId}/{type}_{uuid}.ext`

### 3. Modify `getCandidateDocument` / `listCandidateDocuments`
- Detect S3-stored keys (no leading `/`) → generate presigned download URLs
- Local paths (starting with `/`) → return as-is (backward compat)

### 4. Modify `deleteCandidateDocument`
- Delete from S3 when the stored key is an S3 key

### 5. Add/update tests
- AWS: test `uploadBufferToS3` with mocked S3
- Documents: test S3 upload, download URL generation, S3 delete

## Non-Goals
- No changes to the UI (DocumentsClient.tsx) — same FormData upload flow
- No changes to the app-level page (page.tsx)
- No changes to `getPresignedUploadUrl` (still works for direct uploads if needed later)
