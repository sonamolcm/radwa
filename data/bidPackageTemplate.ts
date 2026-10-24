import { BidPackage, BidPackageDocument, BoqComparisonData, BoqComparisonItem, ProjectRFQ } from '../types/crm';

export const STANDARD_BID_PACKAGE_NAMES: { name: string; department: string; column: 1 | 2; isRequired: boolean }[] = [
  // Column 1 - Technical & Governance
  { name: 'Commercial Proposal & Final Pricing Letter', department: 'Estimating & Commercial', column: 1, isRequired: true },
  { name: 'Detailed BOQ Takeoff & Rate Breakdown (Excel / PDF)', department: 'Quantity Surveying', column: 1, isRequired: true },
  { name: 'Executive Summary & Project Understanding Narrative', department: 'Executive Management', column: 1, isRequired: true },
  { name: 'Project Method Statement & Construction Execution Plan', department: 'Operations & Engineering', column: 1, isRequired: true },
  { name: 'Project Organization Chart & Key Personnel CVs', department: 'Human Resources', column: 1, isRequired: true },
  { name: 'Project Master Schedule & Baseline Gantt Chart', department: 'Planning & Controls', column: 1, isRequired: true },
  { name: 'Manpower Resource Histogram & Mobilization Curve', department: 'Operations Planning', column: 1, isRequired: true },
  { name: 'Equipment & Machinery Deployment Schedule', department: 'Plant & Equipment', column: 1, isRequired: true },
  { name: 'Quality Assurance & Quality Control (QA/QC) Plan', department: 'QA/QC Department', column: 1, isRequired: true },
  { name: 'Project Quality Plan (PQP) & Inspection Test Plans (ITP)', department: 'QA/QC Department', column: 1, isRequired: true },
  { name: 'Health, Safety & Environment (HSE) Plan & Manual', department: 'HSE Department', column: 1, isRequired: true },
  { name: 'Job Safety Analysis (JSA) & Hazard Identification (HAZID)', department: 'HSE Department', column: 1, isRequired: true },
  { name: 'Emergency Response & Evacuation Plan (ERP)', department: 'HSE Department', column: 1, isRequired: true },
  { name: 'Environmental Management & Waste Disposal Protocol', department: 'HSE Department', column: 1, isRequired: false },
  { name: 'Site Logistics, Laydown & Temporary Facilities Plan', department: 'Operations & Logistics', column: 1, isRequired: true },
  { name: 'Traffic Management & Access Routing Plan', department: 'Site Operations', column: 1, isRequired: false },
  { name: 'Procurement Strategy & Long-Lead Items Schedule', department: 'Procurement & Supply Chain', column: 1, isRequired: true },
  { name: 'Approved Vendor List (AVL) & Major Supplier Pre-Commitments', department: 'Procurement', column: 1, isRequired: true },
  { name: 'Subcontracting Strategy & Specialist Partner Profiles', department: 'Subcontracts', column: 1, isRequired: false },
  { name: 'Field Survey & Geotechnical Site Feasibility Report', department: 'Field Operations & Surveying', column: 1, isRequired: true },

  // Column 2 - Legal, Financial & Corporate Compliance
  { name: 'Valid Commercial Registration (CR Certificate)', department: 'Legal & Corporate Affairs', column: 2, isRequired: true },
  { name: 'Chamber of Commerce Membership Certificate', department: 'Corporate Compliance', column: 2, isRequired: true },
  { name: 'Zakat, Tax and Customs Authority (ZATCA) Certificate', department: 'Finance & Taxation', column: 2, isRequired: true },
  { name: 'Value Added Tax (VAT) Registration Certificate', department: 'Finance & Accounts', column: 2, isRequired: true },
  { name: 'General Organization for Social Insurance (GOSI) Certificate', department: 'HR & Government Relations', column: 2, isRequired: true },
  { name: 'Saudization (Nitaqat - Platinum Status) Certificate', department: 'HR & Government Relations', column: 2, isRequired: true },
  { name: 'Contractors Classification Certificate (Grade 1 / 2)', department: 'Ministry of Municipal & Rural Affairs', column: 2, isRequired: true },
  { name: 'Saudi Council of Engineers (SCE) Company Accreditation', department: 'Engineering Compliance', column: 2, isRequired: true },
  { name: 'ISO 9001:2015 Quality Management System Certification', department: 'QA/QC Governance', column: 2, isRequired: true },
  { name: 'ISO 45001:2018 Occupational Health & Safety Certification', department: 'HSE Governance', column: 2, isRequired: true },
  { name: 'ISO 14001:2015 Environmental Management Certification', department: 'HSE Governance', column: 2, isRequired: true },
  { name: 'Audited Financial Statements (Last 3 Consecutive Fiscal Years)', department: 'Finance & External Auditors', column: 2, isRequired: true },
  { name: 'Bank Credit Facility & Financial Standing Confirmation Letter', department: 'Treasury & Corporate Banking', column: 2, isRequired: true },
  { name: 'Original Tender Bond / Earnest Money Deposit (EMD Guarantee)', department: 'Treasury & Banking', column: 2, isRequired: true },
  { name: 'Company Profile & Similar EPC Track Record Portfolio', department: 'Business Development', column: 2, isRequired: true },
  { name: 'Client Appreciation & Completion Certificates for Similar Projects', department: 'Client Relations', column: 2, isRequired: true },
  { name: 'Litigation History & Non-Debarment Affidavit', department: 'Legal Counsel', column: 2, isRequired: true },
  { name: 'Power of Attorney (POA) for Authorized Signatory', department: 'Corporate Legal', column: 2, isRequired: true },
  { name: 'Parent Company Guarantee (PCG) or Board Resolution', department: 'Executive Board', column: 2, isRequired: false },
  { name: 'Signed & Sealed Client Addenda / Bulletins Acknowledgment', department: 'Tendering & Contracts', column: 2, isRequired: true }
];

