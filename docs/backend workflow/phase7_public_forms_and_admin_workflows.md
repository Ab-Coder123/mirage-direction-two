# Phase 07 Technical Report: Public Forms & Admin Workflows

**Date:** October 21, 2026  
**Status:** Completed & Verified  
**Monorepo:** Mirage Pharma Enterprise Architecture (`@mirage/web`, `@mirage/admin`, `@mirage/db`)

---

## 1. Executive Summary & Objective

Phase 07 connects public-facing customer and partner submission points (`/contact` in English and `/ar/contact` in Arabic) to the internal Admin B2B Alliances & Pipeline Hub (`/b2b-leads`). 

Prior to Phase 07, form submissions were either mocked in client state or held in transient in-memory stores without MongoDB persistence, abuse prevention, rate limiting, or RBAC controls. 

Phase 07 establishes an end-to-end server-side pipeline:
1. Public form submissions route asynchronously through a dynamic HTTP API endpoint (`/api/contact`).
2. Input is validated using strict Zod schemas (`SubmitB2BLeadMutationSchema`).
3. Anti-abuse controls suppress duplicate submissions within a rolling 10-minute window and throttle abusive clients (max 5 submissions per 10 minutes per IP/email).
4. Submissions persist to the `b2b_leads` collection in MongoDB with write acknowledgment verification (`w: 'majority'`).
5. Inquiries generate FDA 21 CFR Part 11 audit log entries (`B2B_PARTNER_LEAD_SUBMITTED`).
6. The Admin B2B Alliances Hub loads leads on mount via protected Server Actions (`getB2BLeadsAction`) guarded by session tokens and RBAC permissions (`leads:read`, `leads:write`).
7. Resilient graceful degradation ensures static default leads (`INITIAL_B2B_LEADS`) remain available as an offline fallback without ever displaying false success notifications.

---

## 2. Architecture & Data Flow

```
[Public Website: /contact & /ar/contact]
                  │
                  ▼ (POST JSON Payload: name, email, phone, subject, message)
         [/api/contact (Next.js Dynamic Route)]
                  │
                  ├─► [Abuse Protection: Rolling 10m duplicate suppression]
                  ├─► [Rate Limiter: Max 5 submissions / 10m per IP/email]
                  ├─► [Zod Validation: SubmitB2BLeadMutationSchema]
                  │
                  ▼
   [packages/db/src/server/lead-repository.ts]
                  │
                  ├─► [MongoDB Atlas: `b2b_leads` collection] (Primary)
                  ├─► [Audit Logger: `audit_logs` collection (21 CFR Part 11)]
                  └─► [Static Fallback: `INITIAL_B2B_LEADS`] (Offline resilience)
                  ▲
                  │ (Guarded Server Actions: getB2BLeadsAction, updateB2BLeadStatusAction)
                  │ Session + RBAC: `leads:read`, `leads:write`
[Admin Portal: /b2b-leads (B2B Alliances & Pipeline Hub)]
```

---

## 3. Implementation Details & File Modifications

### 3.1 MongoDB Lead Repository (`packages/db/src/server/lead-repository.ts`)
- Implemented `getB2BLeadsFromDb`, `submitB2BLeadToDb`, `updateB2BLeadStatusInDb`, and `deleteB2BLeadFromDb`.
- **Duplicate Suppression:** Computes a unique fingerprint based on lowercased email and sanitized message body within a 10-minute window. Re-submissions within this window are rejected with `DUPLICATE_SUBMISSION` (HTTP 409).
- **Rate Limiting:** Enforces an in-memory rolling sliding-window rate limit (5 requests per 10 minutes per IP/identifier), throwing `RATE_LIMIT_EXCEEDED` (HTTP 429).
- **Write Acknowledgment:** Verifies `result.acknowledged` and `result.insertedId` before confirming success.
- **Fail-Closed Resilience:** When running in non-test production/development environments without a configured database, mutation operations fail closed with `DB_UNAVAILABLE`, preventing false success notifications.
- **21 CFR Part 11 Compliance:** Creates audit trails for `B2B_PARTNER_LEAD_SUBMITTED`, `UPDATE_LEAD_STATUS`, and `DELETE_LEAD`.

### 3.2 Public API Contact Route (`apps/web/app/api/contact/route.ts`)
- Creates dynamic server-side handler `POST /api/contact`.
- Extracts client IP headers (`x-forwarded-for`, `x-real-ip`).
- Returns HTTP 201 on acknowledged write, HTTP 400 on invalid input, HTTP 409 on duplicates, and HTTP 429 on rate limit exhaustion.

