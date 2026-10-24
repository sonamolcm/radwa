export type UserRole = 'admin' | 'crm' | 'md' | 'estimator' | 'operations' | 'surveyor' | 'qaqc' | 'hse' | 'hr' | 'mr' | 'purchase' | 'inventory';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  estimatorId?: string;
  surveyorId?: string;
  avatarInitials: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

export const PRESET_USERS: Record<UserRole, AuthUser & { defaultPassword: string; description: string }> = {
  admin: {
    id: 'usr-admin-01',
    name: 'System Administrator',
    email: 'admin@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'admin',
    roleTitle: 'Enterprise Super Administrator',
    department: 'IT & Executive Governance',
    avatarInitials: 'SA',
    description: 'Full enterprise privileges. Can access and manage CRM Admin Portal, Managing Director Console, Estimator Workspace, and Operations.'
  },
  crm: {
    id: 'usr-crm-01',
    name: 'Fatima Ali',
    email: 'crm@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'crm',
    roleTitle: 'CRM & Tendering Administrator',
    department: 'Business Development & Client Intake',
    avatarInitials: 'FA',
    description: 'Registers inbound tenders, manages client intake, tracks SOW scopes, and assigns estimators.'
  },
  md: {
    id: 'usr-md-01',
    name: 'Eng. Tariq Al-Mansour',
    email: 'md@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'md',
    roleTitle: 'Managing Director',
    department: 'Executive Governance & Bidding Authorization',
    avatarInitials: 'TM',
    description: 'Inspects tender dossiers, verifies team capacity, and authorizes commercial bidding sign-off.'
  },
  estimator: {
    id: 'usr-est-01',
    name: 'Farhan Qureshi',
    email: 'estimator@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'estimator',
    roleTitle: 'Lead Piping & EPC Estimator',
    department: 'Quantity Surveying & Cost Estimation',
    estimatorId: 'est-farhan',
    avatarInitials: 'FQ',
    description: 'Inspects MD-approved tenders, completes site reviews, runs AI BOQ takeoffs, and submits bids.'
  },
  operations: {
    id: 'usr-ops-01',
    name: 'Eng. Walid Al-Harbi',
    email: 'operations@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'operations',
    roleTitle: 'Operations & Site Feasibility Manager',
    department: 'Field Operations & Site Execution',
    avatarInitials: 'WH',
    description: 'Receives survey requests from Estimators, runs AI site checklist generation, and dispatches field surveyors.'
  },
  surveyor: {
    id: 'usr-surv-01',
    name: 'Saeed Al-Otaibi',
    email: 'surveyor@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'surveyor',
    roleTitle: 'Senior Field Topographical Surveyor',
    department: 'Field Surveying & Ground Inspection',
    surveyorId: 'surv-saeed',
    avatarInitials: 'SO',
    description: 'Executes physical site inspections, downloads PDF checklists, records ground findings, and submits verified reports.'
  },
  qaqc: {
    id: 'usr-qaqc-01',
    name: 'Majed Al-Harbi',
    email: 'qaqc@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'qaqc',
    roleTitle: 'QA/QC Quality Director',
    department: 'Quality Assurance & Quality Control',
    avatarInitials: 'MH',
    description: 'Manages Requests for Inspection (RFI), ITP Hold Points, NCRs, and punch lists.'
  },
  hse: {
    id: 'usr-hse-01',
    name: 'Hamad Al-Ghamdi',
    email: 'hse@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'hse',
    roleTitle: 'Head of HSE & Safety Compliance',
    department: 'Health, Safety & Environment',
    avatarInitials: 'HG',
    description: 'Monitors site safe man-hours, LTIFR/TRIFR metrics, safety inspections, and toolbox talks.'
  },
  hr: {
    id: 'usr-hr-01',
    name: 'Nouf Al-Shehri',
    email: 'hr@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'hr',
    roleTitle: 'HR & Personnel Director',
    department: 'Human Resources & Workforce',
    avatarInitials: 'NS',
    description: 'Employee contracts, Iqama tracking, Saudi nationalization (Nitaqat), and site allocations.'
  },
  purchase: {
    id: 'usr-pur-01',
    name: 'Eng. Khalid Al-Ghamdi',
    email: 'purchase@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'purchase',
    roleTitle: 'Head of Procurement & Purchase Desk',
    department: 'Procurement & Supply Chain',
    avatarInitials: 'KG',
    description: 'Issues official vendor purchase orders from verified MRs, tracks supplier delivery milestones.'
  },
  inventory: {
    id: 'usr-inv-01',
    name: 'Fahad Al-Dossary',
    email: 'inventory@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'inventory',
    roleTitle: 'Central Warehouse & Inventory Controller',
    department: 'Warehousing & Central Logistics',
    avatarInitials: 'FD',
    description: 'Central multi-yard stock catalog, automated project BOQ reconciliation, and shortfall identification.'
  },
  mr: {
    id: 'usr-mr-01',
    name: 'Eng. Tariq Al-Mansour',
    email: 'mr@radwa.sa',
    defaultPassword: 'radwa123',
    role: 'mr',
    roleTitle: 'Material Requests & QA Engineer',
    department: 'Material Verification & QA Desk',
    avatarInitials: 'MR',
    description: 'Inspects and verifies site shortfall requisitions from warehouse stock reconciliation, authorising direct transfer to Purchase Desk.'
  }
};
