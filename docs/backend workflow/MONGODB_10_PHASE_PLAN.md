# Gemini Argon — Mirage MongoDB Implementation Plan

**Project:** Mirage Direction Two  
**Project path:** E:\programming\Space Work\mirage direction two  
**Purpose:** Implement durable, secure Admin-to-website content management backed by MongoDB, in ten reviewable phases.

## Instructions for Gemini Argon

You are working inside the existing project at the path above. Carry out the implementation in this repository, following the project's own instructions and preserving all work already present.

### First: inspect before changing anything

1. Read all applicable AGENTS.md files and repository instructions.
2. Check Git status, current branch, and existing diffs before editing.
3. Inspect the current implementation, including any uncommitted work. Build on it where appropriate.
4. Do not reset, clean, revert, overwrite, or discard user changes. Do not assume the working tree is clean.
5. Inspect existing tests, environment-variable examples, migrations, data access, authentication, and deployment configuration.
6. Verify existing audit documents against source code. Treat documentation as evidence to check, not as guaranteed truth.
7. Discover and read the relevant skills available in your environment before coding. Apply appropriate codebase-analysis, MongoDB/database, security, and testing skills. In each report, list only skills you actually read and used. If a relevant skill is unavailable, say so and consult current official MongoDB documentation as needed. Never invent skills or claim to have used one you did not read.

## Product requirements

### MongoDB backend

- MongoDB is the required application database.
- Do not use Supabase for application persistence, authentication, or file storage.
- Inspect and build on the current repository state. If Supabase is already partly implemented, migrate its active usage to MongoDB carefully; do not simply delete code or data before the replacement is implemented and verified.
- Keep all MongoDB access on the server. Never expose MongoDB URIs, usernames, passwords, or privileged database credentials to browser bundles, client components, public APIs, logs, or error messages.
- Use schema validation, safe queries, indexes, connection reuse appropriate for Next.js, and clear error handling.
- Do not silently claim a persistent save when a database write failed.
- Do not silently use process memory as a substitute for a successful persistent write.
- If MongoDB configuration is unavailable, clearly report the required configuration and keep public pages functional using the existing defaults.

### Preserve all existing frontend data

- Keep every existing static frontend datum, mock record, product, content string, translation, image, and asset intact.
- Do not delete, replace, simplify, rewrite, or regenerate existing static data as part of this work.
- Existing static data is the source of the initial/default experience and must continue to render when MongoDB has no override or cannot be reached.
- MongoDB records are optional overrides. Resolve content field-by-field: use the saved override when present; otherwise use the original static frontend value.
- Never overwrite the original static defaults with CMS data. Saving an override must not remove or mutate the original default data files.
- For an unavailable database, public reads may fall back to the original static content. Admin writes must show a clear failure and must not display a false success state.
- Add checks that prove existing defaults remain present and usable before edits, when no MongoDB override exists, and after a database read failure.

### Content and localization

- Start with the public homepage hero headline and supporting text in English and Arabic.
- Keep English and Arabic content distinct where needed, and retain the current localization and RTL behavior.
- Do not fabricate corporate facts, product claims, medical claims, or translations.
- Add more CMS-managed public content only when its current ownership and data flow have been verified. Clearly distinguish public editable content from Admin-only simulations and operational records.

### Security and authorization

- Enforce authentication and authorization on the server for every Admin mutation.
- Do not treat a client-side role, hidden button, unsigned cookie, arbitrary role string, or unverified Bearer token as proof of identity.
- Keep public reads limited to public fields.
- Validate and normalize all inputs on the server.
- Protect against unauthorized updates, mass assignment, injection, and accidental exposure of private records.
- Do not weaken existing security controls to make a test pass.
- Never print real secret values in terminal output, reports, tests, screenshots, or documentation.

## Ten phases

Complete these phases in order. Keep each phase small enough to inspect. After its phase report, continue to the next phase unless there is a concrete blocker or a decision that must come from the user. Do not wait for approval for routine, reversible implementation choices.

### Phase 1 — Repository audit and baseline

- Read repository instructions and applicable skills.
- Inspect Git status and diffs; identify existing user changes and protect them.
- Map the Web app, Admin app, shared packages, database layer, static data, migrations, forms, authentication, and tests.
- Trace actual flows for homepage content, product catalog, public contact leads, and Admin mutations.
- Identify current Supabase references and distinguish active runtime dependencies from unused or historical files.
- Check which environment files exist without printing secret values.
- Run focused baseline checks where practical. Clearly label checks not run and their reasons.
- Record verified findings, risks, and the implementation sequence.

### Phase 2 — MongoDB architecture and configuration

- Design a server-only MongoDB client/data-access layer compatible with the monorepo and the installed Next.js version.
- Define safe connection reuse and lifecycle behavior for development and production.
- Specify the exact required environment variable names using an example file with placeholders only. Never add real credentials.
- Ensure client bundles cannot import the MongoDB driver or privileged configuration.
- Remove Supabase from active application paths only after equivalent MongoDB paths exist and are verified.
- Keep unrelated Supabase references untouched when they are historical documentation or unrelated user work; explain their status.
- Add focused tests for configuration validation, server-only boundaries, and error behavior.

### Phase 3 — MongoDB models, validation, indexes, and safe migration

- Define the collections/documents needed by verified app behavior, starting with homepage content, products, and public leads as appropriate.
- Add server-side validation and indexes based on actual query patterns.
- Make initialization or seed logic repeatable and safe to rerun.
- Preserve the existing static data and use it as fallback/default content.
- If existing Supabase migrations or records need migration, provide a safe, non-destructive migration path. Never drop a collection, table, or record automatically.
- Document backup and rollback steps before any data migration.
- Add unit tests for schemas, indexes where testable, seeds, fallback rules, and migration idempotency.

