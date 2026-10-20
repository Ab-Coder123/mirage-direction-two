# MIRAGE PHARMA — DATA FLOW MAP & INTEGRATION BOUNDARIES

> **Date:** October 20, 2026  
> **Auditors:** Senior QA Automation Engineer, Senior Full-Stack Engineer  
> **Project Scope:** `mirage-direction-two`  
> **Verification Suite:** `tests/integration/dashboard-to-website.test.tsx` (Passing)  

---

## 1. Overview & Legend

This document details the data lifecycle, boundary interactions, and architectural pathways between the **Mirage Pharma Admin Dashboard** (`apps/admin`) and the **Public Website** (`apps/web`).

For each feature, we provide:
1. **Target Enterprise Architecture Flow:** The full lifecycle required for a production pharmaceutical platform.
2. **Current As-Built Implementation Flow:** The actual behavior observed in the codebase and verified through our automated test suite.
3. **Automated Test Proof:** Reference to the concrete Vitest integration test proving the boundary behavior.

---

## 2. Feature 1: Formulation Studio (Product Management)

### Target Enterprise Architecture Flow
```mermaid
flowchart TD
    A["Admin UI: /products<br>(Formulation Registration Modal)"] -->|User submits formulation| B["Next.js Server Action or POST /api/products"]
    B -->|Validate Schema & RBAC| C["Backend Validation & Audit Logger"]
    C -->|INSERT INTO products| D[("PostgreSQL Database")]
    C -->|Log 21 CFR Part 11 Action| E[("GxP Audit Ledger")]
    D -->|Database Commit| F["Next.js Cache Invalidation<br>revalidatePath('/products')"]
    F -->|Next.js ISR / SSR Revalidation| G["Public Data Fetcher<br>(getProducts)"]
    G -->|Hydrate Component| H["Public Website: /products<br>(Updated Formulation Card Visible)"]
    G -->|Hydrate Detail Route| I["Public Website: /products/[slug]<br>(Monograph Rendered)"]
```

### Current As-Built Implementation Flow (Defect ARCH-01)
```mermaid
flowchart TD
    A["Admin UI: /products<br>(Registration Modal)"] -->|User inputs SKU, Name, Doses| B["handleCreateFormulation Callback"]
    B -->|Local React State Mutation| C["setProducts(prev => [created, ...prev])"]
    C -->|Transient Memory| D["Rendered in Admin Table (Current Tab Only)"]
    
    subgraph Disconnect ["❌ Architectural Disconnect (No Persistence Boundary)"]
        D -.->|Page Refresh F5| E["State Erased; Resets to MOCK_PRODUCTS"]
        D -.-x|No Network Request / No Shared DB| F["Static Import from @mirage/types"]
    end
    
    F --> G["Public Website: /products<br>(Reads original MOCK_PRODUCTS)"]
    G --> H["Rendered Public Catalog<br>(New Formulation NEVER Appears)"]
```

> **Automated Test Proof:**  
> Verified in `tests/integration/dashboard-to-website.test.tsx`:
> - Step 1: Formulation `MIR-TEST-999` ("NovaCardio Complex") created in `apps/admin/app/products/page.tsx`.
> - Step 2: Formulation renders inside the local Admin Table.
> - Step 3: `apps/web/app/products/page.tsx` is rendered.
> - Result: `screen.queryByText("NovaCardio Complex")` is `null`. Proves ARCH-01.

---

## 3. Feature 2: Pack Size Stock & Availability Toggles

### Current As-Built Implementation Flow (Defect ARCH-02)
```mermaid
flowchart TD
    A["Admin UI: /products<br>(Monograph Editor Tab)"] -->|Admin clicks Stock Toggle| B["Local State Mutation in products/page.tsx"]
    B -->|Toggle pack.inStock| C["Admin UI displays Status: Out of Stock"]
    
    subgraph Disconnect ["❌ Architectural Disconnect"]
        C -.-x|No Backend Mutation| D["packages/types/src/mock-data.ts"]
    end
    
    D --> E["Public Website: /products/[slug]<br>(Imports static MOCK_PRODUCTS)"]
    E --> F["Pack Size selector shows inStock: true (Always Available)"]
```

