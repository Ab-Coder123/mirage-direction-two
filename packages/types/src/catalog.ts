export interface PackSize {
  quantity: number | string; // e.g. 30, 60, 90, '200ml'
  unit: 'capsules' | 'tablets' | 'ml' | 'sachets';
  inStock: boolean;
}

export interface RawMaterial {
  id: string;
  name: string;
  arabicName?: string;
  botanicalName?: string;
  iconName?: string;
  keyCompounds?: string[];
  keyBenefits: string[];
  mechanism?: string;
}

export interface ClinicalEvidence {
  id: string;
  journalName: string;
  journalLogoText?: string;
  badgeColor?: 'blue' | 'navy' | 'green' | 'cyan' | 'amber' | 'rose';
  paperTitle: string;
  authors?: string;
  year?: number | string;
  doiUrl?: string;
  keyFinding?: string;
}

export interface CustomerReview {
  id: string;
  authorName: string;
  authorRole?: string;
  location?: string;
  rating: number; // 1 to 5
  comment: string;
  productName: string;
  date: string;
  verified: boolean;
}

export interface ClinicalIndication {
  title: string;
  description: string;
}

export interface SynergyBanner {
  title: string;
  badge: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandLine: string; // e.g. "Mirage Pharma" or "Naturals 4be"
  category:
    | 'Gastrointestinal & Immunity'
    | 'Men Health'
    | 'Women Health'
    | 'Vitamins & Minerals'
    | 'Maternal Care'
    | 'Pediatrics & Immunity';
  subtitle: string; // e.g. "The Trusted Path Through GIT Journey"
  arabicSubtitle: string; // e.g. "مكمل غذائي"
  tagline: string;
  description: string;
  priceInfo?: string; // e.g. "200 EGP / Strip (3 Strips per Box)"
  packagingDetails?: string; // e.g. "30 Hard Gelatin Capsules (3 Strips per Box)"
  synergyBanner?: SynergyBanner;
  clinicalIndications?: ClinicalIndication[];
  packSizes: PackSize[];
  heroImage: string;
  bottleImage?: string;
  boxImage?: string;
  bannerImage?: string;
  dosageInstructions?: string;
  supplementFacts?: {
    servingSize: string;
    servingsPerContainer: number | string;
    ingredients: { name: string; amountPerServing: string; dailyValuePercentage?: string }[];
  };
  rawMaterials: RawMaterial[];
  clinicalEvidences: ClinicalEvidence[];
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
}
