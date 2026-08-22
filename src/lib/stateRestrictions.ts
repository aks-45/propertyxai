export type RestrictionCategory = 
  | 'ALLOWED_CONDITIONAL' 
  | 'STRICTLY_PROHIBITED' 
  | 'PARTIAL_ZONAL' 
  | 'UNRESTRICTED';

export interface StateRestrictionInfo {
  stateKey: string;
  stateName: string;
  category: RestrictionCategory;
  canOutsidersBuyFlats: boolean;
  canOutsidersBuyHomes: boolean;
  canOutsidersBuyLand: boolean;
  headline: string;
  badgeLabel: string;
  badgeColor: 'red' | 'amber' | 'blue' | 'green';
  summary: string;
  legalBasis: string;
  permittedDetails: string;
  prohibitedDetails: string;
  keyChecklist: string[];
  actionAdvice: string;
}

export const STATE_RESTRICTIONS_DATA: Record<string, StateRestrictionInfo> = {
  'sikkim': {
    stateKey: 'sikkim',
    stateName: 'Sikkim',
    category: 'STRICTLY_PROHIBITED',
    canOutsidersBuyFlats: false,
    canOutsidersBuyHomes: false,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CANNOT Buy Flats, Homes, or Land in Sikkim',
    badgeLabel: 'Strictly Prohibited for Outsiders',
    badgeColor: 'red',
    summary: 'Under Article 371F of the Constitution of India and Sikkim Revenue Order No. 1 of 1917, non-domiciles / outsiders (non-Sikkimese) are strictly prohibited from purchasing or registering flats, homes, or land in Sikkim.',
    legalBasis: 'Article 371F of the Constitution of India & Sikkim Revenue Order No. 1',
    permittedDetails: 'Only certified Sikkimese subjects / state domiciles are legally entitled to purchase and hold immovable property.',
    prohibitedDetails: 'All non-domicile Indian citizens and foreign nationals cannot purchase flats, apartments, individual houses, agricultural land, or commercial land.',
    keyChecklist: [
      'Constitutional protection under Article 371F preserves local land ownership',
      'No Sub-Registrar in Sikkim can register deed execution in favor of an outsider',
      'Leasing commercial spaces is possible subject to local government clearances'
    ],
    actionAdvice: 'If you are not a domicile of Sikkim, you cannot legally acquire ownership of this property. Consider long-term registered commercial lease if applicable.'
  },

  'nagaland': {
    stateKey: 'nagaland',
    stateName: 'Nagaland',
    category: 'STRICTLY_PROHIBITED',
    canOutsidersBuyFlats: false,
    canOutsidersBuyHomes: false,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CANNOT Buy Flats, Homes, or Land in Nagaland',
    badgeLabel: 'Strictly Prohibited for Outsiders',
    badgeColor: 'red',
    summary: 'Under Article 371A of the Constitution of India and the Nagaland Land and Revenue Regulations (Amendment) Act 1978, non-indigenous persons (outsiders) are strictly barred from buying, acquiring, or transferring land, homes, or flats in Nagaland.',
    legalBasis: 'Article 371A of the Constitution of India & Nagaland Land & Revenue Act 1978',
    permittedDetails: 'Property ownership is exclusively reserved for indigenous Naga tribal residents.',
    prohibitedDetails: 'Outsiders cannot buy flats, houses, residential plots, or agricultural/forest land.',
    keyChecklist: [
      'Article 371A explicitly exempts Nagaland from central ownership transfer laws',
      'Customary tribal land laws govern all property transactions',
      'Inner Line Permit (ILP) is required even to enter and stay in Nagaland'
    ],
    actionAdvice: 'Outsiders cannot buy residential or commercial property in Nagaland. Do not make advance payments to sellers or brokers.'
  },

  'mizoram': {
    stateKey: 'mizoram',
    stateName: 'Mizoram',
    category: 'STRICTLY_PROHIBITED',
    canOutsidersBuyFlats: false,
    canOutsidersBuyHomes: false,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CANNOT Buy Flats, Homes, or Land in Mizoram',
    badgeLabel: 'Strictly Prohibited for Outsiders',
    badgeColor: 'red',
    summary: 'Under Article 371G of the Constitution of India and the Mizo District (Land and Revenue) Act, the ownership and transfer of land, homes, and flats to non-tribals/outsiders is strictly prohibited.',
    legalBasis: 'Article 371G of the Constitution of India & Mizo District (Land and Revenue) Act',
    permittedDetails: 'Immovable property ownership is restricted to indigenous Mizo tribal inhabitants.',
    prohibitedDetails: 'Non-tribals and non-Mizo citizens cannot purchase flats, homes, or land anywhere in Mizoram.',
    keyChecklist: [
      'Article 371G guarantees customary Mizo land tenure rights',
      'Deed registration to non-indigenous buyers is legally void ab initio',
      'Inner Line Permit (ILP) required for all non-residents'
    ],
    actionAdvice: 'Outsider property purchases are not legally permitted in Mizoram. Avoid any unverified informal agreements.'
  },

  'arunachal pradesh': {
    stateKey: 'arunachal pradesh',
    stateName: 'Arunachal Pradesh',
    category: 'STRICTLY_PROHIBITED',
    canOutsidersBuyFlats: false,
    canOutsidersBuyHomes: false,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CANNOT Buy Flats, Homes, or Land in Arunachal Pradesh',
    badgeLabel: 'Strictly Prohibited for Outsiders',
    badgeColor: 'red',
    summary: 'Under the Bengal Eastern Frontier Regulation 1873 (Inner Line Permit system) and state tribal protection laws, non-indigenous outsiders cannot buy or own flats, houses, or land in Arunachal Pradesh.',
    legalBasis: 'Bengal Eastern Frontier Regulation 1873 & Arunachal Land Rights Norms',
    permittedDetails: 'Ownership is restricted to Arunachal Pradesh Scheduled Tribes (APST).',
    prohibitedDetails: 'Outsiders are barred from buying flats, individual houses, and land parcels.',
    keyChecklist: [
      'Strict Inner Line Permit (ILP) and tribal land protection regulations',
      'All land holdings are community or indigenous tribal titles (LPC)',
      'Government approval required even for institutional leasehold setups'
    ],
    actionAdvice: 'Outsiders cannot purchase property here. Property ownership transfer to non-APST buyers is null and void.'
  },

  'manipur': {
    stateKey: 'manipur',
    stateName: 'Manipur',
    category: 'PARTIAL_ZONAL',
    canOutsidersBuyFlats: true,
    canOutsidersBuyHomes: true,
    canOutsidersBuyLand: false,
    headline: 'Partial & Zonal Restrictions Apply in Manipur',
    badgeLabel: 'Partial / Zonal Restrictions',
    badgeColor: 'amber',
    summary: 'In Manipur, strict zonal distinctions exist: Under Article 371C and the MLR&LR Act, Hill Areas are strictly reserved for indigenous tribal residents (outsiders CANNOT buy). In the Imphal Valley, purchases are permitted subject to state cabinet scrutiny and local DC clearance.',
    legalBasis: 'Article 371C of the Constitution & Manipur Land Revenue & Land Reforms (MLR&LR) Act',
    permittedDetails: 'Imphal Valley (Imphal East, Imphal West, Thoubal, Bishnupur, Kakching) with District Collector / Cabinet NOC.',
    prohibitedDetails: 'Hill Areas (Churachandpur, Ukhrul, Senapati, Tamenglong, Chandel) are strictly non-transferable to outsiders/non-tribals.',
    keyChecklist: [
      'Strict distinction between Hill Districts and Valley Districts',
      'NOC / Revenue Clearance from Deputy Commissioner (DC) mandatory',
      'Tribal land in hill areas cannot be sold or mortgaged to non-tribals'
    ],
    actionAdvice: 'Verify if the property falls in the Imphal Valley or Hill Area. Obtain written legal verification from the local Deputy Commissioner before committing.'
  },

  'himachal pradesh': {
    stateKey: 'himachal pradesh',
    stateName: 'Himachal Pradesh',
    category: 'ALLOWED_CONDITIONAL',
    canOutsidersBuyFlats: true,
    canOutsidersBuyHomes: true,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CAN Buy Flats/Homes in Himachal Pradesh (Municipal Areas)',
    badgeLabel: 'Outsiders Can Buy Flats/Homes',
    badgeColor: 'blue',
    summary: 'Outsiders and non-domiciles CAN legally buy pre-built flats/apartments from registered builders in municipal corporation areas. Non-agriculturists are strictly prohibited from purchasing agricultural land under Section 118.',
    legalBasis: 'Section 118 of Himachal Pradesh Tenancy and Land Reforms Act, 1972',
    permittedDetails: 'Pre-built apartments/flats in HP-RERA registered complexes and approved municipal corporation zones (e.g., Shimla, Solan, Dharamshala, Baddi).',
    prohibitedDetails: 'Agricultural land and rural land outside municipal limits without prior State Cabinet Section 118 clearance.',
    keyChecklist: [
      'Verify builder has valid Section 118 Cabinet clearance for the project',
      'Check HP RERA Project Registration ID on hprera.nic.in',
      'Verify digital Jamabandi / Nakal on HimBhoomi (lrc.hp.nic.in)'
    ],
    actionAdvice: 'You are legally permitted to purchase pre-constructed flats in HP. Ensure the project possesses HP RERA registration and valid Section 118 clearance.'
  },

  'uttarakhand': {
    stateKey: 'uttarakhand',
    stateName: 'Uttarakhand',
    category: 'ALLOWED_CONDITIONAL',
    canOutsidersBuyFlats: true,
    canOutsidersBuyHomes: true,
    canOutsidersBuyLand: false,
    headline: 'Outsiders CAN Buy Flats/Homes in Uttarakhand (Municipal & Capped Plots)',
    badgeLabel: 'Outsiders Can Buy Flats/Homes',
    badgeColor: 'blue',
    summary: 'Outsiders CAN freely purchase flats and apartments within municipal corporation limits (Dehradun, Haridwar, Rishikesh, Haldwani). For open residential plots outside municipal limits, purchase is strictly capped at 250 sq. meters (2,690 sq. ft.). Non-residents cannot buy agricultural land.',
    legalBasis: 'Uttarakhand Zamindari Abolition and Land Reforms (amended 2023/2024)',
    permittedDetails: 'Flats/apartments in municipal corporation limits (unlimited), and residential plots outside municipal limits up to 250 sq. meters.',
    prohibitedDetails: 'Agricultural land and plots exceeding 250 sq. meters outside municipal boundaries without state government sanction.',
    keyChecklist: [
      'Flats within municipal limits have zero size restrictions for outsiders',
      '250 sq. meter ceiling applies per family for residential plots outside municipal limits',
      'Verify 143 Non-Agricultural Conversion order on Devbhoomi Bhulekh'
    ],
    actionAdvice: 'You can freely buy apartments and flats in Uttarakhand municipal areas. If buying a standalone plot in rural areas, ensure it does not exceed 250 sq.m.'
  },
};