export function createDefaultBidPackage(projectId: string, workOrderNo: string): BidPackage {
  const documents: BidPackageDocument[] = STANDARD_BID_PACKAGE_NAMES.map((item, index) => {
    return {
      id: `bp-doc-${index + 1}`,
      order: index + 1,
      column: item.column,
      name: item.name,
      department: item.department,
      isRequired: item.isRequired,
      status: 'Pending Upload',
      sampleDocTitle: item.name,
      sampleDocDescription: `Official signed & verified documentation for ${workOrderNo} submitted under ${item.department}.`
    };
  });

  return {
    id: `bp-${projectId}-${Date.now().toString().slice(-4)}`,
    status: 'Draft',
    documents
  };
}

export function createDefaultBoqComparison(project: ProjectRFQ): BoqComparisonData {
  const sampleItems: BoqComparisonItem[] = [
    {
      id: 'cmp-1',
      itemNo: '01.01',
      category: 'Equipment',
      description: 'Heavy Crawler Excavator 30-Ton with Hydraulic Rock Breaker',
      itemDescription: 'Heavy Crawler Excavator 30-Ton with Hydraulic Rock Breaker',
      unit: 'Units / Mo',
      aiQty: 1,
      aiUnitRate: 45000.0,
      aiTotal: 45000,
      manualQty: 10,
      manualUnitRate: 45000.0,
      manualTotal: 450000,
      deltaQty: 9,
      varianceAmount: 405000,
      variancePercentage: 900.0,
      isFlaggedDiscrepancy: true,
      discrepancyReason: 'Potential equipment inflation flagged by AI. Based on 18km pipeline corridor trench volume (4,200 m³), AI calculated 1 excavator is optimal for 30-day excavation timeline. Estimator specified 10 units.',
      status: 'Needs Justification',
      estimatorQuestion: 'Why did Estimator allocate 10 excavators for a 30-day timeline when 1 excavator can achieve the excavation volume?',
      estimatorJustification: ''
    },
    {
      id: 'cmp-2',
      itemNo: '01.02',
      category: 'Manpower',
      description: 'Certified 6G TIG/SMAW Alloy Pipe Welders (Aramco Approved)',
      itemDescription: 'Certified 6G TIG/SMAW Alloy Pipe Welders (Aramco Approved)',
      unit: 'Men',
      aiQty: 12,
      aiUnitRate: 14500.0,
      aiTotal: 174000,
      manualQty: 24,
      manualUnitRate: 14500.0,
      manualTotal: 348000,
      deltaQty: 12,
      varianceAmount: 174000,
      variancePercentage: 100.0,
      isFlaggedDiscrepancy: false,
      discrepancyReason: 'Manpower variance +50%. AI calculated 12 welders based on 180 total spool welds over 60 shifts. Estimator doubled crew to 24 men.',
      status: 'Justified & Accepted',
      estimatorQuestion: '',
      estimatorJustification: '24-hour round-the-clock dual shift rotation required by Aramco plant shutdown window.'
    },
    {
      id: 'cmp-3',
      itemNo: '02.01',
      category: 'Civil Works',
      description: 'C40/50 Sulfate Resistant Concrete Foundation Pours',
      itemDescription: 'C40/50 Sulfate Resistant Concrete Foundation Pours',
      unit: 'M3',
      aiQty: 1400,
      aiUnitRate: 1650.0,
      aiTotal: 2310000,
      manualQty: 1550,
      manualUnitRate: 1700.0,
      manualTotal: 2635000,
      deltaQty: 150,
      varianceAmount: 325000,
      variancePercentage: 14.1,
      isFlaggedDiscrepancy: true,
      discrepancyReason: 'Concrete volume padded +10.7% beyond IFC structural schedule.',
      status: 'Needs Justification',
      estimatorQuestion: 'Why is foundation concrete volume 1,550 m³ vs 1,400 m³ on drawing Rev 2?',
      estimatorJustification: ''
    },
    {
      id: 'cmp-4',
      itemNo: '02.02',
      category: 'Piping & Mechanical',
      description: '24-inch Seamless Carbon Steel Pipeline API 5L Grade X65',
      itemDescription: '24-inch Seamless Carbon Steel Pipeline API 5L Grade X65',
      unit: 'LM',
      aiQty: 1200,
      aiUnitRate: 1100.0,
      aiTotal: 1320000,
      manualQty: 1250,
      manualUnitRate: 1120.0,
      manualTotal: 1400000,
      deltaQty: 50,
      varianceAmount: 80000,
      variancePercentage: 6.1,
      isFlaggedDiscrepancy: true,
      discrepancyReason: 'Material overrun buffer exceeds 5% Aramco standard allowance.',
      status: 'Needs Justification',
      estimatorQuestion: 'Why is there a 50 LM buffer on 24-inch line without tie-in allowance justification?',
      estimatorJustification: ''
    },
    {
      id: 'cmp-5',
      itemNo: '03.01',
      category: 'HSE & Quality',
      description: 'Third-Party Non-Destructive Testing (NDT Radiography & Ultrasonic)',
      itemDescription: 'Third-Party Non-Destructive Testing (NDT Radiography & Ultrasonic)',
      unit: 'Joints',
      aiQty: 180,
      aiUnitRate: 1700.0,
      aiTotal: 307000,
      manualQty: 180,
      manualUnitRate: 1550.0,
      manualTotal: 279500,
      deltaQty: 0,
      varianceAmount: -27500,
      variancePercentage: -9.0,
      isFlaggedDiscrepancy: true,
      discrepancyReason: 'Rate variance below standard Saudi Council of Engineers norm.',
      status: 'Needs Justification',
      estimatorQuestion: 'Confirm vendor rate commitment for 180 NDT joints at SAR 1,550.',
      estimatorJustification: ''
    }
  ];

  const aiGrandTotal = 4156000;
  const manualGrandTotal = 5112500;
  const totalVarianceAmount = 956500;
  const totalVariancePct = 23;
  const flaggedCount = 4;
  const resolvedCount = 1;

  return {
    items: sampleItems,
    aiGrandTotal,
    manualGrandTotal,
    totalVarianceAmount,
    totalVariancePct,
    flaggedCount,
    resolvedCount
  };
}
