// Comprehensive State-Specific Government Regulations and Portal Database

export const STATE_PORTALS_DATABASE: Record<string, any> = {
  'himachal pradesh': {
    stateKey: 'himachal pradesh',
    stateName: 'Himachal Pradesh',
    registrationDepartmentName: 'Revenue Department Himachal Pradesh (HimBhoomi / NGDRS HP)',
    landRecordsPortalName: 'HimBhoomi Land Records (lrc.hp.nic.in)',
    reraPortalName: 'Himachal Pradesh Real Estate Regulatory Authority (HP RERA)',
    stampDutyPortalName: 'HP Revenue & Stamp Department',
    agriculturalLandWarning:
      'STRICT SECTION 118 RESTRICTIONS: Under Section 118 of the HP Tenancy and Land Reforms Act 1972, non-agriculturists and non-domiciles (outsiders) are strictly barred from buying agricultural land. Outsiders can only buy pre-built apartments/flats from HP-RERA registered builders or plots within municipal corporation limits with prior state cabinet approval.',
    interstateNotice:
      'Outsider / Non-Domicile Buyers: You CANNOT buy agricultural land in Himachal Pradesh. You are legally permitted to purchase apartments/flats in registered residential complexes within municipal areas (e.g. Shimla, Solan, Dharamshala).',
    specialNotes: [
      'Section 118 Clearance: Verify if the builder has valid State Cabinet / Revenue Department Section 118 approval.',
      'Check HP RERA Project ID on hprera.nic.in for under-construction complexes.',
      'Verify digital Jamabandi and Nakal on the HimBhoomi portal (lrc.hp.nic.in).',
      'Verify Town & Country Planning (TCP Himachal) layout and structural safety certificate.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'HP Revenue & Registration',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'Himachal Pradesh e-Registration, deed valuation, and Sub-Registrar appointment booking.',
        actionLabel: 'Visit HP Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'HimBhoomi Land Records',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'Official digitized Jamabandi, Shajra (village map), and land ownership records.',
        actionLabel: 'View HimBhoomi Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'HP RERA Official Portal',
        url: 'https://hprera.nic.in',
        domain: 'hprera.nic.in',
        description: 'Verify builder credentials, Section 118 compliance, and approved project timelines.',
        actionLabel: 'Check HP RERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'HP Circle Rates & Valuation',
        url: 'https://lrc.hp.nic.in',
        domain: 'lrc.hp.nic.in',
        description: 'District and Tehsil circle rates and stamp duty slabs (rebate for female buyers).',
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
      '2024 AMENDMENT RESTRICTIONS: Under Uttarakhand Zamindari Abolition and Land Reforms Act (amended 2023/2024), non-residents/outsiders can only buy a maximum of 250 sq. meters (2,690 sq. ft.) of residential land outside municipal limits without state cabinet permission. Non-residents are strictly prohibited from purchasing agricultural land.',
    interstateNotice:
      'Outsider / Non-Domicile Buyers: You can freely buy apartments and commercial properties within municipal corporation areas (Dehradun, Haridwar, Rishikesh, Haldwani). For open plots in rural/hills areas, individual purchase is strictly capped at 250 sq. meters.',
    specialNotes: [
      'Verify 250 sq. meter ceiling limit compliance for non-domiciles outside municipal boundaries.',
      'Check 143 Non-Agricultural Conversion order on Devbhoomi Bhulekh portal (devbhoomi.uk.gov.in).',
      'Verify MDDA (Mussoorie Dehradun Development Authority) or UK RERA approved layout plans.',
      'Check 30-year title chain and Sub-Registrar Encumbrance Certificate.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'e-Registration Uttarakhand',
        url: 'https://registration.uk.gov.in',
        domain: 'registration.uk.gov.in',
        description: 'Deed registration appointment booking, e-stamp validation, and registered document inspection.',
        actionLabel: 'Visit UK Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Devbhoomi Bhulekh UK',
        url: 'https://devbhoomi.uk.gov.in',
        domain: 'devbhoomi.uk.gov.in',
        description: 'Digital RoR (Record of Rights), Khasra/Khatauni, and land status search.',
        actionLabel: 'View Devbhoomi Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Uttarakhand RERA Official',
        url: 'https://uhuda.org.in',
        domain: 'uhuda.org.in',
        description: 'Verify promoter registration, project escrow compliance, and delivery dates in Uttarakhand.',
        actionLabel: 'Check UK RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'Uttarakhand Circle Rates',
        url: 'https://e-stamp.uk.gov.in',
        domain: 'uk.gov.in',
        description: 'Circle rate schedules for Dehradun, Nainital, Haridwar, and hill districts.',
        actionLabel: 'View UK Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'uttar pradesh': {
    stateKey: 'uttar pradesh',
    stateName: 'Uttar Pradesh',
    registrationDepartmentName: 'Stamp and Registration Department (IGRS UP)',
    landRecordsPortalName: 'UP Bhulekh / Revenue Council',
    reraPortalName: 'Uttar Pradesh Real Estate Regulatory Authority (UP RERA)',
    stampDutyPortalName: 'IGRS UP Stamp & Registration Portal',
    agriculturalLandWarning:
      'Under the UP Revenue Code 2006, Section 80/143 non-agricultural land conversion order is mandatory before buying plots for residential use. Sections 98 and 99 prohibit transfer of SC/ST owned land to non-SC/ST buyers without written permission from the District Magistrate (DM).',
    interstateNotice:
      'Interstate buyers can freely buy residential and commercial apartments, houses, and industrial plots in UP (Noida, Greater Noida, Lucknow, Kanpur, Ghaziabad, Varanasi). Agricultural land ceiling of 12.5 acres applies.',
    specialNotes: [
      'Encumbrance Certificate (EC): Inspect registered deeds on IGRS UP portal (igrsup.gov.in).',
      'Verify UP RERA project registration ID on up-rera.in for under-construction societies.',
      'Check 12-digit computerized Khasra/Khatauni code on UP Bhulekh (upbhulekh.gov.in).',
      'Verify LDA / NOIDA / YEIDA development authority sanctioned layout.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'IGRS Uttar Pradesh',
        url: 'https://igrsup.gov.in',
        domain: 'igrsup.gov.in',
        description: 'Online deed appointment, e-stamp verification, and registered document search.',
        actionLabel: 'Visit IGRS UP Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'UP Bhulekh Portal',
        url: 'https://upbhulekh.gov.in',
        domain: 'upbhulekh.gov.in',
        description: 'Official digitized Khatauni, RoR (Record of Rights), and land parcel ownership status.',
        actionLabel: 'View UP Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'UP RERA Official Portal',
        url: 'https://www.up-rera.in',
        domain: 'up-rera.in',
        description: 'Verify builder credentials, approved layout plans, and registered phase completion dates.',
        actionLabel: 'Check UP RERA Registry',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'UP Stamp Duty & Circle Rates',
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
      'Under the Maharashtra Tenancy and Agricultural Lands Act (MTAL), only a certified agriculturist can purchase agricultural land. For non-agricultural plots, a verified Section 44 NA (Non-Agricultural) order is legally mandatory.',
    interstateNotice:
      'Residential and commercial apartments in Mumbai, Pune, Nagpur, and Thane are freely purchasable by interstate buyers without residency restrictions. Agricultural land requires agriculturist certificate.',
    specialNotes: [
      'e-Search on IGR Maharashtra allows 30-year online title search of registered documents.',
      'Check MahaRERA for QPR (Quarterly Progress Reports) and registered bank escrow accounts.',
      'Verify digital signed 7/12 (Saat-Baara) extract with QR code from Mahabhumi.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'IGR Maharashtra',
        url: 'https://igrmaharashtra.gov.in',
        domain: 'igrmaharashtra.gov.in',
        description: 'e-Registration, document search, e-Stepin appointment, and index II extract.',
        actionLabel: 'Visit IGR Maharashtra',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'MahaBhulekh (Mahabhumi)',
        url: 'https://bhulekh.mahabhumi.gov.in',
        domain: 'bhulekh.mahabhumi.gov.in',
        description: 'Official 7/12 (Saat-Baara), 8A land revenue extract, and Property Card search.',
        actionLabel: 'View 7/12 Extract',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'MahaRERA Official Portal',
        url: 'https://maharera.maharashtra.gov.in',
        domain: 'maharera.maharashtra.gov.in',
        description: 'Check builder registration, litigation disclosures, and building sanctioned plans.',
        actionLabel: 'Check MahaRERA Details',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
      'MUNICIPAL KHATA CLASSIFICATION: In Bengaluru and Karnataka, ensure property has BBMP/BDA A-Khata. B-Khata indicates non-converted or unauthorized layouts with no bank loan sanction and legal risks.',
    interstateNotice:
      'Interstate buyers can register flats and houses via Kaveri 2.0. Ensure BBMP/BDA A-Khata validation for Bangalore urban properties to prevent unauthorized B-Khata layout disputes.',
    specialNotes: [
      'Always obtain Encumbrance Certificate (EC Form 15) for minimum 15 to 30 years via Kaveri Online.',
      'Check BDA / BMRDA layout approval and RERA registration before buying plotted developments.',
      'Verify RTC (Record of Rights, Tenancy and Crops) and Mutation Extract via Bhoomi portal.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'Kaveri Online Services 2.0',
        url: 'https://kaverionline.karnataka.gov.in',
        domain: 'kaverionline.karnataka.gov.in',
        description: 'Online Encumbrance Certificate (EC), certified copy, and digital deed registration.',
        actionLabel: 'Visit Kaveri 2.0 Portal',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Bhoomi Karnataka Land Records',
        url: 'https://bhoomi.karnataka.gov.in',
        domain: 'bhoomi.karnataka.gov.in',
        description: 'Official RTC, Mutation Status, Revenue Maps, and Dispute Case Reports.',
        actionLabel: 'View Bhoomi RTC Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Karnataka RERA Portal',
        url: 'https://rera.karnataka.gov.in',
        domain: 'rera.karnataka.gov.in',
        description: 'Search approved real estate projects, promoter complaints, and project timeline audits.',
        actionLabel: 'Check Karnataka RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
      'LAL DORA & DLR RESTRICTIONS: Agricultural land in Delhi falls under the Delhi Land Reforms (DLR) Act 1954. Lal Dora (abadi) properties often lack municipal sanctioned maps; verify DDA notification status before buying.',
    interstateNotice:
      'Interstate buyers can freely purchase DDA freeholds, builder floors, and apartments. Ensure mutation and sub-lease deed compliance with DDA/L&DO.',
    specialNotes: [
      'Sub-Registrar appointment booking is fully digitized on DORIS (doris.delhigovt.nic.in).',
      'Verify MCD / NDMC property tax mutation and No-Dues Certificate.',
      'Check chain of title for freehold vs leasehold conveyance deeds.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'DORIS Delhi (Delhi Online Registration)',
        url: 'https://doris.delhigovt.nic.in',
        domain: 'doris.delhigovt.nic.in',
        description: 'Sub-registrar appointment scheduling, e-valuation, and registered deed status.',
        actionLabel: 'Visit DORIS Delhi',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Delhi Bhulekh / DLRC',
        url: 'https://dlrc.delhigovt.nic.in',
        domain: 'dlrc.delhigovt.nic.in',
        description: 'Village-wise revenue records, Khasra Girdawari, and DLR land status.',
        actionLabel: 'View Delhi Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Delhi RERA Official',
        url: 'https://rera.delhi.gov.in',
        domain: 'rera.delhi.gov.in',
        description: 'Registration status for commercial and group housing developments in Delhi.',
        actionLabel: 'Check Delhi RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'Delhi Circle Rate & e-Stamping',
        url: 'https://revenue.delhi.gov.in/revenue/circle-rates',
        domain: 'delhi.gov.in',
        description: 'Circle rates categorized from Category A (posh) to Category H, plus women concession.',
        actionLabel: 'View Delhi Circle Rates',
        iconType: 'tax'
      }
    }
  },

  'goa': {
    stateKey: 'goa',
    stateName: 'Goa',
    registrationDepartmentName: 'Department of Registration Goa (e-Dharni)',
    landRecordsPortalName: 'Directorate of Settlement and Land Records (DSLR Goa)',
    reraPortalName: 'Goa Real Estate Regulatory Authority (Goa RERA)',
    stampDutyPortalName: 'DSLR Goa Stamp & Valuation',
    agriculturalLandWarning:
      'PORTUGUESE CIVIL CODE & SANAD CONVERSION: In Goa, agricultural/orchard land cannot be built upon without Land Conversion Sanad. Verify that all surviving legal heirs have signed deed consent under Portuguese Succession Law.',
    interstateNotice:
      'Indian citizens from any state can buy residential villas and apartments in Goa. Ensure compliance with Coastal Regulation Zone (CRZ) setbacks.',
    specialNotes: [
      'Verify Land Conversion Sanad under Goa Land Revenue Code 1968.',
      'Check CRZ clearance for coastal properties within 500m of High Tide Line.',
      'Verify Form I & XIV (Index of Land Records) on DSLR Goa portal.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'e-Dharni Goa Registration',
        url: 'https://ngdrsgoa.gov.in',
        domain: 'ngdrsgoa.gov.in',
        description: 'Goa document registration, nil-encumbrance verification, and deed inspection.',
        actionLabel: 'Visit Goa Registration',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'DSLR Goa Land Records',
        url: 'https://dslr.goa.gov.in',
        domain: 'dslr.goa.gov.in',
        description: 'Official Form I & XIV, cadastral plans, and title mutation records.',
        actionLabel: 'View Form I & XIV',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Goa RERA Official Portal',
        url: 'https://rera.goa.gov.in',
        domain: 'rera.goa.gov.in',
        description: 'Check registered builder projects in North Goa and South Goa.',
        actionLabel: 'Check Goa RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'Goa Stamp & Land Rates',
        url: 'https://dslr.goa.gov.in',
        domain: 'dslr.goa.gov.in',
        description: 'Taluka-wise minimum land rates and stamp duty slabs based on property value.',
        actionLabel: 'View Goa Land Rates',
        iconType: 'tax'
      }
    }
  },

  'haryana': {
    stateKey: 'haryana',
    stateName: 'Haryana',
    registrationDepartmentName: 'Department of Revenue & Disaster Management Haryana (JAMABANDI)',
    landRecordsPortalName: 'Haryana Jamabandi Land Records (jamabandi.nic.in)',
    reraPortalName: 'Haryana Real Estate Regulatory Authority (HARERA Gurugram / Panchkula)',
    stampDutyPortalName: 'Haryana Collector Rates & e-Stamping',
    agriculturalLandWarning:
      'Under the Punjab Land Preservation Act (PLPA) and Haryana Development Regulations, construction on agricultural or forest-notified zones is strictly penalized. Always verify DTCP (Town & Country Planning) colony license.',
    interstateNotice:
      'Interstate buyers can freely purchase freehold flats, builder floors, and plotted assets in Gurugram, Faridabad, Sonipat, and Panchkula.',
    specialNotes: [
      'Check HARERA Gurugram (haryanarera.gov.in) for project RERA number and escrow audit.',
      'Verify Jamabandi & Inteqal (Mutation) online on jamabandi.nic.in.',
      'Check DTCP approved license and layout sanctions before purchasing builder floors.'
    ],
    portals: {
      registration: {
        category: 'registration',
        name: 'Haryana Jamabandi e-Services',
        url: 'https://jamabandi.nic.in',
        domain: 'jamabandi.nic.in',
        description: 'Deed registration, collector rates, mutation status, and property verification.',
        actionLabel: 'Visit Jamabandi Haryana',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Haryana Land Records (Jamabandi)',
        url: 'https://jamabandi.nic.in',
        domain: 'jamabandi.nic.in',
        description: 'Official digitized Jamabandi, Khasra Girdawari, and registered Inteqal.',
        actionLabel: 'View Haryana Jamabandi',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'HARERA Gurugram & Panchkula',
        url: 'https://haryanarera.gov.in',
        domain: 'haryanarera.gov.in',
        description: 'Verify real estate projects, promoter complaints, and construction status in Haryana.',
        actionLabel: 'Check HARERA Portal',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
        name: 'Haryana Collector Rates',
        url: 'https://jamabandi.nic.in/land-records/collector-rates',
        domain: 'jamabandi.nic.in',
        description: 'Tehsil-wise collector rates and stamp duty calculation.',
        actionLabel: 'View Collector Rates',
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
        category: 'registration',
        name: 'Sikkim Land Revenue Department',
        url: 'https://sikkim.gov.in',
        domain: 'sikkim.gov.in',
        description: 'Official Land Revenue & Disaster Management Department of Government of Sikkim.',
        actionLabel: 'Visit Sikkim Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Sikkim Land Records',
        url: 'https://sikkim.gov.in',
        domain: 'sikkim.gov.in',
        description: 'Land record archives and revenue guidelines for Sikkim subjects.',
        actionLabel: 'View Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Sikkim Urban Development Department',
        url: 'https://udd.sikkim.gov.in',
        domain: 'udd.sikkim.gov.in',
        description: 'Urban planning and housing regulatory department of Sikkim.',
        actionLabel: 'Visit UDD Sikkim',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
        category: 'registration',
        name: 'Nagaland Land Revenue Directorate',
        url: 'https://landrevenue.nagaland.gov.in',
        domain: 'landrevenue.nagaland.gov.in',
        description: 'Official land revenue management portal for Nagaland state.',
        actionLabel: 'Visit Nagaland Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Nagaland Land Records Directorate',
        url: 'https://landrecords.nagaland.gov.in',
        domain: 'landrecords.nagaland.gov.in',
        description: 'State land survey and cadastral documentation portal.',
        actionLabel: 'View Land Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Nagaland Urban Development Department',
        url: 'https://udnagaland.nic.in',
        domain: 'udnagaland.nic.in',
        description: 'Urban planning and housing regulatory authority.',
        actionLabel: 'Visit Urban Development',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
        category: 'registration',
        name: 'Mizoram Land Revenue & Settlement',
        url: 'https://landrevenue.mizoram.gov.in',
        domain: 'landrevenue.mizoram.gov.in',
        description: 'Official department for land settlement and revenue administration in Mizoram.',
        actionLabel: 'Visit Mizoram Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Mizoram Land Records',
        url: 'https://landrevenue.mizoram.gov.in',
        domain: 'landrevenue.mizoram.gov.in',
        description: 'Land settlement certificates and cadastral land records.',
        actionLabel: 'View Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Mizoram Urban Development',
        url: 'https://udpa.mizoram.gov.in',
        domain: 'udpa.mizoram.gov.in',
        description: 'Urban planning and housing department.',
        actionLabel: 'Visit UDPA Mizoram',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
        category: 'registration',
        name: 'Arunachal Land Management Department',
        url: 'https://landmanagement.arunachal.gov.in',
        domain: 'landmanagement.arunachal.gov.in',
        description: 'Official department overseeing land management and LPC records in Arunachal Pradesh.',
        actionLabel: 'Visit Land Management',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Arunachal Land Records',
        url: 'https://landmanagement.arunachal.gov.in',
        domain: 'landmanagement.arunachal.gov.in',
        description: 'State land survey records and LPC verification.',
        actionLabel: 'View LPC Records',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Arunachal Town Planning Department',
        url: 'https://arunachal.gov.in',
        domain: 'arunachal.gov.in',
        description: 'Urban planning and housing regulatory portal.',
        actionLabel: 'Visit Town Planning',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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
        category: 'registration',
        name: 'Manipur Revenue & Registration',
        url: 'https://louchapathap.nic.in',
        domain: 'louchapathap.nic.in',
        description: 'Deed registration, appointment booking, and stamp duty valuation.',
        actionLabel: 'Visit Manipur Revenue',
        iconType: 'registration'
      },
      landRecords: {
        category: 'land_records',
        name: 'Loucha Pathap Land Records',
        url: 'https://louchapathap.nic.in',
        domain: 'louchapathap.nic.in',
        description: 'Official computerized Jamabandi, Dag Chitha, and RoR records of Manipur.',
        actionLabel: 'View Loucha Pathap',
        iconType: 'land'
      },
      rera: {
        category: 'rera',
        name: 'Manipur RERA Authority',
        url: 'https://manipur.gov.in',
        domain: 'manipur.gov.in',
        description: 'Real estate regulatory authority of Manipur.',
        actionLabel: 'Check Manipur RERA',
        iconType: 'rera'
      },
      stampDuty: {
        category: 'stamp_duty',
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

export const DEFAULT_NATIONAL_PORTALS = {
  stateKey: 'national',
  stateName: 'India (National / General Guidance)',
  registrationDepartmentName: 'Department of Land Resources / National Generic Document Registration System (NGDRS)',
  landRecordsPortalName: 'Digital India Land Records Modernization Programme (DILRMP)',
  reraPortalName: 'National RERA Coordination & State Real Estate Portals',
  stampDutyPortalName: 'State Stamp & Registration Revenue Portal',
  agriculturalLandWarning:
    'Agricultural land in India is governed by state-specific land revenue and tenancy legislation. Many states have specific eligibility rules regarding who can buy agricultural land, land ceiling limits, and non-agricultural (NA/CLU) conversion protocols.',
  interstateNotice:
    'Property acquisition by Indian citizens across state borders is generally permissible for urban residential and commercial properties under the Transfer of Property Act 1882. State-specific registration, stamp duty, and land-use laws apply.',
  specialNotes: [
    'Always conduct a minimum 30-year legal search and obtain an Encumbrance Certificate (EC).',
    'Verify RERA registration on the official state RERA portal for any project with >8 units or >500 sq. meters.',
    'Ensure all payments above ₹20,000 are made through documented banking channels (cheque/NEFT/RTGS).'
  ],
  portals: {
    registration: {
      category: 'registration',
      name: 'NGDRS - National Document Registration',
      url: 'https://ngdrs.gov.in',
      domain: 'ngdrs.gov.in',
      description: 'National Generic Document Registration System developed by Government of India for unified e-registration.',
      actionLabel: 'Visit NGDRS Portal',
      iconType: 'registration'
    },
    landRecords: {
      category: 'land_records',
      name: 'Digital India Land Records (DILRMP)',
      url: 'https://dilrmp.gov.in',
      domain: 'dilrmp.gov.in',
      description: 'Central portal connecting state-wise computerized land records, cadastral maps, and revenue services.',
      actionLabel: 'Explore Land Records',
      iconType: 'land'
    },
    rera: {
      category: 'rera',
      name: 'Ministry of Housing and Urban Affairs - RERA',
      url: 'https://mohua.gov.in',
      domain: 'mohua.gov.in',
      description: 'Central apex body for Real Estate (Regulation and Development) Act compliance across states.',
      actionLabel: 'View Central RERA Guidelines',
      iconType: 'rera'
    },
    stampDuty: {
      category: 'stamp_duty',
      name: 'Stock Holding Corporation e-Stamping (SHCIL)',
      url: 'https://www.shcilestamp.com',
      domain: 'shcilestamp.com',
      description: 'Central e-stamping agency authorized by state governments for tamper-proof stamp duty payment.',
      actionLabel: 'Visit e-Stamping Portal',
      iconType: 'tax'
    }
  }
};

const STATE_CODE_MAP: Record<string, string> = {
  hp: 'himachal pradesh',
  uk: 'uttarakhand',
  up: 'uttar pradesh',
  dl: 'delhi',
  mh: 'maharashtra',
  ka: 'karnataka',
  ts: 'telangana',
  tn: 'tamil nadu',
  hr: 'haryana',
  wb: 'west bengal',
  gj: 'gujarat',
  rj: 'rajasthan',
  ch: 'chandigarh',
  pb: 'punjab',
  kl: 'kerala',
  ap: 'andhra pradesh',
  mp: 'madhya pradesh',
  ga: 'goa',
  sk: 'sikkim',
  nl: 'nagaland',
  mz: 'mizoram',
  ar: 'arunachal pradesh',
  mn: 'manipur',
};

export function getStateRules(stateName?: string) {
  if (!stateName) return DEFAULT_NATIONAL_PORTALS;
  let normalized = stateName.trim().toLowerCase();
  if (STATE_CODE_MAP[normalized]) {
    normalized = STATE_CODE_MAP[normalized];
  }

  for (const key of Object.keys(STATE_PORTALS_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return STATE_PORTALS_DATABASE[key];
    }
  }

  // Dynamic state fallback
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