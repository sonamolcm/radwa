export type TenderStage = 
  | 'qualification' 
  | 'site_visit' 
  | 'boq_estimation' 
  | 'bid_submitted' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export type ProjectCategory = 
  | 'Residential High-Rise' 
  | 'Commercial & Retail' 
  | 'Infrastructure & Roads' 
  | 'Industrial & Logistics' 
  | 'Healthcare & Institutional' 
  | 'Interior & Fit-Out';

export type ContractType = 
  | 'Lump Sum (Turnkey)' 
  | 'Item Rate (BOQ)' 
  | 'EPC (Design-Build)' 
  | 'Cost Plus Guaranteed Max' 
  | 'Subcontract Package';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type SowDiscipline = 
  | 'Civil' 
  | 'Electrical' 
  | 'Mechanical' 
  | 'HVAC' 
  | 'Plumbing' 
  | 'Structural' 
  | 'Specialized Sub-Scopes';

export interface Estimator {
  id: string;
  name: string;
  initials: string;
  role: string;
  activeTenders: number;
  capacityStatus: 'Optimal Capacity' | 'Moderate' | 'Heavy Workload';
  avatarBg?: string;
  email?: string;
  phone?: string;
  specialty?: string;
}

export type ProjectStatus = 
  | 'New RFQ' 
  | 'Pending MD Approval'
  | 'Approved for Bidding'
  | 'Estimator Assigned' 
  | 'Under BOQ Estimation' 
  | 'Survey Required'
  | 'Survey In Progress'
  | 'Bid Submitted' 
  | 'Under Negotiation' 
  | 'Won / Active Project' 
  | 'Won - In Handover'
  | 'Rejected / Withdrawn'
  | 'Declined / Lost';

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export interface SiteReviewDetails {
  required: boolean;
  status: 'Not Decided' | 'Not Required' | 'Scheduled' | 'Completed';
  scheduledDate?: string;
  inspectorName?: string;
  purpose?: string;
  findings?: string;
  completedAt?: string;
}

export interface EstimatorReportDoc {
  docName: string;
  docType: string;
  keyObservation: string;
}

export interface EstimatorReportRisk {
  category: string;
  risk?: string;
  riskDescription?: string;
  impactOnBoq?: string;
  requiredVerification?: string;
}

export interface EstimatorFeasibilityReport {
  reportTitle: string;
  estimatorName: string;
  estimatorRole: string;
  submittedDate: string;
  urgency: string;
  executiveSummary: string;
  tenderDocsReviewed: EstimatorReportDoc[];
  criticalSiteRisks: EstimatorReportRisk[];
  recommendedSurveyScope?: string[];
  justificationForDelay?: string;
  siteAccessProtocols?: string;
  targetCompletionDate?: string;
  estimatorSignature?: string;
}

export type EstimatorSurveyReport = EstimatorFeasibilityReport;

