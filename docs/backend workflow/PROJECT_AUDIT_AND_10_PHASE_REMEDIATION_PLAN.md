# Mirage Direction Two — Project Audit and 10-Phase Remediation Plan

**Project:** Mirage Direction Two  
**Repository:** E:\programming\Space Work\mirage direction two  
**Document purpose:** Record the read-only architecture audit and provide a guarded, evidence-based 10-phase implementation and verification plan.  
**Audit date:** 2026-10-26  
**Audit mode:** Read-only. No source code was changed for this audit.  
**Current Git state at audit:** Branch main matched origin/main and the working tree was clean. Recheck before every implementation phase.

---

## 1. Executive Summary

The project is a pnpm/Turborepo monorepo with a Next.js public website, a Next.js Admin dashboard, and shared packages for database access, types, UI, utilities, and design tokens. The separation of apps and shared packages is a sound foundation.

MongoDB-backed paths exist for homepage/company CMS content, product catalog operations, and B2B leads. However, the backend does not cover every Admin screen. Several operational areas remain simulations, audit records are currently held in process memory, MongoDB index initialization is defined but was not found in the application startup path, and some product content pages still read static fixtures directly.

The reports call all ten phases complete, but the Phase 10 report explicitly says live CRUD round-trips against Atlas were not performed. Phase reports 1 and 2 are also absent from the repository’s backend workflow folder. Treat completion status as provisional until each phase below passes its own acceptance gates.

**Overall audit score: 6.5 / 10.**  
This is a reasoned engineering assessment of the audited working tree, not a test or certification result.

---

## 2. Scores

| Area | Score | Assessment |
|---|---:|---|
| Coupling | 7.5 / 10 | Good app/package separation; apps still depend directly on the shared database implementation, with repeated session helpers. |
| Phase completion and evidence | 6 / 10 | Core work exists, but some phase evidence is missing, stale, mock-based, or explicitly not live-verified. |
| Architecture | 7.5 / 10 | Clear monorepo structure and server-side data layer; persistence and startup responsibilities are not fully operationalized. |
| System design | 5.5 / 10 | CMS/catalog/lead persistence exists, but durable audit, initialization, rate limiting, and complete data-flow coverage need work. |
| Clean code | 6 / 10 | Strict TypeScript and reusable packages are positives; large page/repository files, any types, duplicated helpers, and stale docs increase maintenance cost. |

---

## 3. Architecture and Data Flow

Admin UI  
→ authenticated Next.js Server Actions  
→ @mirage/db/server repositories  
→ MongoDB collections

Public website  
→ Server Components and API routes  
→ @mirage/db/server repositories  
→ MongoDB reads, with original static data as fallback

Admin content/product writes  
→ shared MongoDB storage  
→ cache revalidation for public routes

Primary MongoDB collections currently described by the code:
- site_content
- products
- b2b_leads
- audit_logs

The key architectural boundary is useful: MongoDB access is intended to remain server-side. The current system is still a shared-code monolith, not an independently deployed backend service. That is a valid design choice for this project, but the report and deployment setup must describe it accurately.

---

## 4. Verified Strengths

1. The repository separates apps/web and apps/admin and centralizes shared code in packages.
2. MongoDB connection reuse, server-context checks, input schemas, and static fallback paths exist.
3. Admin Server Actions perform server-side session and permission checks on the main CMS, product, and lead flows.
4. Static product/content defaults are retained as fallback data; changes should continue to be stored as overrides rather than replacing those source files.
5. The project distinguishes some operational Admin screens as simulations/demos instead of claiming they are production-persistent.
6. .env.local was ignored and not tracked at audit time. Never print or commit real secrets.

---

## 5. Findings to Carry Through the Phases

### High priority

**F-01 — Audit log persistence is not durable.**  
packages/db/src/repository/audit.ts currently appends records to memoryStore. The audit_logs MongoDB collection and indexes are described elsewhere, but the audit writer shown in source does not persist those records to MongoDB. A data mutation and its audit entry are also separate operations. Do not describe the current in-memory hash records as a durable or compliant regulatory audit ledger.

