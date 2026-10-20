# MIRAGE PHARMA — TEST STRATEGY & COVERAGE PLAN

> **Date:** October 20, 2026  
> **Auditors:** Senior QA Automation Engineer, Senior Frontend Engineer  
> **Project Scope:** `mirage-direction-two` Monorepo  
> **Test Framework:** Vitest 3.2.7 with v8 Coverage & React Testing Library 16.3.3  

---

## 1. Test Strategy & Objectives

The primary objective of this testing framework is to establish an automated, deterministic verification barrier that covers:
1. **Shared Foundation (`packages/*`):** Component rendering, accessibility, table sorting/filtering/pagination, CSV export security, formatting, and domain model integrity.
2. **Clinical Operations Hub (`apps/admin`):** Formulation studio CRUD, IoT cold-chain simulation & CAPA electronic signatures, FDA 21 CFR Part 11 audit ledger & Merkle verification, HCP verification queue, CIOMS-I ADR triage, B2B alliance pipeline, newsletter broadcasts, and RBAC settings.
3. **Public HCP & Institutional Website (`apps/web`):** Public formulation catalog rendering, category filtering, search mechanics, dynamic monograph views, and bilingual data fidelity.
4. **Cross-App Integration (`tests/integration`):** Mutation boundary verification, data persistence lifecycle, and cache invalidation.

---

## 2. Testing Infrastructure & Tooling Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │            Vitest Multi-Project Runner                 │
                    │               (vitest.config.ts)                       │
                    └────────────────────────────────────────────────────────┘
                                                 │
         ┌───────────────────┬───────────────────┼───────────────────┐
         ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Project:        │ │ Project:        │ │ Project:        │ │ Project:        │
│ packages        │ │ admin           │ │ web             │ │ integration     │
│                 │ │                 │ │                 │ │                 │
│ • DataTable     │ │ • Products      │ │ • Catalog       │ │ • Admin to Web  │
│ • ClinicalModal │ │ • Cold-Chain    │ │ • Category Tabs │ │   Persistence   │
│ • StatusBadge   │ │ • GxP Ledger    │ │ • Search Query  │ │ • Stock Toggle  │
│ • Slug & Format │ │ • HCP Syndicate │ │ • Monograph View│ │   Synchronization│
│ • Schema Guard  │ │ • CIOMS-I ADR   │ │                 │ │                 │
│                 │ │ • B2B Pipeline  │ │                 │ │                 │
│                 │ │ • Subscribers   │ │                 │ │                 │
│                 │ │ • RBAC Settings │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 2.1 Configuration Specifications (`vitest.config.ts`)
- **Environment:** `jsdom` for browser DOM emulation.
- **Path Resolution:** Next.js `@/*` monorepo path alias plugin dynamically maps imports for `@/components`, `@/lib`, `@/data`, and monorepo packages `@mirage/*`.
- **Global Setup (`tests/setup.ts`):**
  - `@testing-library/jest-dom` matchers loaded globally.
  - Polyfills for `window.matchMedia`, `window.scrollTo`, and `ResizeObserver`.
  - Node.js stub for `URL.createObjectURL` and `URL.revokeObjectURL` for file upload tests.
- **Timeout:** `testTimeout: 15000` to prevent flake during complex DOM tree rendering.

### 2.2 Execution Commands
All test commands run from the monorepo root:

```bash
# Run all 14 test suites once (Deterministic CI mode)
pnpm test:run

# Run tests in interactive watch mode
pnpm test

# Run all test suites with v8 code coverage analysis
pnpm test:coverage

# Run a specific test suite (e.g., integration tests only)
pnpm exec vitest run tests/integration/dashboard-to-website.test.tsx
```

---

## 3. Test Suite Inventory & Coverage Matrix

### 3.1 Package Unit Suites (`packages/`)