export interface SurveyChecklistItem {
  id: string;
  category: string;
  item: string;
  description?: string;
  status: 'Pending Verification' | 'Compliant / Verified' | 'Risk / Hazard Detected' | 'Not Applicable' | 'Pending' | 'Verified' | 'Issue Detected';
  findings?: string;
  notes?: string;
  photoUrl?: string;
  photoRequired?: boolean;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface SiteSurveyRequest {
  id: string;
  projectId: string;
  requestedByEstimatorId: string;
  requestedByEstimatorName: string;
  requestedAt: string;
  urgency: 'Standard' | 'Urgent' | 'Critical 48h';
  surveyReason: string;
  accessRestrictions?: string;
  targetSurveyDate: string;
  status: 
    | 'Pending AI Checklist' 
    | 'Checklist Ready' 
    | 'Surveyor Dispatched' 
    | 'Surveyor En Route' 
    | 'Survey In Progress'
    | 'Survey Submitted' 
    | 'Completed' 
    | 'Cancelled';
  checklist: SurveyChecklistItem[];
  assignedSurveyorId?: string;
  assignedSurveyorName?: string;
  assignedSurveyor?: string;
  dispatchedAt?: string;
  surveyorDepartedAt?: string;
  handoverNotes?: string;
  opsNotes?: string;
  surveyorObservations?: string;
  surveyorSubmittedAt?: string;
  uploadedSurveyDocuments?: AttachedFile[];
  completedAt?: string;
  estimatorReport?: EstimatorFeasibilityReport;
}

export interface Surveyor {
  id: string;
  name: string;
  initials: string;
  role: string;
  assignedZone: string;
  phone: string;
  email?: string;
  activeSurveys: number;
  capacityStatus: 'Available' | 'On Field / Moderate' | 'Fully Booked';
  avatarBg?: string;
  specialty?: string;
}

export interface ManpowerResource {
  id: string;
  role: string;
  trade: 'Civil' | 'Mechanical' | 'Electrical' | 'Supervision' | 'General Labor' | string;
  count: number;
  durationMonths: number;
  monthlyRate: number;
  totalCost: number;
}

export interface HseResource {
  id: string;
  role: string;
  count: number;
  requirements: string;
  monthlyCost: number;
  totalCost: number;
}

export interface QaQcResource {
  id: string;
  role: string;
  count: number;
  testingScope: string;
  monthlyCost: number;
  totalCost: number;
}

export interface EquipmentResource {
  id: string;
  equipmentName: string;
  type: string;
  quantity: number;
  durationMonths: number;
  monthlyRental: number;
  totalCost: number;
}

export interface BoqLineItem {
  id: string;
  itemNo: string;
  package: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
}

export interface AiBoqCalculation {
  promptUsed: string;
  projectSummary: string;
  estimatedDurationMonths: number;
  manpower: ManpowerResource[];
  hse: HseResource[];
  qaqc: QaQcResource[];
  equipmentRentals: EquipmentResource[];
  boqLineItems: BoqLineItem[];
  totals: {
    directMaterialCost: number;
    manpowerCost: number;
    equipmentCost: number;
    hseCost: number;
    qaqcCost: number;
    overheadsAndPreliminaries: number;
    marginPct: number;
    marginAmount: number;
    totalCommercialBidPrice: number;
  };
  generatedAt: string;
}

export interface ProjectRFQ {
  id: string;
  enquirySerialNo: string; // e.g. RGC-RFQ-2026-0145
  workOrderNo: string;     // e.g. WO-2026-0145
  clientRfqNo: string;     // e.g. ghj12345
  receivedDate: string;    // e.g. Oct 16 / 2026-10-16
  clientName: string;      // e.g. omar sohan
  clientShortName: string; // e.g. MA'ADEN
  siteName: string;        // e.g. Ras-al-Khair
  proposedProjectName: string; // e.g. omar sohan's opportunity
  clientSenderContact: string; // e.g. omar@gmail.com
  projectLocation: string; // e.g. Jubail Industrial City
  rfqCameToWhoseName: string; // e.g. Fatima Ali (Office Secretary)
  rfqReceivedThrough: string; // e.g. Email
  projectWorkDescription: string;
  sowScopes: SowDiscipline[];
  sowCaveatsNotes: string;
  bidExtensionDate?: string;
  bidCloseDate: string;
  bidSubmissionType: string;
  attachedFiles: AttachedFile[];
  assignedEstimatorId?: string;
  assignedEstimatorName?: string;
  assignedEstimatorRole?: string;
  status: ProjectStatus;
  estimatedValue?: number;
  mdStatus?: 'Pending Review' | 'Approved for Bidding' | 'Declined';
  mdApprovedAt?: string;
  mdRemarks?: string;
  managementReviewers?: string[];
  siteReview?: SiteReviewDetails;
  surveyRequest?: SiteSurveyRequest;
  aiBoqCalculation?: AiBoqCalculation;
  bidPackage?: BidPackage;
  boqComparison?: BoqComparisonData;
  createdAt: string;
}

export interface BidPackageApprover {
  department: string;
  employeeName: string;
  employeeEmail: string;
  role: string;
  status: 'Pending Review' | 'Approved' | 'Changes Requested';
  assignedAt: string;
  documentCount: number;
}

export interface BidPackageDocument {
  id: string;
  order: number;
  column: 1 | 2;
  name: string;
  department: string;
  isRequired: boolean;
  status: 'Pending Upload' | 'Uploaded' | 'Approved' | 'Sent for Review';
  uploadedFile?: AttachedFile;
  notes?: string;
  sampleDocTitle?: string;
  sampleDocDescription?: string;
  assignedReviewer?: string;
  assignedReviewerEmail?: string;
}

export interface BidPackage {
  id: string;
  status: 'Draft' | 'Sent for Approval' | 'Approved & Transmitted' | 'Approved';
  sentForApprovalAt?: string;
  approvedAt?: string;
  transmittedAt?: string;
  documents: BidPackageDocument[];
  approvers?: BidPackageApprover[];
  routingNotes?: string;
}

export interface BoqComparisonItem {
  id: string;
  itemNo: string;
  description: string;
  itemDescription?: string;
  discrepancyReason?: string;
  category: string;
  unit: string;
  aiQty: number;
  aiUnitRate: number;
  aiTotal: number;
  manualQty: number;
  manualUnitRate: number;
  manualTotal: number;
  deltaQty: number;
  varianceAmount: number;
  variancePercentage: number;
  isFlaggedDiscrepancy: boolean;
  status: 'Exact Match' | 'Variance Flagged' | 'Justified & Accepted' | 'Adjusted / Fixed' | 'Pending Justification';
  estimatorQuestion?: string;
  estimatorJustification?: string;
}

export interface BoqComparisonData {
  items: BoqComparisonItem[];
  aiGrandTotal: number;
  manualGrandTotal: number;
  totalVarianceAmount: number;
  totalVariancePct: number;
  flaggedCount: number;
  resolvedCount: number;
}

export interface ClientContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  type: 'Private Developer' | 'Government Authority' | 'Consultancy / PMC' | 'Semi-Gov Enterprise';
  tier: 'Platinum' | 'Gold' | 'Standard';
  country: string;
  city: string;
  totalAwardedValue: number;
  activeTendersCount: number;
  contactPerson: ClientContact;
  rating: number; // 1-5
  logoInitials: string;
}

