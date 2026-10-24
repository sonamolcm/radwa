import { HseKpiReport, HseIncidentItem, ToolboxTalkItem } from '../types/hse';

export const INITIAL_HSE_KPIS: HseKpiReport[] = [
  {
    id: 'hse-kpi-1',
    kpiRef: 'HSE-KPI-001',
    projectId: 'proj-maaden-2',
    projectName: 'MAADEN Phosphate Complex Infrastructure',
    clientName: 'MAADEN Phosphate',
    reportingMonth: 'October 2026',
    totalSafeManHours: 145000,
    lostTimeInjuries: 0,
    totalRecordableIncidents: 0,
    firstAidCases: 1,
    nearMissReports: 3,
    ltifr: 0.00,
    trifr: 0.00,
    safeDaysCount: 840,
    status: 'Verified Zero LTI',
    recordedBy: 'Hamad Al-Ghamdi',
    createdAt: '2026-10-01'
  },
  {
    id: 'hse-kpi-2',
    kpiRef: 'HSE-KPI-002',
    projectId: 'proj-aramco-safaniya',
    projectName: 'Aramco Safaniya Offshore Tie-In Support',
    clientName: 'Saudi Aramco',
    reportingMonth: 'October 2026',
    totalSafeManHours: 198000,
    lostTimeInjuries: 0,
    totalRecordableIncidents: 0,
    firstAidCases: 0,
    nearMissReports: 2,
    ltifr: 0.00,
    trifr: 0.00,
    safeDaysCount: 1120,
    status: 'Verified Zero LTI',
    recordedBy: 'Sultan Al-Ghamdi',
    createdAt: '2026-10-05'
  }
];

export const INITIAL_HSE_INCIDENTS: HseIncidentItem[] = [
  {
    id: 'inc-01',
    incidentRef: 'INC-2026-004',
    title: 'Minor Hydraulic Fluid Seepage during Crane Rigging',
    severity: 'Low',
    status: 'Closed - CAPA Verified',
    date: '2026-10-12',
    location: 'Jubail Industrial Fabrication Yard #2',
    projectName: 'MAADEN Phosphate Complex Infrastructure',
    assignedOfficer: 'Hamad Al-Ghamdi (HSE Lead)',
    description: 'Drip tray was deployed immediately; spill containment kit applied within 4 minutes. No soil or water contamination.',
    capaPlan: 'Daily hydraulic hose pre-use inspection checklist enforced for all subcontractor mobile cranes.'
  }
];

export const INITIAL_TOOLBOX_TALKS: ToolboxTalkItem[] = [
  {
    id: 'tbt-01',
    tbtRef: 'TBT-2026-089',
    topic: 'Working at Heights & Full Body Harness 100% Tie-Off',
    date: '2026-10-20',
    projectName: 'MAADEN Phosphate Complex Infrastructure',
    attendeesCount: 42,
    conductedLanguage: 'English, Arabic & Hindi',
    keyHazardsDiscussed: 'Scaffold tag inspection, double lanyard anchoring points, and wind speed threshold limits (>20 knots stop work).',
    supervisorName: 'Sultan Al-Ghamdi',
    siteLocation: 'Structural Rack Area - Elevation +18m'
  }
];