### Phase 4 — Authentication and authorization

- Inspect the existing login and session architecture before selecting an implementation.
- Implement cryptographically verifiable sessions and server-side role checks, or clearly identify external identity-provider prerequisites if the repository cannot safely provide them.
- Protect every Admin read or mutation that contains or changes non-public data.
- Keep public website reads narrowly scoped to publishable content.
- Add tests for unauthenticated requests, insufficient roles, valid authorized requests, malformed sessions, and expired sessions.
- Do not use a mock session or bypass as production behavior.

### Phase 5 — Bilingual homepage CMS

- Add a focused Admin editor for the homepage hero headline and supporting text in English and Arabic.
- Save through authenticated server-side handlers to MongoDB.
- Only report success after MongoDB confirms the write.
- Load public content from MongoDB when an override exists; otherwise retain the exact original static value for each missing field.
- Keep Arabic RTL and current presentation behavior intact.
- Revalidate the appropriate English and Arabic public routes after a successful save.
- If the database is unavailable, preserve the public defaults and show a clear Admin error for writes.
- Add tests proving defaults, bilingual override behavior, persistence, failure behavior, authorization, and cache revalidation.

### Phase 6 — Product catalog synchronization

- Verify every Admin product action and every public catalog/detail reader before changing the data path.
- Connect supported product creation, editing, deletion, and availability changes to MongoDB using authenticated server-side writes.
- Preserve the existing product mock data and assets as fallback/default data.
- Ensure public English and Arabic catalog and product detail pages read the same persisted records and resolve missing values from the unchanged static defaults.
- Verify changes are visible after refresh and across separate Web and Admin processes.
- Ensure errors never appear as successful saves and failed writes do not alter defaults.
- Add focused unit and integration tests for each supported mutation and public rendering path.

### Phase 7 — Public forms and Admin workflows

- Trace public contact/lead submission to its actual Admin destination.
- Validate and persist submissions through server-side MongoDB writes.
- Add appropriate abuse controls and duplicate handling without blocking legitimate use.
- Preserve existing demo/seed leads and unrelated Admin-only operational data.
- Enforce access controls for private contact details.
- Add tests for valid submissions, invalid inputs, duplicates, unauthorized reads, successful persistence, and database failures.

### Phase 8 — Remaining public content and Admin data flows

- Inventory other Admin-editable content that is intended to appear on the public website.
- Connect only features whose intended behavior is confirmed by existing UI and requirements.
- Preserve current static defaults, localized content, images, and assets.
- Do not imply that simulated telemetry, safety, GxP, newsletter, HCP, or other Admin workflows are production-persistent unless they actually are.
- Label unsupported or simulated workflows accurately in the UI and documentation.
- Add focused unit and integration tests for each additional data flow implemented.

### Phase 9 — Security, reliability, and data-integrity review

- Review MongoDB authentication, authorization, least-privilege access, input validation, query construction, public projections, secret handling, and error handling.
- Check for client-side imports of server-only code or credentials.
- Review rate limiting and abuse protections for public write endpoints where appropriate.
- Verify database outages preserve public static content and do not create false Admin success messages.
- Verify migrations and seeds are non-destructive, repeatable, and documented.
- Review all diffs for accidental data deletion or changes to existing static content.
- Fix confirmed issues and add focused regression tests.
- Update security and data-flow documentation to match the verified implementation.

### Phase 10 — End-to-end verification and handoff

- Verify the full flow: authorized Admin edit → confirmed MongoDB write → fresh public read → updated English and Arabic pages after refresh.
- Verify the original static defaults still render with an empty database and during database read failure.
- Run the relevant unit, integration, security, type-check, lint, and build checks. Report exact commands and outcomes; never label an unrun check as passed.
- Inspect the final Git diff and confirm unrelated user changes remain untouched.
- Document MongoDB setup, required environment variables, seed/migration steps, backup/rollback instructions, and local run commands.
- Provide a concise final guide explaining how to edit content and verify it on both public language routes.

## Required validation in every phase

Before completing each phase:

1. Add or update focused unit tests for code changed in that phase.
2. Run those unit tests and state the exact pass/fail counts.
3. Run relevant integration and security checks for that phase. If a check is not run, explicitly say so and why.
4. Check that existing static frontend data and assets remain intact.
5. Review the diff for security issues, data-loss risks, unrelated edits, and accidental secret exposure.
6. Fix failures where feasible before proceeding. Do not hide failures or skip tests silently.
7. Do not claim test, security, or persistence behavior that was not actually verified.

## Required report after every phase

At the end of each phase, write a progress report containing:

- Phase number and title
- Findings and work completed
- Files changed
- Skills actually read and applied, with exact names
- Unit tests run and exact results
- Integration/security checks run and exact results
- Static-data preservation check and result
- Risks, blockers, or decisions needed
- Whether you are proceeding to the next phase

Continue to the next phase after reporting unless blocked. Do not stop after writing a plan; implement the work.

## Final report

After Phase 10, provide one consolidated report covering:

- Summary of all ten phases
- MongoDB architecture and required configuration
- Migration/seed and backup/rollback instructions
- How static defaults and MongoDB overrides work
- How to edit the English and Arabic homepage content
- How to verify an Admin change appears on the public website
- Exact tests, security checks, type-checks, lint, and build results
- Remaining risks and limitations
- Skills actually read and used

Never claim a phase or check is complete unless the corresponding work and verification were actually performed.
