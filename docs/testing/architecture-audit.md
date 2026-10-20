# MIRAGE PHARMA — SYSTEM ARCHITECTURE & INTEGRATION AUDIT

> **Date:** October 20, 2026  
> **Auditors:** Senior QA Automation Engineer, Senior Frontend Engineer, DevOps Engineer  
> **Project Scope:** `mirage-direction-two` Monorepo (`apps/admin`, `apps/web`, `packages/*`)  
> **Status:** AUDITED & VALIDATED WITH AUTOMATED TEST PROOFS  

---

## 1. Executive Summary

This architecture audit evaluates the codebase topology, service boundaries, data persistence layer, authorization controls, and synchronization pathways between the **Mirage Pharma Admin Dashboard** (`apps/admin`) and the **Public Website** (`apps/web`).

Our automated test suite (14 test suites, 125 tests executing across `packages`, `apps/admin`, `apps/web`, and cross-app `integration`) confirms a critical architectural finding:

> **CRITICAL ARCHITECTURAL FINDING (ARCH-01):**  
> While the UI components, clinical workflows, and data visualizations across both applications are rich, responsive, and type-safe, **the Admin Dashboard and Public Website operate on completely decoupled, in-memory client state.** Mutations performed in the Admin Dashboard (product creation, inventory toggles, lead updates) modify only transient React component state. They do not persist to a centralized database or shared mutation API, and therefore **never propagate to the public-facing catalog or website.**

---

## 2. Monorepo & System Topology

The repository is structured as a **Turborepo** monorepo managed via **pnpm workspaces** (`pnpm@10.26.1`, Node `>=18.17.0`).

```
mirage-direction-two/
├── apps/
│   ├── admin/                      # Port 3001: Clinical Operations & Regulatory Hub
│   │   ├── app/                    # Next.js 15 App Router
│   │   │   ├── b2b-leads/          # B2B Partnership Pipeline
│   │   │   ├── cold-chain/         # IoT Cryo-Depot Telemetry & Excursions
│   │   │   ├── gxp-logs/           # FDA 21 CFR Part 11 Audit Trail & Merkle Ledger
│   │   │   ├── hcp-verify/         # Healthcare Professional Syndicate Verification
│   │   │   ├── layout.tsx          # Admin Shell (Sidebar, Header, Breadcrumbs)
│   │   │   ├── page.tsx            # Executive Operations KPI Dashboard
│   │   │   ├── pharmacovigilance/  # Pharmacovigilance & CIOMS-I Incident Desk
│   │   │   ├── products/           # Formulation Studio & Product Management
│   │   │   ├── settings/           # RBAC Clearance & Monorepo Diagnostics
│   │   │   └── subscribers/        # Scientific Newsletter & HCP Broadcast Hub
│   │   ├── middleware.ts           # HTTP Security Header Middleware
│   │   └── package.json            # @mirage/admin
│   │
│   └── web/                        # Port 3000: Public Institutional & HCP Website
│       ├── app/                    # Next.js 15 App Router (English + Arabic i18n)
│       │   ├── about/              # Corporate Governance & Global Strategy
│       │   ├── ar/                 # Localized Arabic Mirror (RTL layout)
│       │   │   ├── contact/
│       │   │   ├── page.tsx
│       │   │   └── products/       # Arabic Product Catalog
│       │   ├── cold-chain/         # Public Cold-Chain Integrity Showcase
│       │   ├── contact/            # Institutional Inquiries & Partner Intake
│       │   ├── partners/           # Strategic Alliances & Licensing
│       │   ├── pipeline/           # R&D Development Pipeline
│       │   ├── products/           # Public Formulation Catalog & Monograph View
│       │   │   ├── [slug]/         # Dynamic Formulation Detail Monograph
│       │   │   └── page.tsx        # Filterable Formulation Grid
│       │   ├── quality/            # Quality Standards & GxP Compliance
│       │   ├── science/            # Scientific Advisory Board & R&D
│       │   └── layout.tsx          # Public Shell (Navbar, Footer, Language Switcher)
│       └── package.json            # @mirage/web
│
├── packages/
│   ├── types/                      # Domain interfaces, GxP schemas, Mock Data
│   │   └── src/
│   │       ├── index.ts            # Type definitions (Product, Lot, AdverseEvent, etc.)
│   │       ├── mock-data.ts        # Primary English in-memory dataset
│   │       └── mock-data-ar.ts     # Localized Arabic in-memory dataset
│   ├── ui/                         # Shared UI Component Library (Tailwind CSS)
│   │   └── src/
│   │       ├── ClinicalModal.tsx   # Accessible Dialog & Slide-Over Sheet
│   │       ├── DataTable.tsx       # Paginated, Searchable, Filterable Data Table
│   │       ├── StatusBadge.tsx     # Semantic GxP Status Indicator
│   │       └── TelemetryCard.tsx   # IoT Telemetry Metric Card
│   └── utils/                      # Shared Pure Business Logic & Formatters
│       └── src/
│           ├── format.ts           # Number, date, and currency formatting
│           ├── index.ts            # Public barrel export
│           └── slug.ts             # Deterministic slug generator & validator
│
├── docs/testing/                   # QA Documentation & Architectural Audits
├── tests/                          # Cross-app integration tests & JSDOM setup
├── package.json                    # Monorepo root manifest
├── pnpm-workspace.yaml             # Workspace definition (apps/*, packages/*)
├── turbo.json                      # Turbo task pipeline (build, lint, type-check)
└── vitest.config.ts                # Multi-project Vitest test runner configuration
```

