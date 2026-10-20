export interface ColdChainDepot {
  id: string;
  code: string;
  location: string;
  region: string;
  currentTempCelsius: number;
  targetMinCelsius: number;
  targetMaxCelsius: number;
  humidityPercent: number;
  status: 'optimal' | 'warning' | 'critical';
  activeBatches: number;
  powerSource: 'Grid Primary' | 'Dual Redundant UPS' | 'Cryo-Generator Backup';
  lastCalibrationDate: string;
  gpsCoordinates: { lat: number; lng: number };
  hourlyReadings: number[];
}

export interface DepotBatch {
  id: string;
  batchNumber: string;
  depotId: string;
  depotCode: string;
  productName: string;
  packSize: string;
  unitsCount: number;
  quarantineStatus: 'Released' | 'Quarantine Lock' | 'In Inspection';
  arrivalDate: string;
  expiryDate: string;
}

export interface GxPAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'Super Admin' | 'Medical Director' | 'QA & GxP Lead' | 'Catalog Manager';
  action: string;
  module: 'Formulations' | 'Cold-Chain' | 'HCP Credentialing' | 'Pharmacovigilance' | 'B2B Licensing' | 'Security & RBAC';
  entityId: string;
  regulation: 'FDA 21 CFR Part 11' | 'EDA GxP' | 'EU GMP Annex 11' | 'WHO TRS 961';
  ipAddress: string;
  sha256Hash: string;
  severity: 'info' | 'warning' | 'critical';
  diffSummary: string;
  payloadBefore?: string;
  payloadAfter?: string;
}

export interface HCPApplication {
  id: string;
  fullName: string;
  title: string;
  specialty: string;
  syndicateLicenseNumber: string;
  institution: string;
  governorate: string;
  email: string;
  phone: string;
  submittedAt: string;
  status: 'Pending Review' | 'Verified' | 'Flagged' | 'More Info Requested';
  requestedPortals: string[];
  verificationNotes: string;
}

export interface AdverseEventReport {
  id: string;
  caseNumber: string;
  reportedAt: string;
  productName: string;
  batchNumber: string;
  patientInitials: string;
  patientAge: number;
  patientSex: 'M' | 'F';
  meddraPreferredTerm: string;
  reactionSummary: string;
  seriousness: 'Critical - Expedited 15-Day' | 'Serious - Hospitalization' | 'Non-Serious';
  causalityAssessment: 'Certain' | 'Probable' | 'Possible' | 'Unlikely';
  reporterType: 'Physician' | 'Pharmacist' | 'Patient';
  reporterContact: string;
  status: 'Open Triage' | 'Under Medical Review' | 'CIOMS Submitted' | 'Closed';
}

export interface B2BAllianceInquiry {
  id: string;
  referenceCode: string;
  companyName: string;
  country: string;
  archetype: 'Commercial Distribution' | 'Contract Manufacturing (CMO)' | 'In-Licensing' | 'Hospital Tender';
  contactName: string;
  contactRole: string;
  contactEmail: string;
  targetProducts: string[];
  estimatedAnnualValueUSD: string;
  ndaStatus: 'Signed' | 'Pending Signature' | 'Under Legal Review';
  stage: 'Discovery' | 'Dossier Shared' | 'Term Sheet Negotiation' | 'Contract Executed';
  submittedDate: string;
  dossiersDownloaded: number;
}

export interface SubscriberRecord {
  id: string;
  email: string;
  fullName: string;
  role: 'Physician' | 'Pharmacist' | 'Pediatrician' | 'Patient' | 'Institutional Investor';
  specialtyOrInterest: string;
  governorate: string;
  subscribedAt: string;
  status: 'Active' | 'Unsubscribed' | 'Bounced';
  openRatePercent: number;
}

export interface CampaignDispatch {
  id: string;
  subject: string;
  audienceSegment: string;
  sentAt: string;
  recipientsCount: number;
  openRate: string;
  clickRate: string;
  status: 'Dispatched' | 'Scheduled' | 'Draft';
}

export interface RBACRoleDefinition {
  id: string;
  roleName: 'Super Admin' | 'Medical Director' | 'QA & GxP Lead' | 'Catalog Manager';
  description: string;
  activeUsersCount: number;
  clearanceLevel: string;
  permissions: {
    module: string;
    read: boolean;
    write: boolean;
    approve: boolean;
    export: boolean;
  }[];
}

