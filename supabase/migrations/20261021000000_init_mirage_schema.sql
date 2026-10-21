-- =============================================================================
-- MIRAGE PHARMA — ENTERPRISE DATABASE SCHEMA
-- Migration: 20261021000000_init_mirage_schema.sql
-- Compliance: FDA 21 CFR Part 11, GxP Data Integrity, Supabase Postgres Best Practices
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'qa_officer', 'medical_director', 'read_only');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('NEW', 'TRIAGED', 'UNDER_REVIEW', 'CONTRACT_SIGNED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_framework AS ENUM ('FDA_21_CFR_PART_11', 'EDA_GXP', 'WHO_TRS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'read_only',
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- e.g. 'microbiome', 'oncology', 'cardiometabolic'
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PRODUCTS (FORMULATIONS) TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- SKU, e.g. 'MIR-001'
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_ar TEXT,
    tagline TEXT,
    tagline_ar TEXT,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
    indication TEXT NOT NULL,
    indication_ar TEXT,
    dosage_form TEXT NOT NULL DEFAULT 'Powder',
    status product_status NOT NULL DEFAULT 'draft',
    in_stock BOOLEAN NOT NULL DEFAULT true,
    is_cold_chain BOOLEAN NOT NULL DEFAULT false,
    storage_temp_range TEXT NOT NULL DEFAULT '15°C to 25°C',
    image_url TEXT,
    coa_pdf_url TEXT,
    active_substances JSONB NOT NULL DEFAULT '[]'::jsonb,
    clinical_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. PRODUCT PACKS TABLE
CREATE TABLE IF NOT EXISTS public.product_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    dose_count INT NOT NULL DEFAULT 30,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    gtin_barcode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. B2B ALLIANCE LEADS & CONTACT INTAKE
CREATE TABLE IF NOT EXISTS public.b2b_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    partnership_archetype TEXT NOT NULL, -- 'Hospital Network', 'Regional Distributor', 'Academic Medical Center'
    message TEXT,
    status lead_status NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. AUDIENCE SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    professional_role TEXT NOT NULL DEFAULT 'HCP_OTHER',
    institution TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. GXP IMMUTABLE AUDIT LOG (FDA 21 CFR Part 11)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    framework audit_framework NOT NULL DEFAULT 'FDA_21_CFR_PART_11',
    action TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    before_payload JSONB,
    after_payload JSONB,
    hash TEXT NOT NULL,
    prev_hash TEXT NOT NULL
);

-- 10. INDEXES (Following Supabase Postgres Best Practices)
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_product_packs_product ON public.product_packs(product_id);
CREATE INDEX IF NOT EXISTS idx_b2b_leads_status ON public.b2b_leads(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Categories: Read-only for public, full access for authenticated staff
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

-- Products: Public can only view published formulations
CREATE POLICY "Public can view published products" ON public.products
    FOR SELECT USING (status = 'published');

CREATE POLICY "Staff can view all products" ON public.products
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage products" ON public.products
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'qa_officer', 'medical_director')
        )
    );

-- Product Packs: Public can view packs of published products
CREATE POLICY "Public can view packs of published products" ON public.product_packs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE products.id = product_packs.product_id AND products.status = 'published'
        )
    );

CREATE POLICY "Staff can manage packs" ON public.product_packs
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'qa_officer', 'medical_director')
        )
    );

-- B2B Leads: Public can submit inquiries (INSERT only)
CREATE POLICY "Public can submit contact lead" ON public.b2b_leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view and manage leads" ON public.b2b_leads
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'qa_officer', 'medical_director')
        )
    );

-- Subscribers: Public can subscribe
CREATE POLICY "Public can subscribe" ON public.subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view subscribers" ON public.subscribers
    FOR SELECT TO authenticated USING (true);

-- Audit Logs: Staff can view and append; UPDATE and DELETE are prohibited (immutable)
CREATE POLICY "Staff can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can append audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- Prevent any modification or deletion of audit logs (FDA 21 CFR Part 11 Rule)
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable under FDA 21 CFR Part 11. Updates and deletes are prohibited.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_update ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_update
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