> **Automated Test Proof:**  
> Verified in `tests/integration/dashboard-to-website.test.tsx`:
> - Admin toggles SymPDCA 30-Pack to `inStock: false`.
> - Public `ProductDetailPage` at `/products/sympdca-oral-powder` continues to display SymPDCA in stock. Proves ARCH-02.

---

## 4. Feature 3: B2B Partnerships & Public Contact Intake

### Target Enterprise Flow vs Current Flow (Defect ARCH-04)
```mermaid
flowchart TD
    subgraph Public Intake ["Public Website: /contact"]
        A["Institutional Contact Form"] -->|User fills Name, Org, Email| B["handleSubmit() Handler"]
        B -->|e.preventDefault()| C["setSubmitted(true)"]
        C -->|UI Toast Banner| D["Success Message: Inquiry Received"]
    end

    subgraph Disconnect ["❌ Disconnect Boundary"]
        B -.-x|NO API Call / NO Webhook| E["apps/admin/app/b2b-leads/page.tsx"]
    end

    subgraph Admin Hub ["Admin Dashboard: /b2b-leads"]
        E --> F["MOCK_B2B_INQUIRIES Static Table"]
        F --> G["Admin never sees the submitted contact lead"]
    end
```

---

## 5. Feature 4: Cold-Chain Telemetry & Thermal Excursion CAPA

### As-Built Workflow (Verified in Unit Tests)
```mermaid
sequenceDiagram
    participant User as QA Inspector
    participant UI as Admin /cold-chain
    participant Timer as setInterval (2500ms)
    participant Modal as CAPA Sign-off Modal

    UI->>Timer: Starts telemetry stream (jitter: +/-0.1°C)
    User->>UI: Clicks "Simulate Excursion" (+9.4°C breach)
    UI->>UI: Flags alert-critical, locks depot status to CRITICAL_EXCURSION
    UI->>UI: Batches quarantined (Hold Status)
    User->>UI: Clicks "Sign CAPA"
    UI->>Modal: Opens 21 CFR Part 11 Electronic Signature Sheet
    User->>Modal: Inputs Inspector Name & Reason ("Nitrogen valve purged")
    User->>Modal: Clicks "Authorize Electronic Signature"
    Modal->>UI: Restores temperature to +4.4°C & closes modal
    Note over UI: Verified in apps/admin/__tests__/cold-chain.test.tsx
```

---

## 6. Feature 5: GxP Audit Trail & Cryptographic Merkle Ledger

### As-Built Workflow (Verified in Unit Tests)
```mermaid
sequenceDiagram
    participant Auditor as Regulatory Auditor
    participant UI as Admin /gxp-logs
    participant Modal as Merkle Verification Modal
    participant Diff as Audit Diff Sheet

    Auditor->>UI: Filters by "FDA 21 CFR Part 11"
    UI->>UI: Filters table to matching compliance records
    Auditor->>UI: Clicks "Verify Merkle Chain"
    UI->>Modal: Renders Merkle Tree root hash verification
    Auditor->>UI: Clicks "Inspect Diff" on Record GXP-2026-001
    UI->>Diff: Displays Before/After JSON patch diff
    Note over UI: Verified in apps/admin/__tests__/gxp-logs.test.tsx
```

---

## 7. Feature 6: Healthcare Professional (HCP) Syndicate Verification

### As-Built Workflow (Verified in Unit Tests)
```mermaid
sequenceDiagram
    participant Admin as Medical Credentialing Officer
    participant UI as Admin /hcp-verify
    participant Sheet as HCP Dossier Sheet
    participant KeyModal as Access Key Modal

    Admin->>UI: Filters by "Pending Review"
    UI->>UI: Displays pending doctor applications
    Admin->>UI: Clicks "Dossier" on Dr. Layla Mansour
    UI->>Sheet: Opens verification dossier (License & Medical Syndicate ID)
    Admin->>UI: Clicks "Verify & Grant Access"
    UI->>UI: Updates status to "Verified" (Local state)
    Admin->>UI: Clicks "Issue Key"
    UI->>KeyModal: Generates cryptographically secure API Key token
    Note over UI: Verified in apps/admin/__tests__/hcp-verify.test.tsx
```

---

## 8. Feature 7: Pharmacovigilance & CIOMS-I ADR Triage