---

## 3. Package Manifests & Dependency Mapping

| Package | Role | Internal Dependencies | External Dependencies |
| :--- | :--- | :--- | :--- |
| `apps/admin` | Operations Dashboard | `@mirage/ui`, `@mirage/utils`, `@mirage/types` | `next`, `react`, `lucide-react`, `tailwindcss` |
| `apps/web` | Public Website | `@mirage/ui`, `@mirage/utils`, `@mirage/types` | `next`, `react`, `lucide-react`, `tailwindcss` |
| `packages/ui` | Design System | None (pure UI) | `react`, `lucide-react`, `clsx`, `tailwind-merge` |
| `packages/utils` | Pure Logic | None | Pure TypeScript |
| `packages/types` | Data Models & Mocks | None | Pure TypeScript |

---

## 4. Layer-by-Layer Architectural Audit

### 4.1 Data Persistence Layer
- **Actual Source of Truth:** Pure in-memory TypeScript data structures (`packages/types/src/mock-data.ts` and `mock-data-ar.ts`).
- **Absence of Database / ORM:** There are currently **no** database clients (PostgreSQL, Supabase, Prisma, Drizzle), no server actions executing database queries, and no REST/GraphQL API routes handling CRUD persistence in either `apps/admin` or `apps/web`.
- **Consequence:** 
  1. Any record created via the Formulation Studio modal (`apps/admin/app/products/page.tsx`) exists only within the memory of that browser tab.
  2. A page refresh (`F5`) or navigation destroys newly created entities.
  3. The public website (`apps/web/app/products/page.tsx`) imports `MOCK_PRODUCTS` directly at compile/render time, remaining completely unaware of admin mutations.

### 4.2 Authentication & Security Controls (SEC-01)
- **Middleware Audit (`apps/admin/middleware.ts`):**
  - Configured with security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
  - **Critical Gap:** The middleware does **not** evaluate session tokens, authorization cookies, Bearer JWTs, or role clearances.
  - **Vulnerability:** Any client can request any admin route (`/products`, `/cold-chain`, `/gxp-logs`, `/settings`) without authentication. The RBAC switcher in `apps/admin/app/settings/page.tsx` is an interactive UI simulation that stores state in React memory only.

### 4.3 Image & Document Upload Workflows
- In `apps/admin/app/products/page.tsx`, file uploads are handled via `<input type="file">`.
- When an asset (e.g. package artwork or Certificate of Analysis PDF) is selected, the browser invokes `URL.createObjectURL(file)`.
- **Limitation:** Assets are not uploaded to cloud object storage (S3, Cloudflare R2, Supabase Storage). Object URLs are revoked when the session terminates.

