export interface Subject {
  id: string;
  name: string;
  maxScore: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  scores: Record<string, number>; // subjectId -> score
  totalScore?: number;
  percentage?: number;
  gradeLabel?: string;
  rank?: number;
  rankLabel?: string;
}

export interface SchoolSettings {
  schoolName: string;
  principalName: string;
  academicYear: string;
  logoUrl?: string; // Base64 image
}

export interface SubscriptionLimits {
  maxClasses: number;
  maxStudentsPerClass: number;
  expiryDate: string; // ISO Date string
}

export interface User {
  username: string;
  password?: string; // In a real app, this should be hashed. Here simple storage.
  role: 'admin' | 'user';
  limits: SubscriptionLimits;
  isActive: boolean;
  schoolName?: string;
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  ENTRY = 'ENTRY',
  RESULTS = 'RESULTS',
  SETTINGS = 'SETTINGS',
  ADMIN = 'ADMIN', // New tab for developer
}