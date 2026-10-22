# Phase 3 — MongoDB Models, Validation, Indexes, and Safe Migration Report

**Project:** Mirage Direction Two (`E:\programming\Space Work\mirage direction two`)  
**Specification:** `docs/backend workflow/MONGODB_10_PHASE_PLAN.md`  
**Phase Status:** COMPLETED & VERIFIED (Unit-Tested; Live DB & Legacy Import Pending Credentials)

---

## 1. Phase Number and Title
**Phase 3 — MongoDB models, validation, indexes, and safe migration**

---

## 2. Findings and Work Completed

### 2.1 Strict Document Schemas & Key Validation (`packages/db/src/server/mongo-models.ts`)
- **Strict Content Key Enforcement:**
  - `SiteContentKeySchema = z.enum(['homepage_hero', 'company_story'])`.
  - `MongoSiteContentDocSchema` enforces `SiteContentKeySchema` on `key` and uses `.superRefine` to validate `data` against the corresponding payload schema (`HomepageHeroContentSchema` or `CompanyStoryContentSchema`).
  - `validateSiteContentData(key, data)` strictly validates `key` against `SiteContentKeySchema` first and rejects any unknown key with an actionable error (`Unsupported site_content key "<key>". Allowed keys: homepage_hero, company_story.`). Arbitrary inputs are never cast to `any` or reported as valid.
- **Product Document Schema:**
  - Added `MongoProductDocSchema` and `MongoProductPackSizeSchema` to validate product documents (`id`, `slug`, `name`, `category`, `description`, `brandLine`, `heroImage`, `packSizes`, etc.) before database insertion or migration.
- **Leads & Audit Schemas:**
  - Reused `B2BLeadRecordSchema` and `AuditLogRecordSchema` from `packages/db/src/schema.ts`.

### 2.2 Index Specifications & Error Propagation (`ensureMongoIndexes`)
- Defined index specifications in `MONGO_INDEX_SPECIFICATIONS` for:
  - `site_content`: `{ key: 1 }` (Unique).
  - `products`: `{ id: 1 }` (Unique), `{ slug: 1 }` (Unique), `{ category: 1 }`, `{ name: 'text', description: 'text' }`.
  - `b2b_leads`: `{ id: 1 }` (Unique), `{ created_at: -1 }`, `{ status: 1 }`.
  - `audit_logs`: `{ id: 1 }` (Unique), `{ event_id: 1 }` (Unique), `{ timestamp: -1 }`, `{ entity_id: 1 }`.
- **Accurate Index Error Surfacing:**
  - Updated `ensureMongoIndexes(db)` with `isBenignSameSpecIndexError(err)` so that an error is only treated as `(existing)` when MongoDB explicitly reports code `68` (`IndexAlreadyExists`) or `"index already exists with the same specification"`.
  - Permission errors (`Unauthorized`, code `13`), incompatible index options/keys (`IndexOptionsConflict` code `85`, `IndexKeySpecsConflict` code `86`, `"different options"`), duplicate-key errors (`E11000`, code `11000`), and network/connectivity failures are surfaced immediately with an actionable error message (`Failed to ensure index "<name>" on collection "<collection>": <reason>`) and are never reported as created or existing.

### 2.3 Strictly Non-Destructive & Idempotent Seed Logic (`packages/db/src/server/mongo-seed.ts`)
- **Insert-Only Semantics:**
  - `seedMongoDatabase(db)` checks for document existence (`findOne`) and uses `$setOnInsert` with `{ upsert: true }` across `site_content`, `products`, `b2b_leads`, and `audit_logs`.
  - Existing records in MongoDB are **never** overwritten on subsequent seed runs.
- **Force Overwrite Prohibited:**
  - Removed the destructive `force` overwrite behavior. Passing `{ force: true }` to `seedMongoDatabase` throws an explicit error (`Destructive force-seeding is prohibited...`) and leaves existing documents untouched.
