-- =============================================================================
-- MIRAGE PHARMA — SEED INITIAL FORMULATIONS & CATEGORIES
-- Migration: 20261021000001_seed_initial_data.sql
-- =============================================================================

-- Categories
INSERT INTO public.categories (id, slug, name, name_ar, description)
VALUES 
    ('microbiome', 'microbiome', 'Microbiome & Metabolic', 'الميكروبيوم والأيض', 'Advanced synbiotic formulations targeting the gut-brain axis and metabolic resilience.'),
    ('oncology', 'oncology', 'Oncology Supportive Care', 'الرعاية الداعمة للأورام', 'Targeted nutritional and physiological support during high-dose chemo/radiotherapy.'),
    ('cardiometabolic', 'cardiometabolic', 'Cardiometabolic Health', 'صحة القلب والأوعية الدموية', 'Precision vascular and mitochondrial support compounds.'),
    ('immunology', 'immunology', 'Immunology & Inflammation', 'المناعة والالتهابات', 'Modulators of systemic inflammation and mucosal immunity.')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO public.products (
    id, slug, name, name_ar, tagline, tagline_ar, category_id,
    indication, indication_ar, dosage_form, status, in_stock,
    is_cold_chain, storage_temp_range, active_substances, clinical_evidence
)
VALUES 
    (
        'MIR-001',
        'sympdca-oral-powder',
        'SymPDCA Oral Powder',
        'مسحوق سيم بي دي سي إيه الفموي',
        'Targeted mucosal barrier protector and microbiome modulator',
        'حامي الحاجز المخاطي الموجه ومعدل ميكروبيوم الأمعاء',
        'microbiome',
        'Chemotherapy-induced mucosal barrier disruption and dysbiosis',
        'علاج اضطراب الحاجز المخاطي الناجم عن العلاج الكيميائي واختلال التوازن الميكروبي',
        'Powder Sachets',
        'published',
        true,
        false,
        '15°C to 25°C',
        '[
            {"name": "Sodium Butyrate (Microencapsulated)", "amount": "1200 mg", "purpose": "Colonocyte fuel and tight-junction restoration"},
            {"name": "L-Glutamine USP", "amount": "3000 mg", "purpose": "Enterocyte energy substrate"},
            {"name": "Zinc Carnosine", "amount": "75 mg", "purpose": "Mucosal ulceration healing"}
        ]'::jsonb,
        '[
            {"title": "Phase II Study in Gastrointestinal Mucositis", "journal": "Lancet Oncology Supp.", "year": 2024, "n": 142}
        ]'::jsonb
    ),
    (
        'MIR-002',
        'novamirage-cellular-complex',
        'NovaMirage Cellular Complex',
        'مركب نوفاميرا التجديدي الخلوي',
        'Dual-action NAD+ precursor with therapeutic bioavailability',
        'محفز NAD+ ثنائي المفعول ذو توافر حيوي علاجي فائق',
        'cardiometabolic',
        'Cellular senescence and bioenergetic depletion in chronic metabolic stress',
        'معالجة الشيخوخة الخلوية ونضوب الطاقة الحيوية في الإجهاد الأيضي المزمن',
        'Liposomal Liquid',
        'published',
        true,
        true,
        '2°C to 8°C (Refrigerated)',
        '[
            {"name": "Nicotinamide Mononucleotide (NMN)", "amount": "500 mg", "purpose": "Direct NAD+ biosynthesis precursor"},
            {"name": "Trans-Resveratrol (Micronized)", "amount": "250 mg", "purpose": "SIRT1 sirtuin activator"},
            {"name": "Phosphatidylcholine Matrix", "amount": "800 mg", "purpose": "Liposomal carrier and membrane integrity"}
        ]'::jsonb,
        '[
            {"title": "Randomized Trial on Mitochondrial Respiration in Metabolic Syndrome", "journal": "Cell Metabolism Reports", "year": 2025, "n": 98}
        ]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- Product Packs
INSERT INTO public.product_packs (product_id, name, name_ar, dose_count, in_stock, gtin_barcode)
VALUES
    ('MIR-001', '30 Sachets Pack (Monthly Supply)', 'عبوة 30 كيس (تكفي شهراً)', 30, true, '06221234567890'),
    ('MIR-001', '60 Sachets Clinical Pack', 'عبوة سريرية 60 كيس', 60, true, '06221234567891'),
    ('MIR-002', '300 ml Suspension Bottle', 'زجاجة معلق 300 مل', 30, true, '06221234567892')
ON CONFLICT DO NOTHING;

-- Audit Log Entry
INSERT INTO public.audit_logs (
    event_id, timestamp, framework, action, actor_id, actor_role,
    entity_type, entity_id, after_payload, hash, prev_hash
)
VALUES (
    'GXP-2026-INIT-001',
    now(),
    'FDA_21_CFR_PART_11',
    'SYSTEM_DATABASE_SCHEMA_INITIALIZATION',
    'USR-SYSTEM-ADMIN',
    'SUPER_ADMIN',
    'SYSTEM',
    'ROOT',
    '{"status": "INITIALIZED", "schema_version": "20261021000000"}'::jsonb,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    '0000000000000000000000000000000000000000000000000000000000000000'
)
ON CONFLICT (event_id) DO NOTHING;
