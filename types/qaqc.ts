export type InspectionDiscipline = 
  | 'Civil' 
  | 'Mechanical' 
  | 'Piping' 
  | 'Electrical' 
  | 'Instrumentation' 
  | 'Painting & Coating'
  | string;

export type ItpInspectionPoint = 
  | 'Hold Point (H)' 
  | 'Witness Point (W)' 
  | 'Surveillance (S)' 
  | 'Review (R)'
  | string;

export type InspectionResult = 
  | 'Approved (Code 1)' 
  | 'Approved with Comments (Code 2)' 
  | 'Rejected / Re-inspect (Code 3)' 
  | 'Pending'
  | 'Pending Inspection'
  | string;

export interface RfiInspectionItem {
  id: string;
  rfiRef: string;
  rfiNumber?: string;
  projectId?: string;
  workOrderNo?: string;
  projectName: string;
  clientName?: string;
  wbsTask: string;
  discipline?: InspectionDiscipline;
  inspectionDiscipline: InspectionDiscipline;
  itpHoldPoint?: ItpInspectionPoint;
  itpInspectionPoint: ItpInspectionPoint;
  scheduledDateTime: string;
  inspectionDate?: string;
  siteLocationGridRef: string;
  location?: string;
  radwaInspector: string;
  consultantInspector: string;
  inspectorName?: string;
  qaqcLead?: string;
  status: InspectionResult | string;
  inspectionResult?: InspectionResult;
  findingsComments: string;
  remarks?: string;
  description?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface NcrItem {
  id: string;
  ncrNumber: string;
  workOrderNo: string;
  projectName: string;
  issuedTo: string;
  description: string;
  severity: 'Major' | 'Minor' | string;
  status: 'Open' | 'Under Rectification' | 'Closed' | string;
  correctiveAction: string;
  dateIssued: string;
  closedDate?: string;
  [key: string]: any;
}

export interface PunchListItem {
  id: string;
  punchNumber: string;
  workOrderNo: string;
  projectName: string;
  location: string;
  itemDescription: string;
  category: 'Category A (Pre-Commissioning)' | 'Category B (Post-Handover)' | string;
  status: 'Open' | 'Resolved' | 'Verified' | string;
  assignedTo: string;
  dueDate: string;
  [key: string]: any;
}
