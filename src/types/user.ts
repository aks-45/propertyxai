import { PropertyType, Recommendation } from './property';

export interface UserPreferences {
  preferredCities: string[];
  budgetRange: { min: number; max: number };
  propertyTypes: PropertyType[];
  notificationsEnabled: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  createdAt: string;
}

export interface SavedReport {
  id: string;
  analysisId: string;
  propertyName: string;
  location: string;
  price: number;
  score: number;
  recommendation: Recommendation;
  savedAt: string;
}