### 3.3 Public Form Components (`apps/web/app/contact/page.tsx` & `apps/web/app/ar/contact/page.tsx`)
- Replaced transient local submission with asynchronous `fetch('/api/contact')`.
- Displays real-time loading spinners during submission (`isSubmitting`).
- Prevents false success notices: displays localized error messages if the backend rejects the submission or if a network disconnect occurs.
- Preserves all static contact coordinates (Cairo HQ address, phone numbers, operating hours, regulatory consultation cards) across both English and Arabic layouts.

### 3.4 Admin B2B Alliances Hub & Actions (`apps/admin/app/b2b-leads/`)
- `actions.ts`: Enforces cryptographic session verification (`requireAdminSession`) and permissions (`leads:read` for queries, `leads:write` for stage progression, manual lead creation, and deletions).
- `page.tsx`:
  - Fetches leads from MongoDB on initial mount via `useEffect` and `getB2BLeadsAction`.
  - Added data source badge: displays `IN-SPEC: Live Database (MongoDB)` when connected, or `CAUTION: Static Fallback (Local)` when offline.
  - Added actionable retry banner and error notification if the database connection fails.
  - Fail-closed actions: UI mutations only update state after server actions confirm write success.

---

## 4. Test & Verification Matrix

### 4.1 Unit & Integration Test Suite (`packages/db/__tests__/b2b-leads-mongodb.test.ts`)
16 dedicated tests covering:
- **Zod Validation:** Valid payload parsing and rejection of missing/short contact names, malformed email addresses, and empty inquiry messages.
- **Abuse & Rate Limiting:** Rejection of duplicate submissions within 10 minutes (HTTP 409) and rate limit blocking after 5 requests (HTTP 429).
- **Offline Fallback:** Transparent fallback to `INITIAL_B2B_LEADS` when MongoDB is disconnected, with error logging and zero data corruption.
- **Audit Trails:** Verification that lead submissions, status transitions, and deletions write complete 21 CFR Part 11 audit records.
- **RBAC Security:** Verification that server actions reject unauthenticated callers and verify `leads:read`/`leads:write` permission bits.
- **HTTP Route Integration:** Verifying that `POST /api/contact` returns HTTP 201 with generated lead ID.

### 4.2 Full Repository Test Execution

| Command | Target | Outcome |
| :--- | :--- | :--- |
| `pnpm vitest run packages/db/__tests__/b2b-leads-mongodb.test.ts` | Phase 7 Lead Repository Suite | **16 / 16 PASSED** |
| `pnpm vitest run tests/integration/backend-live-integration.test.tsx` | End-to-End Live Integration Suite | **4 / 4 PASSED** |
| `pnpm vitest run tests/integration/dashboard-to-website.test.tsx` | Cross-Application Architecture Suite | **4 / 4 PASSED** |
| `pnpm vitest run` | Full Monorepo Vitest Suite (25 files) | **248 / 248 PASSED** (0 failed) |
| `pnpm turbo run type-check` | TypeScript Across 7 Monorepo Packages | **7 / 7 PASSED** (0 errors) |
| `pnpm turbo run build` | Next.js Production Build (`admin` + `web`) | **2 / 2 PASSED** (Exit code 0) |

---

## 5. Live Database Check vs. Mock-Based Verification

### 5.1 Verification Using Mocks (In-Memory / Test Suite)
- **What was verified:** Zod validation rules, duplicate detection algorithms, rate limiting counters, session signature verification, permission enforcement, error handling branches, and offline fallback behavior.
- **Note:** Unit and integration tests run in `NODE_ENV=test` using in-memory databases and mocked drivers to guarantee isolation and zero side effects on production data.

### 5.2 Live Database Read-Only Probe
- **Command:** `node --env-file=../../.env.local probe-check.mjs`
- **Result:**
  ```text
  [READ-ONLY CHECK] MongoDB ping response: OK (200)
  [READ-ONLY CHECK] Collections found: [ 'audit_logs', 'b2b_leads', 'products', 'site_content' ]
  [READ-ONLY CHECK] b2b_leads collection document count: 2
  ```
- **Live Writes:** As required by the test protocol, **NO live write, update, or delete operations were executed against the live database cluster**. Live write verification remains unexecuted on production data until an explicit production smoke test is authorized.

---

## 6. Security & Credential Hygiene
- All database credentials, Atlas cluster hostnames, shard addresses, replica set names, and administrative usernames are strictly confined to local uncommitted environment files (`.env.local`).
- No secrets or connection strings are logged in application output, test output, or committed documentation.
- Template files (`.env.example`, `apps/admin/.env.example`, `apps/web/.env.example`) contain only placeholder variable names and instructions.

---

## 7. Status & Non-Destructive Confirmation
- **Static Frontend Integrity:** All static pharmaceutical copy, product listings, category filters, and bilingual layouts (English and Arabic) are preserved.
- **Phase Completion:** Phase 06 fixes are verified and closed; Phase 07 is complete and verified.
- **Next Phase:** Phase 08 (Advanced Analytics & Reporting) is on hold awaiting user instruction.