Evidence: packages/db/src/repository/audit.ts, especially recordAuditLog and memoryStore.addAuditLog.

**F-02 — Index setup is defined but not wired into normal startup.**  
packages/db/src/server/mongo-models.ts exports ensureMongoIndexes(db), but no application call site was found in the audited source. Unless indexes are created manually outside the repository, uniqueness and query-performance guarantees are not reproducible from application startup.

Evidence: packages/db/src/server/mongo-models.ts, ensureMongoIndexes.

**F-03 — Product updates need a server-side allowlist/schema.**  
apps/admin/app/products/actions.ts accepts update data as any, and packages/db/src/server/product-repository.ts spreads updates into a MongoDB $set operation. Validate allowed fields and values on the server; do not rely on the UI form to constrain a Server Action.

Evidence: apps/admin/app/products/actions.ts, updateProductAction; packages/db/src/server/product-repository.ts, updateProductInDb.

**F-04 — Contact abuse controls are process-local.**  
The duplicate and rate-limit state in packages/db/src/server/lead-repository.ts is stored in in-memory arrays/maps. It is not shared across instances and resets on restart. apps/web/app/api/contact/route.ts derives an IP from forwarded headers; validate proxy trust before treating that value as authoritative.

Evidence: apps/web/app/api/contact/route.ts; packages/db/src/server/lead-repository.ts.

**F-05 — Production dependency audit requires remediation review.**  
A read-only pnpm audit --prod run during the previous audit reported 5 advisories across postcss@8.4.31 and zod@3.25.76. Rerun the audit in Phase 9 because advisory status can change. Evaluate semver and framework compatibility before upgrading. References: GitHub advisories GHSA-r28c-9q8g-f849 and GHSA-mrhx-c7xc-m3w5.

### Medium priority

**F-06 — Product content does not flow through every public page.**  
The English and Arabic Documents pages import MOCK_PRODUCTS and MOCK_PRODUCTS_AR directly from packages/types. They therefore do not automatically reflect product overrides saved through Admin.

Evidence: apps/web/app/documents/page.tsx; apps/web/app/ar/documents/page.tsx.

**F-07 — Backend persistence covers only part of the Admin dashboard.**  
Products, CMS, and B2B leads have MongoDB paths. Cold Chain, GxP Logs, HCP Verification, Pharmacovigilance, Subscribers, and the visible RBAC settings are largely mock/simulated or local UI state. Keep these clearly labeled until real persistence and workflows are implemented.

Evidence: corresponding pages under apps/admin/app and docs/backend workflow/phase8_remaining_public_content_and_admin_data_flows.md.

**F-08 — Large files and repeated helpers increase change risk.**  
Examples include apps/admin/app/products/page.tsx (~1,407 lines), apps/admin/app/gxp-logs/page.tsx (~795 lines), packages/db/src/server/product-repository.ts (~764 lines), and packages/db/src/server/lead-repository.ts (~555 lines). Session-cookie extraction is repeated in multiple Server Action files. Refactor only where it reduces real duplication without expanding scope unnecessarily.

**F-09 — Documentation has conflicting or stale claims.**  
The repository’s older docs/testing reports and README describe an earlier architecture. Phase 10 says Atlas live CRUD was not verified, while other phase reports describe live CRUD verification. Reconcile those statements and distinguish mock tests, isolated file persistence, read-only live connectivity, and real isolated-database CRUD.