export const MOCK_COLD_CHAIN_DEPOTS: ColdChainDepot[] = [
  {
    id: 'depot-cai-01',
    code: 'CAI-CRYO-01',
    location: 'Cairo Central Cryo-Depot (Fifth Settlement)',
    region: 'Greater Cairo',
    currentTempCelsius: 4.2,
    targetMinCelsius: 2.0,
    targetMaxCelsius: 8.0,
    humidityPercent: 44,
    status: 'optimal',
    activeBatches: 48,
    powerSource: 'Grid Primary',
    lastCalibrationDate: '2026-09-28',
    gpsCoordinates: { lat: 30.0074, lng: 31.4913 },
    hourlyReadings: [4.1, 4.2, 4.3, 4.2, 4.1, 4.0, 4.2, 4.4, 4.3, 4.2, 4.1, 4.2],
  },
  {
    id: 'depot-alx-02',
    code: 'ALX-PORT-02',
    location: 'Alexandria Coastal Distribution Center (Borg El Arab)',
    region: 'Mediterranean Coast',
    currentTempCelsius: 4.8,
    targetMinCelsius: 2.0,
    targetMaxCelsius: 8.0,
    humidityPercent: 51,
    status: 'optimal',
    activeBatches: 26,
    powerSource: 'Grid Primary',
    lastCalibrationDate: '2026-10-02',
    gpsCoordinates: { lat: 30.8965, lng: 29.5801 },
    hourlyReadings: [4.6, 4.7, 4.8, 4.9, 5.0, 4.8, 4.7, 4.8, 4.9, 4.8, 4.7, 4.8],
  },
  {
    id: 'depot-giz-03',
    code: 'GIZ-MED-03',
    location: 'Giza Medical Logistics Hub (6th of October Industrial Zone)',
    region: 'Giza / West Cairo',
    currentTempCelsius: 5.1,
    targetMinCelsius: 2.0,
    targetMaxCelsius: 8.0,
    humidityPercent: 42,
    status: 'optimal',
    activeBatches: 34,
    powerSource: 'Dual Redundant UPS',
    lastCalibrationDate: '2026-10-09',
    gpsCoordinates: { lat: 29.9527, lng: 30.9219 },
    hourlyReadings: [4.9, 5.0, 5.1, 5.3, 5.2, 5.1, 5.0, 5.2, 5.1, 5.0, 5.1, 5.1],
  },
  {
    id: 'depot-asy-04',
    code: 'ASY-TRN-04',
    location: 'Upper Egypt Regional Transit Carrier (Asyut)',
    region: 'Upper Egypt',
    currentTempCelsius: 6.8,
    targetMinCelsius: 2.0,
    targetMaxCelsius: 8.0,
    humidityPercent: 38,
    status: 'warning',
    activeBatches: 18,
    powerSource: 'Dual Redundant UPS',
    lastCalibrationDate: '2026-09-19',
    gpsCoordinates: { lat: 27.1783, lng: 31.1859 },
    hourlyReadings: [5.4, 5.6, 5.9, 6.1, 6.4, 6.7, 6.9, 6.8, 6.7, 6.8, 6.9, 6.8],
  },
];

export const MOCK_DEPOT_BATCHES: DepotBatch[] = [
  {
    id: 'dbatch-01',
    batchNumber: 'BATCH-FB-2026-019',
    depotId: 'depot-cai-01',
    depotCode: 'CAI-CRYO-01',
    productName: 'Folate B12 (Active Methylfolate)',
    packSize: '30 capsules',
    unitsCount: 4200,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-14',
    expiryDate: '2028-10-31',
  },
  {
    id: 'dbatch-02',
    batchNumber: 'BATCH-IN-2026-084',
    depotId: 'depot-cai-01',
    depotCode: 'CAI-CRYO-01',
    productName: 'Inositol (Myo/D-Chiro 40:1)',
    packSize: '60 capsules',
    unitsCount: 2800,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-12',
    expiryDate: '2028-09-30',
  },
  {
    id: 'dbatch-03',
    batchNumber: 'BATCH-ME-2026-102',
    depotId: 'depot-alx-02',
    depotCode: 'ALX-PORT-02',
    productName: 'Man Edge (Performance & Vitality)',
    packSize: '30 capsules',
    unitsCount: 3500,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-15',
    expiryDate: '2028-11-15',
  },
  {
    id: 'dbatch-04',
    batchNumber: 'BATCH-GP-2026-041',
    depotId: 'depot-giz-03',
    depotCode: 'GIZ-MED-03',
    productName: 'Galacto-Pure (Lactation Support)',
    packSize: '30 sachets',
    unitsCount: 1900,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-17',
    expiryDate: '2028-08-31',
  },
  {
    id: 'dbatch-05',
    batchNumber: 'BATCH-VK-2026-051',
    depotId: 'depot-asy-04',
    depotCode: 'ASY-TRN-04',
    productName: 'VitaKids & Propolis',
    packSize: '200 ml syrup',
    unitsCount: 2400,
    quarantineStatus: 'In Inspection',
    arrivalDate: '2026-10-18',
    expiryDate: '2027-10-31',
  },
  {
    id: 'dbatch-06',
    batchNumber: 'BATCH-SYM-2026-012',
    depotId: 'depot-giz-03',
    depotCode: 'GIZ-MED-03',
    productName: 'SymPDCA (Gastrointestinal & Immunity)',
    packSize: '30 capsules',
    unitsCount: 3100,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-19',
    expiryDate: '2028-12-31',
  },
  {
    id: 'dbatch-07',
    batchNumber: 'BATCH-OG-2026-001',
    depotId: 'depot-cai-01',
    depotCode: 'CAI-CRYO-01',
    productName: 'Osteo-Guard D3 + K2',
    packSize: '60 capsules',
    unitsCount: 5000,
    quarantineStatus: 'Released',
    arrivalDate: '2026-10-20',
    expiryDate: '2028-10-31',
  },
];

