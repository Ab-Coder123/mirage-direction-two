# Phase 4 Report — Authentication, Cryptographically Signed Sessions & RBAC Authorization

**Status:** Completed & Verified  
**Phase:** 04 of 10 (`MONGODB_10_PHASE_PLAN.md`)  
**Scope:** `@mirage/db/auth-token`, `@mirage/db/server`, `apps/admin` (Middleware, Login/Logout, CMS & Product/Lead Server Actions)  

---

## 1. Executive Summary

Phase 4 replaces all legacy unsigned session cookies, client-selected role assertions, unverified `Bearer` token checks, and `super_admin` missing-session fallbacks with a fail-closed, server-verified authentication and Role-Based Access Control (RBAC) architecture:

1. **Cryptographically Signed Session Tokens (`mirage_session`):**
   - Session tokens use an explicit versioned format: `v1.<base64url(payload)>.<base64url(HMAC-SHA256)>`.
   - Signatures are computed with RFC 2104 HMAC-SHA256 using `MIRAGE_SESSION_SECRET` (minimum 32 characters required) and verified in constant time (`constantTimeEqualBytes` / `crypto.timingSafeEqual`).
   - Compatible with both Next.js Edge Runtime (`apps/admin/middleware.ts`) and Node.js Server Actions (`@mirage/db/server`), with unit tests proving bit-for-bit parity against Node's native `crypto.createHmac('sha256', secret)`.