- **Field-by-Field Static Fallback Helpers:**
  - Implemented `resolveHomepageHeroWithFallback(override)` and `resolveCompanyStoryWithFallback(override)` to resolve content field-by-field from saved overrides while falling back to `DEFAULT_HOMEPAGE_HERO_CONTENT` and `DEFAULT_COMPANY_STORY_CONTENT` (preserving `'75 + 500'` workforce in English and Arabic) without mutating static default objects.

### 2.4 Non-Destructive Migration & Conflict Detection (`packages/db/src/server/mongo-migration.ts`)
- **Local File Migration (`migrateFromLocalFiles`):**
  - Reads `.data/site-content/homepage-hero.json` and `.data/site-content/company-story.json` (or configured env paths) and validates them via `validateSiteContentData`.
  - If the destination MongoDB document does **not** exist, inserts it via `$setOnInsert`.
  - If the destination MongoDB document **already exists**:
    - Never overwrites the existing MongoDB document.
    - Compares editable fields; if different, records a structured `MigrationConflict` in `summary.conflicts` and sets `summary.status = 'completed_with_conflicts'` so newer Admin edits in MongoDB are never replaced by stale local files.
    - Preserves both the MongoDB record and the local JSON file on disk.
  - Passing `{ force: true }` to `migrateFromLocalFiles` is explicitly rejected with an error.
