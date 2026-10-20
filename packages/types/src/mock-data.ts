import { Product, CustomerReview } from './catalog';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-sympdca',
    slug: 'sympdca',
    name: 'SymPDCA',
    brandLine: 'Mirage Pharma',
    category: 'Gastrointestinal & Immunity',
    subtitle: 'The TRUSTED PATH Through GIT Journey',
    arabicSubtitle: 'Dietary Supplement',
    tagline: '"Double the Defenses" — The Fast-Acting Dual Shield for Gut Health.',
    description:
      'Supports digestion & helps maintain a normal intestinal microflora.',
    priceInfo: 'Price per Strip 200 EGP (3 strips per box)',
    packagingDetails: '30 Hard gelatin capsules (3 strips per box)',
    synergyBanner: {
      title: 'SymPDCA THE POWER OF SYNERGY (1 + 1 = 3) — A "SMART SYNERGY RATIO."',
      badge: 'ALWAYS THE GREEN LIGHT',
      description:
        'SymPDCA actively shields and enhances the survival rate of Lactobacillus rhamnosus GG (LGG) as it passes through harsh stomach acids.',
    },
    clinicalIndications: [
      {
        title: 'POST-ANTIBIOTIC RECOVERY',
        description:
          'Egypt has a historically high rate of antibiotic use. SymPDCA restores natural gut flora which disrupted by antibiotic courses, preventing antibiotic-associated diarrhea.',
      },
      {
        title: 'IRRITABLE BOWEL SYNDROME (IBS) & BLOATING',
        description:
          'Heavy, traditional Egyptian meals (rich in fats, legumes like Fava beans, and processed carbohydrates) reduce bloating, gas, and irregular bowel movements.',
      },
      {
        title: 'IMMUNE SYSTEM SUPPORT',
        description:
          '70% of the immune system resides in the gut. SymPDCA act as a line of defense that strengthens systemic immunity against seasonal respiratory and gastrointestinal infections.',
      },
    ],
    packSizes: [
      { quantity: 30, unit: 'capsules', inStock: true },
    ],
    heroImage: '/brand/products/sympdca.webp',
    bottleImage: '/brand/products/sympdca.webp',
    boxImage: '/brand/products/sympdca.webp',
    rating: 5.0,
    reviewsCount: 284,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-sboulardii',
        name: 'SACCHAROMYCES BOULARDII (125MG)',
        botanicalName: '125 mg Concentration',
        keyBenefits: [
          'Binding directly to pathogens and neutralizing dangerous microbial toxins before they can damage the gut wall.',
        ],
      },
      {
        id: 'rm-lgg',
        name: 'LACTOBACILLUS RHAMNOSUS GG (15MG)',
        botanicalName: '15 mg Concentration',
        keyBenefits: [
          'Accelerating recovery times and lowering systemic inflammation.',
          'SymPDCA actively shields and enhances the survival rate of Lactobacillus rhamnosus GG (LGG) as it passes through harsh stomach acids.',
        ],
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-sympdca-1',
        journalName: 'PubMed / National Library of Medicine',
        journalLogoText: 'PMID: 34190033',
        badgeColor: 'green',
        paperTitle:
          'Medical Reference: https://pubmed.ncbi.nlm.nih.gov/34190033/',
        doiUrl: 'https://pubmed.ncbi.nlm.nih.gov/34190033/',
        keyFinding:
          'SymPDCA THE POWER OF SYNERGY (1 + 1 = 3) — A "SMART SYNERGY RATIO": Actively shields and enhances the survival rate of Lactobacillus rhamnosus GG (LGG) as it passes through harsh stomach acids.',
      },
    ],
  },
  {
    id: 'prod-novamirage',
    slug: 'novamirage',
    name: 'NOVAMIRAGE 20MG',
    brandLine: 'Mirage Pharma',
    category: 'Acid Suppression (P-CAB)',
    subtitle: 'THE NEXT GENERATION IN ACID SUPPRESSION: THE P-CABS EVOLUTION',
    arabicSubtitle: 'Vonoprazan 20 mg • Film-Coated Tablets',
    tagline: 'When Heartburn ATTACKS — Escape Through the NOVAMIRAGE (Vonoprazan 20 mg) GATE',
    description:
      'NOVAMIRAGE 20MG is Advanced Potassium - Competitive Acid Blocker (P-CAB) engineered for rapid, sustained, and predictable control of acid-related disorders. Moving Beyond the Limitations of Conventional PPIs. Gastric Ulcer, Reflux esophagitis and Suppression of their recurrence.',
    priceInfo: 'Price is 70 EGP per strip (2 strip per box)',
    packagingDetails: '14 Scored Film-Coated Tablets (2 strip per box)',
    dosageInstructions:
      'Tablet should be taken as whole without division. Can be administered with or without food, significantly increasing patient compliance.',
    synergyBanner: {
      title: 'THE REVOLUTIONARY NOVAMIRAGE 20MG MODE OF ACTION',
      badge: 'PROTON PUMP (H+/K+-ATPase) RAPID BLOCKING MECHANISM',
      description:
        'Unlike traditional Proton Pump Inhibitors: NOVAMIRAGE 20MG Binds Competitively & Reversibly directly to potassium ions (K+) on the H+/K+-ATPase enzyme system, blocking acid secretion immediately; Does Not Require Acid Activation (inherently stable in acidic environments, concentrating up to 100,000-fold inside the secretory canaliculi of parietal cells); and is Food Independent.',
    },
    clinicalIndications: [
      {
        title: 'Healing of Erosive Esophagitis (EE) / GERD',
        description:
          'Dosing: 20 mg once daily (4 to 8 weeks). Achieves over 95% healing rates; completely Superior to PPI within the first week.',
      },
      {
        title: 'Gastric Ulcer (GU)',
        description:
          'Dosing: 20 mg once daily (4 to 8 weeks). Provides prompt mucosal restoration and rapid pain relief.',
      },
      {
        title: 'H. pylori Eradication Therapy (As an adjunct)',
        description:
          'Dosing: 20 mg twice daily (BID) for 14 days (Combined with antibiotics like Amoxicillin & Clarithromycin/Metronidazole). Maintains a stable gastric pH (>6.0), maximizing antibiotic stability and boosting eradication success rates, even in PPI-resistant strains.',
      },
    ],
    packSizes: [
      { quantity: 14, unit: 'tablets', inStock: true },
    ],
    heroImage: '/brand/products/novamirage.webp',
    bottleImage: '/brand/products/novamirage.webp',
    boxImage: '/brand/products/novamirage.webp',
    rating: 5.0,
    reviewsCount: 312,
    isFeatured: true,
    rawMaterials: [
      {
        id: 'rm-vonoprazan-moa',
        name: 'VONOPRAZAN 20 MG — ADVANCED P-CAB MODE OF ACTION',
        botanicalName: 'Vonoprazan 20 mg Scored Film-Coated Tablet',
        keyBenefits: [
          'NOVAMIRAGE 20MG Binds Competitively & Reversibly: It binds directly to potassium ions (K+) on the H+/K+-ATPase enzyme system, blocking acid secretion immediately.',
          'NOVAMIRAGE 20MG Does Not Require Acid Activation: NOVAMIRAGE 20MG is inherently stable in acidic environments. It concentrates up to 100,000-fold inside the secretory canaliculi of parietal cells, working whether the pump is actively secreting or at rest.',
          'NOVAMIRAGE 20MG is Food Independent: Can be administered with or without food, significantly increasing patient compliance.',
        ],
        mechanism:
          'Proton Pump (H+/K+-ATPase) is rapid blocking mechanism. NOVAMIRAGE 20MG is Advanced Potassium - Competitive Acid Blocker (P-CAB) engineered for rapid, sustained, and predictable control of acid-related disorders.',
      },
      {
        id: 'rm-vonoprazan-whyrx',
        name: 'WHY RX NOVAMIRAGE 20MG ? (MOVING BEYOND CONVENTIONAL PPIs)',
        botanicalName: 'Clinical Superiority vs. Conventional PPIs',
        keyBenefits: [
          '1: Speed of Action (First-Dose Efficacy) — NOVAMIRAGE 20MG Achieves maximum acid suppression on DAY 1, reaching full effect within hours of the very first dose.',
          "2: 24-Hour Continuous Control — NOVAMIRAGE 20MG Maintains a high gastric pH ensuring a restful night's sleep for GERD patients.",
          '3: Predictable Metabolic Profile — NOVAMIRAGE 20MG is primarily metabolized by CYP3A4. It bypasses the problematic CYP2C19 pathway, offering consistent clinical efficacy.',
          '4: Superior H. pylori Eradication — Conventional PPIs often fail due to unstable gastric PH. NOVAMIRAGE 20MG creates a powerful, sustained neutral environment, allowing amoxicillin and clarithromycin to eradicate the bacteria effectively.',
        ],
        mechanism:
          'WHY DO PPIs FALL SHORT? PPIs require 3 to 5 days to reach steady-state acid inhibition; Patients must take PPIs precisely 30–60 minutes before the first meal; The CYP2C19 Polymorphism Flaw (PPI metabolism varies wildly across patients, making clinical efficacy highly unpredictable); High rate of refractory GERD and treatment failure (PPIs often fail to control high nocturnal acid production, waking patients up with breakthrough heartburn).',
      },
    ],
    clinicalEvidences: [
      {
        id: 'ev-novamirage-1',
        journalName: 'Therapeutic Advances in Gastroenterology (PMC10268044)',
        journalLogoText: 'DOI: 10.1177/1756283X17745776',
        badgeColor: 'blue',
        year: 2018,
        paperTitle:
          'Vonoprazan fumarate, a novel potassium competitive acid blocker, in the management of gastroesophageal reflux disease: Safety and clinical evidence to date',
        doiUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10268044',
        keyFinding:
          'Publications Inc Therapeutic Advances in Gastroenterology -- January 2018; 11:1756283X17745776. DOI: 10.1177/1756283X17745776 (Licenses BY-NC 4.0).',
      },
      {
        id: 'ev-novamirage-2',
        journalName: 'Mayo Clinic Drug & Supplement Monograph',
        journalLogoText: 'DRG-20559712',
        badgeColor: 'cyan',
        paperTitle:
          'Vonoprazan (Oral Route) — Clinical Description & Pharmacology: https://www.mayoclinic.org/drugs-supplements/vonoprazan-oral-route/description/drg-20559712',
        doiUrl: 'https://www.mayoclinic.org/drugs-supplements/vonoprazan-oral-route/description/drg-20559712',
        keyFinding:
          'Official Mayo Clinic pharmacological reference for oral Vonoprazan potassium-competitive acid blocker therapy.',
      },
      {
        id: 'ev-novamirage-3',
        journalName: 'NHS Health Research Authority & JNM Journal',
        journalLogoText: 'DOI: 10.5056/jnm18029',
        badgeColor: 'green',
        paperTitle:
          'A Phase 3 Study of Vonoprazan in Patients with Erosive Esophagitis (NHS HRA) & JNM Review (doi=10.5056/jnm18029)',
        doiUrl: 'https://www.jnmjournal.org/journal/view.html?doi=10.5056/jnm18029',
        keyFinding:
          'NHS Reference: https://www.hra.nhs.uk/planning-and-improving-research/application-summaries/research-summaries/a-phase-3-study-of-vonoprazan-in-patients-with-erosive-esophagitis/',
      },
    ],
  },
];

export const MOCK_REVIEWS: CustomerReview[] = [];