| Test File | Tests | Target Component / Function | Verification Focus |
| :--- | :---: | :--- | :--- |
| `packages/utils/__tests__/slug-and-format.test.ts` | **12** | `slugify`, `validateNewSlug`, `formatCurrency`, `formatNumber`, `formatDate` | Diacritics, spaces, punctuation stripping, boundaries, localized currency, negative numbers. (KD-01 verified) |
| `packages/types/__tests__/data-integrity.test.ts` | **24** | `MOCK_PRODUCTS`, `MOCK_DEPOTS`, `MOCK_GXP_AUDIT_LOGS`, `MOCK_ADVERSE_EVENTS`, `MOCK_B2B_INQUIRIES` | Type compliance, non-empty arrays, valid status enums, temperature ranges, timestamp validity. (KD-03, KD-04 verified) |
| `packages/ui/__tests__/ClinicalModal-StatusBadge-TelemetryCard.test.tsx` | **20** | `ClinicalModal`, `StatusBadge`, `TelemetryCard` | ARIA modal dialog labels, Escape key listeners, backdrop dismissal, slide-over vs center layout, GxP status color palettes, delta indicators. |
| `packages/ui/__tests__/DataTable.test.tsx` | **16** | `DataTable` | Column rendering, null cell fallbacks, multi-key search, case-insensitivity, ascending/descending text sort, numeric sort (not lexicographic), pagination boundaries, column visibility toggles, **CSV formula injection prevention (CWE-1236)**. (KD-02 verified) |

### 3.2 Dashboard Operations Suites (`apps/admin/`)

| Test File | Tests | Target Page / Component | Verification Focus |
| :--- | :---: | :--- | :--- |
| `apps/admin/__tests__/products.test.tsx` | **8** | `FormulationStudioPage` (`/products`) | Initial catalog rendering, 5 monograph tabs, category filters, pack stock toggling with toast, compound addition in Supplement Facts, modal creation, SKU validation, GS1 2D DataMatrix rendering. |
| `apps/admin/__tests__/cold-chain.test.tsx` | **5** | `ColdChainTelemetryPage` (`/cold-chain`) | Telemetry dashboard rendering, regional depot switcher, live stream pause/resume, **+9.4°C thermal excursion simulation**, batch quarantine locking, **21 CFR Part 11 CAPA sign-off modal**. |
| `apps/admin/__tests__/gxp-logs.test.tsx` | **5** | `GxPAuditLedgerPage` (`/gxp-logs`) | Ledger metrics, regulatory framework filters (FDA 21 CFR Part 11 vs EDA GxP), module filters, **Merkle chain cryptographic verification modal**, before/after JSON patch diff sheet. |
| `apps/admin/__tests__/hcp-verify.test.tsx` | **5** | `HCPCredentialingPage` (`/hcp-verify`) | Verification queue, Pending/Verified filters, dossier inspection sheet, status update to Verified, **secure cryptographic API access key issuance modal**, syndicate registry sync simulation. |
| `apps/admin/__tests__/pharmacovigilance.test.tsx` | **4** | `PharmacovigilancePage` (`/pharmacovigilance`) | Safety triage desk, telemetry metrics, seriousness classification filters, **WHO CIOMS-I standard adverse reaction form modal**, ADR incident triage dossier. |
| `apps/admin/__tests__/b2b-leads.test.tsx` | **4** | `B2BAlliancesHubPage` (`/b2b-leads`) | Pipeline hub metrics, partnership archetype filters (Hospital Network, Distributor, Academic), partner registration modal, strategic dossier sheet. |
| `apps/admin/__tests__/subscribers.test.tsx` | **4** | `NewsletterDispatchPage` (`/subscribers`) | Audience intelligence hub, role filters (Clinical Oncologist, Head of Pharmacy), **clinical broadcast composer modal & dispatch campaign**, subscriber engagement profile sheet. |
| `apps/admin/__tests__/settings-and-middleware.test.tsx` | **6** | `SecurityRBACSettingsPage` & `middleware.ts` | RBAC role permission matrix, active role switching, permission bit toggling with GxP signature notice, **monorepo diagnostic certification suite modal**, middleware HTTP security headers. (SEC-01 verified) |