export interface ClientRecord {
  id: string;
  companyName: string;
  shortCode?: string;
  crNumber?: string;
  vatNumber?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
  headquarters?: string;
  createdAt?: string;
}

export interface BidActivity {
  id: string;
  date: string;
  type: 'site_visit' | 'addendum_received' | 'estimation_revised' | 'clarification_sent' | 'client_meeting';
  title: string;
  actor: string;
  notes: string;
}

export interface ConstructionTender {
  id: string;
  referenceNo: string; // e.g. RDW-TND-2026-089
  title: string;
  client: ClientAccount;
  category: ProjectCategory;
  contractType: ContractType;
  estimatedValue: number; // in USD
  tenderFee: number;
  emdBondAmount: number; // Earnest Money Deposit / Bid Bond
  bondExpiryDate: string;
  submissionDeadline: string; // ISO date
  siteLocation: string;
  consultantFirm: string;
  stage: TenderStage;
  winProbability: number; // 0 - 100%
  expectedMargin: number; // percentage
  leadOwner: string; // BD Manager
  seniorEstimator: string;
  priority: PriorityLevel;
  builtUpAreaSqM: number;
  durationMonths: number;
  boqItemCount: number;
  preBidMeetingDate?: string;
  lastUpdated: string;
  notes: string;
  activities: BidActivity[];
  convertedProjectId?: string; // if won and converted
}

export interface CrmKpiSummary {
  totalPipelineValue: number;
  activeTendersCount: number;
  bidsSubmittedCount: number;
  wonThisQuarterValue: number;
  wonThisQuarterCount: number;
  overallWinRate: number;
  avgProfitMargin: number;
  activeBidBondsExposure: number;
}
