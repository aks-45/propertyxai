import { StateSpecificRules, GovernmentPortalResource } from '../types/guide';

export const STATE_PORTALS_DATABASE: Record<string, StateSpecificRules> = {
  'uttar pradesh': {
    stateKey: 'uttar pradesh',
    stateName: 'Uttar Pradesh',
    registrationDepartmentName: 'Stamp and Registration Department (IGRS UP)',
    landRecordsPortalName: 'UP Bhulekh / Revenue Council',
    reraPortalName: 'Uttar Pradesh Real Estate Regulatory Authority (UP RERA)',
    stampDutyPortalName: 'IGRS UP Stamp & Registration Portal',
    agriculturalLandWarning:
      'In Uttar Pradesh, Section 89/154 of the UP Revenue Code regulates agricultural land purchase ceilings and non-agriculturist transfers. Verification of Khasra/Khatauni in UP Bhulekh and 143/80 conversion (non-agricultural status) is mandatory before buying for non-farming purposes.',
    interstateNotice:
      'Interstate buyers from outside UP can buy residential and commercial properties without restrictions. For agricultural land, ceiling limits and Section 89 permission protocols apply.',
    specialNotes: [
      'Encumbrance Certificate (EC) can be inspected on the IGRS UP portal for registered documents post-2015.',
      'Always verify UP RERA project registration ID for under-construction residential complexes.',
      'Check Khasra / Khatauni 12-digit computerized code on UP Bhulekh.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'IGRS Uttar Pradesh',
        url: 'https://igrsup.gov.in',
        domain: 'igrsup.gov.in',
        description: 'Online deed appointment, e-stamp verification, and registered document search.',
        actionLabel: 'Visit IGRS UP Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'UP Bhulekh Portal',
        url: 'https://upbhulekh.gov.in',
        domain: 'upbhulekh.gov.in',
        description: 'Official digitized Khatauni, RoR (Record of Rights), and land parcel ownership status.',
        actionLabel: 'View UP Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'UP RERA Official Portal',
        url: 'https://www.up-rera.in',
        domain: 'up-rera.in',
        description: 'Verify builder credentials, approved layout plans, and registered phase completion dates.',
        actionLabel: 'Check UP RERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'UP Stamp Duty Calculator & Circle Rates',
        url: 'https://igrsup.gov.in/igrsup/valuationListAction',
        domain: 'igrsup.gov.in',
        description: 'District and tehsil-wise circle rates, stamp duty slabs (with rebate for women buyers).',
        actionLabel: 'View UP Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'maharashtra': {
    stateKey: 'maharashtra',
    stateName: 'Maharashtra',
    registrationDepartmentName: 'Inspector General of Registration & Controller of Stamps (IGR Maharashtra)',
    landRecordsPortalName: 'MahaBhulekh (7/12 & 8A Records)',
    reraPortalName: 'Maharashtra Real Estate Regulatory Authority (MahaRERA)',
    stampDutyPortalName: 'IGR Maharashtra e-Stepin & e-ASR Portal',
    agriculturalLandWarning:
      'Under the Maharashtra Tenancy and Agricultural Lands Act (MTAL), only a certified agriculturist is permitted to purchase agricultural land. For non-agricultural use, verified NA (Non-Agricultural) order under Section 44 of the Maharashtra Land Revenue Code is essential.',
    interstateNotice:
      'Residential and commercial apartments in Mumbai, Pune, and Thane are freely purchasable by interstate buyers. However, agricultural land transactions strictly require proof of agricultural status.',
    specialNotes: [
      'e-Search on IGR Maharashtra allows 30-year online title search of registered documents.',
      'Check MahaRERA for QPR (Quarterly Progress Reports) and registered bank escrow accounts.',
      'Verify digital signed 7/12 (Saat-Baara) extract with QR code from Mahabhumi.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'IGR Maharashtra',
        url: 'https://igrmaharashtra.gov.in',
        domain: 'igrmaharashtra.gov.in',
        description: 'e-Registration, document search, e-Stepin appointment, and index II extract.',
        actionLabel: 'Visit IGR Maharashtra',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'MahaBhulekh (Mahabhumi)',
        url: 'https://bhulekh.mahabhumi.gov.in',
        domain: 'bhulekh.mahabhumi.gov.in',
        description: 'Official 7/12 (Saat-Baara), 8A land revenue extract, and Property Card search.',
        actionLabel: 'View 7/12 Extract',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'MahaRERA Official Portal',
        url: 'https://maharera.maharashtra.gov.in',
        domain: 'maharera.maharashtra.gov.in',
        description: 'Check builder registration, litigation disclosures, and building sanctioned plans.',
        actionLabel: 'Check MahaRERA Details',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'e-ASR (Annual Statement of Rates)',
        url: 'https://igrmaharashtra.gov.in/eASR',
        domain: 'igrmaharashtra.gov.in',
        description: 'Official Ready Reckoner rates, stamp duty calculator, and local metro cess applicability.',
        actionLabel: 'Check Ready Reckoner Rates',
        iconType: 'tax'
      }
    }
  },

  'karnataka': {
    stateKey: 'karnataka',
    stateName: 'Karnataka',
    registrationDepartmentName: 'Department of Stamps and Registration (Kaveri Online Services)',
    landRecordsPortalName: 'Bhoomi Karnataka Land Records & Dishaank',
    reraPortalName: 'Karnataka Real Estate Regulatory Authority (K-RERA)',
    stampDutyPortalName: 'Kaveri Online Valuation & Stamp Calculator',
    agriculturalLandWarning:
      'Following amendments to the Karnataka Land Reforms Act (Sections 79A & 79B repealed), non-agriculturists can now buy agricultural land, but ceiling restrictions under Section 63 and A-Khata/B-Khata municipal classifications still strictly apply for residential layouts.',
    interstateNotice:
      'Interstate buyers can register flats and houses via Kaveri 2.0. Ensure BBMP/BDA A-Khata validation for Bangalore urban properties to prevent unauthorized B-Khata layout disputes.',
    specialNotes: [
      'Always obtain Encumbrance Certificate (EC Form 15) for minimum 15 to 30 years via Kaveri Online.',
      'Check BDA / BMRDA layout approval and RERA registration before buying plotted developments.',
      'Verify RTC (Record of Rights, Tenancy and Crops) and Mutation Extract via Bhoomi portal.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Kaveri Online Services 2.0',
        url: 'https://kaverionline.karnataka.gov.in',
        domain: 'kaverionline.karnataka.gov.in',
        description: 'Online Encumbrance Certificate (EC), certified copy, and digital deed registration.',
        actionLabel: 'Visit Kaveri 2.0 Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Bhoomi Karnataka Land Records',
        url: 'https://bhoomi.karnataka.gov.in',
        domain: 'bhoomi.karnataka.gov.in',
        description: 'Official RTC, Mutation Status, Revenue Maps, and Dispute Case Reports.',
        actionLabel: 'View Bhoomi RTC Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Karnataka RERA Portal',
        url: 'https://rera.karnataka.gov.in',
        domain: 'rera.karnataka.gov.in',
        description: 'Search approved real estate projects, promoter complaints, and project timeline audits.',
        actionLabel: 'Check Karnataka RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Kaveri Guidance Value Calculator',
        url: 'https://kaverionline.karnataka.gov.in/GuidanceValue/GuidanceValue',
        domain: 'kaverionline.karnataka.gov.in',
        description: 'State government guidance values, BBMP cess, and registration fee schedules.',
        actionLabel: 'Calculate Guidance Value',
        iconType: 'tax'
      }
    }
  },

  'delhi': {
    stateKey: 'delhi',
    stateName: 'Delhi (NCT)',
    registrationDepartmentName: 'Revenue Department, Government of NCT of Delhi (DORIS)',
    landRecordsPortalName: 'Delhi Land Records & Bhulekh DLRC',
    reraPortalName: 'Delhi Real Estate Regulatory Authority (Delhi RERA)',
    stampDutyPortalName: 'Stock Holding Corporation e-Stamping Delhi',
    agriculturalLandWarning:
      'Agricultural land in Delhi (such as rural/semi-urban belts) falls under the Delhi Land Reforms (DLR) Act, 1954. Sections 33 and 81 impose strict transfer and usage restrictions. Most transactions require DDA land pooling or Lal Dora status verification.',
    interstateNotice:
      'Interstate buyers can freely purchase DDA freeholds, builder floors, and apartments. Ensure mutation and sub-lease deed compliance with DDA/L&DO.',
    specialNotes: [
      'Sub-Registrar appointment booking is fully digitized on DORIS (doris.delhigovt.nic.in).',
      'Verify MCD / NDMC property tax mutation and No-Dues Certificate.',
      'Check chain of title for freehold vs leasehold conveyance deeds.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'DORIS Delhi (Delhi Online Registration)',
        url: 'https://doris.delhigovt.nic.in',
        domain: 'doris.delhigovt.nic.in',
        description: 'Sub-registrar appointment scheduling, e-valuation, and registered deed status.',
        actionLabel: 'Visit DORIS Delhi',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Delhi Bhulekh / DLRC',
        url: 'https://dlrc.delhigovt.nic.in',
        domain: 'dlrc.delhigovt.nic.in',
        description: 'Village-wise revenue records, Khasra Girdawari, and DLR land status.',
        actionLabel: 'View Delhi Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Delhi RERA Official',
        url: 'https://rera.delhi.gov.in',
        domain: 'rera.delhi.gov.in',
        description: 'Registration status for commercial and group housing developments in Delhi.',
        actionLabel: 'Check Delhi RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Delhi Circle Rate & e-Stamping',
        url: 'https://revenue.delhi.gov.in/revenue/circle-rates',
        domain: 'delhi.gov.in',
        description: 'Circle rates categorized from Category A (posh) to Category H, plus women concession.',
        actionLabel: 'View Delhi Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'telangana': {
    stateKey: 'telangana',
    stateName: 'Telangana',
    registrationDepartmentName: 'Registration and Stamps Department (CARD / Dharani)',
    landRecordsPortalName: 'Dharani Integrated Land Records Portal',
    reraPortalName: 'Telangana Real Estate Regulatory Authority (TS RERA)',
    stampDutyPortalName: 'Telangana Registration Market Value Search',
    agriculturalLandWarning:
      'Agricultural land in Telangana is registered and managed exclusively via the Dharani portal through Tahsildar-cum-Joint Sub-Registrar offices. Passbook (Pattadar Passbook) and Non-Prohibited Property List (Section 22A) verification is mandatory.',
    interstateNotice:
      'Interstate buyers can seamlessly purchase non-agricultural flats and commercial assets in Hyderabad/Cyberabad. Non-agricultural registrations use the CARD system.',
    specialNotes: [
      'Verify HMDA / GHMC building permission order and draft layout approvals.',
      'Check Prohibited Properties List (Section 22A) on the registration portal to avoid disputed plots.',
      'Obtain online EC (Encumbrance Certificate) from 1983 onwards on registration.telangana.gov.in.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'TS Registration & Stamps Portal',
        url: 'https://registration.telangana.gov.in',
        domain: 'registration.telangana.gov.in',
        description: 'Encumbrance search (EC), certified copies, market value assistance, and slot booking.',
        actionLabel: 'Visit TS Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Dharani Portal Telangana',
        url: 'https://dharani.telangana.gov.in',
        domain: 'dharani.telangana.gov.in',
        description: 'Unified land portal for agricultural land RoR-1B, Pahani, and mutation registry.',
        actionLabel: 'View Dharani Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'TS RERA Official Portal',
        url: 'https://rera.telangana.gov.in',
        domain: 'rera.telangana.gov.in',
        description: 'Verify project approvals and quarterly construction milestone filings.',
        actionLabel: 'Check TS RERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'TS Market Value & Stamp Slabs',
        url: 'https://registration.telangana.gov.in/unitRateMV.htm',
        domain: 'registration.telangana.gov.in',
        description: 'Door number and survey number-wise basic market values across Telangana.',
        actionLabel: 'Check TS Unit Rates',
        iconType: 'tax'
      }
    }
  },

  'haryana': {
    stateKey: 'haryana',
    stateName: 'Haryana',
    registrationDepartmentName: 'Revenue and Disaster Management Department (Jamabandi)',
    landRecordsPortalName: 'Jamabandi Land Records Portal',
    reraPortalName: 'Haryana Real Estate Regulatory Authority (HRERA Gurugram / Panchkula)',
    stampDutyPortalName: 'Jamabandi Stamp Duty & Collector Rates',
    agriculturalLandWarning:
      'In Haryana, urban areas under Section 7A of the Haryana Development and Regulation of Urban Areas Act require a No-Objection Certificate (NOC) for registering small agricultural or vacant plots to curb unauthorized colony mushrooming.',
    interstateNotice:
      'Interstate buyers can freely acquire residential and commercial properties in Gurgaon, Faridabad, and Sonipat. Ensure DTCP (Town & Country Planning) licensing compliance for plots.',
    specialNotes: [
      'Check HRERA Gurugram (haryanarera.gov.in) for registered builder towers and occupation certificates.',
      'Download Jamabandi (RoR) and Nakal online to verify ownership, mortgage, and court stay orders.',
      'Check Collector rates on jamabandi.nic.in before calculating stamp duty and registry fee.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Haryana e-Registration & Slot Booking',
        url: 'https://jamabandi.nic.in',
        domain: 'jamabandi.nic.in',
        description: 'Online deed appointment, registry token booking, and encumbrance tracking.',
        actionLabel: 'Visit Jamabandi Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Jamabandi Nakal & Mutation',
        url: 'https://jamabandi.nic.in/land%20records/NakalRecord',
        domain: 'jamabandi.nic.in',
        description: 'Official computerized Jamabandi, Khasra Girdawari, mutation status, and court cases.',
        actionLabel: 'View Jamabandi Nakal',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'HRERA Official Portal',
        url: 'https://haryanarera.gov.in',
        domain: 'haryanarera.gov.in',
        description: 'Project search for Gurgaon and Panchkula jurisdiction real estate developments.',
        actionLabel: 'Check HRERA Project',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Haryana Collector Rates',
        url: 'https://jamabandi.nic.in/PropertyRegistration/CollectorRates',
        domain: 'jamabandi.nic.in',
        description: 'Tehsil and sub-tehsil collector rate lists for residential, commercial, and agricultural land.',
        actionLabel: 'View Collector Rates',
        iconType: 'tax'
      }
    }
  },

  'rajasthan': {
    stateKey: 'rajasthan',
    stateName: 'Rajasthan',
    registrationDepartmentName: 'Registration and Stamps Department (E-Panjiyan)',
    landRecordsPortalName: 'Apna Khata (E-Dharti)',
    reraPortalName: 'Rajasthan Real Estate Regulatory Authority (RajRERA)',
    stampDutyPortalName: 'DLC Rate & E-Panjiyan Portal',
    agriculturalLandWarning:
      'Under the Rajasthan Tenancy Act, transfer of agricultural land belonging to SC/ST persons to non-SC/ST persons is strictly prohibited. Conversion under Section 90-A of the Rajasthan Land Revenue Act is mandatory for residential/commercial layouts.',
    interstateNotice:
      'Interstate buyers can register urban residential properties in Jaipur, Udaipur, and Jodhpur via E-Panjiyan without special permissions.',
    specialNotes: [
      'Verify JDA / UIT / Municipal layout approval and lease money (Pattanam / Lease Deed).',
      'Check Apna Khata for digitized Jamabandi and Namantran (Mutation) records.',
      'Check District Level Committee (DLC) rates for accurate stamp duty assessment.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'E-Panjiyan Rajasthan',
        url: 'https://epanjiyan.nic.in',
        domain: 'epanjiyan.nic.in',
        description: 'Online document tracking, stamp duty evaluation, and Sub-Registrar appointment booking.',
        actionLabel: 'Visit E-Panjiyan Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Apna Khata (E-Dharti Rajasthan)',
        url: 'https://apnakhata.rajasthan.gov.in',
        domain: 'apnakhata.rajasthan.gov.in',
        description: 'Official Jamabandi copy, Khasra map, and computerized revenue record verification.',
        actionLabel: 'View Apna Khata Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Rajasthan RERA (RajRERA)',
        url: 'https://rera.rajasthan.gov.in',
        domain: 'rera.rajasthan.gov.in',
        description: 'Verify project compliance, promoter details, and registered complaints in Rajasthan.',
        actionLabel: 'Check RajRERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'DLC Rates Portal Rajasthan',
        url: 'https://epanjiyan.nic.in/dlc_rate.aspx',
        domain: 'epanjiyan.nic.in',
        description: 'District and colony-wise DLC (District Level Committee) property valuation rates.',
        actionLabel: 'View DLC Rates',
        iconType: 'tax'
      }
    }
  },

  'gujarat': {
    stateKey: 'gujarat',
    stateName: 'Gujarat',
    registrationDepartmentName: 'Superintendent of Stamps & Inspector General of Registration (Garvi Gujarat)',
    landRecordsPortalName: 'AnyRoR (Any Records of Rights Anywhere in Gujarat)',
    reraPortalName: 'Gujarat Real Estate Regulatory Authority (GujRERA)',
    stampDutyPortalName: 'Jantri (Annual Statement of Rates) Portal',
    agriculturalLandWarning:
      'Under the Gujarat Tenancy and Agricultural Lands Act, 1948 (Section 63), strictly only an agriculturist can buy agricultural land. Non-agriculturists must obtain District Collector approval or purchase verified NA (Non-Agricultural) zoned plots.',
    interstateNotice:
      'Interstate buyers can easily purchase residential apartments and commercial real estate in Ahmedabad, Surat, and Vadodara. If purchasing land, verify NA permission certificate.',
    specialNotes: [
      'Verify 7/12, 8A, and Form 6 (Mutation entries) on AnyRoR portal.',
      'Check Jantri rates to verify government circle rate valuation before registry.',
      'Verify GujRERA project registration and escrow compliance.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Garvi Gujarat (Inspector General of Registration)',
        url: 'https://garvi.gujarat.gov.in',
        domain: 'garvi.gujarat.gov.in',
        description: 'Online deed registration, Encumbrance Certificate (Index-II), and token generation.',
        actionLabel: 'Visit Garvi Gujarat Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'AnyRoR Gujarat Land Records',
        url: 'https://anyror.gujarat.gov.in',
        domain: 'anyror.gujarat.gov.in',
        description: 'Official 7/12, 8A, E-Chavadi, and Promulgated / Non-Promulgated village records.',
        actionLabel: 'View AnyRoR Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'GujRERA Official Portal',
        url: 'https://gujrera.gujarat.gov.in',
        domain: 'gujrera.gujarat.gov.in',
        description: 'Search registered projects, real estate agents, and project development milestones.',
        actionLabel: 'Check GujRERA Details',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Gujarat Jantri Valuation',
        url: 'https://garvi.gujarat.gov.in/Jantri',
        domain: 'garvi.gujarat.gov.in',
        description: 'Official Jantri circle rates and stamp duty calculation matrix.',
        actionLabel: 'Check Jantri Rates',
        iconType: 'tax'
      }
    }
  },

  'tamil nadu': {
    stateKey: 'tamil nadu',
    stateName: 'Tamil Nadu',
    registrationDepartmentName: 'Commercial Taxes and Registration Department (TNREGINET)',
    landRecordsPortalName: 'Anytime Anywhere e-Services (Patta / Chitta)',
    reraPortalName: 'Tamil Nadu Real Estate Regulatory Authority (TNRERA)',
    stampDutyPortalName: 'TN Guideline Value Search',
    agriculturalLandWarning:
      'In Tamil Nadu, unapproved agricultural plot sub-divisions cannot be registered under Section 22A of the Registration Act. Ensure the layout has DTCP (Directorate of Town and Country Planning) or CMDA approval with valid Patta transfer.',
    interstateNotice:
      'Interstate buyers can register properties online via TNREGINET. EC (Encumbrance Certificate) from 1975 onwards is accessible online.',
    specialNotes: [
      'Obtain online Encumbrance Certificate (Villangam Sandhithal) via TNREGINET.',
      'Check e-Patta and Chitta extract on eservices.tn.gov.in to confirm ownership and survey boundaries.',
      'Verify CMDA / DTCP planning permission and building completion certificate.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'TNREGINET Portal',
        url: 'https://tnreginet.gov.in',
        domain: 'tnreginet.gov.in',
        description: 'Online Encumbrance Certificate (EC), certified copies, and appointment booking.',
        actionLabel: 'Visit TNREGINET Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Tamil Nadu Patta / Chitta e-Services',
        url: 'https://eservices.tn.gov.in',
        domain: 'eservices.tn.gov.in',
        description: 'Verify View Patta & FMB / Chitta / TSLR Extract and A-Register entries.',
        actionLabel: 'View Patta / Chitta',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'TNRERA Official Portal',
        url: 'https://www.rera.tn.gov.in',
        domain: 'rera.tn.gov.in',
        description: 'Search registered layouts, building projects, and structural compliance in TN.',
        actionLabel: 'Check TNRERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'TN Guideline Value Search',
        url: 'https://tnreginet.gov.in/portal/webHP.do?service=getGuidelineValues',
        domain: 'tnreginet.gov.in',
        description: 'Street-wise and survey number-wise government guideline values for property registration.',
        actionLabel: 'View Guideline Values',
        iconType: 'tax'
      }
    }
  },

  'goa': {
    stateKey: 'goa',
    stateName: 'Goa',
    registrationDepartmentName: 'State Directorate of Settlement and Land Records (NGDRS Goa)',
    landRecordsPortalName: 'Directorate of Settlement and Land Records (DSLR Goa)',
    reraPortalName: 'Goa Real Estate Regulatory Authority (Goa RERA)',
    stampDutyPortalName: 'Goa Land & Registration Portal',
    agriculturalLandWarning:
      'Under the Goa Land Revenue Code and Agricultural Tenancy Act, paddy fields, orchards, and agricultural zones cannot be converted without strict Town and Country Planning (TCP) clearance and Sanad under Section 32.',
    interstateNotice:
      'Interstate buyers can freely buy residential villas, apartments, and commercial units. For land parcels, zoning verification in the Regional Plan 2021 (Settlement Zone vs Orchard/CRZ) is essential.',
    specialNotes: [
      'Check Form I & XIV (Form 1 & 14) from DSLR Goa for title and tenancy encumbrances.',
      'Verify CRZ (Coastal Regulation Zone) distance from High Tide Line if near the coast.',
      'Check Goa RERA registration for all new projects and developments.'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'NGDRS Goa Registration Portal',
        url: 'https://ngdrsgoa.gov.in',
        domain: 'ngdrsgoa.gov.in',
        description: 'Online document entry, registration appointment, and digital stamp duty payments.',
        actionLabel: 'Visit NGDRS Goa',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'DSLR Goa Land Records (Form I & XIV)',
        url: 'https://dslr.goa.gov.in',
        domain: 'dslr.goa.gov.in',
        description: 'Official digitized Form I & XIV, cadastral survey maps, and mutation status.',
        actionLabel: 'View Form I & XIV',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Goa RERA Official Portal',
        url: 'https://rera.goa.gov.in',
        domain: 'rera.goa.gov.in',
        description: 'Verify developer disclosures, approved villas/apartments, and completion status.',
        actionLabel: 'Check Goa RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Goa Land Rate Schedule',
        url: 'https://dslr.goa.gov.in',
        domain: 'dslr.goa.gov.in',
        description: 'Taluka-wise minimum land rates and stamp duty slabs based on property value.',
        actionLabel: 'View Goa Land Rates',
        iconType: 'tax'
      }
    }
  },

  'himachal pradesh': {
    stateKey: 'himachal pradesh',
    stateName: 'Himachal Pradesh',
    registrationDepartmentName: 'Revenue Department Himachal Pradesh (HimBhoomi / NGDRS HP)',
    landRecordsPortalName: 'HimBhoomi Land Records (lrc.hp.nic.in)',
    reraPortalName: 'Himachal Pradesh Real Estate Regulatory Authority (HP RERA)',
    stampDutyPortalName: 'HP Revenue & Stamp Department',
    agriculturalLandWarning:
      'STRICT SECTION 118 RESTRICTIONS: Under Section 118 of the HP Tenancy and Land Reforms Act 1972, non-agriculturists and non-domiciles (outsiders) are strictly barred from buying agricultural land. Outsiders can buy pre-built apartments/flats from HP-RERA registered builders within municipal corporation limits.',
    interstateNotice:
      'Outsider / Non-Domicile Buyers: You CAN buy apartments/flats in registered residential complexes within municipal areas (Shimla, Solan, Dharamshala, Baddi). You CANNOT buy agricultural land.',
    specialNotes: [
      'Section 118 Clearance: Verify if the builder has valid State Cabinet / Revenue Department Section 118 approval.',
      'Check HP RERA Project ID on hprera.nic.in for under-construction complexes.',
      'Verify digital Jamabandi and Nakal on the HimBhoomi portal (lrc.hp.nic.in).'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'HP Revenue & Registration',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'Himachal Pradesh e-Registration, deed valuation, and Sub-Registrar appointment booking.',
        actionLabel: 'Visit HP Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'HimBhoomi Land Records',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'Official digitized Jamabandi, Shajra (village map), and land ownership records.',
        actionLabel: 'View HimBhoomi Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'HP RERA Official Portal',
        url: 'https://hprera.nic.in',
        domain: 'hprera.nic.in',
        description: 'Verify builder credentials, Section 118 compliance, and approved project timelines.',
        actionLabel: 'Check HP RERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'HP Circle Rates & Valuation',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'District and Tehsil circle rates and stamp duty slabs.',
        actionLabel: 'View HP Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'uttarakhand': {
    stateKey: 'uttarakhand',
    stateName: 'Uttarakhand',
    registrationDepartmentName: 'Department of Stamps and Registration Uttarakhand (e-Registration UK)',
    landRecordsPortalName: 'Devbhoomi Uttarakhand Bhulekh',
    reraPortalName: 'Uttarakhand Real Estate Regulatory Authority (UK RERA)',
    stampDutyPortalName: 'Uttarakhand Stamp & Registration Revenue Portal',
    agriculturalLandWarning:
      'Under Uttarakhand Zamindari Abolition and Land Reforms Act (amended 2023/2024), non-residents/outsiders can buy flats/apartments within municipal corporation limits freely. Standalone residential plot purchase outside municipal limits is strictly capped at 250 sq. meters. Outsiders cannot buy agricultural land.',
    interstateNotice:
      'Outsider / Non-Domicile Buyers: You can freely buy apartments and flats within municipal corporation areas (Dehradun, Haridwar, Rishikesh, Haldwani). Standalone plots outside municipal limits are capped at 250 sq. meters.',
    specialNotes: [
      'Flats within municipal corporation limits have zero size restrictions for outsiders.',
      'Verify 250 sq. meter ceiling limit compliance for non-domiciles outside municipal boundaries.',
      'Check 143 Non-Agricultural Conversion order on Devbhoomi Bhulekh portal (devbhoomi.uk.gov.in).'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'e-Registration Uttarakhand',
        url: 'https://registration.uk.gov.in',
        domain: 'registration.uk.gov.in',
        description: 'Deed registration appointment booking, e-stamp validation, and registered document inspection.',
        actionLabel: 'Visit UK Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Devbhoomi Bhulekh UK',
        url: 'https://devbhoomi.uk.gov.in',
        domain: 'devbhoomi.uk.gov.in',
        description: 'Digital RoR (Record of Rights), Khasra/Khatauni, and land status search.',
        actionLabel: 'View Devbhoomi Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Uttarakhand RERA Official',
        url: 'https://uhuda.org.in',
        domain: 'uhuda.org.in',
        description: 'Check MDDA/UK RERA approved builder layout plans and registered project status.',
        actionLabel: 'Check UK RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'UK Stamp Duty & Circle Rates',
        url: 'https://registration.uk.gov.in',
        domain: 'registration.uk.gov.in',
        description: 'Dehradun and district circle rates with concessional stamp duty for female buyers.',
        actionLabel: 'View UK Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'sikkim': {
    stateKey: 'sikkim',
    stateName: 'Sikkim',
    registrationDepartmentName: 'Land Revenue & Disaster Management Department Sikkim',
    landRecordsPortalName: 'Sikkim Land Records & Revenue Portal',
    reraPortalName: 'Urban Development and Housing Department Sikkim',
    stampDutyPortalName: 'Sikkim Revenue & Stamp Office',
    agriculturalLandWarning:
      'STRICT OUTSIDER PROHIBITION: Under Article 371F of the Constitution of India and Sikkim Revenue Order No. 1 of 1917, outsiders (non-domiciles/non-Sikkimese) are strictly prohibited from buying flats, homes, or land in Sikkim. Property ownership is strictly reserved for indigenous Sikkimese residents.',
    interstateNotice:
      '🚨 OUTSIDER PURCHASE BARRED: Outsiders CANNOT buy flats, apartments, homes, or land in Sikkim under Article 371F constitutional protection.',
    specialNotes: [
      'Article 371F of the Indian Constitution preserves Sikkim Old Laws',
      'No property deed can be executed or registered in favor of an outsider',
      'Only certified Sikkimese domiciles can hold title to property'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Sikkim Land Revenue Department',
        url: 'https://sikkim.gov.in',
        domain: 'sikkim.gov.in',
        description: 'Official Land Revenue & Disaster Management Department of Government of Sikkim.',
        actionLabel: 'Visit Sikkim Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Sikkim Land Records',
        url: 'https://sikkim.gov.in',
        domain: 'sikkim.gov.in',
        description: 'Land record archives and revenue guidelines for Sikkim subjects.',
        actionLabel: 'View Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Sikkim Urban Development Department',
        url: 'https://udd.sikkim.gov.in',
        domain: 'udd.sikkim.gov.in',
        description: 'Urban planning and housing regulatory department of Sikkim.',
        actionLabel: 'Visit UDD Sikkim',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Sikkim Stamp & Revenue Schedule',
        url: 'https://sikkim.gov.in',
        domain: 'sikkim.gov.in',
        description: 'Official registration fee schedules for Sikkimese subjects.',
        actionLabel: 'View Stamp Rates',
        iconType: 'tax'
      }
    }
  },

  'nagaland': {
    stateKey: 'nagaland',
    stateName: 'Nagaland',
    registrationDepartmentName: 'Department of Land Revenue Nagaland',
    landRecordsPortalName: 'Nagaland Land Records & Survey Directorate',
    reraPortalName: 'Urban Development Department Nagaland',
    stampDutyPortalName: 'Nagaland State Revenue Directorate',
    agriculturalLandWarning:
      'CONSTITUTIONAL PROHIBITION (ARTICLE 371A): Under Article 371A of the Constitution of India and Nagaland Land and Revenue Regulations 1978, no non-indigenous person / outsider can purchase or own flats, homes, or land in Nagaland.',
    interstateNotice:
      '🚨 OUTSIDER PURCHASE BARRED: Outsiders CANNOT buy flats, houses, or land in Nagaland. Customary tribal law reserves all property rights for indigenous Nagas.',
    specialNotes: [
      'Article 371A protects Naga customary ownership rights',
      'Non-indigenous persons cannot register property deeds',
      'Inner Line Permit (ILP) is mandatory for visitors'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Nagaland Land Revenue Directorate',
        url: 'https://landrevenue.nagaland.gov.in',
        domain: 'landrevenue.nagaland.gov.in',
        description: 'Official land revenue management portal for Nagaland state.',
        actionLabel: 'Visit Nagaland Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Nagaland Land Records Directorate',
        url: 'https://landrecords.nagaland.gov.in',
        domain: 'landrecords.nagaland.gov.in',
        description: 'State land survey and cadastral documentation portal.',
        actionLabel: 'View Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Nagaland Urban Development Department',
        url: 'https://udnagaland.nic.in',
        domain: 'udnagaland.nic.in',
        description: 'Urban planning and housing regulatory authority.',
        actionLabel: 'Visit Urban Development',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Nagaland Revenue & Taxation',
        url: 'https://nagaland.gov.in',
        domain: 'nagaland.gov.in',
        description: 'State taxation and stamp guidelines.',
        actionLabel: 'View Tax Rates',
        iconType: 'tax'
      }
    }
  },

  'mizoram': {
    stateKey: 'mizoram',
    stateName: 'Mizoram',
    registrationDepartmentName: 'Land Revenue & Settlement Department Mizoram',
    landRecordsPortalName: 'Mizoram Land Revenue Portal (landrevenue.mizoram.gov.in)',
    reraPortalName: 'Urban Development & Poverty Alleviation Department Mizoram',
    stampDutyPortalName: 'Mizoram Stamp & Registration Office',
    agriculturalLandWarning:
      'CONSTITUTIONAL PROHIBITION (ARTICLE 371G): Under Article 371G and Mizo District Land and Revenue Act, transfer and ownership of land, homes, or flats to non-tribals / outsiders is strictly prohibited.',
    interstateNotice:
      '🚨 OUTSIDER PURCHASE BARRED: Outsiders CANNOT buy flats, homes, or land in Mizoram. Ownership is legally restricted to indigenous Mizo tribes.',
    specialNotes: [
      'Article 371G protects customary Mizo land tenure',
      'No Sub-Registrar can register property in favor of non-tribals',
      'Inner Line Permit (ILP) required for all non-residents'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Mizoram Land Revenue & Settlement',
        url: 'https://landrevenue.mizoram.gov.in',
        domain: 'landrevenue.mizoram.gov.in',
        description: 'Official department for land settlement and revenue administration in Mizoram.',
        actionLabel: 'Visit Mizoram Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Mizoram Land Records',
        url: 'https://landrevenue.mizoram.gov.in',
        domain: 'landrevenue.mizoram.gov.in',
        description: 'Land settlement certificates and cadastral land records.',
        actionLabel: 'View Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Mizoram Urban Development',
        url: 'https://udpa.mizoram.gov.in',
        domain: 'udpa.mizoram.gov.in',
        description: 'Urban planning and housing department.',
        actionLabel: 'Visit UDPA Mizoram',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Mizoram Revenue Schedule',
        url: 'https://landrevenue.mizoram.gov.in',
        domain: 'landrevenue.mizoram.gov.in',
        description: 'State stamp duty and registration fees.',
        actionLabel: 'View Rates',
        iconType: 'tax'
      }
    }
  },

  'arunachal pradesh': {
    stateKey: 'arunachal pradesh',
    stateName: 'Arunachal Pradesh',
    registrationDepartmentName: 'Department of Land Management Arunachal Pradesh',
    landRecordsPortalName: 'Arunachal Land Records & Survey (landmanagement.arunachal.gov.in)',
    reraPortalName: 'Department of Town Planning & Urban Local Bodies',
    stampDutyPortalName: 'Arunachal Revenue & Stamp Office',
    agriculturalLandWarning:
      'BEFR 1873 & TRIBAL PROTECTION: Under Bengal Eastern Frontier Regulation 1873 and customary land laws, non-indigenous outsiders CANNOT buy flats, homes, or land in Arunachal Pradesh. Property rights are reserved for Arunachal Pradesh Scheduled Tribes (APST).',
    interstateNotice:
      '🚨 OUTSIDER PURCHASE BARRED: Outsiders CANNOT buy flats, homes, or land in Arunachal Pradesh under ILP regulations and tribal protection laws.',
    specialNotes: [
      'Bengal Eastern Frontier Regulation 1873 regulates entry and land holding',
      'Land Possession Certificates (LPC) are issued exclusively to APST members',
      'Leasing requires prior state cabinet / district administration approval'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Arunachal Land Management Department',
        url: 'https://landmanagement.arunachal.gov.in',
        domain: 'landmanagement.arunachal.gov.in',
        description: 'Official department overseeing land management and LPC records in Arunachal Pradesh.',
        actionLabel: 'Visit Land Management',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Arunachal Land Records',
        url: 'https://landmanagement.arunachal.gov.in',
        domain: 'landmanagement.arunachal.gov.in',
        description: 'State land survey records and LPC verification.',
        actionLabel: 'View LPC Records',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Arunachal Town Planning Department',
        url: 'https://arunachal.gov.in',
        domain: 'arunachal.gov.in',
        description: 'Urban planning and housing regulatory portal.',
        actionLabel: 'Visit Town Planning',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Arunachal Revenue Schedule',
        url: 'https://arunachal.gov.in',
        domain: 'arunachal.gov.in',
        description: 'Official revenue and registration fee rates.',
        actionLabel: 'View Stamp Rates',
        iconType: 'tax'
      }
    }
  },

  'manipur': {
    stateKey: 'manipur',
    stateName: 'Manipur',
    registrationDepartmentName: 'Department of Revenue Manipur (louchapathap.nic.in)',
    landRecordsPortalName: 'Loucha Pathap Manipur Land Records',
    reraPortalName: 'Manipur Real Estate Regulatory Authority (Manipur RERA)',
    stampDutyPortalName: 'Manipur Stamp & Registration Directorate',
    agriculturalLandWarning:
      'ZONAL RESTRICTIONS: Under Article 371C and Manipur Land Revenue & Land Reforms (MLR&LR) Act, Hill Areas are strictly reserved for indigenous tribal residents (outsiders CANNOT buy). In the Imphal Valley, purchase of flats/homes is permitted with state cabinet scrutiny and Deputy Commissioner (DC) NOC.',
    interstateNotice:
      '⚠️ PARTIAL / ZONAL RESTRICTIONS: Hill Areas in Manipur are strictly restricted (outsiders CANNOT buy). Imphal Valley allows flat/home purchases with Deputy Commissioner approval.',
    specialNotes: [
      'Strict distinction between Hill Districts and Valley Districts under MLR&LR Act',
      'Deputy Commissioner (DC) NOC required for property transfer in Imphal Valley',
      'Verify digitized RoR and Jamabandi on Loucha Pathap (louchapathap.nic.in)'
    ],
    portals: {
      registration: {
        category: 'Property Registration',
        name: 'Manipur Revenue & Registration',
        url: 'https://louchapathap.nic.in',
        domain: 'louchapathap.nic.in',
        description: 'Deed registration, appointment booking, and stamp duty valuation.',
        actionLabel: 'Visit Manipur Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'Land & Revenue Records',
        name: 'Loucha Pathap Land Records',
        url: 'https://louchapathap.nic.in',
        domain: 'louchapathap.nic.in',
        description: 'Official computerized Jamabandi, Dag Chitha, and RoR records of Manipur.',
        actionLabel: 'View Loucha Pathap',
        iconType: 'land'
      },
      rera: {
        category: 'Project RERA Verification',
        name: 'Manipur RERA Authority',
        url: 'https://manipur.gov.in',
        domain: 'manipur.gov.in',
        description: 'Real estate regulatory authority of Manipur.',
        actionLabel: 'Check Manipur RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'Stamp Duty & Valuation',
        name: 'Manipur Stamp & Revenue Schedule',
        url: 'https://louchapathap.nic.in',
        domain: 'louchapathap.nic.in',
        description: 'District circle rates and stamp duty slabs.',
        actionLabel: 'View Stamp Rates',
        iconType: 'tax'
      }
    }
  }
};