export const MOCK_GXP_AUDIT_LOGS: GxPAuditLog[] = [
  {
    id: 'gxp-9928',
    timestamp: '2026-10-20 14:48:12 UTC',
    actorName: 'Dr. Tarek El Attar',
    actorRole: 'Super Admin',
    action: 'BATCH_RELEASE_SIGNED',
    module: 'Formulations',
    entityId: 'BATCH-ME-2026-108 (Man Edge 30 Caps)',
    regulation: 'EDA GxP',
    ipAddress: '197.54.112.18',
    sha256Hash: '8f9d2a4c7e1b09f34a62d81e5c7b3a91e4f0d8c2a6b19e3f',
    severity: 'info',
    diffSummary: 'Updated Batch QA release status from PENDING_ASSAY to RELEASED_FOR_DISTRIBUTION',
    payloadBefore: '{ "batchId": "BATCH-ME-2026-108", "qaStatus": "PENDING_ASSAY", "signedBy": null }',
    payloadAfter: '{ "batchId": "BATCH-ME-2026-108", "qaStatus": "RELEASED_FOR_DISTRIBUTION", "signedBy": "Dr. Tarek El Attar" }',
  },
  {
    id: 'gxp-9927',
    timestamp: '2026-10-20 13:15:04 UTC',
    actorName: 'Dr. Nadia Mansour',
    actorRole: 'Medical Director',
    action: 'HCP_CREDENTIAL_APPROVED',
    module: 'HCP Credentialing',
    entityId: 'HCP-EG-44821 (Dr. Hisham El-Khashab)',
    regulation: 'FDA 21 CFR Part 11',
    ipAddress: '197.54.112.44',
    sha256Hash: '3c7e91b4a0f82d6e5c1a49f30b8d7e2a19c6f4b0d8e3a712',
    severity: 'info',
    diffSummary: 'Verified Egyptian Medical Syndicate license #EMS-88219 and issued clinical monograph token.',
    payloadBefore: '{ "hcpId": "HCP-EG-44821", "status": "Pending Review", "accessLevel": "NONE" }',
    payloadAfter: '{ "hcpId": "HCP-EG-44821", "status": "Verified", "accessLevel": "TIER_2_PRESCRIBER" }',
  },
  {
    id: 'gxp-9926',
    timestamp: '2026-10-20 11:02:51 UTC',
    actorName: 'Eng. Karim Hassan',
    actorRole: 'QA & GxP Lead',
    action: 'THERMAL_THRESHOLD_WARNING_ACK',
    module: 'Cold-Chain',
    entityId: 'ASY-TRN-04 (Asyut Regional Carrier)',
    regulation: 'WHO TRS 961',
    ipAddress: '41.33.168.90',
    sha256Hash: 'a1d4f6b8e0c29a7f3b5d1e8c4a6f90b2d4e6c8a0f2b4d6e8',
    severity: 'warning',
    diffSummary: 'Acknowledged pre-excursion drift to +6.8°C during transit door unloading cycle.',
    payloadBefore: '{ "depot": "ASY-TRN-04", "tempC": 5.9, "alertState": "NOMINAL" }',
    payloadAfter: '{ "depot": "ASY-TRN-04", "tempC": 6.8, "alertState": "PRE_EXCURSION_ACKNOWLEDGED" }',
  },
  {
    id: 'gxp-9925',
    timestamp: '2026-10-19 18:40:19 UTC',
    actorName: 'Dr. Nadia Mansour',
    actorRole: 'Medical Director',
    action: 'CIOMS_SAFETY_TRIAGE_ESCALATED',
    module: 'Pharmacovigilance',
    entityId: 'PV-2026-0041 (Inositol 60 Caps)',
    regulation: 'EU GMP Annex 11',
    ipAddress: '197.54.112.44',
    sha256Hash: '7b2e4d9a1c6f80b3e5a7d9c1f3b5e7a9c2d4f6a8b0c2e4f6',
    severity: 'critical',
    diffSummary: 'Assigned MedDRA PT code 10028813 (Mild GI Discomfort) and logged causality assessment.',
    payloadBefore: '{ "caseId": "PV-2026-0041", "triage": "UNASSIGNED", "meddraCode": null }',
    payloadAfter: '{ "caseId": "PV-2026-0041", "triage": "Under Medical Review", "meddraCode": "10028813" }',
  },
  {
    id: 'gxp-9924',
    timestamp: '2026-10-19 15:11:30 UTC',
    actorName: 'Salma El-Shazly',
    actorRole: 'Catalog Manager',
    action: 'SMPC_MONOGRAPH_UPDATED',
    module: 'Formulations',
    entityId: 'PROD-002 (Folate B12)',
    regulation: 'EDA GxP',
    ipAddress: '197.54.118.210',
    sha256Hash: '9e1c3f5a7b9d2e4f6a8c0b2d4e6f8a1c3e5f7a9b1d3e5f7a',
    severity: 'info',
    diffSummary: 'Updated Arabic patient leaflet typography and storage instructions for Folate B12.',
    payloadBefore: '{ "product": "Folate B12", "revision": "v2.3", "storage": "Store below 30C" }',
    payloadAfter: '{ "product": "Folate B12", "revision": "v2.4", "storage": "Store below 25C in dry place" }',
  },
  {
    id: 'gxp-9923',
    timestamp: '2026-10-19 11:24:00 UTC',
    actorName: 'Eng. Karim Hassan',
    actorRole: 'QA & GxP Lead',
    action: 'THERMAL_EXCURSION_QUARANTINE_LOCKED',
    module: 'Cold-Chain',
    entityId: 'ASY-TRN-04 / BATCH-VK-2026-051',
    regulation: 'FDA 21 CFR Part 11',
    ipAddress: '41.33.168.90',
    sha256Hash: '4a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    severity: 'critical',
    diffSummary: 'Triggered thermal excursion lockout at +9.4°C. 2,400 units VitaKids locked under 21 CFR Part 11 investigation protocol.',
    payloadBefore: '{ "depot": "ASY-TRN-04", "status": "optimal", "tempC": 5.4, "quarantineLock": false }',
    payloadAfter: '{ "depot": "ASY-TRN-04", "status": "critical", "tempC": 9.4, "quarantineLock": true, "capaCase": "CAPA-2026-CRYO-091" }',
  },
  {
    id: 'gxp-9922',
    timestamp: '2026-10-18 16:05:44 UTC',
    actorName: 'Dr. Tarek El Attar',
    actorRole: 'Super Admin',
    action: 'B2B_NDA_COUNTERSIGNED',
    module: 'B2B Licensing',
    entityId: 'B2B-2026-0089 (Gulf Pharma Alliance KSA)',
    regulation: 'FDA 21 CFR Part 11',
    ipAddress: '197.54.112.18',
    sha256Hash: '5e7a9c2d4f6a8b0c2e4f67b2e4d9a1c6f80b3e5a7d9c1f3b',
    severity: 'info',
    diffSummary: 'Countersigned mutual non-disclosure agreement for GCC GCC-wide distribution of Naturals 4be formulations.',
    payloadBefore: '{ "partner": "Gulf Pharma Alliance", "ndaStatus": "Under Legal Review", "dossierAccess": false }',
    payloadAfter: '{ "partner": "Gulf Pharma Alliance", "ndaStatus": "Signed", "dossierAccess": true, "tokenIssued": true }',
  },
  {
    id: 'gxp-9921',
    timestamp: '2026-10-18 09:30:15 UTC',
    actorName: 'Salma El-Shazly',
    actorRole: 'Catalog Manager',
    action: 'FORMULATION_GS1_REGISTERED',
    module: 'Formulations',
    entityId: 'FORM-2026-007 (SymPDCA GI)',
    regulation: 'WHO TRS 961',
    ipAddress: '197.54.118.210',
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    severity: 'info',
    diffSummary: 'Registered GS1 2D DataMatrix GTIN 06223001928475 with tamper-evident serial packaging specs.',
    payloadBefore: '{ "formulation": "SymPDCA", "gtin": null, "lifecycle": "DRAFT" }',
    payloadAfter: '{ "formulation": "SymPDCA", "gtin": "06223001928475", "lifecycle": "COMMERCIAL_ACTIVE" }',
  },
];

