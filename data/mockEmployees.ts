export interface RegisteredCompanyEmployee {
  id: string;
  name: string;
  initials?: string;
  avatarBg?: string;
  email: string;
  role: string;
  department: 'HSE' | 'QA/QC' | 'Operations' | 'Procurement' | 'Commercial & Tendering' | 'Executive / Management';
  phone?: string;
}

export const REGISTERED_COMPANY_EMPLOYEES: RegisteredCompanyEmployee[] = [
  // HSE
  {
    id: 'emp-hse-01',
    name: 'Eng. Faisal Al-Harbi',
    initials: 'FH',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    email: 'faisal.harbi@radwa.sa',
    role: 'Head of Health, Safety & Environment (HSE)',
    department: 'HSE',
    phone: '+966 50 123 4567'
  },
  {
    id: 'emp-hse-02',
    name: 'Sultan Al-Ghamdi',
    initials: 'SG',
    avatarBg: 'bg-emerald-100 text-emerald-800',
    email: 'sultan.ghamdi@radwa.sa',
    role: 'Senior HSE Field Auditor',
    department: 'HSE',
    phone: '+966 50 123 4568'
  },
  // QA/QC
  {
    id: 'emp-qaqc-01',
    name: 'Eng. Tariq Al-Otaibi',
    initials: 'TO',
    avatarBg: 'bg-blue-100 text-blue-800',
    email: 'tariq.otaibi@radwa.sa',
    role: 'Quality Assurance & Quality Control (QA/QC) Manager',
    department: 'QA/QC',
    phone: '+966 50 234 5678'
  },
  {
    id: 'emp-qaqc-02',
    name: 'Mansour Al-Dossary',
    initials: 'MD',
    avatarBg: 'bg-blue-100 text-blue-800',
    email: 'mansour.dossary@radwa.sa',
    role: 'Lead QC Welding & Piping Inspector',
    department: 'QA/QC',
    phone: '+966 50 234 5679'
  },
  // Operations
  {
    id: 'emp-ops-01',
    name: 'Eng. Khalid Al-Zahrani',
    initials: 'KZ',
    avatarBg: 'bg-amber-100 text-amber-800',
    email: 'khalid.zahrani@radwa.sa',
    role: 'VP of Engineering & Field Operations',
    department: 'Operations',
    phone: '+966 50 345 6789'
  },
  {
    id: 'emp-ops-02',
    name: 'Nasser Al-Subaie',
    initials: 'NS',
    avatarBg: 'bg-amber-100 text-amber-800',
    email: 'nasser.subaie@radwa.sa',
    role: 'Heavy Machinery & Earthwork Operations Lead',
    department: 'Operations',
    phone: '+966 50 345 6780'
  },
  // Procurement
  {
    id: 'emp-proc-01',
    name: 'Majed Al-Mutairi',
    initials: 'MM',
    avatarBg: 'bg-indigo-100 text-indigo-800',
    email: 'majed.mutairi@radwa.sa',
    role: 'Director of Supply Chain & Strategic Procurement',
    department: 'Procurement',
    phone: '+966 50 456 7890'
  },
  {
    id: 'emp-proc-02',
    name: 'Saad Al-Qahtani',
    initials: 'SQ',
    avatarBg: 'bg-indigo-100 text-indigo-800',
    email: 'saad.qahtani@radwa.sa',
    role: 'Senior Piping & Steel Package Buyer',
    department: 'Procurement',
    phone: '+966 50 456 7891'
  },
  // Commercial & Tendering
  {
    id: 'emp-comm-01',
    name: 'Farhan Qureshi',
    initials: 'FQ',
    avatarBg: 'bg-purple-100 text-purple-800',
    email: 'farhan.qureshi@radwa.sa',
    role: 'Lead Estimating & BOQ Engineer',
    department: 'Commercial & Tendering',
    phone: '+966 50 567 8901'
  },
  {
    id: 'emp-comm-02',
    name: 'Zaid Al-Shehri',
    initials: 'ZS',
    avatarBg: 'bg-purple-100 text-purple-800',
    email: 'zaid.shehri@radwa.sa',
    role: 'Commercial Tenders & Contracts Manager',
    department: 'Commercial & Tendering',
    phone: '+966 50 567 8902'
  },
  // Executive
  {
    id: 'emp-exec-01',
    name: 'Eng. Abdulaziz Radwa',
    initials: 'AR',
    avatarBg: 'bg-rose-100 text-rose-800',
    email: 'md@radwa.sa',
    role: 'Managing Director & Board Executive',
    department: 'Executive / Management',
    phone: '+966 50 999 8888'
  }
];
