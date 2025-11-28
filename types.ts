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
  gradeLabel?: string; // New field for Grade (Excellent, Very Good, etc.)
  rank?: number;
  rankLabel?: string;
}

export interface SchoolSettings {
  schoolName: string;
  principalName: string;
  academicYear: string;
  logoUrl?: string; // Base64 image
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  ENTRY = 'ENTRY',
  RESULTS = 'RESULTS',
  SETTINGS = 'SETTINGS',
}