import { GoogleGenerativeAI } from '@google/generative-ai';
import { getStateRules } from '../../data/government-guide';

export interface GeminiExplanation {
  decision_explanation: string;
  top_reasons: string[];
  risks: string[];
  financial_summary: string;
  location_summary: string;
  what_to_verify: string[];
  state_legal_rules?: {
    stateName: string;
    outsiderNotice: string;
    landWarning: string;
    specialNotes: string[];
  };
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your-gemini-api-key-here' && apiKey.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey.trim());
      } catch (e) {
        console.warn('Failed to initialize GoogleGenerativeAI:', (e as Error).message);
      }
    }
  }

  /**
   * Generate narrative AI explanation using Gemini with structured JSON schema
   */
  async generateExplanation(input: {
    property: any;
    scores: any;
    decision: any;
    financialMetrics: any;
    locationData: any;
    user?: any;
  }): Promise<GeminiExplanation> {
    const propertyState = input.property?.locationDetails?.state || 'Uttar Pradesh';
    const stateRules = getStateRules(propertyState);

    if (!this.genAI) {
      return this.getFallbackExplanation(input, stateRules);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const prompt = this.buildPrompt(input, stateRules);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const parsed = JSON.parse(text);
      if (this.isValidExplanation(parsed)) {
        return {
          ...parsed,
          state_legal_rules: {
            stateName: stateRules.stateName,
            outsiderNotice: stateRules.interstateNotice || 'Standard inter-state purchasing regulations apply.',
            landWarning: stateRules.agriculturalLandWarning || 'Verify non-agricultural conversion and local revenue code compliance.',
            specialNotes: stateRules.specialNotes || [],
          },
        };
      }
      return this.getFallbackExplanation(input, stateRules);
    } catch (error) {
      console.warn('Gemini 2.5 Flash generation error, utilizing deterministic fallback:', (error as Error).message);
      return this.getFallbackExplanation(input, stateRules);
    }
  }

  private buildPrompt(input: {
    property: any;
    scores: any;
    decision: any;
    financialMetrics: any;
    locationData: any;
    user?: any;
  }, stateRules: any): string {
    return `
You are Property X AI's expert Indian Real Estate Investment & Legal Due Diligence Advisor.
Explain the following pre-calculated property evaluation to the buyer in clear, practical terms.
Do NOT recalculate or contradict any provided scores, financial figures, or recommendations.

CONTEXT & CALCULATIONS:
- Property Location: ${input.property?.locationDetails?.address || input.property?.location || 'Unknown'}, ${stateRules.stateName}
- Property Type: ${input.property?.type || 'Residential'}
- Price: ₹${(input.property?.price || 0).toLocaleString('en-IN')}
- Pre-Calculated Decision: ${input.decision?.decision || 'WAIT'} (Confidence: ${input.decision?.confidence || 75}%)
- Scores (0-100): Overall: ${input.scores?.overall}, Affordability: ${input.scores?.affordability}, Connectivity: ${input.scores?.connectivity}, Healthcare: ${input.scores?.healthcare}, Education: ${input.scores?.education}, Environment: ${input.scores?.environment}, Growth Potential: ${input.scores?.growth}
- Workplace Commute Analysis:
  * Office Location: ${input.scores?.commute?.workLocation || 'Not specified'}
  * One-Way Distance & Travel Time: ${input.scores?.commute?.distanceText || 'N/A'} (${input.scores?.commute?.durationText || 'N/A'})
  * Commute Rating: ${input.scores?.commute?.rating || 'N/A'} (Penalty: ${input.scores?.commute?.scorePenalty || 0} pts)
  * Actionable Commute Suggestions: ${input.scores?.commute?.suggestions?.join(' | ') || 'N/A'}
- Financial Overview: Monthly EMI: ₹${(input.financialMetrics?.costEstimation?.monthlyEMI || 0).toLocaleString('en-IN')}, Total Initial Cash Outlay: ₹${(input.financialMetrics?.costEstimation?.totalInitialCost || 0).toLocaleString('en-IN')}
- State-Specific Land & Outsider Regulations for ${stateRules.stateName}:
  * Outsider / Interstate Notice: ${stateRules.interstateNotice}
  * Land / Revenue Warning: ${stateRules.agriculturalLandWarning}
  * Key Authority Portals: ${stateRules.registrationDepartmentName}, ${stateRules.reraPortalName}

RESPOND EXCLUSIVELY WITH A JSON OBJECT MATCHING THIS EXACT SCHEMA:
{
  "decision_explanation": "Detailed 2-3 paragraph explanation of why this property received the ${input.decision?.decision} verdict based on affordability, work commute distance, and locality data.",
  "top_reasons": ["Reason 1", "Reason 2", "Reason 3"],
  "risks": ["Risk 1", "Risk 2"],
  "financial_summary": "Summary of cash outflow, EMI sustainability, and upfront stamp duty/registration requirements.",
  "location_summary": "Summary of connectivity, workplace commute distance, neighborhood infrastructure, and liveability.",
  "what_to_verify": [
    "Verify state-specific compliance for ${stateRules.stateName}",
    "Verify 30-year Encumbrance Certificate on ${stateRules.registrationDepartmentName}",
    "Verify RERA registration on ${stateRules.reraPortalName}",
    "Verify Revenue Records on ${stateRules.landRecordsPortalName}"
  ]
}
`;
  }

  private isValidExplanation(obj: any): obj is GeminiExplanation {
    return (
      obj &&
      typeof obj.decision_explanation === 'string' &&
      Array.isArray(obj.top_reasons) &&
      Array.isArray(obj.risks) &&
      typeof obj.financial_summary === 'string' &&
      typeof obj.location_summary === 'string' &&
      Array.isArray(obj.what_to_verify)
    );
  }

  private getFallbackExplanation(input: {
    property: any;
    scores: any;
    decision: any;
    financialMetrics: any;
    locationData: any;
    user?: any;
  }, stateRules: any): GeminiExplanation {
    const verdict = input.decision?.decision || 'WAIT';
    const stateName = stateRules.stateName || 'Uttar Pradesh';
    const priceFormatted = `₹${(input.property?.price || 0).toLocaleString('en-IN')}`;
    const emiFormatted = `₹${(input.financialMetrics?.costEstimation?.monthlyEMI || 0).toLocaleString('en-IN')}`;
    const initialCostFormatted = `₹${(input.financialMetrics?.costEstimation?.totalInitialCost || 0).toLocaleString('en-IN')}`;

    let explanation = '';
    if (verdict === 'BUY') {
      explanation = `The property in ${input.property?.locationDetails?.city || stateName} demonstrates strong fundamentals with an intelligence score of ${input.scores?.overall || 80}/100. The estimated monthly EMI of ${emiFormatted} aligns with your disposable income, with positive capital appreciation trends in this micro-market.`;
    } else if (verdict === 'RENT') {
      explanation = `Given the acquisition outlay of ${priceFormatted} and recurring carrying costs, renting in ${stateName} represents a more capital-efficient choice. It allows you to utilize local infrastructure without bearing a heavy monthly debt service of ${emiFormatted}.`;
    } else {
      explanation = `A WAIT recommendation is advised for this property in ${stateName} to monitor price trends and accumulate a higher down payment reserve, minimizing long-term interest costs.`;
    }

    if (input.scores?.commute && input.scores.commute.rating === 'EXCESSIVE') {
      explanation += ` Additionally, the excessive daily commute of ${input.scores.commute.distanceText} (${input.scores.commute.durationText}) to ${input.scores.commute.workLocation} adds ~${input.scores.commute.annualCommuteHours} hrs/yr in transit and ₹${input.scores.commute.monthlyTravelCostEst.toLocaleString('en-IN')}/mo in travel expense. We advise evaluating properties closer to your workplace or renting nearby to avoid chronic travel burnout.`;
    } else if (input.scores?.commute && input.scores.commute.rating === 'STRETCHED') {
      explanation += ` Note: One-way commute to ${input.scores.commute.workLocation} is ${input.scores.commute.distanceText} (${input.scores.commute.durationText}). Consider hybrid work arrangements or express transit options.`;
    }

    // Build authoritative state-specific checklist
    const stateChecklist: string[] = [];

    if (stateRules.stateKey === 'himachal pradesh') {
      stateChecklist.push('🚨 SECTION 118 CHECK: Confirm property is not agricultural land. Outsiders/non-domiciles can only buy pre-built apartments or plots within municipal limits with State Cabinet Section 118 clearance.');
      stateChecklist.push('Verify Jamabandi & Nakal on HimBhoomi portal (lrc.hp.nic.in).');
      stateChecklist.push('Check HP RERA Project Registration ID on hprera.nic.in.');
    } else if (stateRules.stateKey === 'uttarakhand') {
      stateChecklist.push('🚨 250 SQ. METER CAP: For non-residents buying outside municipal corporation boundaries, verify that the plot size does not exceed 250 sq. meters (2,690 sq. ft.) as per 2024 UK Land Law amendments.');
      stateChecklist.push('Verify Section 143 Non-Agricultural Conversion on Devbhoomi Bhulekh (devbhoomi.uk.gov.in).');
      stateChecklist.push('Check UK RERA registration and Mussoorie Dehradun Development Authority (MDDA) layout approval.');
    } else if (stateRules.stateKey === 'uttar pradesh') {
      stateChecklist.push('🚨 SECTION 80/143 CONVERSION: Verify that agricultural land has an official Section 80 Non-Agricultural conversion order recorded in UP Bhulekh.');
      stateChecklist.push('🚨 SC/ST LAND TRANSFER (Section 98/99): Ensure land is not owned by SC/ST individuals without prior District Magistrate (DM) permission.');
      stateChecklist.push('Verify 12-digit computerized Khasra/Khatauni on upbhulekh.gov.in and 30-year Encumbrance Certificate on igrsup.gov.in.');
      stateChecklist.push('Check UP RERA project registration ID and escrow bank account on up-rera.in.');
    } else if (stateRules.stateKey === 'maharashtra') {
      stateChecklist.push('🚨 MTAL & SECTION 44 NA ORDER: Verify Section 44 Non-Agricultural (NA) order under the Maharashtra Land Revenue Code.');
      stateChecklist.push('Obtain digital signed 7/12 (Saat-Baara) and 8A extract with QR code from MahaBhulekh (bhulekh.mahabhumi.gov.in).');
      stateChecklist.push('Verify Building Commencement Certificate (CC) and MahaRERA quarterly disclosures on maharera.maharashtra.gov.in.');
    } else if (stateRules.stateKey === 'karnataka') {
      stateChecklist.push('🚨 BBMP / BDA A-KHATA VALIDATION: Ensure property holds legal A-Khata. B-Khata properties indicate unauthorized layouts with no bank loan eligibility.');
      stateChecklist.push('Obtain 30-year Encumbrance Certificate (EC Form 15) on Kaveri Online 2.0 (kaverionline.karnataka.gov.in).');
      stateChecklist.push('Check RTC (Record of Rights / Pahani) on Bhoomi Karnataka (bhoomi.karnataka.gov.in).');
    } else if (stateRules.stateKey === 'delhi') {
      stateChecklist.push('🚨 LAL DORA / DLR ACT RESTRICTIONS: If located in rural/abadi areas, verify DDA land pooling notification status.');
      stateChecklist.push('Verify Sub-Registrar deed registration and property tax mutation on DORIS Delhi (doris.delhigovt.nic.in).');
      stateChecklist.push('Check Delhi RERA project approvals on rera.delhi.gov.in.');
    } else if (stateRules.stateKey === 'goa') {
      stateChecklist.push('🚨 SANAD & PORTUGUESE SUCCESSION: Verify Land Conversion Sanad under Goa Land Revenue Code and ensure all legal heirs sign deed consent.');
      stateChecklist.push('Verify Coastal Regulation Zone (CRZ) setbacks on DSLR Goa portal (dslr.goa.gov.in).');
      stateChecklist.push('Check Goa RERA registration on rera.goa.gov.in.');
    } else if (stateRules.stateKey === 'haryana') {
      stateChecklist.push('🚨 DTCP & HARERA APPROVAL: Verify Town & Country Planning colony license and HARERA Gurugram/Panchkula registration.');
      stateChecklist.push('Check registered Jamabandi and Inteqal (Mutation) on jamabandi.nic.in.');
    } else {
      stateChecklist.push(`Verify 30-year Encumbrance Certificate (EC) on ${stateRules.registrationDepartmentName}.`);
      stateChecklist.push(`Confirm RERA project registration ID on ${stateRules.reraPortalName}.`);
      stateChecklist.push(`Verify digitized land records and mutation on ${stateRules.landRecordsPortalName}.`);
      stateChecklist.push(`Ensure property taxes and municipal sanction approvals are fully cleared.`);
    }

    return {
      decision_explanation: explanation,
      top_reasons: input.decision?.reasons?.length ? input.decision.reasons : [
        `Verified social infrastructure and connectivity in ${stateName}.`,
        'Structured financial modeling aligns with your target timeline.',
        'Capital growth potential evaluated against district averages.',
      ],
      risks: input.decision?.risks?.length ? input.decision.risks : [
        'Floating home loan interest rate fluctuations over the loan tenure.',
        'Statutory revenue and title compliance requirements.',
      ],
      financial_summary: `Initial total acquisition requirement is ${initialCostFormatted} (including stamp duty, registration, legal fees, and interior setup). The ongoing monthly EMI is estimated at ${emiFormatted} over 20 years.`,
      location_summary: `The locality benefits from structured road access, transit hubs within reach, and accessible healthcare and education facilities in ${stateName}.`,
      what_to_verify: stateChecklist,
      state_legal_rules: {
        stateName: stateRules.stateName,
        outsiderNotice: stateRules.interstateNotice || 'Standard inter-state purchasing regulations apply.',
        landWarning: stateRules.agriculturalLandWarning || 'Verify non-agricultural conversion and local revenue code compliance.',
        specialNotes: stateRules.specialNotes || [],
      },
    };
  }
}