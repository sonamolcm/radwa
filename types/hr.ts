export type EmployeeSponsor = 'Radwa' | 'Alfakama' | 'Sulaiman' | string;
export type EmployeeMainCategory = 'Direct Labor' | 'Indirect / Staff' | 'Subcontractor' | 'Management' | string;
export type ExpensesCategory = 'Project Direct Job Cost' | 'Overhead & Administration' | 'Camp & Catering' | 'Equipment Logistics' | string;
export type RecruitmentType = 'Local Transfer' | 'Overseas Visa' | 'Direct Hire' | 'Internal Transfer' | string;
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string;
export type CoverallSize = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | string;
export type IndemnityExitReason = 'Resignation' | 'Termination with Cause' | 'Contract Completion' | 'Redundancy' | string;

export interface CumulativeBenefitRecord {
  isActive?: boolean;
  vacationExitDate?: string;
  joiningDate?: string;
  totalDaysWorked?: number;
  leaveSalaryCalculationRule?: string;
  cumulativeAmountLeaveSalary?: number;
  paidLeaveSalary?: number;
  balanceLeaveSalary?: number;
  indemnityCalculationRule?: string;
  cumulativeAmountIndemnity?: number;
  paidIndemnity?: number;
  balanceIndemnity?: number;
  [key: string]: any;
}

export interface SalaryRevisionItem {
  id: string;
  revisionDate?: string;
  dateOfRevision?: string;
  oldSalary?: number;
  newSalary?: number;
  reason?: string;
  approvedBy?: string;
  presentBasic: number;
  revisedBasic: number;
  revisedHouseAllowance?: number;
  revisedVehicleAllowance?: number;
  revisedTelephoneAllowance?: number;
  [key: string]: any;
}

export interface HrEmployee {
  id: string;
  emplNo: string;
  name: string;
  photoUrl: string;
  sponsor: EmployeeSponsor;
  mainCategory: EmployeeMainCategory;
  tradeDesignation: string;
  expensesCategory: ExpensesCategory;
  nationality: string;
  religion: string;
  dateOfBirth: string;
  dateOfArrival: string;
  departurePort: string;
  dateOfJoin: string;
  passportNo: string;
  iqamaNo: string;
  assignedWorkOrder: string;
  recruitmentType: RecruitmentType;
  agentName?: string;
  referredByName?: string;
  localMobNo: string;
  bloodGroup: BloodGroup;
  emergencyContactAddress: string;
  emergencyContactTele: string;
  education: string;
  experienceYears: number;
  cvFileName?: string;
  photoFileName?: string;
  basicSalary: number;
  dutyHours: number;
  otRate: number;
  foodAllowance: number;
  otAllowance: number;
  teleAllowance: number;
  houseAllowance: number;
  vehicleAllowance: number;
  otherAllowance: number;
  leaveContractPeriod: string;
  yearlyLeaveDays: number;
  coverallSize: CoverallSize;
  shoeSize: number;
  status: 'Active' | 'Inactive' | 'On Leave' | string;
  benefits?: CumulativeBenefitRecord | any;
  salaryRevisions?: SalaryRevisionItem[];
  [key: string]: any;
}