### 4.4 Internationalization & Localization (ARCH-03)
- `apps/web` provides Arabic routes under `/ar/*` with RTL layout support.
- **Data Split:** English routes read from `MOCK_PRODUCTS` (`packages/types/src/mock-data.ts`), whereas Arabic routes read from `MOCK_PRODUCTS_AR` (`packages/types/src/mock-data-ar.ts`).
- **Defect:** There is no synchronized bilingual entity model. An update in the Admin dashboard does not have fields for Arabic localization and cannot update `MOCK_PRODUCTS_AR`.

### 4.5 Public Lead Intake (ARCH-04)
- `apps/web/app/contact/page.tsx` renders an institutional partnership contact form.
- Upon submission, the handler calls `e.preventDefault()` and sets `submitted = true`.
- It does **not** dispatch a `POST` request or push the inquiry into the Admin B2B Leads pipeline (`MOCK_B2B_INQUIRIES` in `apps/admin/app/b2b-leads/page.tsx`).

---

## 5. Summary of Verified Defects

| Defect ID | Severity | Component | Root Cause | Status |
| :--- | :--- | :--- | :--- | :--- |
| **KD-01** | High | `packages/utils/src/slug.ts` | Multi-space, punctuation, diacritics corrupted URL slugs | **FIXED & TESTED** |
| **KD-02** | High | `packages/ui/src/DataTable.tsx` | CSV Formula Injection (CWE-1236) on leading `=`, `+`, `-`, `@` | **FIXED & TESTED** |
| **WEB-01** | Medium | `apps/web/app/products/page.tsx` | Search filter omitted `product.tagline`, causing missing search matches | **FIXED & TESTED** |
| **ARCH-01** | Critical | Monorepo Data Flow | Admin mutations are stored in local React state, disconnected from public website | **DOCUMENTED & PROVEN IN TESTS** |
| **ARCH-02** | High | Catalog Stock Sync | Admin stock toggle only mutates local state; public web remains hardcoded `inStock: true` | **DOCUMENTED & PROVEN IN TESTS** |
| **ARCH-03** | Medium | Catalog Localization | Separate decoupled files for English and Arabic mock data | **DOCUMENTED** |
| **ARCH-04** | Medium | B2B Lead Intake | Public contact form does not dispatch leads to Admin B2B table | **DOCUMENTED** |
| **SEC-01** | Critical | `apps/admin/middleware.ts` | Zero session/cookie validation; all routes unprotected | **DOCUMENTED & VERIFIED** |
| **KD-03** | Low | `packages/types/src/mock-data.ts` | Cross-module entity references (batches, adverse events) refer to non-existent SKUs | **DOCUMENTED** |
| **KD-04** | Low | `packages/types/src/mock-data.ts` | Audit ledger hashes are truncated 48-char strings instead of 64-char SHA-256 | **DOCUMENTED** |

---

## 6. Recommended Phase 2 Architecture Roadmap

To transition Mirage Pharma from an interactive client prototype to production-grade enterprise software, the following backend architecture must be implemented:

1. **Unified Database Layer:** Introduce PostgreSQL via Supabase or Prisma with migration files matching `@mirage/types`.
2. **Centralized REST/tRPC API:** Create shared API routes or Server Actions in `apps/admin` and `apps/web` backed by the database.
3. **Authentication & Session Guard:** Deploy NextAuth.js / Supabase Auth in `apps/admin/middleware.ts` enforcing RBAC roles (`SUPER_ADMIN`, `QA_OFFICER`, `MEDICAL_DIRECTOR`, `READ_ONLY`).
4. **On-Demand Cache Revalidation:** Implement `revalidatePath('/products')` and `revalidateTag('catalog')` in Next.js Server Actions upon any admin mutation.
5. **Secure Cloud Object Storage:** Integrate AWS S3 or Supabase Storage for Certificate of Analysis (CoA) PDFs and packaging artwork.