### 3.3 Public Website Suites (`apps/web/`)

| Test File | Tests | Target Page / Component | Verification Focus |
| :--- | :---: | :--- | :--- |
| `apps/web/__tests__/products.test.tsx` | **8** | `ProductsPage` & `ProductDetailPage` | Public formulation grid, header banner, category tab filters, **case-insensitive search across name, indication, and tagline (WEB-01 verified)**, dynamic slug rendering for SymPDCA & NovaMirage, 404 fallback for invalid slugs. |

### 3.4 Cross-App Integration Suites (`tests/integration/`)

| Test File | Tests | Target Boundary | Verification Focus |
| :--- | :---: | :--- | :--- |
| `tests/integration/dashboard-to-website.test.tsx` | **4** | Admin Mutation → Public Fetcher | **Proves ARCH-01:** Admin creation of `MIR-TEST-999` modifies only local React state and fails to persist to public catalog. **Proves ARCH-02:** Admin pack stock toggle does not synchronize with public catalog. |

---

## 4. Code Coverage Results (v8 Coverage Provider)

Execution of `vitest run --coverage` across the monorepo yielded the following verified metrics:

| Module / Directory | Statements | Branches | Functions | Lines |
| :--- | :---: | :---: | :---: | :---: |
| **`packages/utils/src`** | **100.00%** | **100.00%** | **100.00%** | **100.00%** |
| **`packages/ui/src/DataTable.tsx`** | **98.64%** | **91.17%** | **90.90%** | **98.64%** |
| **`packages/ui/src/ClinicalModal.tsx`** | **98.76%** | **93.75%** | **100.00%** | **98.76%** |
| **`apps/admin/middleware.ts`** | **100.00%** | **100.00%** | **100.00%** | **100.00%** |
| **`apps/admin/app/products/page.tsx`** | **98.22%** | **86.36%** | **83.33%** | **98.22%** |
| **`apps/admin/app/cold-chain/page.tsx`** | **97.47%** | **93.10%** | **78.57%** | **97.47%** |
| **`apps/admin/app/subscribers/page.tsx`** | **95.02%** | **91.30%** | **88.88%** | **95.02%** |
| **`apps/admin/app/gxp-logs/page.tsx`** | **94.79%** | **89.47%** | **90.00%** | **94.79%** |
| **`apps/admin/app/settings/page.tsx`** | **92.06%** | **88.88%** | **83.33%** | **92.06%** |
| **`apps/admin/app/hcp-verify/page.tsx`** | **88.26%** | **80.00%** | **85.71%** | **88.26%** |
| **`apps/admin/app/pharmacovigilance/page.tsx`** | **87.92%** | **81.48%** | **83.33%** | **87.92%** |
| **`apps/admin/app/b2b-leads/page.tsx`** | **86.14%** | **81.81%** | **85.71%** | **86.14%** |
| **`apps/web/app/products/page.tsx`** | **96.15%** | **92.30%** | **100.00%** | **96.15%** |
| **`apps/web/app/products/[slug]/page.tsx`** | **87.78%** | **80.00%** | **75.00%** | **87.78%** |
| **OVERALL CODEBASE MONOREPO** | **76.32%** | **80.00%** | **50.80%** | **76.32%** |

---

## 5. Quality Assurance Principles Enforced

1. **Deterministic Execution:** Zero reliance on live cloud endpoints, live databases, or non-deterministic timers during unit tests.
2. **True State Assertion:** Asserts actual DOM mutations and state transitions rather than shallow snapshots.
3. **Boundary Fidelity:** Integration tests test actual application entry points (`apps/web/app/products/page.tsx` and `apps/admin/app/products/page.tsx`) without mocking the business logic.
4. **Zero Flake:** JSDOM polyfills handle browser API gaps (`matchMedia`, `scrollTo`, `createObjectURL`) reliably.