export const MOCK_HCP_APPLICATIONS: HCPApplication[] = [
  {
    id: 'hcp-001',
    fullName: 'Dr. Hisham El-Khashab',
    title: 'Consultant of Urology & Andrology',
    specialty: 'Urology & Male Infertility',
    syndicateLicenseNumber: 'EMS-88219-CAIRO',
    institution: 'Cairo University Hospitals (Kasr Al Ainy)',
    governorate: 'Cairo',
    email: 'dr.khashab@urology-clinic.eg',
    phone: '+20 100 482 9910',
    submittedAt: '2026-10-19',
    status: 'Verified',
    requestedPortals: ['Man Edge Clinical Monograph', 'Dosing Calculator', 'Sample Request'],
    verificationNotes: 'Syndicate registration verified against EMS electronic registry.',
  },
  {
    id: 'hcp-002',
    fullName: 'Dr. Laila Abdel-Rahman',
    title: 'Professor of Obstetrics & Gynecology',
    specialty: 'Reproductive Endocrinology & PCOS',
    syndicateLicenseNumber: 'EMS-64109-ALEX',
    institution: 'Alexandria Medical Center',
    governorate: 'Alexandria',
    email: 'laila.obgyn@alexmed.org.eg',
    phone: '+20 122 910 3341',
    submittedAt: '2026-10-20',
    status: 'Pending Review',
    requestedPortals: ['Inositol 40:1 Trial Data', 'Folate B12 Maternal Dossier', 'Galacto-Pure Studies'],
    verificationNotes: 'Awaiting review of uploaded hospital faculty ID card.',
  },
  {
    id: 'hcp-003',
    fullName: 'Dr. Samir El-Gamal',
    title: 'Clinical Pharmacy Director',
    specialty: 'Clinical Nutrition & Pediatrics',
    syndicateLicenseNumber: 'EPS-33912-GIZA',
    institution: 'Dar Al Fouad Hospital',
    governorate: 'Giza',
    email: 'pharmacist.samir@daralfouad.org',
    phone: '+20 111 738 2209',
    submittedAt: '2026-10-20',
    status: 'Pending Review',
    requestedPortals: ['VitaKids Stability Profile', 'Hospital Formulary Dossier'],
    verificationNotes: 'Pharmacist Syndicate number format valid; ready for medical director sign-off.',
  },
  {
    id: 'hcp-004',
    fullName: 'Dr. Reem Adel',
    title: 'Senior Pediatrician & Neonatologist',
    specialty: 'Pediatrics & Lactation Support',
    syndicateLicenseNumber: 'EMS-91044-CAIRO',
    institution: 'Air Force Specialized Hospital',
    governorate: 'Cairo',
    email: 'reem.adel@pediatrics.org.eg',
    phone: '+20 109 551 8823',
    submittedAt: '2026-10-17',
    status: 'Verified',
    requestedPortals: ['VitaKids Monograph', 'Galacto-Pure Lactation Evidence'],
    verificationNotes: 'Full practitioner verification completed.',
  },
  {
    id: 'hcp-005',
    fullName: 'MagedFarouk_Clinic',
    title: 'General Practitioner',
    specialty: 'General Medicine',
    syndicateLicenseNumber: 'UNVERIFIED-0092',
    institution: 'Private Polyclinic',
    governorate: 'Dakahlia',
    email: 'maged.clinic99@yahoo.com',
    phone: '+20 101 002 9182',
    submittedAt: '2026-10-18',
    status: 'Flagged',
    requestedPortals: ['Full Commercial Dossier', 'Bulk Sample Request'],
    verificationNotes: 'License number mismatch with Egyptian Medical Syndicate registry. Requested official stamp.',
  },
  {
    id: 'hcp-006',
    fullName: 'Dr. Youssef El-Hawary',
    title: 'Consultant Orthopedic Surgeon',
    specialty: 'Orthopedics & Joint Health',
    syndicateLicenseNumber: 'EMS-77312-CAIRO',
    institution: 'Al Salam International Hospital',
    governorate: 'Cairo',
    email: 'youssef.ortho@alsalam.com',
    phone: '+20 100 234 5678',
    submittedAt: '2026-10-20',
    status: 'Pending Review',
    requestedPortals: ['Osteo-Guard D3+K2 Trial Dossier', 'Bone Density Protocol'],
    verificationNotes: 'Syndicate membership verified; awaiting hospital appointment confirmation.',
  },
  {
    id: 'hcp-007',
    fullName: 'Dr. Mona Rashad',
    title: 'Clinical Pharmacologist',
    specialty: 'Pharmacovigilance & Hospital Formulary',
    syndicateLicenseNumber: 'EPS-51982-ASYUT',
    institution: 'Assiut University Hospital',
    governorate: 'Asyut',
    email: 'mona.rashad@aun.edu.eg',
    phone: '+20 128 445 1190',
    submittedAt: '2026-10-16',
    status: 'More Info Requested',
    requestedPortals: ['Hospital Formulary Direct Order', 'Clinical Monograph Access'],
    verificationNotes: 'Requested scanned copy of valid 2026 Syndicate ID renewal stamp.',
  },
];