const STATE_KEYWORDS_MAP: Record<string, string> = {
  // Sikkim
  'sikkim': 'sikkim',
  'gangtok': 'sikkim',
  'namchi': 'sikkim',
  'geyzing': 'sikkim',
  'mangan': 'sikkim',
  'pelling': 'sikkim',
  'singtam': 'sikkim',
  'rangpo': 'sikkim',

  // Nagaland
  'nagaland': 'nagaland',
  'kohima': 'nagaland',
  'dimapur': 'nagaland',
  'mokokchung': 'nagaland',
  'tuensang': 'nagaland',
  'wokha': 'nagaland',
  'zunheboto': 'nagaland',

  // Mizoram
  'mizoram': 'mizoram',
  'aizawl': 'mizoram',
  'lunglei': 'mizoram',
  'champhai': 'mizoram',
  'serchhip': 'mizoram',
  'kolasib': 'mizoram',

  // Arunachal Pradesh
  'arunachal pradesh': 'arunachal pradesh',
  'arunachal': 'arunachal pradesh',
  'itanagar': 'arunachal pradesh',
  'naharlagun': 'arunachal pradesh',
  'pasighat': 'arunachal pradesh',
  'tawang': 'arunachal pradesh',
  'ziro': 'arunachal pradesh',
  'bomdila': 'arunachal pradesh',

  // Manipur
  'manipur': 'manipur',
  'imphal': 'manipur',
  'churachandpur': 'manipur',
  'thoubal': 'manipur',
  'bishnupur': 'manipur',
  'ukhrul': 'manipur',
  'senapati': 'manipur',
  'kakching': 'manipur',

  // Himachal Pradesh
  'himachal pradesh': 'himachal pradesh',
  'himachal': 'himachal pradesh',
  'hp': 'himachal pradesh',
  'shimla': 'himachal pradesh',
  'manali': 'himachal pradesh',
  'dharamshala': 'himachal pradesh',
  'solan': 'himachal pradesh',
  'kullu': 'himachal pradesh',
  'kasauli': 'himachal pradesh',
  'mandi': 'himachal pradesh',
  'baddi': 'himachal pradesh',

  // Uttarakhand
  'uttarakhand': 'uttarakhand',
  'uttaranchal': 'uttarakhand',
  'uk': 'uttarakhand',
  'dehradun': 'uttarakhand',
  'rishikesh': 'uttarakhand',
  'haridwar': 'uttarakhand',
  'haldwani': 'uttarakhand',
  'nainital': 'uttarakhand',
  'mussoorie': 'uttarakhand',
  'roorkee': 'uttarakhand',
  'rudrapur': 'uttarakhand',
};

/**
 * Detects if a location query, state name, or full address matches any state with special restrictions.
 */
export function getStateRestrictionInfo(queryOrAddressOrState?: string): StateRestrictionInfo | null {
  if (!queryOrAddressOrState) return null;
  const lower = queryOrAddressOrState.toLowerCase().trim();

  // 1. Direct match on keyword dictionary
  for (const [keyword, stateKey] of Object.entries(STATE_KEYWORDS_MAP)) {
    // Regex for word boundary to prevent false positives
    const regex = new RegExp(`\\b${keyword.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(lower)) {
      return STATE_RESTRICTIONS_DATA[stateKey] || null;
    }
  }

  // 2. Fallback substring search
  for (const [stateKey, info] of Object.entries(STATE_RESTRICTIONS_DATA)) {
    if (lower.includes(stateKey) || lower.includes(info.stateName.toLowerCase())) {
      return info;
    }
  }

  return null;
}