Evidence: README.md; docs/testing/*; docs/backend workflow/phase6_product_catalog_synchronization.md; docs/backend workflow/phase10_end_to_end_verification_and_handoff.md.

**F-10 — Phase evidence is incomplete in the repository.**  
The backend workflow folder contains Phase 3 through Phase 10 reports, but no saved Phase 1 or Phase 2 report was found during this audit. The final handoff must point to evidence for every phase or explicitly mark missing evidence.

### Operational security note

A prior user-authorized Atlas change used 0.0.0.0/0. Verify the current Atlas allowlist outside this source audit. If that rule is still active, restrict it before public production use. Do not modify Atlas access rules as part of code work unless the user separately asks.

---

## 6. Mandatory Rules for Every Phase

These rules apply independently to Phases 1–10. A phase is not complete just because implementation code exists.

### Skill review

1. Before work in each phase, inspect available skills and instructions relevant to that phase.
2. Read and use the actual skill resource. Do not invent skill names or claim skills that were not read.
3. In the phase report, list the exact skill name/resource used and what guidance affected the work.
4. If a relevant MongoDB/security/testing skill is unavailable, say so and use current official documentation where needed.

### Tests and checks

1. Add or update focused unit tests for behavior changed in that phase.
2. Run those tests and report exact command, pass/fail counts, and duration when available.
3. Run relevant integration/security checks. Clearly identify mocked tests versus real database tests.
4. Do not call an unrun check passed. Do not hide or skip a failure silently.
5. Check that original static data, translations, images, and fallback behavior remain intact.
6. Inspect the diff for secrets, destructive changes, accidental data replacement, and unrelated edits.

### API/fetch request verification

Whenever a phase adds, changes, or relies on fetch, a route handler, a webhook, or a Server Action that calls another service:

1. Inventory the exact request path, method, caller, authentication, input schema, expected status, response schema, and persistence/cache side effect.
2. Exercise every valid request path involved in the phase. A valid read should normally return 200; a successful create may correctly return 201. Assert the response body and expected database/public-page effect, not only the status.
3. Exercise invalid JSON, invalid fields, missing/invalid authentication, insufficient role, unsupported method, duplicate submissions, rate limits, and database failure where applicable. Assert expected 4xx/5xx statuses and safe error bodies.
4. Verify requests from the real browser flow in addition to direct endpoint checks when the UI uses fetch. Inspect browser network failures and console errors.
5. Verify persisted changes using a fresh read, and verify cache revalidation where applicable.
6. Record latency for the relevant requests and flag regressions. Do not claim a performance benchmark unless measurements were actually run.
7. Do not force all requests to return HTTP 200. Invalid or unauthorized requests should return the designed 4xx response; the phase report must explain expected statuses.
8. Use a disposable/local or isolated staging MongoDB database for integration writes. Never run destructive test mutations against production data.

### Required phase report

At the end of each phase, provide:
- Phase number, title, and status.
- Findings and exact files changed.
- Skills actually reviewed and applied.
- Unit/integration/security commands and exact results.
- API/fetch request matrix and results, when applicable.
- Static-default preservation evidence.
- Risks, blockers, and follow-up work.
- Whether the next phase is safe to start.

Continue to the next phase after the report unless a concrete external blocker or user decision is required. Preserve the user’s existing changes. Do not stage, commit, push, or deploy unless separately requested.

---

## 7. Ten-Phase Work Plan and Acceptance Gates

### Phase 1 — Current repository audit and truthful baseline

**Objective:** Establish the actual current state before implementation; treat existing reports as claims to verify.

**Work:**
- Read repository instructions, current Git status/diff, package scripts, environment examples, routes, repositories, schemas, static datasets, tests, and all existing phase reports.
- Map every Admin feature as MongoDB-persistent, static fallback, file/test-only, or simulated.
- Map public pages and API routes to their actual data sources.
- Identify Supabase references as active runtime, migration-only, dependency-only, documentation, or obsolete.
- Record secret-file presence without printing values.
- Create a baseline inventory and known-risk register. Do not change code in the audit step.

**Skills:** Read full-codebase-analysis and any applicable repository instructions; read other relevant skills discovered for testing/security.

**Tests and request checks:** Do not claim a baseline test result unless the exact command is executed. Inventory all fetch/API/Server Action call paths so later phases can test them.

**Acceptance:** Current state, uncommitted work, data ownership, runtime boundaries, and unverified claims are documented. Missing Phase 1/2 evidence is called out rather than reconstructed as if it had existed.

### Phase 2 — MongoDB architecture, configuration, and startup lifecycle

**Objective:** Make the MongoDB foundation explicit, server-only, repeatable, and operational.

**Work:**
- Review MongoClient reuse, environment parsing, server-only boundary, timeout and pool configuration, and behavior in dev/test/production.
- Define safe startup/setup behavior for indexes and required seed/bootstrap work. Make it idempotent; do not silently overwrite existing records.
- Keep real credentials out of source, browser bundles, logs, reports, and examples.
- Decide and document behavior when MongoDB is missing/unreachable. Public reads may use preserved static defaults; writes must fail clearly rather than claiming persistence.
- Remove only active Supabase persistence paths after their MongoDB replacement is verified. Keep a migration-only tool only if it has a documented, justified use.

**Skills:** Review MongoDB/database, Next.js server runtime, security, and testing skills actually available.

**Tests:** Unit-test config parsing, invalid URI, missing config, pooling reuse, failure behavior, and server-only boundary.

**API/fetch checks:** Verify health/connectivity diagnostic endpoints if exposed. Do not expose database credentials or internal error details.

**Acceptance:** One documented server-side connection path; deterministic index/seed setup; no secrets in client output; explicit failure/fallback behavior.

### Phase 3 — Schemas, indexes, static defaults, seeding, and migration safety

**Objective:** Validate documents and make initialization/data migration reproducible without data loss.

**Work:**
- Review schemas for site_content, products, b2b_leads, and audit_logs against real code behavior.
- Ensure unique and query indexes are actually created and verified, not merely declared.
- Validate all writes and migrations on the server. Add update schemas and allowed-field lists.
- Preserve packages/types/src/mock-data.ts, mock-data-ar.ts, admin-data.ts, all content strings, and assets.
- Make seed operations insert-only/idempotent. Detect conflicts without overwriting user edits.
- Provide backup, rollback, dry-run, and count/reconciliation guidance before live migration.
- Label migration-only Supabase dependencies and paths accurately.

**Skills:** Review MongoDB schema/index, migration/data-integrity, security, and testing skills actually available.

**Tests:** Test schema boundaries, duplicate keys, index creation/error behavior, repeat seed, conflict behavior, migration idempotency, and field-by-field static fallback.

**API/fetch checks:** Exercise any migration/diagnostic route only in an isolated test environment with explicit authorization. Verify no public route exposes migration controls.

**Acceptance:** Fallback data is unchanged; index setup is wired; migration is non-destructive and tested against disposable data; live migration remains clearly marked pending unless actually completed.

### Phase 4 — Authentication, authorization, and Admin request protection

**Objective:** Protect every private Admin read and mutation, not only page navigation.

**Work:**
- Verify signed session format, expiry, secure HttpOnly cookie attributes, role permissions, logout behavior, and session revocation expectations.
- Protect every Admin Server Action and any API route that reads or changes private data.
- Validate role and action on the server; never rely on hidden buttons, client role state, or middleware alone.
- Review the optional plaintext password path. Ensure production policy requires a password hash and does not accidentally accept plaintext credentials.
- Add abuse controls for login attempts and document session/token revocation limits.
- Keep public website reads limited to public content.

**Skills:** Review authentication/session, Next.js Server Actions, web security, and testing skills actually available.

**Tests:** No session, malformed/tampered/expired session, each role permission, authorized success, login throttling, logout, and server action direct invocation.

**API/fetch checks:** Verify direct calls as well as browser navigation. Check expected redirects/401/403 responses, cookie flags, and that requests cannot spoof role headers.

**Acceptance:** Every private operation has server-side authentication and action-specific authorization; production credentials are not accepted in an unsafe mode.

### Phase 5 — Bilingual homepage and company CMS

**Objective:** Make supported homepage/company overrides reliable while preserving exact original defaults.

**Work:**
- Verify homepage hero and company story ownership, schema, save action, MongoDB write acknowledgment, metadata, and Arabic RTL rendering.
- Keep original English/Arabic defaults unchanged. A partial override must leave unspecified fields at their original values.
- Report success only after MongoDB confirms the write.
- Persist audit events durably as part of the designed write flow.
- Revalidate the correct public pages after successful writes; clearly report revalidation failure.
- Keep static corporate text that is not CMS-managed unchanged and document the exact editable fields.

**Skills:** Review CMS/data validation, Next.js caching/revalidation, security, and testing skills actually available.

**Tests:** Default render, English override, Arabic override, partial override, invalid payload, unauthorized writer, DB failure, fresh read, and revalidation.

**API/fetch checks:** Exercise save/load Server Actions and POST /api/revalidate. Test valid secret, missing/wrong secret, invalid paths/body, and expected statuses. Verify public pages after refresh in both languages.

**Acceptance:** Admin edits are durable, visible on the public pages, field-level defaults are intact, and no false success is shown.

### Phase 6 — Product catalog and all public product readers

**Objective:** Synchronize supported Admin product operations across all intended public product pages.

**Work:**
- Add server validation and an update allowlist for create/update/stock/delete.
- Verify duplicate ID/slug behavior with actual database indexes.
- Preserve MOCK_PRODUCTS, MOCK_PRODUCTS_AR, media, and detail content as fallback.
- Inventory every product reader, including English/Arabic lists, dynamic details, homepage featured products, and both Documents pages.
- Decide which pages should follow MongoDB and implement only the confirmed requirement; document intentionally static pages.
- Verify cache invalidation across list and detail routes and across Admin/Web processes.

**Skills:** Review MongoDB repository, Next.js rendering/caching, security, and webapp-testing skills actually available.

**Tests:** Create, read, update, stock toggle, delete policy, duplicates, invalid update fields, outage fallback, Arabic fallback, and static-default preservation.

**API/fetch checks:** Exercise GET /api/products with locale/category/search and all Admin mutations. Verify valid success status/body, invalid inputs, direct unauthorized action call, fresh MongoDB read, browser-visible list/detail results, and cache refresh.

**Acceptance:** Every advertised catalog flow has a tested persistence path, or is explicitly documented as static/simulated. Static baseline files remain untouched.

### Phase 7 — Public contact forms and Admin B2B lead management

**Objective:** Safely persist public inquiries and expose them only to authorized Admin users.

**Work:**
- Verify both English and Arabic forms and request payload mapping.
- Validate and normalize names, email, phone, subject, and message; enforce request-size limits.
- Replace process-local rate limiting with a strategy appropriate to deployment, and only trust proxy IP headers according to the hosting configuration.
- Define duplicate handling, retention, private-field access, and audit behavior for personally identifiable information.
- Ensure lead create/update/delete and audit events have clear failure semantics.

**Skills:** Review API validation, privacy/security, MongoDB persistence, and testing skills actually available.

**Tests:** Valid/invalid request, duplicates, rate limit, spoofed/untrusted headers, DB outage, unauthorized reads, permission denial, status update, deletion policy, and durable audit evidence.

**API/fetch checks:** Test POST /api/contact end-to-end. Valid creation should return the documented 2xx status; malformed requests, duplicates, rate limits, and unavailable storage should return the designed non-2xx status. Verify the created lead appears in the Admin after a fresh read and does not leak through public APIs.

**Acceptance:** Valid customer requests persist once; abuse controls operate across app instances; private lead data is access-controlled; UI never reports a failed write as successful.

### Phase 8 — Remaining public content and Admin workflow classification

**Objective:** Complete only intended public data flows and accurately label Admin simulations.

**Work:**
- Inventory all public content and every Admin page.
- Mark each feature as persisted, static, file/test-only, or simulated.
- Connect confirmed public content fields to CMS only after verifying ownership and preserving existing strings/translations/assets.
- Keep Cold Chain, GxP, HCP, Pharmacovigilance, and subscriber features labeled as demos unless real persistence, integrations, and operational controls are implemented.
- Fix stale page-data paths only where the product requirement says they should reflect Admin changes.
- Update documentation and visible source status labels.

**Skills:** Review applicable feature, data-flow, frontend, accessibility, and testing skills actually available.

**Tests:** One focused test per supported data flow and regression tests for static/demo labels and preserved content.

**API/fetch checks:** For every new or changed fetch path, build the request matrix in the mandatory rules. For simulated modules, verify the UI does not issue an undocumented fake production request or claim durable success.

**Acceptance:** No user-facing claim implies persistence or a real external integration where none exists; supported CMS flows pass English/Arabic request-to-render checks.

### Phase 9 — Security, reliability, audit integrity, and performance

**Objective:** Close cross-cutting risks and verify production-oriented safeguards.

**Work:**
- Implement and verify durable append-only audit storage; define concurrency ordering, tamper detection, retention, and recovery.
- Ensure mutations and audit records cannot silently diverge; evaluate transaction/replica-set requirements.
- Re-review authentication, RBAC, rate limits, proxy trust, mass assignment, NoSQL query construction, error responses, secret handling, CORS/CSRF behavior, and public projections.
- Re-run dependency audit and review each finding against the resolved version and actual use.
- Check database pool limits, unbounded collection reads, pagination, burst caching, and error fallback behavior.
- Review any broad Atlas IP allowlist and deployment secret configuration; do not disclose secret values.

**Skills:** Review security, MongoDB reliability/data-integrity, performance, and testing skills actually available.

**Tests:** Security regression tests, failure injection, concurrent writes/audit ordering, oversized inputs, permission matrix, dependency audit, type-check, lint, and relevant build.

**API/fetch checks:** Re-run the endpoint matrix for public and Admin requests, including authorization failures, timeouts, DB errors, and safe error bodies. Measure request latency; state test conditions and do not invent performance targets.

**Acceptance:** No known high-priority security finding remains unexplained; audit durability and failure behavior are demonstrated; dependency advisories are resolved or explicitly accepted with rationale.

### Phase 10 — Isolated end-to-end verification and handoff

**Objective:** Prove the real application flow using a disposable/staging MongoDB database and real browser requests.

**Work:**
- Configure an isolated test database, never production data.
- Start both applications and verify login, Admin CMS/product/lead operations, and public English/Arabic pages.
- Verify DB write acknowledgment, fresh reads from another process/request, cache revalidation, and static fallback with an empty/unavailable test database.
- Inspect every browser network request used by the tested flows and record status, response shape, latency, and errors.
- Run the full relevant unit/integration/security/type/lint/build checks and report exact commands and results.
- Reconcile every phase report and update stale README/testing docs. Explain untested scope and remaining risks.
- Review final Git diff and verify static data/assets; do not commit, push, deploy, or alter Atlas production settings without separate authorization.

**Skills:** Review end-to-end/browser automation, MongoDB integration, security, and applicable framework skills actually available.

**Tests:** Full suite plus isolated live-Mongo E2E. Clearly distinguish true live-database tests from Mongo mocks, in-memory store, temporary file tests, and read-only connectivity pings.

**API/fetch checks:** Produce a final endpoint/request matrix covering GET /api/products, POST /api/contact, POST /api/revalidate, and all browser-triggered Server Actions/requests in the verified workflows. Include positive and negative cases and expected statuses.

**Acceptance:** Admin edit → confirmed isolated MongoDB write → fresh public read is proven in both languages; defaults survive empty/outage conditions; all checks are accurately reported; no unreviewed or destructive change is included.

---

## 8. Final Handoff Scorecard Required from the Implementer

At the end of Phase 10, the implementer must report:

- Final scores for coupling, phase completion/evidence, architecture, system design, and clean code.
- What data is truly persistent versus static, fallback, file/test-only, or simulated.
- MongoDB collections, index initialization, seed/migration process, and backup/rollback instructions.
- Exact editable CMS fields and which public routes reflect them.
- Every API/fetch request tested, with method, scenario, expected/actual status, response verification, persistence result, and latency.
- Exact test/build/security commands and pass/fail results.
- Skills actually read and used in each phase.
- Remaining findings, deferred work, and deployment prerequisites.
- Confirmation that original static frontend data and assets were preserved.

**Never mark a phase complete unless its acceptance gate and required report are satisfied. Never claim “all requests work” based only on a successful homepage load or a single MongoDB ping.**

