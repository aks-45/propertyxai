import { PropertyInput, NearbyPlace, Recommendation } from './property';

export interface AnalysisScores {
  overall: number;
  location: number;
  affordability: number;
  connectivity: number;
  infrastructure: number;
  environment: number;
  future: number;
  buy: number;
  rent: number;
  wait: number;
}

export interface CostEstimation {
  propertyPrice: number;
  stampDuty: number;
  registration: number;
  legalCharges: number;
  interiorCost: number;
  totalInitialCost: number;
  monthlyEMI: number;
  monthlyMaintenance: number;
  monthlyTotal: number;
  annualCost: number;
  fiveYearCost: number;
}

export interface FutureProjection {
  year: number;
  optimistic: number;
  expected: number;
  conservative: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskItem {
  id: string;
  category: string;
  level: RiskLevel;
  title: string;
  description: string;
}

export type BreakDecisionCategory = 'good' | 'warning' | 'risk' | 'assumption' | 'uncertainty';
export type Severity = 'low' | 'medium' | 'high';

export interface BreakDecisionItem {
  id: string;
  category: BreakDecisionCategory;
  title: string;
  description: string;
  severity: Severity;
}

export interface AnalysisResult {
  id: string;
  propertyInput: PropertyInput;
  scores: AnalysisScores;
  recommendation: Recommendation;
  confidence: number;
  costEstimation: CostEstimation;
  futureProjections: FutureProjection[];
  risks: RiskItem[];
  breakDecision: BreakDecisionItem[];
  nearbyPlaces: NearbyPlace[];
  reasonsForRecommendation: string[];
  potentialRisks: string[];
  createdAt: string;
}
