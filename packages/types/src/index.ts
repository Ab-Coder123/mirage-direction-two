export interface ClinicalTrial {
  id: string;
  code: string; // e.g. "MRG-701"
  moleculeName: string; // e.g. "Mirage-Targeted Polypeptide Alpha"
  therapeuticArea: 'Oncology' | 'Cardiology' | 'Neurology' | 'Immunology' | 'Rare Diseases';
  indication: string;
  phase: 'Discovery' | 'Pre-clinical' | 'Phase I' | 'Phase II' | 'Phase III' | 'FDA / EMA Review';
  progressPercentage: number;
  mechanismOfAction: string;
  leadInvestigator: string;
  status: 'Recruiting' | 'Active' | 'Completed' | 'Regulatory Submission';
}

export interface TelemetryMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  status: 'optimal' | 'warning' | 'nominal';
  change24h?: string;
}

export interface ColdChainLog {
  sensorId: string;
  batchNumber: string;
  currentTempCelsius: number;
  targetTempRange: [number, number];
  location: string;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
  status: 'In-Spec' | 'Excursion-Alert';
}

export type TherapeuticCategory =
  | 'Oncology'
  | 'Cardiology'
  | 'Immunology'
  | 'Rare Diseases'
  | 'Preventative Longevity';

export interface PipelineMolecule {
  id: string;
  code: string;
  name: string;
  category: 'Oncology' | 'Cardiology' | 'Immunology' | 'Rare Diseases';
  mechanism: string;
  indication: string;
  currentPhase: 'Phase I' | 'Phase II' | 'Phase III' | 'Commercial';
  progress: number; // 25, 50, 75, 100
  regulatory: string;
  leadInvestigator: string;
  cohortSize: string;
  primaryEndpoint: string;
  trialId?: string;
  targetReceptor?: string;
}

export interface CommercialProduct {
  id: string;
  name: string;
  genericName: string;
  category: 'Oncology' | 'Cardiology' | 'Immunology' | 'Preventative Longevity';
  atcCode: string;
  type: 'Rx' | 'OTC';
  dosage: string;
  storageCondition: '-80°C Cryo' | '+2°C to +8°C Cold-Chain' | 'Controlled Room Temp';
  description: string;
  smpcFileName: string;
  packSize?: string;
  gtin?: string;
}