export const MOCK_ADVERSE_EVENTS: AdverseEventReport[] = [
  {
    id: 'pv-001',
    caseNumber: 'PV-2026-0041',
    reportedAt: '2026-10-19 16:20',
    productName: 'Inositol',
    batchNumber: 'BATCH-IN-2026-084',
    patientInitials: 'M.S.',
    patientAge: 29,
    patientSex: 'F',
    meddraPreferredTerm: 'Mild Transient Nausea (10028813)',
    reactionSummary: 'Patient reported mild transient nausea when taking 4 capsules on an empty stomach; resolved immediately after taking with meals.',
    seriousness: 'Non-Serious',
    causalityAssessment: 'Possible',
    reporterType: 'Physician',
    reporterContact: 'dr.laila@alexmed.org.eg',
    status: 'Under Medical Review',
  },
  {
    id: 'pv-002',
    caseNumber: 'PV-2026-0040',
    reportedAt: '2026-10-18 09:45',
    productName: 'Man Edge',
    batchNumber: 'BATCH-ME-2026-102',
    patientInitials: 'A.K.',
    patientAge: 54,
    patientSex: 'M',
    meddraPreferredTerm: 'Sinus Tachycardia / Palpitations (10033557)',
    reactionSummary: 'Patient with pre-existing hypertension consumed double the recommended serving along with high-caffeine pre-workout.',
    seriousness: 'Serious - Hospitalization',
    causalityAssessment: 'Possible',
    reporterType: 'Pharmacist',
    reporterContact: 'pharmacist.samir@el-ezaby.com',
    status: 'Open Triage',
  },
  {
    id: 'pv-003',
    caseNumber: 'PV-2026-0039',
    reportedAt: '2026-10-14 11:10',
    productName: 'VitaKids',
    batchNumber: 'BATCH-VK-2026-051',
    patientInitials: 'Y.H.',
    patientAge: 6,
    patientSex: 'M',
    meddraPreferredTerm: 'Urticaria / Mild Skin Rash (10046735)',
    reactionSummary: 'Mild localized skin rash noted 3 hours post administration; suspected sensitivity to natural berry flavoring excipient.',
    seriousness: 'Critical - Expedited 15-Day',
    causalityAssessment: 'Probable',
    reporterType: 'Physician',
    reporterContact: 'reem.adel@pediatrics.org.eg',
    status: 'CIOMS Submitted',
  },
  {
    id: 'pv-004',
    caseNumber: 'PV-2026-0038',
    reportedAt: '2026-10-10 14:05',
    productName: 'Folate B12',
    batchNumber: 'BATCH-FB-2026-019',
    patientInitials: 'N.R.',
    patientAge: 33,
    patientSex: 'F',
    meddraPreferredTerm: 'No Adverse Effect — Quality Inquiry (10000000)',
    reactionSummary: 'Caller inquired about natural speckle color variation in methylcobalamin vegetarian capsules. Confirmed within COA specification.',
    seriousness: 'Non-Serious',
    causalityAssessment: 'Unlikely',
    reporterType: 'Patient',
    reporterContact: 'nadia.r@gmail.com',
    status: 'Closed',
  },
  {
    id: 'pv-005',
    caseNumber: 'PV-2026-0037',
    reportedAt: '2026-10-08 17:30',
    productName: 'Osteo-Guard',
    batchNumber: 'BATCH-OG-2026-001',
    patientInitials: 'E.T.',
    patientAge: 62,
    patientSex: 'M',
    meddraPreferredTerm: 'Dyspepsia / Acid Reflux (10019211)',
    reactionSummary: 'Mild upper abdominal discomfort when taking capsule before breakfast without water.',
    seriousness: 'Non-Serious',
    causalityAssessment: 'Possible',
    reporterType: 'Pharmacist',
    reporterContact: 'pharmacist.samir@daralfouad.org',
    status: 'Under Medical Review',
  },
  {
    id: 'pv-006',
    caseNumber: 'PV-2026-0036',
    reportedAt: '2026-10-05 12:15',
    productName: 'Galacto-Pure',
    batchNumber: 'BATCH-GP-2026-041',
    patientInitials: 'S.M.',
    patientAge: 27,
    patientSex: 'F',
    meddraPreferredTerm: 'Flushing / Vasodilation (10016288)',
    reactionSummary: 'Brief transient facial flushing noticed 20 minutes post warm milk solution consumption; self-resolved in 45 minutes.',
    seriousness: 'Non-Serious',
    causalityAssessment: 'Probable',
    reporterType: 'Physician',
    reporterContact: 'reem.adel@pediatrics.org.eg',
    status: 'Closed',
  },
];

