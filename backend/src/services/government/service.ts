import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getStateRules } from '../../data/government-guide';

// Types for government guidance
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
  applicablePropertyTypes?: string[];
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
  propertyType: string;
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

export class GovernmentService {
  // Get government guidance for a specific purchase scenario
  async getGovernmentGuide(input: {
    buyerState: string;
    buyerCity?: string;
    buyerStatus: string;
    propertyState: string;
    propertyCity: string;
    propertyAddress: string;
    propertyType: string;
    purchasePurpose: string;
  }): Promise<PurchaseGuideData> {
    try {
      const {
        buyerState,
        buyerCity,
        buyerStatus,
        propertyState,
        propertyCity,
        propertyAddress,
        propertyType,
        purchasePurpose
      } = input;

      // Determine if this is an interstate purchase
      const isInterstate = buyerState.toUpperCase() !== propertyState.toUpperCase();

      // Determine if property is agricultural or land
      const isAgriculturalOrLand =
        propertyType.toLowerCase() === 'agricultural_land' ||
        propertyType.toLowerCase() === 'residential_land';

      // Get state-specific rules using the imported function (which mimics the frontend's logic)
      const buyerStateRules = getStateRules(buyerState);
      const propertyStateRules = getStateRules(propertyState);

      // For the guide, we primarily need the property state rules
      // but we might want to note differences if buying from another state
      const stateRules = propertyStateRules;

      // Get checklist documents based on property type and states
      const checklist = this.getChecklistDocuments(
        buyerState,
        propertyState,
        propertyType,
        purchasePurpose
      );

      // Get procedure steps
      const timeline = this.getProcedureSteps(
        buyerState,
        propertyState,
        propertyType,
        purchasePurpose,
        isInterstate
      );

      // Get official portals
      const officialPortals = this.getOfficialPortals(
        buyerState,
        propertyState
      );

      // Create the scenario
      const scenario: PurchaseScenario = {
        buyerState,
        buyerCity: buyerCity || undefined,
        buyerStatus,
        propertyState,
        propertyCity,
        propertyAddress,
        propertyType,
        propertyTypeLabel: this.getPropertyTypeLabel(propertyType),
        purchasePurpose,
        isInterstate,
        interstateMessage: isInterstate
          ? `This is an interstate purchase from ${buyerState} to ${propertyState}. Additional requirements may apply.`
          : undefined,
        isAgriculturalOrLand,
        agriculturalWarning: isAgriculturalOrLand
          ? stateRules.agriculturalLandWarning
          : undefined
      };

      // Get disclaimer
      const disclaimer = this.getDisclaimer();

      return {
        scenario,
        stateRules,
        checklist,
        timeline,
        officialPortals,
        disclaimer
      };
    } catch (error) {
      console.error('Government service error:', error);
      // Return a basic fallback response
      return this.getFallbackGovernmentGuide(input);
    }
  }

  // Get property type label
  private getPropertyTypeLabel(propertyType: string): string {
    const labels: { [key: string]: string } = {
      'apartment': 'Apartment/Flat',
      'flat': 'Apartment/Flat',
      'house': 'House/Villa',
      'residential_land': 'Residential Land',
      'agricultural_land': 'Agricultural Land',
      'commercial': 'Commercial Property',
      'other': 'Other Property Type'
    };

    return labels[propertyType.toLowerCase()] || propertyType;
  }