export const DEFAULT_NATIONAL_PORTALS: StateSpecificRules = {
  stateKey: 'national',
  stateName: 'India (National / General Guidance)',
  registrationDepartmentName: 'Department of Land Resources / National Generic Document Registration System (NGDRS)',
  landRecordsPortalName: 'Digital India Land Records Modernization Programme (DILRMP)',
  reraPortalName: 'National RERA Coordination & State Real Estate Portals',
  stampDutyPortalName: 'State Stamp & Registration Revenue Portal',
  agriculturalLandWarning:
    'Agricultural land in India is governed by state-specific land revenue and tenancy legislation. Many states have specific eligibility rules regarding who can buy agricultural land, land ceiling limits, and non-agricultural (NA/CLU) conversion protocols.',
  interstateNotice:
    'Property acquisition by Indian citizens across state borders is generally permissible for urban residential and commercial properties under the Transfer of Property Act, 1882. State-specific registration, stamp duty, and land-use laws apply.',
  specialNotes: [
    'Always conduct a minimum 30-year legal search and obtain an Encumbrance Certificate (EC).',
    'Verify RERA registration on the official state RERA portal for any project with >8 units or >500 sq. meters.',
    'Ensure all payments above ₹20,000 are made through documented banking channels (cheque/NEFT/RTGS).'
  ],
  portals: {
    registration: {
      category: 'Property Registration',
      name: 'NGDRS - National Document Registration',
      url: 'https://ngdrs.gov.in',
      domain: 'ngdrs.gov.in',
      description: 'National Generic Document Registration System developed by Government of India for unified e-registration.',
      actionLabel: 'Visit NGDRS Portal',
      iconType: 'registration'
    },
    landRecords: {
      category: 'Land & Revenue Records',
      name: 'Digital India Land Records (DILRMP)',
      url: 'https://dilrmp.gov.in',
      domain: 'dilrmp.gov.in',
      description: 'Central portal connecting state-wise computerized land records, cadastral maps, and revenue services.',
      actionLabel: 'Explore Land Records',
      iconType: 'land'
    },
    rera: {
      category: 'Project RERA Verification',
      name: 'Ministry of Housing and Urban Affairs - RERA',
      url: 'https://mohua.gov.in',
      domain: 'mohua.gov.in',
      description: 'Central apex body for Real Estate (Regulation and Development) Act compliance across states.',
      actionLabel: 'View Central RERA Guidelines',
      iconType: 'rera'
    },
    stampDuty: {
      category: 'Stamp Duty & Valuation',
      name: 'Stock Holding Corporation e-Stamping (SHCIL)',
      url: 'https://www.shcilestamp.com',
      domain: 'shcilestamp.com',
      description: 'Central e-stamping agency authorized by state governments for tamper-proof stamp duty payment.',
      actionLabel: 'Visit e-Stamping Portal',
      iconType: 'tax'
    }
  }
};

export function getStateRules(stateName?: string): StateSpecificRules {
  if (!stateName) return DEFAULT_NATIONAL_PORTALS;
  const normalized = stateName.trim().toLowerCase();
  
  for (const key of Object.keys(STATE_PORTALS_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return STATE_PORTALS_DATABASE[key];
    }
  }
  
  // Custom fallback retaining state name
  return {
    ...DEFAULT_NATIONAL_PORTALS,
    stateKey: normalized,
    stateName: stateName.trim(),
    registrationDepartmentName: `${stateName.trim()} Revenue & Registration Department`,
    landRecordsPortalName: `${stateName.trim()} Land Records Directorate`,
    reraPortalName: `${stateName.trim()} RERA Authority`,
    stampDutyPortalName: `${stateName.trim()} Stamp & Revenue Slabs`
  };
}