export const MOCK_B2B_INQUIRIES: B2BAllianceInquiry[] = [
  {
    id: 'b2b-001',
    referenceCode: 'ALN-2026-GCC-01',
    companyName: 'Al-Dawaa Medical Services Co.',
    country: 'Saudi Arabia (KSA)',
    archetype: 'Commercial Distribution',
    contactName: 'Faisal Al-Harbi',
    contactRole: 'VP of Nutraceutical Licensing',
    contactEmail: 'f.alharbi@aldawaa.com.sa',
    targetProducts: ['Man Edge', 'Inositol', 'Folate B12'],
    estimatedAnnualValueUSD: '$1,450,000',
    ndaStatus: 'Signed',
    stage: 'Term Sheet Negotiation',
    submittedDate: '2026-10-12',
    dossiersDownloaded: 14,
  },
  {
    id: 'b2b-002',
    referenceCode: 'ALN-2026-UAE-04',
    companyName: 'Aster Pharmacy Group MENA',
    country: 'United Arab Emirates (UAE)',
    archetype: 'Commercial Distribution',
    contactName: 'Dr. Vikram Mehta',
    contactRole: 'Head of Portfolio Sourcing',
    contactEmail: 'v.mehta@asterpharmacy.ae',
    targetProducts: ['VitaKids', 'Galacto-Pure', 'Inositol'],
    estimatedAnnualValueUSD: '$920,000',
    ndaStatus: 'Signed',
    stage: 'Dossier Shared',
    submittedDate: '2026-10-15',
    dossiersDownloaded: 9,
  },
  {
    id: 'b2b-003',
    referenceCode: 'ALN-2026-EGY-09',
    companyName: 'Cleopatra Hospitals Group (CHG)',
    country: 'Egypt',
    archetype: 'Hospital Tender',
    contactName: 'Dr. Amr El-Sawy',
    contactRole: 'Group Chief Procurement Officer',
    contactEmail: 'amr.elsawy@cleopatrahospitals.com',
    targetProducts: ['Folate B12', 'Inositol', 'Galacto-Pure'],
    estimatedAnnualValueUSD: '$640,000',
    ndaStatus: 'Signed',
    stage: 'Contract Executed',
    submittedDate: '2026-10-04',
    dossiersDownloaded: 22,
  },
  {
    id: 'b2b-004',
    referenceCode: 'ALN-2026-JOR-02',
    companyName: 'Amman Biotech & Pharma Logistics',
    country: 'Jordan',
    archetype: 'Contract Manufacturing (CMO)',
    contactName: 'Tariq Ziad',
    contactRole: 'Director of Business Development',
    contactEmail: 't.ziad@ammanbiotech.jo',
    targetProducts: ['Man Edge', 'VitaKids'],
    estimatedAnnualValueUSD: '$410,000',
    ndaStatus: 'Pending Signature',
    stage: 'Discovery',
    submittedDate: '2026-10-19',
    dossiersDownloaded: 2,
  },
  {
    id: 'b2b-005',
    referenceCode: 'ALN-2026-CHE-07',
    companyName: 'Helvetia Bio-Nutra AG',
    country: 'Switzerland',
    archetype: 'In-Licensing',
    contactName: 'Mathias Steiner',
    contactRole: 'VP European Business Expansion',
    contactEmail: 'steiner@helvetiabio.ch',
    targetProducts: ['Osteo-Guard', 'SymPDCA'],
    estimatedAnnualValueUSD: '$1,800,000',
    ndaStatus: 'Under Legal Review',
    stage: 'Discovery',
    submittedDate: '2026-10-18',
    dossiersDownloaded: 4,
  },
  {
    id: 'b2b-006',
    referenceCode: 'ALN-2026-KSA-03',
    companyName: 'Nahdi Medical Company',
    country: 'Saudi Arabia (KSA)',
    archetype: 'Commercial Distribution',
    contactName: 'Dr. Ziyad Al-Otaibi',
    contactRole: 'Commercial Sourcing Director',
    contactEmail: 'z.otaibi@nahdi.sa',
    targetProducts: ['Inositol', 'Man Edge', 'Galacto-Pure'],
    estimatedAnnualValueUSD: '$2,100,000',
    ndaStatus: 'Signed',
    stage: 'Term Sheet Negotiation',
    submittedDate: '2026-10-09',
    dossiersDownloaded: 18,
  },
];

