import { AnalysisResult } from '../types/analysis';
import { generatePurchaseGuide } from './purchaseGuideGenerator';

export interface ProcedurePlacesData {
  advocates: Array<{ name: string; address?: string; phone?: string; distance?: string; distanceKm?: number; rating?: number; type?: string }>;
  banks: Array<{ name: string; address?: string; phone?: string; distance?: string; distanceKm?: number; rating?: number; type?: string }>;
  municipal: Array<{ name: string; address?: string; phone?: string; distance?: string; distanceKm?: number; rating?: number; type?: string }>;
  courts: Array<{ name: string; address?: string; phone?: string; distance?: string; distanceKm?: number; rating?: number; type?: string }>;
}

function formatPDFCurrency(amount: number): string {
  if (!amount && amount !== 0) return 'Rs. 0';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `Rs. ${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lk = amount / 100000;
    return `Rs. ${Number.isInteger(lk) ? lk : lk.toFixed(2)} Lakh`;
  }
  return `Rs. ${Math.round(amount).toLocaleString('en-IN')}`;
}

async function getLogoBase64(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generatePropertyPDF(
  analysis: AnalysisResult,
  procedurePlacesInput?: ProcedurePlacesData
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryBlue = [37, 99, 235];
  const darkNavy = [15, 23, 42];
  const textGray = [71, 85, 105];
  const bgLight = [248, 250, 252];
  const borderGray = [226, 232, 240];

  const totalPages = 4;
  const logoBase64 = await getLogoBase64();

  // Helper for Header & Footer
  const renderHeaderFooter = (pageNo: number, total: number = totalPages) => {
    // Header background banner
    pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.rect(0, 0, pageWidth, 18, 'F');

    let textStartX = margin;
    if (logoBase64) {
      try {
        // White rounded background tile so navy logo stands out with high contrast
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(margin, 2.5, 13, 13, 2, 2, 'F');
        pdf.addImage(logoBase64, 'PNG', margin + 1, 3.5, 11, 11);
        textStartX = margin + 16;
      } catch {
        textStartX = margin;
      }
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(255, 255, 255);
    pdf.text('PROPERTY X AI', textStartX, 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    pdf.text('PROPERTY INTELLIGENCE REPORT', pageWidth - margin, 12, { align: 'right' });

    // Footer
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    pdf.setFontSize(8);
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text('Confidential — Prepared by Property X AI Intelligence Platform', margin, pageHeight - 8);
    pdf.text(`Page ${pageNo} of ${total}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: Executive Summary & Financial Analysis
  // ==========================================
  renderHeaderFooter(1, totalPages);

  let y = 26;

  // Document Title Box
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.rect(margin, y, contentWidth, 22, 'F');
  pdf.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.setLineWidth(1);
  pdf.line(margin, y, margin, y + 22);

  if (logoBase64) {
    try {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin + 4, y + 3, 16, 16, 2, 2, 'F');
      pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      pdf.roundedRect(margin + 4, y + 3, 16, 16, 2, 2, 'D');
      pdf.addImage(logoBase64, 'PNG', margin + 5, y + 4, 14, 14);
    } catch {}
  }
  const titleX = logoBase64 ? margin + 24 : margin + 5;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('Property Intelligence Report', titleX, y + 9);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text(`Address: ${analysis.propertyInput.locationDetails?.address || analysis.propertyInput.location}`, titleX, y + 16);
  pdf.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, pageWidth - margin - 4, y + 16, { align: 'right' });

  y += 28;

  // Overview Badges (Score & Recommendation)
  const boxWidth = (contentWidth - 6) / 2;

  // Score Box
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.rect(margin, y, boxWidth, 32, 'FD');

  pdf.setFontSize(9);
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text('OVERALL INTELLIGENCE SCORE', margin + 6, y + 8);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.text(`${analysis.scores.overall}/100`, margin + 6, y + 22);

  // Recommendation Box
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.rect(margin + boxWidth + 6, y, boxWidth, 32, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text('FINAL RECOMMENDATION', margin + boxWidth + 12, y + 8);

  const rec = analysis.recommendation;
  const recColor = rec === 'BUY' ? [22, 163, 74] : rec === 'RENT' ? [37, 99, 235] : [217, 119, 6];
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(recColor[0], recColor[1], recColor[2]);
  pdf.text(rec, margin + boxWidth + 12, y + 22);

  y += 38;

  // Financial Analysis Section Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('1. Financial Breakdown & Affordability', margin, y);
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  const cost = analysis.costEstimation;
  const detectedPaymentMode =
    analysis.propertyInput?.paymentMode ||
    (analysis.propertyInput as any)?.details?.paymentMode ||
    'emi';
  const isFullPayment = detectedPaymentMode === 'full';
  const isEmiSelected = !isFullPayment;

  const finRows = isFullPayment
    ? [
        ['Property Valuation / Price', formatPDFCurrency(cost.propertyPrice)],
        ['Financing Mode', '100% Full Cash Upfront (Zero Loan / Zero EMI)'],
        ['Estimated Stamp Duty', formatPDFCurrency(cost.stampDuty)],
        ['Estimated Registration Fee', formatPDFCurrency(cost.registration)],
        ['Estimated Legal & Title Charges', formatPDFCurrency(cost.legalCharges)],
        ['Interior & Renovation (Est.)', formatPDFCurrency(cost.interiorCost)],
        ['Monthly Society Maintenance', formatPDFCurrency(cost.monthlyMaintenance)],
        ['Total Initial Outlay (Upfront)', formatPDFCurrency(cost.totalInitialCost)],
      ]
    : [
        ['Property Valuation / Price', formatPDFCurrency(cost.propertyPrice)],
        ['Monthly Salary / Gross Income', formatPDFCurrency(cost.monthlySalary || 0)],
        ['Monthly Living Expenses', formatPDFCurrency(cost.monthlyExpenses || 0)],
        ['Available Monthly Income (Net)', formatPDFCurrency(cost.availableIncome || 0)],
        ['Estimated Loan EMI (8.5%, 20Y)', formatPDFCurrency(cost.monthlyEMI)],
        ['Monthly Maintenance', formatPDFCurrency(cost.monthlyMaintenance)],
        ['Total Monthly Property Outflow', formatPDFCurrency(cost.monthlyTotal)],
        ['Total Initial Upfront Cost (Stamp Duty + Reg + Legal)', formatPDFCurrency(cost.totalInitialCost)],
      ];

  pdf.setFontSize(9);
  finRows.forEach(([label, val], idx) => {
    const rowY = y + idx * 7;
    pdf.setFillColor(idx % 2 === 0 ? 255 : bgLight[0], idx % 2 === 0 ? 255 : bgLight[1], idx % 2 === 0 ? 255 : bgLight[2]);
    pdf.rect(margin, rowY, contentWidth, 7, 'F');

    pdf.setFont('helvetica', label.includes('Available') || label.includes('Total') || label.includes('Financing') ? 'bold' : 'normal');
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(label, margin + 4, rowY + 5);
    pdf.text(val, pageWidth - margin - 4, rowY + 5, { align: 'right' });
  });

  y += finRows.length * 7 + 10;

  // Property Score Breakdown Section Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('2. Parameter Score Breakdown', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  const scoreGrid = [
    { name: 'Affordability', score: analysis.scores.affordability },
    { name: 'Location & Surroundings', score: analysis.scores.location },
    { name: 'Connectivity & Transit', score: analysis.scores.connectivity },
    { name: 'Infrastructure & Amenities', score: analysis.scores.infrastructure },
    { name: 'Environment & Livability', score: analysis.scores.environment },
    { name: 'Future Growth & Appreciation', score: analysis.scores.future },
  ];

  scoreGrid.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const itemX = margin + col * (boxWidth + 6);
    const itemY = y + row * 12;

    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(itemX, itemY, boxWidth, 10, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(item.name, itemX + 4, itemY + 6);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.text(`${item.score}/100`, itemX + boxWidth - 4, itemY + 6, { align: 'right' });
  });

  // ==========================================
  // PAGE 2: Nearby Facilities, Risk Analysis & Conclusion
  // ==========================================
  pdf.addPage();
  renderHeaderFooter(2, totalPages);

  y = 26;

  // Nearby Facilities Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('3. Nearby Infrastructure & Facilities (Google Places API)', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  // Table Header
  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(margin, y, contentWidth, 7, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('CATEGORY', margin + 4, y + 5);
  pdf.text('FACILITY NAME & ADDRESS', margin + 45, y + 5);
  pdf.text('DISTANCE', pageWidth - margin - 4, y + 5, { align: 'right' });

  y += 7;

  analysis.nearbyPlaces.slice(0, 8).forEach((place, idx) => {
    pdf.setFillColor(idx % 2 === 0 ? 255 : bgLight[0], idx % 2 === 0 ? 255 : bgLight[1], idx % 2 === 0 ? 255 : bgLight[2]);
    pdf.rect(margin, y, contentWidth, 6, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(place.type, margin + 4, y + 4.5);
    pdf.text((place.name + (place.address ? ` - ${place.address}` : '')).substring(0, 48), margin + 45, y + 4.5);
    pdf.text(place.distance, pageWidth - margin - 4, y + 4.5, { align: 'right' });

    y += 6;
  });

  y += 10;

  // Risk Assessment Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('4. Key Risk Factors & Stress-Test Analysis', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  const risksToDisplay = analysis.risks && analysis.risks.length > 0 ? analysis.risks.slice(0, 4) : [];
  risksToDisplay.forEach((risk) => {
    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(margin, y, contentWidth, 11, 'F');

    const badgeColor = risk.level === 'high' ? [220, 38, 38] : risk.level === 'medium' ? [217, 119, 6] : [22, 163, 74];
    pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    pdf.rect(margin + 3, y + 3, 14, 5, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text(risk.level.toUpperCase(), margin + 10, y + 6.5, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(`${risk.category}: ${risk.title}`.substring(0, 36), margin + 20, y + 6.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(risk.description.substring(0, 52), pageWidth - margin - 4, y + 6.5, { align: 'right' });

    y += 13;
  });

  y += 6;

  // Verdict Banner
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(margin, y, contentWidth, 24, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('EXECUTIVE VERDICT & RECOMMENDATION', margin + 6, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(203, 213, 225);
  pdf.text(
    `Based on financial available income, location scores, commute indicators, and risk parameters, our AI model recommends: ${rec}. Confidence score: ${analysis.confidence}%.`,
    margin + 6,
    y + 16
  );

  // ==========================================
  // PAGE 3: Government Regulations & Legal Checklist
  // ==========================================
  pdf.addPage();
  renderHeaderFooter(3, totalPages);

  const guide = generatePurchaseGuide(analysis);
  y = 26;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('5. State Legal & Due Diligence Guidelines', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  // Scenario Box
  pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  pdf.rect(margin, y, contentWidth, 20, 'F');
  pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  pdf.rect(margin, y, contentWidth, 20, 'D');

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`Buyer State: ${guide.scenario.buyerState}`, margin + 4, y + 6);
  pdf.text(`Property State: ${guide.scenario.propertyState}`, margin + 60, y + 6);
  pdf.text(`Property Type: ${guide.scenario.propertyTypeLabel}`, margin + 120, y + 6);

  pdf.setFont('helvetica', 'normal');
  if (guide.scenario.isInterstate) {
    pdf.setTextColor(180, 83, 9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Status: Interstate Property Purchase (State-specific verification applies)', margin + 4, y + 14);
  } else {
    pdf.setTextColor(22, 163, 74);
    pdf.text(`Status: Intra-state transaction within ${guide.scenario.propertyState}`, margin + 4, y + 14);
  }

  y += 24;

  // Key Legal Documents Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('Essential Document Checklist', margin, y);

  y += 5;

  pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  pdf.rect(margin, y, contentWidth, 6, 'F');

  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('DOCUMENT NAME', margin + 4, y + 4.5);
  pdf.text('CATEGORY', margin + 85, y + 4.5);
  pdf.text('STATUS', pageWidth - margin - 4, y + 4.5, { align: 'right' });

  y += 6;

  guide.checklist.slice(0, 7).forEach((doc, idx) => {
    pdf.setFillColor(idx % 2 === 0 ? 255 : bgLight[0], idx % 2 === 0 ? 255 : bgLight[1], idx % 2 === 0 ? 255 : bgLight[2]);
    pdf.rect(margin, y, contentWidth, 6, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(doc.name, margin + 4, y + 4.2);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(doc.categoryLabel, margin + 85, y + 4.2);

    pdf.setFont('helvetica', 'bold');
    const stColor = doc.status === 'required' ? [22, 163, 74] : doc.status === 'may-apply' ? [217, 119, 6] : [37, 99, 235];
    pdf.setTextColor(stColor[0], stColor[1], stColor[2]);
    pdf.text(doc.statusLabel.replace(/[✓⚠ℹ]/g, '').trim(), pageWidth - margin - 4, y + 4.2, { align: 'right' });

    y += 6;
  });

  y += 8;

  // State Outsider & Non-Domicile Legal Summary
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`State Acquisition & Land Conversion Laws (${guide.stateRules.stateName})`, margin, y);

  y += 5;

  const legalNotes = [
    `• Outsider Rules: ${guide.stateRules.interstateNotice || 'Interstate buyers can freely purchase residential property under Transfer of Property Act.'}`,
    `• Revenue Land Conversion: ${guide.stateRules.agriculturalLandWarning || 'Ensure verified non-agricultural (NA/CLU) conversion and approved building layout plan.'}`,
    `• RERA Compliance: Mandatory verification of builder RERA registration certificate and escrow account.`,
  ];

  legalNotes.forEach((note) => {
    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(margin, y, contentWidth, 10, 'F');
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.rect(margin, y, contentWidth, 10, 'D');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(note.substring(0, 110), margin + 4, y + 6.5);
    y += 12;
  });

  y += 4;

  // Official Government Portals Section
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text(`Official Government Portals (${guide.stateRules.stateName})`, margin, y);

  y += 5;

  guide.officialPortals.slice(0, 3).forEach((portal) => {
    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.rect(margin, y, contentWidth, 8, 'D');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(`${portal.category}: ${portal.name}`, margin + 4, y + 5.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.text(portal.domain, pageWidth - margin - 4, y + 5.5, { align: 'right' });

    y += 10;
  });

  // ==========================================
  // PAGE 4: Statutory Property Acquisition Roadmap & Local Authorities Directory
  // ==========================================
  pdf.addPage();
  renderHeaderFooter(4, totalPages);

  y = 26;

  // Section Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('6. Statutory Acquisition Procedure & Local Authorities Directory', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 8;

  // Procedure Banner with Payment Mode Badge
  pdf.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.rect(margin, y, contentWidth, 14, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.text('4-STAGE STATUTORY CONVEYANCING ROADMAP', margin + 6, y + 6);

  const paymentBadge = isFullPayment
    ? 'Mode: 100% Upfront Full Cash (Zero Loan Liabilities)'
    : 'Mode: Bank Home Loan / EMI Financing';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(isFullPayment ? 52 : 96, isFullPayment ? 211 : 165, isFullPayment ? 153 : 250);
  pdf.text(paymentBadge, pageWidth - margin - 6, y + 6, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text(
    'Standard legal conveyance under Transfer of Property Act, 1882 & Registration Act, 1908.',
    margin + 6,
    y + 11
  );

  y += 18;

  // 4-Stage Conveyancing Roadmap (2x2 Grid)
  const roadmapStages = [
    {
      num: '1',
      title: 'Title Due Diligence & Search',
      authority: 'Advocate / Legal Counsel',
      desc: 'Verify 30-year Encumbrance Certificate (EC), mother deed chain, and Khasra/Khatauni land records.',
      keyDoc: 'Non-Encumbrance Report',
      color: [37, 99, 235],
    },
    {
      num: '2',
      title: isEmiSelected ? 'Loan Sanction & Valuation' : 'Self-Funded Settlement & Escrow',
      authority: isEmiSelected ? 'Bank / Lending Institution' : 'Buyer & Seller Settlement',
      desc: isEmiSelected
        ? 'Submit builder NOC. Bank conducts Title Investigation Report (TIR) & physical valuation.'
        : 'Execute registered Agreement to Sell (ATS), transfer token via traceable RTGS, escrow balance.',
      keyDoc: isEmiSelected ? 'Sanction Letter & MODTD' : 'Registered Agreement to Sell',
      color: isEmiSelected ? [22, 163, 74] : [217, 119, 6],
    },
    {
      num: '3',
      title: 'Municipal & Tehsil Clearances',
      authority: 'Municipal Body / Tehsil',
      desc: 'Check sanctioned building plan, Completion/Occupancy Certificate (OC/CC), and property tax no-dues.',
      keyDoc: 'Municipal Map NOC & OC',
      color: [217, 119, 6],
    },
    {
      num: '4',
      title: 'Sub-Registrar Registry & Mutation',
      authority: 'Sub-Registrar Court',
      desc: 'Pay e-stamp duty, present biometrics at Registrar Court, execute Sale Deed, and apply for revenue mutation.',
      keyDoc: 'Registered Deed & Mutation',
      color: [147, 51, 234],
    },
  ];

  roadmapStages.forEach((stage, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sX = margin + col * (boxWidth + 6);
    const sY = y + row * 24;

    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(sX, sY, boxWidth, 22, 'F');
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.rect(sX, sY, boxWidth, 22, 'D');

    // Number Badge
    pdf.setFillColor(stage.color[0], stage.color[1], stage.color[2]);
    pdf.rect(sX + 3, sY + 3, 5, 5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text(stage.num, sX + 5.5, sY + 6.8, { align: 'center' });

    // Stage Title
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.setFontSize(8);
    pdf.text(stage.title, sX + 11, sY + 6.8);

    // Authority subtitle
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(stage.color[0], stage.color[1], stage.color[2]);
    pdf.text(`[${stage.authority}]`, sX + boxWidth - 3, sY + 6.8, { align: 'right' });

    // Description
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(stage.desc.substring(0, 58), sX + 4, sY + 12.5);
    if (stage.desc.length > 58) {
      pdf.text(stage.desc.substring(58, 115), sX + 4, sY + 16);
    }

    // Key Doc
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    pdf.text(`Key Doc: ${stage.keyDoc}`, sX + 4, sY + 20);
  });

  y += 54;

  // Local Authority Directory Section Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  pdf.text('Local Legal & Government Authorities Directory (Google Maps Live API)', margin, y);
  pdf.line(margin, y + 2, pageWidth - margin, y + 2);

  y += 6;

  // Extract authorities from input or analysis nearbyPlaces
  const procedurePlaces = procedurePlacesInput || {
    advocates: (analysis.nearbyPlaces || []).filter((p) => p.type.toLowerCase().includes('lawyer') || p.type.toLowerCase().includes('advocate')),
    banks: (analysis.nearbyPlaces || []).filter((p) => p.type.toLowerCase().includes('bank')),
    municipal: (analysis.nearbyPlaces || []).filter((p) => p.type.toLowerCase().includes('municipal') || p.type.toLowerCase().includes('government')),
    courts: (analysis.nearbyPlaces || []).filter((p) => p.type.toLowerCase().includes('court') || p.type.toLowerCase().includes('registr')),
  };

  const directoryCategories = [
    {
      title: 'Advocates & Legal Counsel',
      items: procedurePlaces.advocates.slice(0, 2),
      icon: 'Legal',
      badge: 'Title Due Diligence & Search',
    },
    {
      title: 'Sub-Registrar & Registry Courts',
      items: procedurePlaces.courts.slice(0, 2),
      icon: 'Court',
      badge: 'Deed Execution & Biometrics',
    },
    {
      title: 'Municipal & Tehsil Authority',
      items: procedurePlaces.municipal.slice(0, 2),
      icon: 'Govt',
      badge: 'Sanction Map & Property Tax',
    },
    ...(isEmiSelected
      ? [
          {
            title: 'Bank & Mortgage Branches',
            items: procedurePlaces.banks.slice(0, 2),
            icon: 'Bank',
            badge: 'Home Loan Sanction & TIR',
          },
        ]
      : [
          {
            title: '100% Cash Settlement Desk',
            items: [
              {
                name: 'Direct Escrow & RTGS Ledger',
                address: 'Settlement through verified scheduled bank direct RTGS transfer',
                phone: 'Zero Loan Liabilities',
                distance: 'Immediate Settlement',
              },
            ],
            icon: 'Cash',
            badge: 'Zero Mortgage Liens',
          },
        ]),
  ];

  directoryCategories.forEach((cat, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cX = margin + col * (boxWidth + 6);
    const cY = y + row * 45;

    pdf.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    pdf.rect(cX, cY, boxWidth, 42, 'F');
    pdf.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    pdf.rect(cX, cY, boxWidth, 42, 'D');

    // Category Header Box
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.rect(cX, cY, boxWidth, 6.5, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(cat.title, cX + 3, cY + 4.5);
    pdf.setFontSize(6.5);
    pdf.text(cat.badge, cX + boxWidth - 3, cY + 4.5, { align: 'right' });

    let itemY = cY + 9;
    if (cat.items.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(7);
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.text('Local authority scanned via Google Maps API.', cX + 3, itemY + 4);
    } else {
      cat.items.forEach((it, itIdx) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
        pdf.text(`${itIdx + 1}. ${it.name}`.substring(0, 40), cX + 3, itemY + 3.5);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.8);
        pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        pdf.text(it.distance || 'Nearby', cX + boxWidth - 3, itemY + 3.5, { align: 'right' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6.8);
        pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
        if (it.phone) {
          pdf.text(`Tel: ${it.phone}`, cX + 3, itemY + 8);
        }
        if (it.address) {
          pdf.text(`Addr: ${it.address.substring(0, 44)}`, cX + 3, itemY + 12);
        }
        itemY += 16;
      });
    }
  });

  // Disclaimer at bottom of Page 4
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text(
    'Disclaimer: Property X AI can make mistakes. Check important info. Contacts & authorities retrieved from Google Maps Places API.',
    margin,
    pageHeight - 17
  );

  pdf.save(`Property-X-Intelligence-Report-${Date.now()}.pdf`);
}