  // Get checklist documents
  private getChecklistDocuments(
    buyerState: string,
    propertyState: string,
    propertyType: string,
    purchasePurpose: string
  ): ChecklistDocument[] {
    // In a real implementation, this would be more complex and data-driven
    // For now, we'll return a basic set of common documents

    const documents: ChecklistDocument[] = [
      {
        id: 'doc1',
        name: 'Sale Deed',
        category: 'title',
        categoryLabel: 'Title Documents',
        status: 'required',
        statusLabel: 'Required',
        description: 'The main legal document that transfers ownership of the property from seller to buyer.',
        authorityOrSource: 'Sub-Registrar Office',
        applicablePropertyTypes: ['apartment', 'flat', 'house', 'residential_land', 'agricultural_land', 'commercial']
      },
      {
        id: 'doc2',
        name: 'Encumbrance Certificate',
        category: 'title',
        categoryLabel: 'Title Documents',
        status: 'required',
        statusLabel: 'Required',
        description: 'Certifies that the property is free from any legal or monetary liabilities such as uncleared loans or leases.',
        authorityOrSource: 'Sub-Registrar Office',
        applicablePropertyTypes: ['apartment', 'flat', 'house', 'residential_land', 'agricultural_land', 'commercial']
      },
      {
        id: 'doc3',
        name: 'Property Tax Receipts',
        category: 'building',
        categoryLabel: 'Building/Occupancy Documents',
        status: 'required',
        statusLabel: 'Required',
        description: 'Proof that all property taxes have been paid up to date.',
        authorityOrSource: 'Municipal Corporation',
        applicablePropertyTypes: ['apartment', 'flat', 'house', 'commercial']
      }
    ];

    // Add state-specific documents if needed
    // Add property-type specific documents if needed

    return documents;
  }

  // Get procedure steps
  private getProcedureSteps(
    buyerState: string,
    propertyState: string,
    propertyType: string,
    purchasePurpose: string,
    isInterstate: boolean
  ): ProcedureStep[] {
    // Basic procedure steps for property purchase
    const steps: ProcedureStep[] = [
      {
        stepNumber: '1',
        title: 'Property Verification',
        summary: 'Verify the property details, ownership, and legal status',
        details: [
          'Confirm property address and boundaries',
          'Verify seller/s ownership rights',
          'Check for any existing loans or liens on the property',
          'Verify property tax payment status'
        ],
        keyDocuments: ['Sale Deed', 'Encumbrance Certificate', 'Property Tax Receipts'],
        officialSourceType: 'registration'
      },
      {
        stepNumber: '2',
        title: 'Document Preparation',
        summary: 'Prepare all necessary documents for the transaction',
        details: [
          'Draft the sale agreement',
          'Prepare identity and address proofs for both parties',
          'Gather property-related documents',
          'Obtain No Objection Certificates (if applicable)'
        ],
        keyDocuments: ['Sale Agreement', 'Identity Proof', 'Address Proof'],
        officialSourceType: 'general'
      },
      {
        stepNumber: '3',
        title: 'Stamp Duty and Registration',
        summary: 'Pay applicable stamp duty and register the property',
        details: [
          'Calculate stamp duty based on property value and state rates',
          'Purchase stamp papers or use e-stamping',
          'Pay registration fees',
          'Visit Sub-Registrar office for document registration'
        ],
        keyDocuments: ['Sale Deed', 'Stamp Papers', 'Identity Proofs'],
        officialSourceType: 'registration'
      }
    ];

    // Add interstate-specific steps if needed
    if (isInterstate) {
      steps.splice(1, 0, {
        stepNumber: '1.5',
        title: 'Interstate Purchase Clearance',
        summary: 'Obtain necessary clearances for interstate property purchase',
        details: [
          'Check if buyer state has any restrictions on purchasing property in another state',
          'Verify if property state has any restrictions on selling property to outsiders',
          'Obtain any required permissions from relevant authorities'
        ],
        keyDocuments: ['Interstate Purchase Permission', 'No Objection Certificate'],
        officialSourceType: 'general'
      });
    }

    // Add agricultural land specific steps if needed
    if (propertyType.toLowerCase() === 'agricultural_land' ||
        propertyType.toLowerCase() === 'residential_land') {
      // Insert after property verification
      steps.splice(1, 0, {
        stepNumber: '1.5',
        title: 'Land Use Verification',
        summary: 'Verify land use permissions and conversion requirements',
        details: [
          'Check if the land is approved for residential/commercial use (if applicable)',
          'Verify if land conversion is required from agricultural to non-agricultural use',
          'Check for any ceiling limits on land holdings in the state'
        ],
        keyDocuments: ['Land Use Certificate', 'Conversion Permission (if required)'],
        officialSourceType: 'land_records'
      });
    }

    return steps;
  }