export const MOCK_SUBSCRIBERS: SubscriberRecord[] = [
  {
    id: 'sub-01',
    email: 'dr.khashab@urology-clinic.eg',
    fullName: 'Dr. Hisham El-Khashab',
    role: 'Physician',
    specialtyOrInterest: 'Andrology & Men Health',
    governorate: 'Cairo',
    subscribedAt: '2026-10-12',
    status: 'Active',
    openRatePercent: 94,
  },
  {
    id: 'sub-02',
    email: 'pharmacist.samir@el-ezaby.com',
    fullName: 'Dr. Samir El-Gamal',
    role: 'Pharmacist',
    specialtyOrInterest: 'Retail Chain Formulary',
    governorate: 'Giza',
    subscribedAt: '2026-10-10',
    status: 'Active',
    openRatePercent: 88,
  },
  {
    id: 'sub-03',
    email: 'reem.adel@pediatrics.org.eg',
    fullName: 'Dr. Reem Adel',
    role: 'Pediatrician',
    specialtyOrInterest: 'Pediatric Immunity & Maternal Care',
    governorate: 'Cairo',
    subscribedAt: '2026-10-05',
    status: 'Active',
    openRatePercent: 91,
  },
  {
    id: 'sub-04',
    email: 'mona.salem@gmail.com',
    fullName: 'Mona Salem',
    role: 'Patient',
    specialtyOrInterest: 'Women Health & Wellness',
    governorate: 'Alexandria',
    subscribedAt: '2026-10-08',
    status: 'Active',
    openRatePercent: 76,
  },
  {
    id: 'sub-05',
    email: 'karim.gamal@fitness-cairo.com',
    fullName: 'Karim Gamal',
    role: 'Patient',
    specialtyOrInterest: 'Athletic Performance & Vitality',
    governorate: 'Cairo',
    subscribedAt: '2026-10-01',
    status: 'Active',
    openRatePercent: 82,
  },
  {
    id: 'sub-06',
    email: 'h.elmasry@mena-healthfund.com',
    fullName: 'Hassan El-Masry',
    role: 'Institutional Investor',
    specialtyOrInterest: 'Life Sciences ESG & B2B Growth',
    governorate: 'Cairo',
    subscribedAt: '2026-09-24',
    status: 'Active',
    openRatePercent: 96,
  },
  {
    id: 'sub-07',
    email: 'dr.mona.rashad@aun.edu.eg',
    fullName: 'Dr. Mona Rashad',
    role: 'Pharmacist',
    specialtyOrInterest: 'Hospital Formulary & Clinical Nutrition',
    governorate: 'Asyut',
    subscribedAt: '2026-10-16',
    status: 'Active',
    openRatePercent: 84,
  },
  {
    id: 'sub-08',
    email: 'tarek.patient@yahoo.com',
    fullName: 'Tarek Mahmoud',
    role: 'Patient',
    specialtyOrInterest: 'Digestive Health & Probiotics',
    governorate: 'Giza',
    subscribedAt: '2026-09-18',
    status: 'Unsubscribed',
    openRatePercent: 42,
  },
];