### As-Built Workflow (Verified in Unit Tests)
```mermaid
sequenceDiagram
    participant Officer as Pharmacovigilance Officer
    participant UI as Admin /pharmacovigilance
    participant CIOMS as WHO CIOMS-I Modal
    participant Dossier as Safety Dossier Sheet

    Officer->>UI: Filters by "SERIOUS_HOSPITALIZATION"
    UI->>UI: Filters adverse reaction table
    Officer->>UI: Clicks "WHO CIOMS-I Form"
    UI->>CIOMS: Renders standard Council for International Organizations of Medical Sciences form
    Officer->>UI: Clicks "Triage Case"
    UI->>Dossier: Opens incident causality assessment & de-challenge notes
    Note over UI: Verified in apps/admin/__tests__/pharmacovigilance.test.tsx
```

---

## 9. Feature 8: Audience & Scientific Newsletter Broadcast

### As-Built Workflow (Verified in Unit Tests)
```mermaid
sequenceDiagram
    participant Director as Communications Director
    participant UI as Admin /subscribers
    participant Modal as Broadcast Composer
    participant Sheet as Subscriber Profile

    Director->>UI: Filters subscribers by "Clinical Oncologist"
    UI->>UI: Filters audience grid
    Director->>UI: Clicks "Dispatch Broadcast"
    UI->>Modal: Opens composer modal with targeting chips
    Director->>Modal: Inputs subject & content, clicks "Dispatch"
    Modal->>UI: Dispatches campaign & increments sent count
    Director->>UI: Clicks "Profile" on recipient
    UI->>Sheet: Opens engagement analytics slide-over
    Note over UI: Verified in apps/admin/__tests__/subscribers.test.tsx
```

---

## 10. Feature 9: RBAC Settings Hub & Middleware Enforcement

### Current Security Perimeter (Defect SEC-01)
```mermaid
flowchart LR
    Client["Browser / HTTP Client"] --> M["apps/admin/middleware.ts"]
    M -->|Injects X-Frame-Options, CSP, etc.| R["Admin Route Handler (/products, /cold-chain, /settings)"]
    
    subgraph Gap ["⚠️ Missing Security Boundary (SEC-01)"]
        M -.->|NO Session Check / NO JWT Verification| Pass["ALLOW ALL REQUESTS"]
    end
    
    Pass --> R
    R --> Render["Full Admin Dashboard Exposed without Login"]
```

---

## 11. Complete Integration Boundary Matrix

| Entity / Feature | Admin Mutation Origin | Persistence Layer | Public Fetcher Route | Data Synchronization Status | Test Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Formulations (SKUs)** | `/products` modal | Local Component State | `/products` & `/products/[slug]` | ❌ **DISCONNECTED** (Lost on F5) | `dashboard-to-website.test.tsx` (ARCH-01) |
| **Inventory Availability** | `/products` tab | Local Component State | `/products/[slug]` | ❌ **DISCONNECTED** (Stale inStock) | `dashboard-to-website.test.tsx` (ARCH-02) |
| **B2B Alliance Leads** | `/b2b-leads` modal | Local Component State | None (Admin only) | ❌ **DISCONNECTED** from `/contact` | `b2b-leads.test.tsx` (ARCH-04) |
| **Cold-Chain Depots** | `/cold-chain` CAPA | Local Component State | `/cold-chain` (Public) | ❌ **DISCONNECTED** (Separate datasets) | `cold-chain.test.tsx` |
| **GxP Audit Trail** | `/gxp-logs` | In-memory `MOCK_GXP_AUDIT_LOGS` | None (Admin only) | ⚠️ Static In-Memory | `gxp-logs.test.tsx` |
| **HCP Verification** | `/hcp-verify` | Local Component State | None (Admin only) | ⚠️ State resets on reload | `hcp-verify.test.tsx` |
| **Safety ADR Cases** | `/pharmacovigilance` | In-memory `MOCK_ADVERSE_EVENTS` | None (Admin only) | ⚠️ State resets on reload | `pharmacovigilance.test.tsx` |
| **Audience Broadcasts** | `/subscribers` | Local Component State | None (Admin only) | ⚠️ State resets on reload | `subscribers.test.tsx` |
| **RBAC Clearances** | `/settings` | Local Component State | None (Admin only) | ❌ **UNENFORCED** in middleware | `settings-and-middleware.test.tsx` (SEC-01) |
