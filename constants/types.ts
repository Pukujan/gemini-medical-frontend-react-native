// constants/types.ts
import type { Timestamp } from 'firebase/firestore';

export interface MedicalRecordBase {
  patientName: string;
  dob: string;
  diagnosis: string[];
  provider: string;
  visitDate: string;
  summary: string;
  medications: string[];
  markdownReport?: string;
  rawText?: string;
  createdAt?: Timestamp;
  processedBy?: string;
}

export interface MedicalRecord extends MedicalRecordBase {
  id: string;
}
