import { ClientAccount, ConstructionTender, CrmKpiSummary, Estimator, ProjectRFQ, Surveyor } from '../types/crm';

export const INITIAL_SURVEYORS: Surveyor[] = [
  {
    id: 'surv-saeed',
    name: 'Saeed Al-Otaibi',
    initials: 'SO',
    role: 'Senior Topographical Surveyor',
    assignedZone: 'Jubail Industrial City',
    phone: '+966 50 123 4567',
    email: 'saeed.otaibi@radwa.sa',
    activeSurveys: 1,
    capacityStatus: 'Available',
    avatarBg: 'bg-teal-100 text-teal-800',
    specialty: 'GPS RTK Topography & GPR Utility Scanning'
  },
  {
    id: 'surv-ibrahim',
    name: 'Ibrahim Khalil',
    initials: 'IK',
    role: 'Civil & Route Inspection Surveyor',
    assignedZone: 'Yanbu Industrial Zone',
    phone: '+966 55 987 6543',
    email: 'ibrahim.khalil@radwa.sa',
    activeSurveys: 0,
    capacityStatus: 'Available',
    avatarBg: 'bg-amber-100 text-amber-800',
    specialty: 'Right-of-Way Clashes & Elevation Surveys'
  },
  {
    id: 'surv-mansoor',
    name: 'Mansoor Al-Harthi',
    initials: 'MH',
    role: 'Geotechnical & Soil Inspector',
    assignedZone: 'Ras Al-Khair & Eastern Province',
    phone: '+966 54 321 0987',
    email: 'mansoor.harthi@radwa.sa',
    activeSurveys: 2,
    capacityStatus: 'On Field / Moderate',
    avatarBg: 'bg-blue-100 text-blue-800',
    specialty: 'Dewatering, Soil Bearing & Deep Trench Safety'
  }
];

export const INITIAL_CLIENTS: ClientAccount[] = [];

export const INITIAL_TENDERS: ConstructionTender[] = [];

export const INITIAL_KPIS: CrmKpiSummary = {
  totalPipelineValue: 0,
  activeTendersCount: 0,
  bidsSubmittedCount: 0,
  wonThisQuarterValue: 0,
  wonThisQuarterCount: 0,
  overallWinRate: 0,
  avgProfitMargin: 0,
  activeBidBondsExposure: 0
};

export const PIPELINE_STAGES: { id: ConstructionTender['stage']; label: string; description: string; color: string }[] = [
  { id: 'qualification', label: '1. Lead & PQ', description: 'Feasibility, PQ submittals, client brief', color: 'slate' },
  { id: 'site_visit', label: '2. Site Survey & Scope', description: 'Site reconnaissance & soil/topography', color: 'blue' },
  { id: 'boq_estimation', label: '3. BOQ Costing', description: 'Takeoffs, labor & subcontractor pricing', color: 'amber' },
  { id: 'bid_submitted', label: '4. Bid Submitted', description: 'Technical & Commercial envelope sent', color: 'purple' },
  { id: 'negotiation', label: '5. Negotiation & Clarifications', description: 'Value engineering, BAFO, LOI', color: 'emerald' },
  { id: 'won', label: '6. Won / Awarded', description: 'Contract signed, Ready for Site Execution', color: 'green' },
  { id: 'lost', label: '7. Lost / Disqualified', description: 'Lost or withdrawn tenders with debrief', color: 'rose' }
];

export const BD_TEAM: { name: string; role: string; activeBids: number; pipelineValue: number; winRate: number }[] = [];

export const INITIAL_ESTIMATORS: Estimator[] = [
  {
    id: 'est-ahmed',
    name: 'Ahmed Mansoor',
    initials: 'AH',
    role: 'Lead Mechanical Estimator',
    activeTenders: 0,
    capacityStatus: 'Optimal Capacity',
    avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    email: 'ahmed.mansoor@radwa-contracting.sa',
    phone: '+966 11 498 1021',
    specialty: 'HVAC, Firefighting, Plumbing & District Cooling'
  },
  {
    id: 'est-farhan',
    name: 'Farhan Qureshi',
    initials: 'FA',
    role: 'Lead Piping & EPC Estimator',
    activeTenders: 0,
    capacityStatus: 'Optimal Capacity',
    avatarBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    email: 'farhan.qureshi@radwa-contracting.sa',
    phone: '+966 11 498 1022',
    specialty: 'Industrial Piping, Pressure Vessels, Refineries & Tanks'
  },
  {
    id: 'est-rajesh',
    name: 'Rajesh Kumar',
    initials: 'RA',
    role: 'Senior Electrical Estimator',
    activeTenders: 0,
    capacityStatus: 'Optimal Capacity',
    avatarBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    email: 'rajesh.kumar@radwa-contracting.sa',
    phone: '+966 11 498 1023',
    specialty: 'High Voltage Substations, Switchgear & Instrumentation'
  },
  {
    id: 'est-salman',
    name: 'Salman Al-Dosari',
    initials: 'SA',
    role: 'Junior Cost Estimator',
    activeTenders: 0,
    capacityStatus: 'Optimal Capacity',
    avatarBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    email: 'salman.dosari@radwa-contracting.sa',
    phone: '+966 11 498 1024',
    specialty: 'Civil Quantities, Earthworks, Foundations & Takeoffs'
  },
  {
    id: 'est-tariq',
    name: 'Tariq Al-Ghamdi',
    initials: 'TA',
    role: 'Lead Civil Estimator',
    activeTenders: 0,
    capacityStatus: 'Optimal Capacity',
    avatarBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    email: 'tariq.ghamdi@radwa-contracting.sa',
    phone: '+966 11 498 1025',
    specialty: 'Reinforced Concrete, Post-Tensioning, Structural Steel & Roads'
  }
];

export const INITIAL_PROJECT_RFQS: ProjectRFQ[] = [];
export const INITIAL_PROJECTS: ProjectRFQ[] = INITIAL_PROJECT_RFQS;
