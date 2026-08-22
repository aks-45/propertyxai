import { PropertyType } from './property';

export type DocumentRequirementStatus = 'required' | 'may-apply' | 'verify';

export interface ChecklistDocument {
  id: string;
  name: string;
  category: 'buyer' | 'title' | 'building' | 'land';
  categoryLabel: string;
  status: DocumentRequirementStatus;
  statusLabel: string;
  description: string;
  authorityOrSource?: string;
  applicablePropertyTypes?: PropertyType[];
}

export interface ProcedureStep {
  stepNumber: string;
  title: string;
  summary: string;
  details: string[];
  keyDocuments: string[];
  officialSourceType?: 'registration' | 'land_records' | 'rera' | 'stamp_duty' | 'general';
}

export interface GovernmentPortalResource {
  category: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  actionLabel: string;
  iconType: 'registration' | 'land' | 'rera' | 'tax' | 'general';
}

export interface StateSpecificRules {
  stateKey: string;
  stateName: string;
  registrationDepartmentName: string;
  landRecordsPortalName: string;
  reraPortalName: string;
  stampDutyPortalName: string;
  agriculturalLandWarning?: string;
  interstateNotice?: string;
  specialNotes?: string[];
  portals: {
    registration?: GovernmentPortalResource;
    landRecords?: GovernmentPortalResource;
    rera?: GovernmentPortalResource;
    stampDuty?: GovernmentPortalResource;
  };
}

export interface PurchaseScenario {
  buyerState: string;
  buyerCity?: string;
  buyerStatus: string;
  propertyState: string;
  propertyCity: string;
  propertyAddress: string;
  propertyType: PropertyType;
  propertyTypeLabel: string;
  purchasePurpose: string;
  isInterstate: boolean;
  interstateMessage?: string;
  isAgriculturalOrLand: boolean;
  agriculturalWarning?: string;
}

export interface PurchaseGuideData {
  scenario: PurchaseScenario;
  stateRules: StateSpecificRules;
  checklist: ChecklistDocument[];
  timeline: ProcedureStep[];
  officialPortals: GovernmentPortalResource[];
  disclaimer: string;
}