export const MOCK_CAMPAIGNS: CampaignDispatch[] = [
  {
    id: 'cmp-01',
    subject: 'Clinical Monograph Update: Myo & D-Chiro Inositol 40:1 Ratio in PCOS Management',
    audienceSegment: 'Physicians & OB/GYN Specialists',
    sentAt: '2026-10-15 09:00',
    recipientsCount: 482,
    openRate: '68.4%',
    clickRate: '24.1%',
    status: 'Dispatched',
  },
  {
    id: 'cmp-02',
    subject: 'Q4 Cold-Chain & GxP Serialization Bulletin for Partner Pharmacies',
    audienceSegment: 'Verified Pharmacists',
    sentAt: '2026-10-08 11:30',
    recipientsCount: 510,
    openRate: '71.2%',
    clickRate: '31.8%',
    status: 'Dispatched',
  },
  {
    id: 'cmp-03',
    subject: 'Naturals 4be Maternal & Pediatric Care Guide — Autumn 2026 Edition',
    audienceSegment: 'All Active Subscribers (1,248)',
    sentAt: '2026-10-25 10:00',
    recipientsCount: 1248,
    openRate: '—',
    clickRate: '—',
    status: 'Scheduled',
  },
];

export const MOCK_RBAC_ROLES: RBACRoleDefinition[] = [
  {
    id: 'role-super-admin',
    roleName: 'Super Admin',
    description: 'Executive unrestricted access across all clinical, supply-chain, regulatory, and security configuration modules.',
    activeUsersCount: 2,
    clearanceLevel: 'LEVEL 5 — EXECUTIVE GxP SIGNATORY',
    permissions: [
      { module: 'Formulation Catalog & Serialization', read: true, write: true, approve: true, export: true },
      { module: 'Cold-Chain Cryo-Depot Telemetry', read: true, write: true, approve: true, export: true },
      { module: '21 CFR Part 11 Audit Ledger', read: true, write: false, approve: true, export: true },
      { module: 'HCP Credentialing Queue', read: true, write: true, approve: true, export: true },
      { module: 'Pharmacovigilance ADR Triage', read: true, write: true, approve: true, export: true },
      { module: 'B2B Strategic Alliances', read: true, write: true, approve: true, export: true },
    ],
  },
  {
    id: 'role-med-director',
    roleName: 'Medical Director',
    description: 'Clinical oversight for HCP license approvals, pharmacovigilance CIOMS-I safety reporting, and scientific evidence.',
    activeUsersCount: 4,
    clearanceLevel: 'LEVEL 4 — CLINICAL & SAFETY SIGNATORY',
    permissions: [
      { module: 'Formulation Catalog & Serialization', read: true, write: true, approve: false, export: true },
      { module: 'Cold-Chain Cryo-Depot Telemetry', read: true, write: false, approve: false, export: true },
      { module: '21 CFR Part 11 Audit Ledger', read: true, write: false, approve: false, export: true },
      { module: 'HCP Credentialing Queue', read: true, write: true, approve: true, export: true },
      { module: 'Pharmacovigilance ADR Triage', read: true, write: true, approve: true, export: true },
      { module: 'B2B Strategic Alliances', read: true, write: false, approve: false, export: false },
    ],
  },
  {
    id: 'role-qa-lead',
    roleName: 'QA & GxP Lead',
    description: 'Quality assurance officer responsible for batch release, thermal excursion sign-offs, and regulatory compliance audits.',
    activeUsersCount: 6,
    clearanceLevel: 'LEVEL 4 — QUALITY & COLD-CHAIN OFFICER',
    permissions: [
      { module: 'Formulation Catalog & Serialization', read: true, write: false, approve: true, export: true },
      { module: 'Cold-Chain Cryo-Depot Telemetry', read: true, write: true, approve: true, export: true },
      { module: '21 CFR Part 11 Audit Ledger', read: true, write: false, approve: true, export: true },
      { module: 'HCP Credentialing Queue', read: true, write: false, approve: false, export: false },
      { module: 'Pharmacovigilance ADR Triage', read: true, write: true, approve: false, export: true },
      { module: 'B2B Strategic Alliances', read: false, write: false, approve: false, export: false },
    ],
  },
  {
    id: 'role-catalog-mgr',
    roleName: 'Catalog Manager',
    description: 'Manages commercial product metadata, Arabic/English patient leaflets, supplement facts, and newsletter broadcasts.',
    activeUsersCount: 5,
    clearanceLevel: 'LEVEL 2 — COMMERCIAL CONTENT OPERATOR',
    permissions: [
      { module: 'Formulation Catalog & Serialization', read: true, write: true, approve: false, export: true },
      { module: 'Cold-Chain Cryo-Depot Telemetry', read: true, write: false, approve: false, export: false },
      { module: '21 CFR Part 11 Audit Ledger', read: false, write: false, approve: false, export: false },
      { module: 'HCP Credentialing Queue', read: false, write: false, approve: false, export: false },
      { module: 'Pharmacovigilance ADR Triage', read: false, write: false, approve: false, export: false },
      { module: 'B2B Strategic Alliances', read: true, write: true, approve: false, export: true },
    ],
  },
];