2. **Elimination of Client Role Spoofing & Default Fallbacks:**
   - Removed client-side `document.cookie` session creation and role selection from [`apps/admin/app/login/page.tsx`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/login/page.tsx).
   - Removed the `getActorContext()` fallback that previously treated unauthenticated callers or spoofed `X-User-Role` headers as `super_admin` in [`homepage-actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/settings/homepage-actions.ts) and [`company-actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/settings/company-actions.ts).
   - Removed hardcoded `{ userId: 'USR-ADMIN', role: 'SUPER_ADMIN' }` execution from [`apps/admin/app/products/actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/products/actions.ts).
3. **Fail-Closed Server Configuration:**
   - No default production usernames, passwords, or session secrets are hardcoded in source code.
   - When `MIRAGE_SESSION_SECRET` or Admin operator credentials (`MIRAGE_ADMIN_EMAIL` + `MIRAGE_ADMIN_PASSWORD_HASH` / `MIRAGE_ADMIN_PASSWORD` or `MIRAGE_ADMIN_USERS_JSON`) are missing, authentication and session verification fail closed with `code: 'AUTH_NOT_CONFIGURED'`.
4. **Public Website Accessibility Preserved:**
   - Public routes on `apps/web` (`/`, `/ar`, `/our-story`, `/ar/our-story`, `/products`, `/ar/products`) and public server repository readers (`getHomepageHeroContent`, `getCompanyStoryContent`) remain accessible without an Admin session cookie.

---

## 2. Security Defects Remediated

| Defect ID | Previous Vulnerable Behavior | Phase 4 Remediation |
| :--- | :--- | :--- |
| **`SEC-01`** | `apps/admin/middleware.ts` only redirected when `process.env.ENFORCE_AUTH === 'true'`, accepted raw unsigned JSON cookies (`JSON.parse`), and treated any `Authorization: Bearer ...` string as `super_admin`. | Middleware now unconditionally enforces authentication on all protected Admin routes, verifies the HMAC-SHA256 signature and expiration of `mirage_session`, rejects unsigned JSON cookies and arbitrary `Bearer` headers, strips spoofed `X-User-Role` headers, and redirects unauthenticated requests (`HTTP 307`) to `/login?from=<path>&reason=<code>`. |
| **`SEC-02`** | `apps/admin/app/login/page.tsx` had a hardcoded dummy password (`••••••••••••`), let the user pick any role (`super_admin`, `qa_officer`, etc.), and wrote an unsigned cookie via `document.cookie`. | Replaced with a server-verified login form calling `loginAdminAction({ email, password })`. Operator credentials are verified on the server using `scrypt` + `crypto.timingSafeEqual`, roles are assigned strictly from server configuration, and the session token is stored in an `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (in production) cookie. |
| **`SEC-03`** | `saveHomepageHeroAction` and `saveCompanyStoryAction` read unsigned `mirage_session` or `X-User-Role` headers and fell back to `super_admin` when no session existed. | Both actions now call `await requireAdminSession('cms:write')` before touching storage. Unauthenticated, expired, tampered, or `read_only` / `qa_officer` callers are rejected immediately. Audit logs record the cryptographically verified `sub`, `email`, and `role`. |
| **`SEC-04`** | `apps/admin/app/products/actions.ts` (`createProductAction`, `updateProductAction`, `togglePackStockAction`, `deleteProductAction`) had zero authentication or RBAC checks. | All product mutations now require `requireAdminSession('products:write')`, product reads require `requireAdminSession('products:read')`, and private B2B lead actions (`apps/admin/app/b2b-leads/actions.ts`) require `requireAdminSession('leads:read' / 'leads:write')`. |

---

## 3. Role-Based Access Control (RBAC) Matrix

Defined in [`packages/db/src/server/auth-token.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/src/server/auth-token.ts):

| Permission | `super_admin` | `medical_director` | `qa_officer` | `read_only` | Protected Actions |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`cms:read`** | Allowed | Allowed | Allowed | Allowed | `getHomepageHeroAction`, `getCompanyStoryAction` |
| **`cms:write`** | Allowed | Allowed | **Forbidden** | **Forbidden** | `saveHomepageHeroAction`, `saveCompanyStoryAction` |
| **`products:read`** | Allowed | Allowed | Allowed | Allowed | `getProductsAction` |
| **`products:write`** | Allowed | Allowed | Allowed | **Forbidden** | `createProductAction`, `updateProductAction`, `togglePackStockAction`, `deleteProductAction` |
| **`leads:read`** | Allowed | Allowed | Allowed | Allowed | `getB2BLeadsAction` |
| **`leads:write`** | Allowed | Allowed | **Forbidden** | **Forbidden** | `updateB2BLeadStatusAction`, `deleteB2BLeadAction` |
| **`audit:read`** | Allowed | Allowed | Allowed | Allowed | Audit ledger queries |

---

## 4. Required Server-Only Environment Variables

Documented with safe placeholders in [`.env.example`](file:///E:/programming/Space%20Work/mirage%20direction%20two/.env.example) and [`apps/admin/.env.example`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/.env.example):

- `MIRAGE_SESSION_SECRET`: Server-only HMAC-SHA256 signing secret (minimum 32 characters).
- `MIRAGE_ADMIN_EMAIL`: Operator email address for primary Admin login.
- `MIRAGE_ADMIN_PASSWORD_HASH`: Scrypt password hash (`scrypt:<salt_hex>:<derived_key_hex>`) or `sha256:<digest_hex>`. (Optional `MIRAGE_ADMIN_PASSWORD` supported for local development).
- `MIRAGE_ADMIN_ROLE`: Assigned operator role (`super_admin` | `medical_director` | `qa_officer` | `read_only`).
- `MIRAGE_ADMIN_NAME`: Display name recorded in 21 CFR Part 11 audit logs.
- `MIRAGE_ADMIN_USERS_JSON` *(optional)*: JSON array of role-scoped operator accounts.

---

## 5. Files Created & Modified in Phase 4

1. **[`packages/db/src/server/auth-token.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/src/server/auth-token.ts)** *(Created)*:
   - Edge- and Node-compatible FIPS 180-4 SHA-256 and RFC 2104 HMAC-SHA256 implementation, constant-time byte comparison (`constantTimeEqualBytes`), `issueSessionToken`, `verifySessionToken`, `AdminSessionPayloadSchema`, and `ROLE_PERMISSIONS`.
2. **[`packages/db/src/server/auth.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/src/server/auth.ts)** *(Created)*:
   - Server-only credential loader (`loadConfiguredAdminOperators`), `scrypt` password hashing and constant-time verification (`hashAdminPasswordScrypt`, `verifyAdminPassword`), `authenticateAdminCredentials`, `getAdminSessionCookieOptions`, and `requireAdminSession`.
3. **[`packages/db/src/server/index.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/src/server/index.ts)** & **[`packages/db/package.json`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/package.json)** *(Modified)*:
   - Exported `./auth` from `@mirage/db/server` and `./auth-token` subpath for Edge middleware.
4. **[`apps/admin/middleware.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/middleware.ts)** *(Modified)*:
   - Enforced cryptographic verification of `mirage_session`, rejected unsigned cookies and arbitrary `Bearer` headers, stripped spoofed client role headers, and redirected unauthenticated requests to `/login`.
5. **[`apps/admin/app/login/actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/login/actions.ts)** *(Created)* & **[`apps/admin/app/login/page.tsx`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/login/page.tsx)** *(Modified)*:
   - Implemented server-side login/logout actions setting `HttpOnly` signed cookies and removed client-side cookie/role manipulation.
6. **[`apps/admin/app/settings/homepage-actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/settings/homepage-actions.ts)** & **[`apps/admin/app/settings/company-actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/settings/company-actions.ts)** *(Modified)*:
   - Replaced unsigned `getActorContext()` with `requireAdminSession('cms:write')` and `requireAdminSession('cms:read')`.
7. **[`apps/admin/app/products/actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/products/actions.ts)** & **[`apps/admin/app/b2b-leads/actions.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/app/b2b-leads/actions.ts)** *(Modified / Created)*:
   - Enforced `requireAdminSession('products:read' | 'products:write' | 'leads:read' | 'leads:write')` across all product and B2B lead Server Actions.
8. **[`packages/db/__tests__/auth-and-authorization.test.ts`](file:///E:/programming/Space%20Work/mirage%20direction%20two/packages/db/__tests__/auth-and-authorization.test.ts)** & **[`tests/integration/admin-auth-and-authorization.test.tsx`](file:///E:/programming/Space%20Work/mirage%20direction%20two/tests/integration/admin-auth-and-authorization.test.tsx)** & **[`apps/admin/__tests__/settings-and-middleware.test.tsx`](file:///E:/programming/Space%20Work/mirage%20direction%20two/apps/admin/__tests__/settings-and-middleware.test.tsx)** *(Created / Updated)*:
   - Added focused unit and integration tests covering valid sessions, tampered signatures, unsigned cookies, arbitrary Bearer tokens, expired tokens, missing configuration, invalid credentials, `read_only` and `qa_officer` role boundaries, and every protected Server Action.

---

## 6. Verification Results

| Command | Scope | Result |
| :--- | :--- | :--- |
| `pnpm test:run packages/db/__tests__/auth-and-authorization.test.ts tests/integration/admin-auth-and-authorization.test.tsx apps/admin/__tests__/settings-and-middleware.test.tsx` | Phase 4 Focused Auth, Middleware, and Server Action Tests | **3 test files, 22 passed, 0 failed** |
| `pnpm test:run` | Full Monorepo Test Suite across all 4 projects (`packages`, `admin`, `web`, `integration`) | **22 test files, 203 passed, 0 failed** |
| `pnpm turbo run type-check` | Monorepo TypeScript Verification across all 7 packages | **7 successful, 7 total (0 errors)** |
| `pnpm turbo run build` | Next.js Production Build (`apps/web` 27 routes + `apps/admin` 13 routes & Middleware) | **2 successful, 2 total (0 errors)** |

