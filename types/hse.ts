export interface HseKpiReport {
  id: string;
  kpiRef: string;
  projectId: string;
  projectName: string;
  clientName?: string;
  reportingMonth: string;
  totalSafeManHours: number;
  lostTimeInjuries: number;
  totalRecordableIncidents: number;
  firstAidCases: number;
  nearMissReports: number;
  ltifr: number;
  trifr: number;
  safeDaysCount?: number;
  status?: string;
  recordedBy?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface HseIncidentItem {
  id: string;
  incidentRef: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low' | 'Critical' | string;
  status: 'Open' | 'Under Investigation' | 'Closed - CAPA Verified' | string;
  date: string;
  location: string;
  projectName: string;
  assignedOfficer: string;
  description: string;
  capaPlan?: string;
  [key: string]: any;
}

export interface ToolboxTalkItem {
  id: string;
  tbtRef: string;
  topic: string;
  date: string;
  projectName: string;
  attendeesCount: number;
  conductedLanguage: string;
  keyHazardsDiscussed: string;
  supervisorName: string;
  siteLocation: string;
  [key: string]: any;
}