  // Get official government portals
  private getOfficialPortals(
    buyerState: string,
    propertyState: string
  ): GovernmentPortalResource[] {
    const portals: GovernmentPortalResource[] = [
      {
        category: 'registration',
        name: 'National Generic Document Registration System (NGDRS)',
        url: 'https://ngrds.in/',
        domain: 'ngrds.in',
        description: 'Generic application for registration of deeds and documents across states',
        actionLabel: 'Register Property',
        iconType: 'registration'
      },
      {
        category: 'land_records',
        name: 'Digital India Land Records Modernisation Programme (DILRMP)',
        url: 'https://dilrmp.gov.in/',
        domain: 'dilrmp.gov.in',
        description: 'Government initiative to digitize land records',
        actionLabel: 'Access Land Records',
        iconType: 'land'
      },
      {
        category: 'rera',
        name: 'Real Estate Regulatory Authority (RERA)',
        url: 'https://rera.rajasthan.gov.in/', // Example, would be state-specific
        domain: 'rera.gov.in',
        description: 'Regulatory authority for real estate sector',
        actionLabel: 'Check Project Registration',
        iconType: 'rera'
      }
    ];

    return portals;
  }

  // Get disclaimer
  private getDisclaimer(): string {
    return 'The information provided is for general guidance only. Government regulations and procedures may change. Users are advised to verify the latest requirements with the respective state authorities and consult legal experts for property transactions.';
  }

  // Get fallback government guide when data fails
  private getFallbackGovernmentGuide(input: any): PurchaseGuideData {
    return {
      scenario: {
        buyerState: input.buyerState,
        buyerCity: input.buyerCity,
        buyerStatus: input.buyerStatus,
        propertyState: input.propertyState,
        propertyCity: input.propertyCity,
        propertyAddress: input.propertyAddress,
        propertyType: input.propertyType,
        propertyTypeLabel: this.getPropertyTypeLabel(input.propertyType),
        purchasePurpose: input.purchasePurpose,
        isInterstate: input.buyerState.toUpperCase() !== input.propertyState.toUpperCase(),
        interstateMessage: undefined,
        isAgriculturalOrLand:
          input.propertyType.toLowerCase() === 'agricultural_land' ||
          input.propertyType.toLowerCase() === 'residential_land',
        agriculturalWarning: undefined
      },
      stateRules: getStateRules(input.propertyState), // Use the imported function for fallback too
      checklist: [
        {
          id: 'fallback1',
          name: 'Sale Deed',
          category: 'title',
          categoryLabel: 'Title Documents',
          status: 'required',
          statusLabel: 'Required',
          description: 'Main property ownership transfer document',
          applicablePropertyTypes: ['apartment', 'flat', 'house', 'land', 'commercial']
        }
      ],
      timeline: [
        {
          stepNumber: '1',
          title: 'Property Verification',
          summary: 'Verify property details and ownership',
          details: ['Confirm property boundaries', 'Verify seller ownership'],
          keyDocuments: ['Sale Deed'],
          officialSourceType: 'registration'
        },
        {
          stepNumber: '2',
          title: 'Document Preparation',
          summary: 'Prepare transaction documents',
          details: ['Draft sale agreement', 'Gather identity proofs'],
          keyDocuments: ['Sale Agreement'],
          officialSourceType: 'general'
        },
        {
          stepNumber: '3',
          title: 'Registration',
          summary: 'Complete property registration',
          details: ['Pay stamp duty', 'Register at Sub-Registrar office'],
          keyDocuments: ['Sale Deed', 'Stamp Papers'],
          officialSourceType: 'registration'
        }
      ],
      officialPortals: [
        {
          category: 'registration',
          name: 'State Registration Portal',
          url: '#',
          domain: 'government.gov',
          description: 'Official portal for property registration',
          actionLabel: 'Register Property',
          iconType: 'registration'
        }
      ],
      disclaimer: 'Government information not available in database. Please verify with local authorities.'
    };
  }
}