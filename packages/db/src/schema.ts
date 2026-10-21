import { z } from 'zod';
import type { Product, PackSize } from '@mirage/types';

// =============================================================================
// ENUMS & SCHEMAS
// =============================================================================
export const UserRoleSchema = z.enum(['super_admin', 'qa_officer', 'medical_director', 'read_only']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const ProductStatusSchema = z.enum(['draft', 'published', 'archived']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const LeadStatusSchema = z.enum(['NEW', 'TRIAGED', 'UNDER_REVIEW', 'CONTRACT_SIGNED', 'REJECTED']);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const AuditFrameworkSchema = z.enum(['FDA_21_CFR_PART_11', 'EDA_GXP', 'WHO_TRS']);
export type AuditFramework = z.infer<typeof AuditFrameworkSchema>;

// =============================================================================
// B2B LEADS & AUDIT LOGS SCHEMAS
// =============================================================================
export const B2BLeadRecordSchema = z.object({
  id: z.string(),
  company_name: z.string().min(2, 'Company name is required'),
  contact_name: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  partnership_archetype: z.string().min(2, 'Partnership type is required'),
  message: z.string().optional().nullable(),
  status: LeadStatusSchema.default('NEW'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type B2BLeadRecord = z.infer<typeof B2BLeadRecordSchema>;

export const AuditLogRecordSchema = z.object({
  id: z.string(),
  event_id: z.string().min(1),
  timestamp: z.string(),
  framework: AuditFrameworkSchema.default('FDA_21_CFR_PART_11'),
  action: z.string().min(1),
  actor_id: z.string().min(1),
  actor_role: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  before_payload: z.record(z.any()).optional().nullable(),
  after_payload: z.record(z.any()).optional().nullable(),
  hash: z.string().min(64, 'SHA-256 hash must be 64 characters'),
  prev_hash: z.string().min(64),
});
export type AuditLogRecord = z.infer<typeof AuditLogRecordSchema>;

export const CategorySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  name_ar: z.string().min(1),
  description: z.string().optional().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

// =============================================================================
// MUTATIONS
// =============================================================================
export const SubmitB2BLeadMutationSchema = z.object({
  company_name: z.string().min(2, 'Company or organization name is required'),
  contact_name: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  partnership_archetype: z.string().min(2, 'Please select a partnership archetype'),
  message: z.string().optional(),
});
export type SubmitB2BLeadInput = z.infer<typeof SubmitB2BLeadMutationSchema>;

export const CreateProductMutationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  subtitle: z.string().optional(),
  arabicSubtitle: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().min(5, 'Description is required'),
  brandLine: z.string().optional().default('Mirage Pharma'),
  heroImage: z.string().optional().default('/brand/products/folate-b12.jpg'),
  priceInfo: z.string().optional(),
  packagingDetails: z.string().optional(),
  packSizes: z
    .array(
      z.object({
        quantity: z.union([z.number(), z.string()]),
        unit: z.enum(['capsules', 'tablets', 'ml', 'sachets']),
        inStock: z.boolean(),
      })
    )
    .optional(),
  dosageInstructions: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof CreateProductMutationSchema>;

export type { Product, PackSize };