- **Legacy Supabase Read-Only Import (`migrateFromSupabase`):**
  - Implemented a read-only import path (`migrateFromSupabase(db, customSource?)`) that only executes `.select('*')` on `site_content`, `products`, `b2b_leads`, and `audit_logs` without modifying or deleting anything in Supabase.
  - Validates every incoming row and inserts only missing documents into MongoDB (`$setOnInsert`), recording conflicts in `summary.conflicts` if a destination record already exists with different values.
  - **Honest Execution Status:** When `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not configured in the environment, `migrateFromSupabase(db)` returns `ok: false, status: 'pending_configuration'` with the exact `manualActionRequired` message. **No live Supabase import has been executed in this environment because no Supabase credentials exist.**
  - Active runtime repositories in `packages/db/src/repository/*` and `packages/db/src/server/*` retain their current paths until the equivalent MongoDB repositories are wired in Phases 5–8; historical SQL files in `supabase/migrations/` remain untouched.

### 2.5 Backup and Rollback Procedures
Documented in `MONGODB_BACKUP_AND_ROLLBACK_GUIDE` (`packages/db/src/server/mongo-migration.ts`):
- **Pre-migration backup:** `mongodump --uri="$MONGODB_URI" --db="mirage_pharma" --out="./backups/backup_$(date +%Y%m%d_%H%M%S)"`
- **Single-collection JSON export:** `mongoexport --uri="$MONGODB_URI" --db="mirage_pharma" --collection="site_content" --out="./backups/site_content.json"`
- **Rollback restore:** `mongorestore --uri="$MONGODB_URI" --db="mirage_pharma" --drop "./backups/<backup_name>/mirage_pharma"`

---

## 3. Files Changed
- `packages/db/src/company-content.ts` — Exported `COMPANY_STORY_FIELDS` for field-by-field comparison and fallback resolution.
- `packages/db/src/server/mongo-models.ts` — Enforced `SiteContentKeySchema`, rejected unknown keys in `validateSiteContentData`, added `MongoProductDocSchema`, and updated `ensureMongoIndexes` to surface index creation failures.
- `packages/db/src/server/mongo-seed.ts` — Enforced strictly non-destructive `$setOnInsert` seeding, prohibited `force` overwrite, and added `resolveHomepageHeroWithFallback` and `resolveCompanyStoryWithFallback`.
- `packages/db/src/server/mongo-migration.ts` — Made `migrateFromLocalFiles` insert-only with conflict reporting, prohibited `force` overwrite, and added read-only `migrateFromSupabase` with `pending_configuration` reporting when credentials are absent.
- `packages/db/__tests__/mongo-models-and-migration.test.ts` — Expanded unit test suite to 20 unit tests covering unknown keys, malformed payloads, field-by-field fallbacks, index error propagation, seed non-destructiveness, local migration conflict preservation, and Supabase read-only import / pending configuration.
- `docs/backend workflow/phase3_mongodb_models_validation_indexes_and_safe_migration.md` — Saved this corrected Phase 3 report in the repository.

---

## 4. Skills Actually Read and Applied
- `full-codebase-analysis` (`C:\Users\TaFrA\.agents\skills\full-codebase-analysis\SKILL.md`): Read and applied to verify all schema definitions, repository boundaries, and existing content models across `packages/db` and `packages/types`.
- *Unavailable Skill Note:* No dedicated MongoDB skill is installed in the environment; official MongoDB Node.js driver v7 specifications (`createIndex`, `$setOnInsert`, error codes `68`, `85`, `86`, `11000`, `13`) were applied directly.

---

## 5. Unit Tests Run and Exact Results
- **Command:** `pnpm test:run packages/db/__tests__/mongo-models-and-migration.test.ts`
- **Test Type:** Unit tests using an in-memory mock MongoDB `Db` (not a live MongoDB server integration test).
- **Result:** **1 test file passed, 20/20 unit tests passed (0 failed)** in 79ms (total runner duration 5.93s).
  - Validated `homepage_hero` and `company_story` schemas.
  - Rejected unknown content keys (`unknown_section`, `arbitrary_key`) and malformed payloads.
  - Verified field-by-field fallback resolution and `'75 + 500'` workforce preservation.
  - Verified index creation idempotency and confirmed that permission (`code: 13`), options conflict (`code: 85`), duplicate key (`code: 11000`), and connectivity (`ECONNREFUSED`) errors are thrown rather than hidden.
  - Verified `seedMongoDatabase` preserves prepopulated `site_content`, `products`, `b2b_leads`, and `audit_logs` records and rejects `{ force: true }`.
  - Verified `migrateFromLocalFiles` preserves newer existing MongoDB records when stale local JSON files exist, reports conflicts in `summary.conflicts`, and leaves disk files intact.
  - Verified `migrateFromSupabase` returns `status: 'pending_configuration'` when credentials are unconfigured, and imports missing records read-only without overwriting existing MongoDB records when a read-only source is provided.

---

## 6. Integration and Security Checks Run and Exact Results
- **Package Type-Check:**
  - Command: `pnpm --filter @mirage/db type-check`
  - Result: **PASSED (0 TypeScript errors)**.
- **Live MongoDB Server Check:**
  - **NOT RUN (Unconfigured):** `MONGODB_URI` is not set in the environment. No live MongoDB connection or index creation against a running `mongod` instance was performed.
- **Live Supabase Import Check:**
  - **NOT RUN (Pending Configuration):** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not set in the environment. `migrateFromSupabase` is implemented in code and unit-tested against a mock read-only source, but no live Supabase data import has been executed.

---

## 7. Static-Data Preservation Check and Result
- **Result:** **PASSED (100% Intact)**.
- `DEFAULT_COMPANY_STORY_CONTENT.workforceEn` and `workforceAr` remain `'75 + 500'`.
- `DEFAULT_HOMEPAGE_HERO_CONTENT`, `MOCK_PRODUCTS`, `MOCK_PRODUCTS_AR`, and `admin-data.ts` are untouched.
- Unit tests verify that `resolveHomepageHeroWithFallback` and `resolveCompanyStoryWithFallback` never mutate the default objects.

---

## 8. Risks, Blockers, or Decisions Needed
- **Live MongoDB Provisioning:** A running MongoDB instance (`MONGODB_URI`) will be needed when verifying live database persistence in end-to-end tests.
- **Optional Legacy Supabase Import:** If a live Supabase instance holds historical data that must be migrated, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be supplied on the server to run `migrateFromSupabase(db)`.
- **No Blocker for Phase 4:** All Phase 3 gate criteria are satisfied.

---

## 9. Next Steps
Proceeding immediately to **Phase 4 — Authentication and authorization** in this session.
