import { AnalysisResult } from '../types/analysis';
import { User } from '../types/user';
import {
  PurchaseGuideData,
  PurchaseScenario,
  ChecklistDocument,
  ProcedureStep,
  GovernmentPortalResource
} from '../types/guide';
import { getStateRules } from '../data/governmentPortals';
import { mockUser } from '../data/mockUser';

function extractStateFromAddress(address: string): string {
  if (!address) return 'Uttar Pradesh';
  const lower = address.toLowerCase();
  
  if (lower.includes('uttar pradesh') || lower.includes('noida') || lower.includes('lucknow') || lower.includes('kanpur') || lower.includes('ghaziabad') || lower.includes('varanasi')) {
    return 'Uttar Pradesh';
  }
  if (lower.includes('maharashtra') || lower.includes('pune') || lower.includes('mumbai') || lower.includes('thane') || lower.includes('nagpur') || lower.includes('nashik')) {
    return 'Maharashtra';
  }
  if (lower.includes('karnataka') || lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('mysuru') || lower.includes('hubballi')) {
    return 'Karnataka';
  }
  if (lower.includes('delhi') || lower.includes('new delhi') || lower.includes('dwarka') || lower.includes('saket') || lower.includes('rohini')) {
    return 'Delhi';
  }
  if (lower.includes('telangana') || lower.includes('hyderabad') || lower.includes('secunderabad') || lower.includes('gachibowli')) {
    return 'Telangana';
  }
  if (lower.includes('haryana') || lower.includes('gurgaon') || lower.includes('gurugram') || lower.includes('faridabad') || lower.includes('panchkula')) {
    return 'Haryana';
  }
  if (lower.includes('rajasthan') || lower.includes('jaipur') || lower.includes('udaipur') || lower.includes('jodhpur')) {
    return 'Rajasthan';
  }
  if (lower.includes('gujarat') || lower.includes('ahmedabad') || lower.includes('surat') || lower.includes('vadodara')) {
    return 'Gujarat';
  }
  if (lower.includes('tamil nadu') || lower.includes('chennai') || lower.includes('coimbatore') || lower.includes('madurai')) {
    return 'Tamil Nadu';
  }
  if (lower.includes('goa') || lower.includes('panaji') || lower.includes('margao')) {
    return 'Goa';
  }
  return 'Uttar Pradesh'; // standard default
}

