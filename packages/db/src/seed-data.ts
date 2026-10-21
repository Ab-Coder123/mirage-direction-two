import { MOCK_PRODUCTS, MOCK_PRODUCTS_AR, type Product } from '@mirage/types';
import type { Category, B2BLeadRecord, AuditLogRecord } from './schema';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'Gastrointestinal & Immunity',
    slug: 'gastrointestinal-immunity',
    name: 'Gastrointestinal & Immunity',
    name_ar: 'الجهاز الهضمي والمناعة',
    description: 'Advanced synbiotic formulations targeting the gut-brain axis and mucosal integrity.',
  },
  {
    id: 'Acid Suppression (P-CAB)',
    slug: 'acid-suppression-pcab',
    name: 'Acid Suppression (P-CAB)',
    name_ar: 'مثبطات إفراز الحمض (P-CAB)',
    description: 'Next-generation potassium-competitive acid blockers for rapid, food-independent GERD relief.',
  },
  {
    id: 'Men Health',
    slug: 'men-health',
    name: 'Men Health',
    name_ar: 'صحة الرجل',
    description: 'Targeted formulations for hormonal vitality and vascular performance.',
  },
  {
    id: 'Women Health',
    slug: 'women-health',
    name: 'Women Health',
    name_ar: 'صحة المرأة',
    description: 'Evidence-based support for reproductive balance and metabolic equilibrium.',
  },
  {
    id: 'Vitamins & Minerals',
    slug: 'vitamins-minerals',
    name: 'Vitamins & Minerals',
    name_ar: 'الفيتامينات والمعادن',
    description: 'High-bioavailability micronutrient complexes with zero synthetic binders.',
  },
  {
    id: 'Maternal Care',
    slug: 'maternal-care',
    name: 'Maternal Care',
    name_ar: 'رعاية الأمومة',
    description: 'Prenatal and postnatal nutritional optimization for maternal and fetal health.',
  },
  {
    id: 'Pediatrics & Immunity',
    slug: 'pediatrics-immunity',
    name: 'Pediatrics & Immunity',
    name_ar: 'طب الأطفال والمناعة',
    description: 'Gentle, clinical-grade immune resilience drops and syrups for children.',
  },
];

export const INITIAL_PRODUCTS: Product[] = JSON.parse(JSON.stringify(MOCK_PRODUCTS));
export const INITIAL_PRODUCTS_AR: Product[] = JSON.parse(JSON.stringify(MOCK_PRODUCTS_AR));

export const INITIAL_B2B_LEADS: B2BLeadRecord[] = [
  {
    id: 'lead-001',
    company_name: 'Cairo Cure Oncology Centers',
    contact_name: 'Dr. Tarek El-Kady',
    email: 'tarek.elkady@cairocure.org',
    phone: '+20 100 456 7890',
    partnership_archetype: 'Hospital Network',
    message: 'Seeking institutional formulary inclusion for SymPDCA in GI mucositis protocol.',
    status: 'UNDER_REVIEW',
    created_at: '2026-04-12T11:20:00Z',
    updated_at: '2026-04-12T11:20:00Z',
  },
  {
    id: 'lead-002',
    company_name: 'Al-Amal Medical Group',
    contact_name: 'Dr. Sarah Farouk',
    email: 'sarah.farouk@alamal-health.com',
    phone: '+20 111 888 2233',
    partnership_archetype: 'Regional Distributor',
    message: 'Tender procurement request for NovaMirage commercial distribution in Upper Egypt.',
    status: 'TRIAGED',
    created_at: '2026-04-15T14:10:00Z',
    updated_at: '2026-04-15T14:10:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: 'audit-001',
    event_id: 'GXP-2026-INIT-001',
    timestamp: '2026-01-01T00:00:00Z',
    framework: 'FDA_21_CFR_PART_11',
    action: 'SYSTEM_DATABASE_SCHEMA_INITIALIZATION',
    actor_id: 'USR-SYSTEM-ADMIN',
    actor_role: 'SUPER_ADMIN',
    entity_type: 'SYSTEM',
    entity_id: 'ROOT',
    before_payload: null,
    after_payload: { status: 'INITIALIZED', schema_version: '20261021000000' },
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
  },
];
