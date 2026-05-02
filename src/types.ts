export type UserRole = 'patient' | 'doctor';

export interface Reminder {
  id: string;
  text: string;
  time: string;
  completed: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  onboarded: boolean;
  // Patient specific
  age?: number;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  isSharingEnabled?: boolean;
  reminders?: Reminder[];
  // Doctor specific
  degree?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  fileURL: string;
  fileName: string;
  type: 'prescription' | 'report';
  createdAt: any; // Firestore Timestamp
}