export function generatePurchaseGuide(analysis: AnalysisResult, currentUser?: User | null): PurchaseGuideData {
  const user = currentUser || mockUser;
  const propInput = analysis.propertyInput;
  
  // 1. Determine Property Location & State
  const propertyAddress = propInput.locationDetails?.address || propInput.location || 'Selected Property Location';
  const propertyState = propInput.locationDetails?.state || extractStateFromAddress(propertyAddress);
  const propertyCity = propInput.locationDetails?.city || propInput.location.split(',')[0] || 'Selected City';
  
  // 2. Determine Buyer Location & State
  // Can come from user input work location, user preferred cities, or default
  const buyerLocationInput = propInput.monthlySalary !== undefined ? 'Uttar Pradesh' : 'Uttar Pradesh';
  const buyerState = extractStateFromAddress(buyerLocationInput);
  const buyerCity = 'Noida / Delhi NCR';
  const buyerStatus = 'Indian Resident Citizen';

  // 3. Interstate detection
  const isInterstate = buyerState.trim().toLowerCase() !== propertyState.trim().toLowerCase();
  const interstateMessage = isInterstate
    ? `Buyer is based in ${buyerState}, while the property is located in ${propertyState}. Property purchase, stamp duty, registration procedures, and revenue records vary by state. Additional verification applies for cross-state title execution and land classification.`
    : undefined;

  // 4. Property Type & Agricultural classification
  const propertyType = propInput.type || 'flat';
  const propertyTypeLabels: Record<string, string> = {
    flat: 'Apartment / Flat',
    house: 'Independent House / Villa',
    land: 'Plot / Land Parcel',
    commercial: 'Commercial Property'
  };
  const propertyTypeLabel = propertyTypeLabels[propertyType] || 'Residential Property';

  const isAgriculturalOrLand = propertyType === 'land';

  const scenario: PurchaseScenario = {
    buyerState,
    buyerCity,
    buyerStatus,
    propertyState,
    propertyCity,
    propertyAddress,
    propertyType,
    propertyTypeLabel,
    purchasePurpose: propInput.purpose === 'live' ? 'Primary Residence / End Use' : 'Investment / Capital Appreciation',
    isInterstate,
    interstateMessage,
    isAgriculturalOrLand,
    agriculturalWarning: isAgriculturalOrLand
      ? `Agricultural land may be subject to state-specific eligibility, transfer, land-use, or permission requirements. Verify the applicable ${propertyState} state rules before paying an advance or signing a binding agreement.`
      : undefined
  };

  // 5. State Specific Rules & Portals
  const stateRules = getStateRules(propertyState);

  // 6. Personalized Document Checklist
  const checklist: ChecklistDocument[] = [];

  // Buyer Documents
  checklist.push({
    id: 'doc_id',
    name: 'Government Photo ID Proof',
    category: 'buyer',
    categoryLabel: 'Buyer Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Aadhaar Card, Passport, or Voter ID for biometric identity verification at the Sub-Registrar office.',
    authorityOrSource: 'UIDAI / Sub-Registrar'
  });

  checklist.push({
    id: 'doc_pan',
    name: 'Permanent Account Number (PAN Card)',
    category: 'buyer',
    categoryLabel: 'Buyer Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Mandatory under Section 139A of Income Tax Act for property transactions exceeding ₹5 Lakhs and TDS deduction.',
    authorityOrSource: 'Income Tax Department'
  });

  checklist.push({
    id: 'doc_address',
    name: 'Address & Domicile Proof',
    category: 'buyer',
    categoryLabel: 'Buyer Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Utility bill, bank statement, or registered rent agreement verifying permanent and correspondence address.',
    authorityOrSource: 'Local Authority'
  });

  checklist.push({
    id: 'doc_finance',
    name: 'Bank Sanction & NOC Documents',
    category: 'buyer',
    categoryLabel: 'Buyer Documents',
    status: 'may-apply',
    statusLabel: '⚠ May Apply',
    description: 'Home loan sanction letter, tripartite agreement, and bank disbursement proof if financed through mortgage.',
    authorityOrSource: 'Lending Bank / NBFC'
  });

  // Property & Title Documents
  checklist.push({
    id: 'doc_title_deed',
    name: 'Original Title Deed & 30-Year Chain of Title',
    category: 'title',
    categoryLabel: 'Property / Title Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Parent sale deeds, gift deeds, or conveyance documents establishing unbroken ownership chain for minimum 30 years.',
    authorityOrSource: 'Sub-Registrar Office / Seller'
  });

  checklist.push({
    id: 'doc_ec',
    name: 'Encumbrance Certificate (EC Form 15 / Nil Encumbrance)',
    category: 'title',
    categoryLabel: 'Property / Title Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: `Official certificate from ${stateRules.registrationDepartmentName} confirming property is free from legal dues, mortgages, and litigation.`,
    authorityOrSource: stateRules.portals.registration?.name || 'State Registration Dept'
  });

  checklist.push({
    id: 'doc_tax_receipts',
    name: 'Updated Property Tax Receipts & No-Dues Certificate',
    category: 'title',
    categoryLabel: 'Property / Title Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Receipts from the municipal corporation or Gram Panchayat showing zero outstanding municipal/assessment taxes.',
    authorityOrSource: 'Municipal Corporation / Local Body'
  });

  checklist.push({
    id: 'doc_mutation',
    name: 'Mutation Extract / Patta / Khata Transfer Proof',
    category: 'title',
    categoryLabel: 'Property / Title Documents',
    status: 'required',
    statusLabel: '✓ Commonly Required',
    description: 'Revenue record showing the current seller as the lawful recorded owner in government land/property register.',
    authorityOrSource: stateRules.portals.landRecords?.name || 'Revenue Department'
  });

  // Building / Apartment Specific (if flat or commercial)
  if (propertyType === 'flat' || propertyType === 'commercial' || propertyType === 'house') {
    checklist.push({
      id: 'doc_rera',
      name: 'RERA Project Registration & Disclosures',
      category: 'building',
      categoryLabel: 'Building & Development Documents',
      status: 'required',
      statusLabel: '✓ Commonly Required',
      description: `RERA registration number verified on ${stateRules.reraPortalName} with sanctioned floor plans and project delivery timeline.`,
      authorityOrSource: stateRules.portals.rera?.name || 'State RERA'
    });

    checklist.push({
      id: 'doc_sanction_plan',
      name: 'Sanctioned Building Plan & Commencement Certificate (CC)',
      category: 'building',
      categoryLabel: 'Building & Development Documents',
      status: 'required',
      statusLabel: '✓ Commonly Required',
      description: 'Building permit approval from Town & Country Planning or Municipal Authority validating structural legality.',
      authorityOrSource: 'Development Authority'
    });

    checklist.push({
      id: 'doc_oc',
      name: 'Occupancy Certificate (OC) / Completion Certificate (CC)',
      category: 'building',
      categoryLabel: 'Building & Development Documents',
      status: 'required',
      statusLabel: '✓ Commonly Required',
      description: 'Mandatory certificate issued by local civic authority certifying building is safe, completed, and habitable.',
      authorityOrSource: 'Municipal Corporation'
    });

    checklist.push({
      id: 'doc_society_noc',
      name: 'Society / Builder No-Objection Certificate (NOC)',
      category: 'building',
      categoryLabel: 'Building & Development Documents',
      status: 'may-apply',
      statusLabel: '⚠ May Apply',
      description: 'NOC from Resident Welfare Association (RWA) or Apartment Owners Association confirming maintenance clearance.',
      authorityOrSource: 'Housing Society / RWA'
    });
  }

  // Land Specific Documents
  if (isAgriculturalOrLand) {
    checklist.push({
      id: 'doc_land_ror',
      name: 'Computerized Land RoR (7/12, Khasra-Khatauni, Patta, or Jamabandi)',
      category: 'land',
      categoryLabel: 'Land & Revenue Documents',
      status: 'required',
      statusLabel: '✓ Commonly Required',
      description: `Official revenue extract from ${stateRules.landRecordsPortalName} detailing land parcel survey number, area, and ownership rights.`,
      authorityOrSource: stateRules.portals.landRecords?.name || 'Tehsildar / Revenue Authority'
    });

    checklist.push({
      id: 'doc_na_order',
      name: 'Non-Agricultural (NA / CLU) Conversion Order',
      category: 'land',
      categoryLabel: 'Land & Revenue Documents',
      status: 'verify',
      statusLabel: 'ℹ Verify with Authority',
      description: 'District Collector or Town Planning order permitting non-agricultural residential/commercial use of land.',
      authorityOrSource: 'District Collector / Sub-Divisional Magistrate'
    });

    checklist.push({
      id: 'doc_demarcation',
      name: 'Survey Map & Demarcation / Tatkal Boundary Report',
      category: 'land',
      categoryLabel: 'Land & Revenue Documents',
      status: 'verify',
      statusLabel: 'ℹ Verify with Authority',
      description: 'Official survey map prepared by Revenue Inspector / Taluk Surveyor showing physical boundary coordinates.',
      authorityOrSource: 'Directorate of Land Records'
    });

    checklist.push({
      id: 'doc_ceiling_noc',
      name: 'Land Ceiling & Tenancy Clearance (Section 89/Section 63 NOC)',
      category: 'land',
      categoryLabel: 'Land & Revenue Documents',
      status: 'verify',
      statusLabel: 'ℹ Verify with Authority',
      description: 'Clearance under state agricultural land reforms act if purchaser does not hold registered agricultural status.',
      authorityOrSource: 'Revenue Department'
    });
  }

  // 7. Step-by-Step Procedure Timeline
  const timeline: ProcedureStep[] = [
    {
      stepNumber: '01',
      title: 'Legal Title Due Diligence',
      summary: 'Inspect the 30-year chain of title and verify that the seller has absolute, clear, and marketable title.',
      details: [
        'Engage an independent property advocate to conduct a title search at the local Sub-Registrar Office.',
        'Trace parent title documents and verify original deeds against physical municipal records.'
      ],
      keyDocuments: ['Title Deed', 'Chain of Title Deeds', 'Property Tax Receipts'],
      officialSourceType: 'registration'
    },
    {
      stepNumber: '02',
      title: 'RERA & Developer / Seller Verification',
      summary: `Verify project credentials on ${stateRules.reraPortalName} and ensure seller identity authenticity.`,
      details: [
        'Search the project RERA registration number to check approved layout, delivery date, and litigation disclosures.',
        'Verify PAN and Aadhaar identity details of seller or power-of-attorney holder.'
      ],
      keyDocuments: ['RERA Certificate', 'Sanctioned Layout Plan', 'Seller ID Proof'],
      officialSourceType: 'rera'
    },
    {
      stepNumber: '03',
      title: 'Encumbrance Certificate (EC) Search',
      summary: `Obtain official Nil Encumbrance Certificate for 15–30 years from ${stateRules.registrationDepartmentName}.`,
      details: [
        'Ensure the property is free from bank hypothecation, mortgage attachments, court stays, or family partitions.',
        'Verify online index records via the state registration portal.'
      ],
      keyDocuments: ['Encumbrance Certificate (Form 15/16)', 'Registered Search Report'],
      officialSourceType: 'registration'
    },
    {
      stepNumber: '04',
      title: 'Land & Revenue Record Verification',
      summary: `Inspect digitized land records on ${stateRules.landRecordsPortalName} to confirm mutation status.`,
      details: [
        'Check survey number, parcel demarcation, and recorded landowner names on the state revenue portal.',
        isAgriculturalOrLand
          ? 'Verify CLU / NA conversion order and check if the land is non-transferable government/tribal land.'
          : 'Confirm that municipal property identification number (Khata / Property Card) matches registry records.'
      ],
      keyDocuments: ['7/12 Extract / Khasra-Khatauni', 'Mutation Extract', 'Land Map'],
      officialSourceType: 'land_records'
    },
    {
      stepNumber: '05',
      title: 'Municipal Approvals & OC/CC Compliance',
      summary: 'Verify building sanction plan, Commencement Certificate (CC), and Occupancy Certificate (OC).',
      details: [
        'Check building height, setback clearances, and fire NOC approvals from the local municipal corporation.',
        'Do not take possession without a valid Occupancy Certificate (OC) issued by the local authority.'
      ],
      keyDocuments: ['Occupancy Certificate (OC)', 'Commencement Certificate', 'Fire & Environmental NOCs'],
      officialSourceType: 'general'
    },
    {
      stepNumber: '06',
      title: 'State-Specific Eligibility & Cross-Border Check',
      summary: `Comply with state-specific legal norms in ${propertyState}${isInterstate ? ' for interstate buyers' : ''}.`,
      details: [
        isInterstate
          ? `Review ${propertyState} state transfer norms. Indian citizens can buy non-agricultural properties freely across state lines.`
          : 'Verify local municipal zone regulations and master plan development guidelines.',
        isAgriculturalOrLand
          ? `Review ${propertyState} tenancy and agricultural land transfer acts to confirm eligibility.`
          : 'Check local municipal guideline/circle rate classifications for accurate valuation.'
      ],
      keyDocuments: ['State Zone Certificate', 'Interstate ID & Domicile', 'Land Use Permission'],
      officialSourceType: 'general'
    },
    {
      stepNumber: '07',
      title: 'Agreement to Sell & Sale Deed Drafting',
      summary: 'Draft a comprehensive Agreement to Sell and Sale Deed with standard indemnities and payment milestones.',
      details: [
        'Clearly define schedule of property, car parking allotment, payment schedule, and default penalty clauses.',
        'Include indemnity clause protecting buyer against pre-existing title claims or third-party liabilities.'
      ],
      keyDocuments: ['Agreement to Sell', 'Draft Sale Deed', 'Payment Receipts'],
      officialSourceType: 'general'
    },
    {
      stepNumber: '08',
      title: 'Stamp Duty & Registration Fee Payment',
      summary: `Calculate stamp duty based on ${propertyState} circle rates and purchase verified e-Stamp paper.`,
      details: [
        'Pay stamp duty online through authorized e-Stamping portal (SHCIL / State Treasury).',
        'Verify stamp duty concessions if buying in the name of a female family member where applicable by state policy.'
      ],
      keyDocuments: ['e-Stamp Certificate', 'e-Challan Registration Fee Receipt'],
      officialSourceType: 'stamp_duty'
    },
    {
      stepNumber: '09',
      title: 'Biometric Registration at Sub-Registrar Office',
      summary: 'Book an appointment slot, execute the Sale Deed before the Sub-Registrar, and complete biometric capture.',
      details: [
        'Both buyer and seller (or authorized POAs) must appear with two independent witnesses with ID proofs.',
        'Complete biometric thumb impression, digital photo capture, and receive registered document acknowledgment receipt.'
      ],
      keyDocuments: ['Original Sale Deed', 'Buyer & Seller IDs', 'Witness IDs', 'Registration Challan'],
      officialSourceType: 'registration'
    },
    {
      stepNumber: '10',
      title: 'Post-Registration Mutation & Khata Transfer',
      summary: 'Apply for revenue mutation and municipal Khata transfer to reflect new ownership in government records.',
      details: [
        'Submit registered deed copy to local municipal office / Tehsildar to update property tax ledger in your name.',
        'Obtain updated mutation certificate and update electricity/water meter connections.'
      ],
      keyDocuments: ['Registered Sale Deed Copy', 'Mutation Application', 'Updated Property Tax Challan'],
      officialSourceType: 'land_records'
    }
  ];

  // 8. Official Government Portals List
  const officialPortals: GovernmentPortalResource[] = [];
  if (stateRules.portals.registration) officialPortals.push(stateRules.portals.registration);
  if (stateRules.portals.landRecords) officialPortals.push(stateRules.portals.landRecords);
  if (stateRules.portals.rera) officialPortals.push(stateRules.portals.rera);
  if (stateRules.portals.stampDuty) officialPortals.push(stateRules.portals.stampDuty);

  // 9. Informational Disclaimer
  const disclaimer =
    'Government procedures and property laws can vary by state, property type, and transaction. Property X provides guidance based on available official information and does not replace professional legal advice. Verify requirements with the relevant government authority before completing a transaction.';

  return {
    scenario,
    stateRules,
    checklist,
    timeline,
    officialPortals,
    disclaimer
  };
}
