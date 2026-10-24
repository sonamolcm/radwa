'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Printer, 
  IdCard, 
  Calculator, 
  History, 
  UserCheck, 
  UserX, 
  Building2, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  FileText, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Layers, 
  Briefcase, 
  HardHat, 
  DollarSign, 
  FileSpreadsheet, 
  LayoutGrid, 
  Table as TableIcon,
  Eye,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Check,
  RefreshCw,
  TrendingUp,
  MapPin,
  HeartPulse,
  Camera,
  FileUp
} from 'lucide-react';
import { 
  HrEmployee, 
  EmployeeSponsor, 
  EmployeeMainCategory, 
  ExpensesCategory, 
  RecruitmentType, 
  BloodGroup, 
  CoverallSize, 
  IndemnityExitReason, 
  CumulativeBenefitRecord, 
  SalaryRevisionItem 
} from '../../types/hr';
import { INITIAL_HR_EMPLOYEES } from '../../data/mockHrData';
import { ProjectRFQ } from '../../types/crm';

interface HrDashboardProps {
  projects: ProjectRFQ[];
  currentUser?: {
    name: string;
    role: string;
    email: string;
  };
  onBackToMainMenu?: () => void;
}

export const HrDashboard: React.FC<HrDashboardProps> = ({
  projects,
  currentUser,
  onBackToMainMenu
}) => {
  // Employee State with local persistence
  const [employees, setEmployees] = useState<HrEmployee[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('radwa_hr_employees');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Failed to load hr employees', e);
      }
    }
    return INITIAL_HR_EMPLOYEES;
  });

  const saveEmployees = (updated: HrEmployee[]) => {
    setEmployees(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('radwa_hr_employees', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist hr employees', e);
      }
    }
  };

  // View Mode: 'grid' (Card grid view requested in Audio 2) vs 'table' (Excel spreadsheet view from Screenshots 1 & 2)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sponsorFilter, setSponsorFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [workOrderFilter, setWorkOrderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<HrEmployee | null>(null);
  const [selectedEmployeeForIdBadge, setSelectedEmployeeForIdBadge] = useState<HrEmployee | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'profile' | 'idcard' | 'benefits' | 'salary'>('profile');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Work Orders list from projects & employees
  const availableWorkOrders = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.assignedWorkOrder) set.add(e.assignedWorkOrder);
    });
    projects.forEach(p => {
      if (p.workOrderNo) set.add(p.workOrderNo);
    });
    return Array.from(set);
  }, [employees, projects]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.emplNo.toLowerCase().includes(q) ||
        emp.tradeDesignation.toLowerCase().includes(q) ||
        emp.iqamaNo.toLowerCase().includes(q) ||
        emp.assignedWorkOrder.toLowerCase().includes(q) ||
        emp.nationality.toLowerCase().includes(q);

      const matchesSponsor = sponsorFilter === 'ALL' || emp.sponsor === sponsorFilter;
      const matchesCategory = categoryFilter === 'ALL' || emp.mainCategory === categoryFilter;
      const matchesWorkOrder = workOrderFilter === 'ALL' || emp.assignedWorkOrder === workOrderFilter;
      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      return matchesSearch && matchesSponsor && matchesCategory && matchesWorkOrder && matchesStatus;
    });
  }, [employees, searchQuery, sponsorFilter, categoryFilter, workOrderFilter, statusFilter]);

  // KPI Metrics Calculations
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter(e => e.status === 'Active').length;
  const saudiCount = employees.filter(e => e.nationality.toLowerCase().includes('saudi')).length;
  const saudiPercentage = totalEmployeesCount > 0 ? ((saudiCount / totalEmployeesCount) * 100).toFixed(1) : '0';
  const totalMonthlyPayroll = employees.reduce((sum, e) => {
    const totalAllowances = (e.foodAllowance || 0) + (e.otAllowance || 0) + (e.teleAllowance || 0) + (e.houseAllowance || 0) + (e.vehicleAllowance || 0) + (e.otherAllowance || 0);
    return sum + (e.basicSalary || 0) + totalAllowances;
  }, 0);
  const avgExpYears = totalEmployeesCount > 0 
    ? (employees.reduce((sum, e) => sum + (e.experienceYears || 0), 0) / totalEmployeesCount).toFixed(1)
    : '0';

  // Sponsor Badges Helper
  const getSponsorBadge = (sponsor: EmployeeSponsor) => {
    switch (sponsor) {
      case 'Radwa':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Alfakama':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sulaiman':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Status Badges Helper
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // CSV / Excel Export Function
  const handleExportCsv = () => {
    const headers = [
      'Empl #', 'Name', 'Sponsor', 'Main Category', 'Trade / Designation', 'Expenses Category',
      'Nationality', 'Religion', 'DOB', 'Arrival Date', 'Departure Port', 'Date of Join',
      'Passport #', 'Iqama #', 'Work Order', 'Recruitment Type', 'Agent Name', 'Referred By',
      'Local Mobile', 'Blood Group', 'Emergency Address', 'Emergency Tele', 'Education', 'Experience (Yrs)',
      'Basic Salary', 'Duty Hours', 'OT Rate', 'Food Allowance', 'OT Allowance', 'Tele Allowance',
      'House Allowance', 'Vehicle Allowance', 'Other Allowance', 'Leave Period', 'Yearly Leave Days',
      'Coverall Size', 'Shoe Size', 'Status'
    ];

    const rows = filteredEmployees.map(e => [
      e.emplNo, `"${e.name.replace(/"/g, '""')}"`, e.sponsor, `"${e.mainCategory}"`, `"${e.tradeDesignation}"`, `"${e.expensesCategory}"`,
      e.nationality, e.religion, e.dateOfBirth, e.dateOfArrival, `"${e.departurePort}"`, e.dateOfJoin,
      e.passportNo, e.iqamaNo, e.assignedWorkOrder, e.recruitmentType, `"${e.agentName || ''}"`, `"${e.referredByName || ''}"`,
      e.localMobNo, e.bloodGroup, `"${e.emergencyContactAddress.replace(/"/g, '""')}"`, e.emergencyContactTele, `"${e.education}"`, e.experienceYears,
      e.basicSalary, e.dutyHours, e.otRate, e.foodAllowance, e.otAllowance, e.teleAllowance,
      e.houseAllowance, e.vehicleAllowance, e.otherAllowance, `"${e.leaveContractPeriod}"`, e.yearlyLeaveDays,
      e.coverallSize, e.shoeSize, e.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Radwa_HR_Workforce_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ Employee roster successfully exported to CSV / Excel format.');
  };

  // Toggle Employee Active / Inactive (Saudi Labor Law terminal rule)
  const handleToggleEmployeeActiveStatus = (empId: string) => {
    const updated = employees.map(e => {
      if (e.id === empId) {
        const newStatus: 'Active' | 'Inactive' = e.status === 'Active' ? 'Inactive' : 'Active';
        const updatedBenefits = e.benefits ? {
          ...e.benefits,
          isActive: newStatus === 'Active',
          vacationExitDate: newStatus === 'Inactive' ? new Date().toISOString().slice(0, 10) : undefined
        } : undefined;
        return {
          ...e,
          status: newStatus,
          benefits: updatedBenefits
        };
      }
      return e;
    });
    saveEmployees(updated);
    if (selectedEmployeeForDetail && selectedEmployeeForDetail.id === empId) {
      setSelectedEmployeeForDetail(prev => prev ? {
        ...prev,
        status: prev.status === 'Active' ? 'Inactive' : 'Active',
        benefits: prev.benefits ? {
          ...prev.benefits,
          isActive: prev.status !== 'Active',
          vacationExitDate: prev.status === 'Active' ? new Date().toISOString().slice(0, 10) : undefined
        } : undefined
      } : null);
    }
    showToast(`Status updated: Employee is now marked as ${employees.find(e => e.id === empId)?.status === 'Active' ? 'Inactive' : 'Active'}.`);
  };

  // Save New Salary Revision
  const handleAddSalaryRevision = (
    empId: string, 
    revisedBasic: number, 
    revisedHouse: number, 
    revisedVehicle: number, 
    revisedTele: number, 
    interval: string, 
    reason: string
  ) => {
    const updated = employees.map(e => {
      if (e.id === empId) {
        const newTotalRevised = revisedBasic + revisedHouse + revisedVehicle + revisedTele;
        const newRevision: SalaryRevisionItem = {
          id: `rev-${Date.now()}`,
          presentBasic: e.basicSalary,
          revisedBasic: revisedBasic,
          revisedHouseAllowance: revisedHouse,
          revisedVehicleAllowance: revisedVehicle,
          revisedTelephoneAllowance: revisedTele,
          revisedAmount: newTotalRevised,
          dateOfRevision: new Date().toISOString().slice(0, 10),
          revisionInterval: interval || 'Annual Review 2026',
          reasonOfRevision: reason || 'Merit Increase & Cost of Living Adjustment',
          approvalAttachName: `Approval_Signoff_${e.emplNo}_${Date.now()}.pdf`
        };

        const existingRevs = e.salaryRevisions || [];
        return {
          ...e,
          basicSalary: revisedBasic,
          houseAllowance: revisedHouse,
          vehicleAllowance: revisedVehicle,
          teleAllowance: revisedTele,
          salaryRevisions: [newRevision, ...existingRevs]
        };
      }
      return e;
    });

    saveEmployees(updated);
    const updatedEmp = updated.find(e => e.id === empId);
    if (updatedEmp) {
      setSelectedEmployeeForDetail(updatedEmp);
    }
    showToast('✅ Salary revision logged and current compensation updated.');
  };

  // --------------------------------------------------------------------------
  // ADD EMPLOYEE FORM STATE (Exact match to 38 fields in user's Excel)
  // --------------------------------------------------------------------------
  const [formEmplNo, setFormEmplNo] = useState(`10${employees.length + 1}`);
  const [formName, setFormName] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formSponsor, setFormSponsor] = useState<EmployeeSponsor>('Radwa');
  const [formMainCategory, setFormMainCategory] = useState<EmployeeMainCategory>('Project operation team (POT)');
  const [formTradeDesignation, setFormTradeDesignation] = useState('');
  const [formExpensesCategory, setFormExpensesCategory] = useState<ExpensesCategory>('Project direct cost');
  const [formNationality, setFormNationality] = useState('Saudi');
  const [formReligion, setFormReligion] = useState('Muslim');
  const [formDateOfBirth, setFormDateOfBirth] = useState('1994-04-12');
  const [formDateOfArrival, setFormDateOfArrival] = useState(new Date().toISOString().slice(0, 10));
  const [formDeparturePort, setFormDeparturePort] = useState('King Khalid International Airport (RUH)');
  const [formDateOfJoin, setFormDateOfJoin] = useState(new Date().toISOString().slice(0, 10));
  const [formPassportNo, setFormPassportNo] = useState('');
  const [formIqamaNo, setFormIqamaNo] = useState('');
  const [formAssignedWorkOrder, setFormAssignedWorkOrder] = useState('wo# 1234');
  const [formRecruitmentType, setFormRecruitmentType] = useState<RecruitmentType>('new recruited');
  const [formAgentName, setFormAgentName] = useState('');
  const [formReferredByName, setFormReferredByName] = useState('');
  const [formLocalMobNo, setFormLocalMobNo] = useState('+966 5');
  const [formBloodGroup, setFormBloodGroup] = useState<BloodGroup>('O+');
  const [formEmergencyContactAddress, setFormEmergencyContactAddress] = useState('');
  const [formEmergencyContactTele, setFormEmergencyContactTele] = useState('+966 5');
  const [formEducation, setFormEducation] = useState('B.Sc Engineering');
  const [formExperienceYears, setFormExperienceYears] = useState<number>(5);
  const [formCvFileName, setFormCvFileName] = useState('Candidate_Resume.pdf');
  const [formCvFileSize, setFormCvFileSize] = useState('1.8 MB');
  const [formPhotoFileName, setFormPhotoFileName] = useState('');
  const [isPhotoUrlManual, setIsPhotoUrlManual] = useState(false);
  const [formBasicSalary, setFormBasicSalary] = useState<number>(4500);
  const [formDutyHours, setFormDutyHours] = useState<number>(8);
  const [formOtRate, setFormOtRate] = useState<number>(1.5);
  const [formFoodAllowance, setFormFoodAllowance] = useState<number>(300);
  const [formOtAllowance, setFormOtAllowance] = useState<number>(0);
  const [formTeleAllowance, setFormTeleAllowance] = useState<number>(100);
  const [formHouseAllowance, setFormHouseAllowance] = useState<number>(1000);
  const [formVehicleAllowance, setFormVehicleAllowance] = useState<number>(0);
  const [formOtherAllowance, setFormOtherAllowance] = useState<number>(0);
  const [formLeaveContractPeriod, setFormLeaveContractPeriod] = useState('1 Year');
  const [formYearlyLeaveDays, setFormYearlyLeaveDays] = useState<number>(21);
  const [formCoverallSize, setFormCoverallSize] = useState<CoverallSize>('L');
  const [formShoeSize, setFormShoeSize] = useState<number>(42);

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormPhotoUrl(event.target.result as string);
          showToast(`📸 Photo "${file.name}" uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormCvFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFormCvFileSize(`${sizeMB} MB`);
      showToast(`📄 CV Document "${file.name}" attached successfully!`);
    }
  };

  const resetAddForm = () => {
    setFormEmplNo(`10${employees.length + 1}`);
    setFormName('');
    setFormPhotoUrl('');
    setFormPhotoFileName('');
    setFormCvFileName('Candidate_Resume.pdf');
    setFormCvFileSize('1.8 MB');
    setIsPhotoUrlManual(false);
    setFormTradeDesignation('');
    setFormPassportNo('');
    setFormIqamaNo('');
    setFormAgentName('');
    setFormReferredByName('');
    setFormEmergencyContactAddress('');
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTradeDesignation.trim()) {
      alert('Please fill in Employee Name and Trade / Designation.');
      return;
    }

    const defaultPhoto = formPhotoUrl.trim() || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 50000000)}?w=150&h=150&fit=crop&crop=face`;

    const newEmp: HrEmployee = {
      id: `emp-${Date.now()}`,
      emplNo: formEmplNo || `10${employees.length + 1}`,
      name: formName.trim(),
      photoUrl: defaultPhoto,
      sponsor: formSponsor,
      mainCategory: formMainCategory,
      tradeDesignation: formTradeDesignation.trim(),
      expensesCategory: formExpensesCategory,
      nationality: formNationality,
      religion: formReligion,
      dateOfBirth: formDateOfBirth,
      dateOfArrival: formDateOfArrival,
      departurePort: formDeparturePort,
      dateOfJoin: formDateOfJoin,
      passportNo: formPassportNo || `P${Math.floor(10000000 + Math.random() * 90000000)}`,
      iqamaNo: formIqamaNo || `2${Math.floor(100000000 + Math.random() * 900000000)}`,
      assignedWorkOrder: formAssignedWorkOrder,
      recruitmentType: formRecruitmentType,
      agentName: formAgentName || undefined,
      referredByName: formReferredByName || undefined,
      localMobNo: formLocalMobNo,
      bloodGroup: formBloodGroup,
      emergencyContactAddress: formEmergencyContactAddress || 'Riyadh, Kingdom of Saudi Arabia',
      emergencyContactTele: formEmergencyContactTele,
      education: formEducation,
      experienceYears: Number(formExperienceYears) || 0,
      cvFileName: formCvFileName,
      photoFileName: formPhotoFileName || `${formName.replace(/\s+/g, '_')}_Photo.jpg`,
      basicSalary: Number(formBasicSalary) || 0,
      dutyHours: Number(formDutyHours) || 8,
      otRate: Number(formOtRate) || 1.5,
      foodAllowance: Number(formFoodAllowance) || 0,
      otAllowance: Number(formOtAllowance) || 0,
      teleAllowance: Number(formTeleAllowance) || 0,
      houseAllowance: Number(formHouseAllowance) || 0,
      vehicleAllowance: Number(formVehicleAllowance) || 0,
      otherAllowance: Number(formOtherAllowance) || 0,
      leaveContractPeriod: formLeaveContractPeriod,
      yearlyLeaveDays: Number(formYearlyLeaveDays) || 21,
      coverallSize: formCoverallSize,
      shoeSize: Number(formShoeSize) || 42,
      status: 'Active',
      benefits: {
        joiningDate: formDateOfJoin,
        totalDaysWorked: 1,
        leaveSalaryCalculationRule: `one year ${formYearlyLeaveDays} days`,
        cumulativeAmountLeaveSalary: Math.round(((Number(formBasicSalary) || 0) / 30) * Number(formYearlyLeaveDays)),
        paidLeaveSalary: 0,
        balanceLeaveSalary: Math.round(((Number(formBasicSalary) || 0) / 30) * Number(formYearlyLeaveDays)),
        indemnityReason: 'Resignation',
        indemnityFormula: 'basic / 1/3 for 2-5 yrs service',
        actualIndemnityCalculation: 0,
        indemnityCumulativeAmount: 0,
        contractCompletedPeriod: 'Not comleted',
        actualIndemnityAmount: 0,
        totalDurationDaysWorked: 1,
        isActive: true
      },
      salaryRevisions: []
    };

    saveEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    resetAddForm();
    showToast(`✅ Employee ${newEmp.name} (Empl # ${newEmp.emplNo}) onboarded successfully!`);
  };

  return (
    <div className="w-full space-y-6 font-sans text-slate-800">
      
      {/* ============================================================ */}
      {/* 1. HR EXECUTIVE COMMAND BANNER & KPI METRICS                 */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>HR & Workforce Management</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
              Saudi Labor Law / GOSI / Muqeem
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Workforce Registry & Onboarding</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Centralized employee directory, multi-sponsor registry (Radwa, Alfakama, Sulaiman), Work Order site allocations, printable ID cards, Saudi Labor Law end-of-service indemnity calculator, and historical salary revision logs.
          </p>
        </div>

        {/* Action Buttons in Banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition cursor-pointer flex items-center gap-2 shadow-xs backdrop-blur-md active:scale-95"
            title="Download Excel / CSV of all employees"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetAddForm();
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-900/40 border border-rose-400/30 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee Joining</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. EXECUTIVE WORKFORCE KPI CARDS                              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Workforce */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalEmployeesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">{activeEmployeesCount} Active</span>
              <span>• {totalEmployeesCount - activeEmployeesCount} Inactive</span>
            </div>
          </div>
        </div>

        {/* Saudi Nationalization / Nitaqat */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Saudi Nationalization</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight flex items-baseline gap-1">
              <span>{saudiPercentage}%</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nitaqat Platinum Tier ({saudiCount} Nationals)</span>
            </div>
          </div>
        </div>

        {/* Assigned to Projects */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Project Deployments</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              {employees.filter(e => e.expensesCategory === 'Project direct cost').length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Direct Site Work Orders (wo#)
            </div>
          </div>
        </div>

        {/* Monthly Payroll Total */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Payroll</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              SAR {totalMonthlyPayroll.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Gross (Basic + All Allowances)
            </div>
          </div>
        </div>

        {/* Average Experience */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Experience</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight">
              {avgExpYears} <span className="text-sm font-normal text-slate-400">Years</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Technical & Supervisory Seniority
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. TOOLBAR: SEARCH, FILTERS & VIEW MODE SWITCHER             */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Empl #, trade, Iqama, work order..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition shadow-2xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Sponsor Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold">Sponsor:</span>
            <select
              value={sponsorFilter}
              onChange={(e) => setSponsorFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sponsors</option>
              <option value="Radwa">Radwa</option>
              <option value="Alfakama">Alfakama</option>
              <option value="Sulaiman">Sulaiman</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="ALL">All Categories</option>
              <option value="Directors">Directors</option>
              <option value="Senior management">Senior Management</option>
              <option value="Operation Management team">Operation Management</option>
              <option value="officeManagement team">Office Management</option>
              <option value="OfficeSupporting staff">Office Supporting Staff</option>
              <option value="Project Management team (PMT)">PMT</option>
              <option value="Project operation team (POT)">POT</option>
            </select>
          </div>

          {/* Work Order Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold">Work Order:</span>
            <select
              value={workOrderFilter}
              onChange={(e) => setWorkOrderFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Work Orders</option>
              {availableWorkOrders.map(wo => (
                <option key={wo} value={wo}>{wo}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs Spreadsheet Table */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 ml-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-rose-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Employee Card Grid View (with Photo, Name, and Role)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-rose-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Excel Spreadsheet Table View (Matching Screenshot 1 & 2)"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Excel Table</span>
            </button>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. MAIN WORKFORCE DIRECTORY DISPLAY                           */}
      {/* ============================================================ */}

      {/* ------------------------------------------------------------ */}
      {/* MODE A: CARD GRID VIEW (Requested in Audio 2)               */}
      {/* ------------------------------------------------------------ */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-rose-400/80 shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Card Header: Sponsor Tag & Status */}
                <div className="p-4 pb-0 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getSponsorBadge(emp.sponsor)}`}>
                      {emp.sponsor}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      #{emp.emplNo}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(emp.status)}`}>
                    {emp.status}
                  </span>
                </div>

                {/* Profile Overview: Photo, Name, Trade */}
                <div className="p-4 pt-3 flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={emp.photoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face`}
                      alt={emp.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs text-[9px] font-bold text-slate-700">
                      {emp.bloodGroup}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate leading-snug group-hover:text-rose-600 transition">
                      {emp.name}
                    </h3>
                    <p className="text-xs font-semibold text-rose-700 truncate mt-0.5">
                      {emp.tradeDesignation}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {emp.mainCategory}
                    </p>
                  </div>
                </div>

                {/* Info Grid (Work Order, Nationality, Iqama) */}
                <div className="px-4 py-2.5 mx-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Assigned WO:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {emp.assignedWorkOrder || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Nationality:</span>
                    <span className="font-medium text-slate-800">{emp.nationality}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Iqama / ID #:</span>
                    <span className="font-mono text-slate-800">{emp.iqamaNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Joined Date:</span>
                    <span className="text-slate-700 font-medium">{emp.dateOfJoin}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="p-4 pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeForIdBadge(emp);
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer hover:border-slate-300"
                  title="Generate Official Company ID Badge"
                >
                  <IdCard className="w-3.5 h-3.5 text-rose-600" />
                  <span>ID Badge</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeForDetail(emp);
                    setDetailModalTab('profile');
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dossier</span>
                </button>
              </div>

            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No employees match this filter criteria</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try clearing search terms or resetting sponsor, category, and work order filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/* MODE B: SPREADSHEET TABLE VIEW (Exact User Excel Layout)     */}
      {/* ------------------------------------------------------------ */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Table Header Controls */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="font-bold text-slate-700 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Full Employee Joining Registry (All 38 Columns)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px]">
                {filteredEmployees.length} records
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
          </div>

          {/* Dense Horizontal Scrolling Table */}
          <div className="overflow-x-auto max-h-[700px] border-b border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 via-emerald-100 to-amber-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Employee Sponsor</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Empl #</th>
                  <th className="py-2.5 px-4 border-r border-slate-200 whitespace-nowrap">Empl. Main Category</th>
                  <th className="py-2.5 px-4 border-r border-slate-200 whitespace-nowrap">Trade / Designation</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Expenses Category</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Nationality</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Religion</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">DOB</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Date of Arrival</th>
                  <th className="py-2.5 px-4 border-r border-slate-200 whitespace-nowrap">Departure Port</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Date of Join</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Passport #</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Iqama #</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Assigned Work Order</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Recruitment Type</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Agent Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Referred By</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Local Mob #</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">Blood</th>
                  <th className="py-2.5 px-4 border-r border-slate-200 whitespace-nowrap">Emergency Address</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Emergency Tele</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Education</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">Exp (Yrs)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-right bg-emerald-50">Basic Salary</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">Duty Hrs</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">OT Rate</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">Food Allw</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">OT Allw</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">Tele Allw</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">House Allw</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">Veh Allw</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-right">Other Allw</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Contract Period</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">Yearly Leave</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">Coverall</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 whitespace-nowrap text-center">Shoe</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap text-center">Status</th>
                  <th className="py-2.5 px-4 text-center sticky right-0 bg-white shadow-l">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-2 px-3 border-r border-slate-200 font-sans font-bold text-slate-900 whitespace-nowrap">
                      {emp.sponsor}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-rose-600 whitespace-nowrap">
                      {emp.emplNo}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans whitespace-nowrap text-slate-800">
                      {emp.mainCategory}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans font-semibold text-slate-900 whitespace-nowrap">
                      {emp.tradeDesignation}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap text-slate-600">
                      {emp.expensesCategory}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.nationality}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.religion}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                      {emp.dateOfBirth}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                      {emp.dateOfArrival}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans whitespace-nowrap max-w-xs truncate">
                      {emp.departurePort}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-900">
                      {emp.dateOfJoin}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                      {emp.passportNo}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-slate-800">
                      {emp.iqamaNo}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-bold text-indigo-600 bg-indigo-50/40">
                      {emp.assignedWorkOrder}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.recruitmentType}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.agentName || '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.referredByName || '-'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                      {emp.localMobNo}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-rose-700">
                      {emp.bloodGroup}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-sans whitespace-nowrap max-w-xs truncate">
                      {emp.emergencyContactAddress}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                      {emp.emergencyContactTele}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.education}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center">
                      {emp.experienceYears}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-emerald-800 bg-emerald-50/50">
                      SAR {emp.basicSalary.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center">
                      {emp.dutyHours}h
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center text-rose-600 font-bold">
                      {emp.otRate}x
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.foodAllowance || 0}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.otAllowance || 0}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.teleAllowance || 0}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.houseAllowance || 0}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.vehicleAllowance || 0}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-right">
                      {emp.otherAllowance || 0}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.leaveContractPeriod}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-sans whitespace-nowrap">
                      {emp.yearlyLeaveDays} days
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center font-bold">
                      {emp.coverallSize}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-200 text-center">
                      {emp.shoeSize}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 shadow-l">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployeeForIdBadge(emp)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Generate ID Card Badge"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeForDetail(emp);
                            setDetailModalTab('profile');
                          }}
                          className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="View Full Profile & Saudi Indemnity"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ADD EMPLOYEE JOINING MODAL (All 38 Fields from Images 1 & 2)*/}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    Add Employee Joining (New Onboarding)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Complete all 38 field registry matching Radwa Corporate HR Excel standard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Form */}
            <form onSubmit={handleCreateEmployee} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* SECTION 1: Personal Identification & Nationality */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    1. Identification & Personal Details
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(Empl #, Iqama, Passport, DOB)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Empl # *</label>
                    <input
                      type="text"
                      required
                      value={formEmplNo}
                      onChange={(e) => setFormEmplNo(e.target.value)}
                      placeholder="e.g. 1014"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Full Name (As per Iqama / Passport) *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Eng. Tariq Al-Mansoor"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                    <select
                      value={formBloodGroup}
                      onChange={(e) => setFormBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-rose-700 focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O+">O+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Nationality *</label>
                    <input
                      type="text"
                      required
                      value={formNationality}
                      onChange={(e) => setFormNationality(e.target.value)}
                      placeholder="e.g. Saudi, Indian, Egyptian"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Religion</label>
                    <input
                      type="text"
                      value={formReligion}
                      onChange={(e) => setFormReligion(e.target.value)}
                      placeholder="e.g. Muslim, Christian"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formDateOfBirth}
                      onChange={(e) => setFormDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Date of Join *</label>
                    <input
                      type="date"
                      required
                      value={formDateOfJoin}
                      onChange={(e) => setFormDateOfJoin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Date of Arrival (in KSA)</label>
                    <input
                      type="date"
                      value={formDateOfArrival}
                      onChange={(e) => setFormDateOfArrival(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Departure Port</label>
                    <input
                      type="text"
                      value={formDeparturePort}
                      onChange={(e) => setFormDeparturePort(e.target.value)}
                      placeholder="e.g. King Khalid Int Airport"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Passport #</label>
                    <input
                      type="text"
                      value={formPassportNo}
                      onChange={(e) => setFormPassportNo(e.target.value)}
                      placeholder="e.g. P9028442"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Iqama # (Civil ID) *</label>
                    <input
                      type="text"
                      required
                      value={formIqamaNo}
                      onChange={(e) => setFormIqamaNo(e.target.value)}
                      placeholder="10-digit ID (e.g. 2389104829)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Sponsorship, Hierarchy & Work Order Assignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    2. Sponsorship, Designation & Work Order
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(Sponsor, Main Category, Trade, WO#)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Employee Sponsor *</label>
                    <select
                      value={formSponsor}
                      onChange={(e) => setFormSponsor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Radwa">Radwa</option>
                      <option value="Alfakama">Alfakama</option>
                      <option value="Sulaiman">Sulaiman</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Empl. Main Category *</label>
                    <select
                      value={formMainCategory}
                      onChange={(e) => setFormMainCategory(e.target.value as EmployeeMainCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-medium focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="Directors">Directors</option>
                      <option value="Senior management">Senior management</option>
                      <option value="Operation Management team">Operation Management team</option>
                      <option value="officeManagement team">officeManagement team</option>
                      <option value="OfficeSupporting staff">OfficeSupporting staff</option>
                      <option value="Project Management team (PMT)">Project Management team (PMT)</option>
                      <option value="Project operation team (POT)">Project operation team (POT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Trade / Designation *</label>
                    <input
                      type="text"
                      required
                      value={formTradeDesignation}
                      onChange={(e) => setFormTradeDesignation(e.target.value)}
                      placeholder="e.g. Site supervisor, MD, Safety officer"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-rose-700 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Expenses Category</label>
                    <select
                      value={formExpensesCategory}
                      onChange={(e) => setFormExpensesCategory(e.target.value as ExpensesCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    >
                      <option value="Office support overhead">Office support overhead</option>
                      <option value="Project direct cost">Project direct cost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Assigned Work Order (wo#) *</label>
                    <input
                      type="text"
                      required
                      value={formAssignedWorkOrder}
                      onChange={(e) => setFormAssignedWorkOrder(e.target.value)}
                      placeholder="e.g. wo# 1234"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-indigo-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Recruitment Type</label>
                    <select
                      value={formRecruitmentType}
                      onChange={(e) => setFormRecruitmentType(e.target.value as RecruitmentType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    >
                      <option value="employee transer">employee transer</option>
                      <option value="new recruited">new recruited</option>
                      <option value="local hire">local hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Agent Name</label>
                    <input
                      type="text"
                      value={formAgentName}
                      onChange={(e) => setFormAgentName(e.target.value)}
                      placeholder="Recruiting Agency name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Referred By Name</label>
                    <input
                      type="text"
                      value={formReferredByName}
                      onChange={(e) => setFormReferredByName(e.target.value)}
                      placeholder="Referral contact"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Contact, Emergency, Education & Documents */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    3. Contact, Qualifications & Attachments
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(Phone, CV, Photo, Experience)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Local Mobile #</label>
                    <input
                      type="text"
                      value={formLocalMobNo}
                      onChange={(e) => setFormLocalMobNo(e.target.value)}
                      placeholder="+966 50 ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Address</label>
                    <input
                      type="text"
                      value={formEmergencyContactAddress}
                      onChange={(e) => setFormEmergencyContactAddress(e.target.value)}
                      placeholder="Street, City, Country"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Tele</label>
                    <input
                      type="text"
                      value={formEmergencyContactTele}
                      onChange={(e) => setFormEmergencyContactTele(e.target.value)}
                      placeholder="+966 50 ..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Education</label>
                    <input
                      type="text"
                      value={formEducation}
                      onChange={(e) => setFormEducation(e.target.value)}
                      placeholder="e.g. B.Tech Civil, Diploma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-semibold mb-1">Experience (Years)</label>
                    <input
                      type="number"
                      value={formExperienceYears}
                      onChange={(e) => setFormExperienceYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                    />
                  </div>

                  {/* Field 25: Photo Upload / Live Badge Preview */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-white border border-indigo-100/90 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Employee Photo (ID Badge Picture)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsPhotoUrlManual(!isPhotoUrlManual)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
                      >
                        {isPhotoUrlManual ? '← Upload Image File' : 'Paste Image URL →'}
                      </button>
                    </div>

                    {isPhotoUrlManual ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={formPhotoUrl}
                          onChange={(e) => setFormPhotoUrl(e.target.value)}
                          placeholder="https://... or photo.jpg"
                          className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        />
                        <p className="text-[10px] text-slate-400">Direct image link for official employee ID badge.</p>
                      </div>
                    ) : (
                      <div>
                        <input
                          id="hr-employee-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                        
                        {formPhotoUrl ? (
                          <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={formPhotoUrl}
                                alt="Preview"
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-xs shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                                  {formPhotoFileName || 'employee_badge_photo.jpg'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Ready for ID Badge</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <label
                                htmlFor="hr-employee-photo-upload"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Change</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormPhotoUrl('');
                                  setFormPhotoFileName('');
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="hr-employee-photo-upload"
                            className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/60 rounded-xl cursor-pointer transition group bg-white/60"
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1 transition">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-950">
                              Click to Upload Photo
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              PNG, JPG, WebP (max 5MB) • Live Badge Preview
                            </span>
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Field 26: CV Upload Dropzone */}
                  <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-white border border-blue-100/90 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                        <FileUp className="w-3.5 h-3.5 text-blue-600" />
                        <span>Attach CV (Candidate Resume)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">PDF, DOC, DOCX</span>
                    </div>

                    <div>
                      <input
                        id="hr-employee-cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCvFileUpload}
                        className="hidden"
                      />

                      {formCvFileName ? (
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-200 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                                {formCvFileName}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                                  {formCvFileSize || '1.8 MB'}
                                </span>
                                <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Attached
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <label
                              htmlFor="hr-employee-cv-upload"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                            >
                              <FileUp className="w-3 h-3" />
                              <span>Replace</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setFormCvFileName('');
                                setFormCvFileSize('');
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Remove CV"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="hr-employee-cv-upload"
                          className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/60 rounded-xl cursor-pointer transition group bg-white/60"
                        >
                          <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-1 transition">
                            <FileUp className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-blue-900 group-hover:text-blue-950">
                            Click to Upload Candidate CV
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Attach PDF or DOCX file (max 10MB) for HR records
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Compensation & Salary Allowances */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    4. Compensation Breakdown & Allowances (SAR)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(Basic, OT, Food, Housing, Vehicle, Tele)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Basic Salary (SAR) *</label>
                    <input
                      type="number"
                      required
                      value={formBasicSalary}
                      onChange={(e) => setFormBasicSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700 bg-emerald-50/30"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Duty Hours</label>
                    <input
                      type="number"
                      value={formDutyHours}
                      onChange={(e) => setFormDutyHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">OT Rate</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formOtRate}
                      onChange={(e) => setFormOtRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-rose-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Food Allowance</label>
                    <input
                      type="number"
                      value={formFoodAllowance}
                      onChange={(e) => setFormFoodAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">OT Allowance</label>
                    <input
                      type="number"
                      value={formOtAllowance}
                      onChange={(e) => setFormOtAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tele. Allowance</label>
                    <input
                      type="number"
                      value={formTeleAllowance}
                      onChange={(e) => setFormTeleAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">House Allowance</label>
                    <input
                      type="number"
                      value={formHouseAllowance}
                      onChange={(e) => setFormHouseAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Vehicle Allowance</label>
                    <input
                      type="number"
                      value={formVehicleAllowance}
                      onChange={(e) => setFormVehicleAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Other Allowance</label>
                    <input
                      type="number"
                      value={formOtherAllowance}
                      onChange={(e) => setFormOtherAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3 bg-slate-900 text-white rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Monthly Gross Package</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">
                        SAR {(formBasicSalary + formFoodAllowance + formOtAllowance + formTeleAllowance + formHouseAllowance + formVehicleAllowance + formOtherAllowance).toLocaleString()}
                      </div>
                    </div>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Leave Contract & PPE Uniform Sizes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    5. Contract Terms & PPE Sizes
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">(Leave Cycle, Coverall, Safety Shoes)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Leave Contract Period</label>
                    <input
                      type="text"
                      value={formLeaveContractPeriod}
                      onChange={(e) => setFormLeaveContractPeriod(e.target.value)}
                      placeholder="e.g. 1 Year, 2 year"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Yearly Leave (Days/Year)</label>
                    <input
                      type="number"
                      value={formYearlyLeaveDays}
                      onChange={(e) => setFormYearlyLeaveDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Coverall Size</label>
                    <select
                      value={formCoverallSize}
                      onChange={(e) => setFormCoverallSize(e.target.value as CoverallSize)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Shoe Size</label>
                    <input
                      type="number"
                      value={formShoeSize}
                      onChange={(e) => setFormShoeSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-rose-900/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Save Employee Joining</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. OFFICIAL ID CARD GENERATOR MODAL (Exact match to Image 2)  */}
      {/* ============================================================ */}
      {selectedEmployeeForIdBadge && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <IdCard className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Generate an ID Card (Employee Identity Badge)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForIdBadge(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ID Card Canvas (Matching Image 2 Layout) */}
            <div className="p-6 bg-slate-100 flex flex-col items-center">
              
              <div 
                id="printable-id-card"
                className="w-full max-w-md bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden text-slate-900 font-sans"
              >
                {/* ID Header with Company Name & Logo */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white px-4 py-3 flex items-center justify-between border-b-2 border-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-black text-rose-400 text-xs">
                      R
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wider uppercase leading-none">
                        Radwa Contracting & Trading
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        Kingdom of Saudi Arabia • CR 1010293847
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40 uppercase">
                    {selectedEmployeeForIdBadge.sponsor}
                  </span>
                </div>

                {/* 2-Column Split matching Image 2 */}
                <div className="grid grid-cols-5 divide-x-2 divide-slate-900">
                  
                  {/* Left Column (3/5): Employee Personal Details */}
                  <div className="col-span-3 p-3.5 space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Empl. Name</span>
                      <span className="font-extrabold text-slate-950 text-xs block leading-tight">
                        {selectedEmployeeForIdBadge.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Empl No.</span>
                        <span className="font-mono font-bold text-rose-700 block">
                          {selectedEmployeeForIdBadge.emplNo}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Blood Group</span>
                        <span className="font-bold text-rose-600 block">
                          {selectedEmployeeForIdBadge.bloodGroup}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Nationality</span>
                      <span className="font-semibold text-slate-800 block">
                        {selectedEmployeeForIdBadge.nationality}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Iqama / Civil ID #</span>
                      <span className="font-mono font-bold text-slate-950 block">
                        {selectedEmployeeForIdBadge.iqamaNo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Date of Birth</span>
                        <span className="font-mono text-[10px] text-slate-700 block">
                          {selectedEmployeeForIdBadge.dateOfBirth}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Date of Join</span>
                        <span className="font-mono text-[10px] text-slate-700 block font-semibold">
                          {selectedEmployeeForIdBadge.dateOfJoin}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (2/5): Designation, Photo, Barcode */}
                  <div className="col-span-2 p-3 flex flex-col items-center justify-between text-center bg-slate-50/50">
                    
                    {/* Designation box */}
                    <div className="w-full pb-2 border-b border-slate-200">
                      <span className="text-[9px] font-bold uppercase text-slate-400 block">Designation</span>
                      <span className="font-bold text-slate-900 text-xs leading-tight block mt-0.5">
                        {selectedEmployeeForIdBadge.tradeDesignation}
                      </span>
                    </div>

                    {/* Employee Photo */}
                    <div className="my-2">
                      <img
                        src={selectedEmployeeForIdBadge.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                        alt={selectedEmployeeForIdBadge.name}
                        className="w-20 h-24 object-cover rounded-lg border-2 border-slate-800 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
                        }}
                      />
                    </div>

                    {/* Code-128 Barcode Simulation */}
                    <div className="w-full pt-1 border-t border-slate-200">
                      <div className="font-mono text-[9px] text-slate-400 uppercase tracking-widest text-center">
                        Barcode
                      </div>
                      {/* SVG Barcode Lines */}
                      <svg viewBox="0 0 120 28" className="w-28 h-7 mx-auto mt-0.5">
                        <rect x="2" y="0" width="3" height="28" fill="#000" />
                        <rect x="7" y="0" width="1" height="28" fill="#000" />
                        <rect x="10" y="0" width="4" height="28" fill="#000" />
                        <rect x="16" y="0" width="2" height="28" fill="#000" />
                        <rect x="21" y="0" width="1" height="28" fill="#000" />
                        <rect x="24" y="0" width="3" height="28" fill="#000" />
                        <rect x="30" y="0" width="2" height="28" fill="#000" />
                        <rect x="34" y="0" width="4" height="28" fill="#000" />
                        <rect x="41" y="0" width="1" height="28" fill="#000" />
                        <rect x="45" y="0" width="3" height="28" fill="#000" />
                        <rect x="51" y="0" width="2" height="28" fill="#000" />
                        <rect x="56" y="0" width="3" height="28" fill="#000" />
                        <rect x="62" y="0" width="1" height="28" fill="#000" />
                        <rect x="66" y="0" width="4" height="28" fill="#000" />
                        <rect x="73" y="0" width="2" height="28" fill="#000" />
                        <rect x="78" y="0" width="1" height="28" fill="#000" />
                        <rect x="82" y="0" width="3" height="28" fill="#000" />
                        <rect x="88" y="0" width="2" height="28" fill="#000" />
                        <rect x="93" y="0" width="4" height="28" fill="#000" />
                        <rect x="100" y="0" width="1" height="28" fill="#000" />
                        <rect x="104" y="0" width="3" height="28" fill="#000" />
                        <rect x="110" y="0" width="2" height="28" fill="#000" />
                        <rect x="115" y="0" width="3" height="28" fill="#000" />
                      </svg>
                      <div className="font-mono text-[8px] text-slate-500 text-center tracking-wider">
                        *{selectedEmployeeForIdBadge.emplNo}*{selectedEmployeeForIdBadge.iqamaNo}*
                      </div>
                    </div>

                  </div>

                </div>

                {/* ID Bottom Security Bar */}
                <div className="bg-slate-900 text-white text-[9px] px-3 py-1 text-center font-mono tracking-wider flex items-center justify-between">
                  <span>WORK ORDER: {selectedEmployeeForIdBadge.assignedWorkOrder}</span>
                  <span>SAUDI ARABIA</span>
                </div>

              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedEmployeeForIdBadge(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>Print Official Badge</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. EMPLOYEE DETAIL & SAUDI INDEMNITY & SALARY REVISION MODAL */}
      {/* ============================================================ */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployeeForDetail.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                  alt={selectedEmployeeForDetail.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {selectedEmployeeForDetail.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.2 rounded bg-white/10 text-slate-300 border border-white/10">
                      #{selectedEmployeeForDetail.emplNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedEmployeeForDetail.status)}`}>
                      {selectedEmployeeForDetail.status}
                    </span>
                  </div>
                  <div className="text-xs text-rose-300 font-medium">
                    {selectedEmployeeForDetail.tradeDesignation} • {selectedEmployeeForDetail.sponsor}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleEmployeeActiveStatus(selectedEmployeeForDetail.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    selectedEmployeeForDetail.status === 'Active'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                  title="Saudi Labor Law: Once employee left make it as Inactive"
                >
                  {selectedEmployeeForDetail.status === 'Active' ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Set Inactive (Left)</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Reactivate Employee</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEmployeeForDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs (Profile, ID Card, 2nd PART Benefits, Salary Revision) */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setDetailModalTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'profile'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Employee Profile Dossier</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab('idcard')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'idcard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <IdCard className="w-3.5 h-3.5 text-rose-400" />
                <span>Official ID Card Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab('benefits')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'benefits'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>2nd PART - Cumulative Benefits & Saudi Indemnity</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailModalTab('salary')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  detailModalTab === 'salary'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Salary Revision Tracker</span>
                {selectedEmployeeForDetail.salaryRevisions && selectedEmployeeForDetail.salaryRevisions.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-950 text-[10px] font-black">
                    {selectedEmployeeForDetail.salaryRevisions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 text-xs">
              
              {/* TAB 1: FULL PROFILE DOSSIER */}
              {detailModalTab === 'profile' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Identification Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-400 pb-1 border-b border-slate-200 flex items-center justify-between">
                        <span>Personal Identity</span>
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between"><span className="text-slate-400">Iqama / Civil ID:</span> <span className="font-mono font-bold">{selectedEmployeeForDetail.iqamaNo}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Passport #:</span> <span className="font-mono font-semibold">{selectedEmployeeForDetail.passportNo}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Nationality:</span> <span>{selectedEmployeeForDetail.nationality}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Religion:</span> <span>{selectedEmployeeForDetail.religion}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Date of Birth:</span> <span>{selectedEmployeeForDetail.dateOfBirth}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Blood Group:</span> <span className="font-bold text-rose-600">{selectedEmployeeForDetail.bloodGroup}</span></div>
                      </div>
                    </div>

                    {/* Employment & Sponsorship */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-400 pb-1 border-b border-slate-200 flex items-center justify-between">
                        <span>Sponsorship & Work Order</span>
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between"><span className="text-slate-400">Sponsor:</span> <span className="font-bold text-slate-900">{selectedEmployeeForDetail.sponsor}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Category:</span> <span>{selectedEmployeeForDetail.mainCategory}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Assigned WO:</span> <span className="font-mono font-bold text-indigo-600">{selectedEmployeeForDetail.assignedWorkOrder}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Expenses Type:</span> <span>{selectedEmployeeForDetail.expensesCategory}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Date of Join:</span> <span className="font-semibold">{selectedEmployeeForDetail.dateOfJoin}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Recruitment:</span> <span>{selectedEmployeeForDetail.recruitmentType}</span></div>
                      </div>
                    </div>

                    {/* Contract, Uniform & Contacts */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-400 pb-1 border-b border-slate-200 flex items-center justify-between">
                        <span>PPE Sizes & Contacts</span>
                        <HardHat className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between"><span className="text-slate-400">Coverall Size:</span> <span className="font-bold">{selectedEmployeeForDetail.coverallSize}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Shoe Size:</span> <span className="font-bold">{selectedEmployeeForDetail.shoeSize}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Contract Period:</span> <span>{selectedEmployeeForDetail.leaveContractPeriod}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Yearly Leave:</span> <span>{selectedEmployeeForDetail.yearlyLeaveDays} days</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Local Mobile:</span> <span className="font-mono">{selectedEmployeeForDetail.localMobNo}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Emergency Tele:</span> <span className="font-mono">{selectedEmployeeForDetail.emergencyContactTele}</span></div>
                      </div>
                    </div>

                    {/* Education, Background & Attached CV Document */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Education & Experience */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-xs font-bold uppercase text-slate-400 pb-1 border-b border-slate-200 flex items-center justify-between">
                          <span>Education & Professional Background</span>
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="space-y-1.5 text-slate-700">
                          <div className="flex justify-between"><span className="text-slate-400">Education:</span> <span className="font-semibold">{selectedEmployeeForDetail.education || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Experience:</span> <span className="font-bold text-slate-900">{selectedEmployeeForDetail.experienceYears} Years</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Departure Port:</span> <span>{selectedEmployeeForDetail.departurePort || 'N/A'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">Date of Arrival:</span> <span className="font-mono">{selectedEmployeeForDetail.dateOfArrival}</span></div>
                          {selectedEmployeeForDetail.agentName && (
                            <div className="flex justify-between"><span className="text-slate-400">Recruitment Agent:</span> <span>{selectedEmployeeForDetail.agentName}</span></div>
                          )}
                          {selectedEmployeeForDetail.referredByName && (
                            <div className="flex justify-between"><span className="text-slate-400">Referred By:</span> <span>{selectedEmployeeForDetail.referredByName}</span></div>
                          )}
                        </div>
                      </div>

                      {/* Attached Candidate CV Document */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-slate-50 border border-blue-200/80 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase text-blue-900 pb-1 border-b border-blue-100 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-rose-500" />
                              <span>Candidate CV / Resume</span>
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {selectedEmployeeForDetail.cvFileName || `${selectedEmployeeForDetail.name.replace(/\s+/g, '_')}_CV.pdf`}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Candidate Document • PDF Format
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`📥 Downloading CV: "${selectedEmployeeForDetail.cvFileName || 'Candidate_Resume.pdf'}"`);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Candidate CV</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Compensation Summary Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white border border-slate-800">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Monthly Compensation Structure</span>
                        <span className="text-sm font-extrabold text-white">Full Allowance Breakdown (SAR)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Monthly Gross</span>
                        <span className="text-xl font-extrabold text-emerald-400 font-mono">
                          SAR {(selectedEmployeeForDetail.basicSalary + (selectedEmployeeForDetail.foodAllowance || 0) + (selectedEmployeeForDetail.otAllowance || 0) + (selectedEmployeeForDetail.teleAllowance || 0) + (selectedEmployeeForDetail.houseAllowance || 0) + (selectedEmployeeForDetail.vehicleAllowance || 0) + (selectedEmployeeForDetail.otherAllowance || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Basic</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">SAR {selectedEmployeeForDetail.basicSalary.toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Housing</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">SAR {(selectedEmployeeForDetail.houseAllowance || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Vehicle</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">SAR {(selectedEmployeeForDetail.vehicleAllowance || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Telephone</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">SAR {(selectedEmployeeForDetail.teleAllowance || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Food</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">SAR {(selectedEmployeeForDetail.foodAllowance || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">OT Rate</span>
                        <span className="font-mono font-bold text-rose-400 text-xs">{selectedEmployeeForDetail.otRate}x</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase block">Duty Hours</span>
                        <span className="font-mono font-bold text-slate-200 text-xs">{selectedEmployeeForDetail.dutyHours} hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OFFICIAL ID CARD GENERATOR (Embedded) */}
              {detailModalTab === 'idcard' && (
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="w-full max-w-md bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden text-slate-900 font-sans">
                    <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b-2 border-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs">
                          R
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider">RADWA CONTRACTING</div>
                          <div className="text-[8px] text-slate-400 font-mono">SAUDI ARABIA</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        {selectedEmployeeForDetail.sponsor}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 divide-x-2 divide-slate-900">
                      <div className="col-span-3 p-3.5 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Empl. Name</span>
                          <span className="font-extrabold text-slate-950 text-xs block">{selectedEmployeeForDetail.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Empl No.</span>
                            <span className="font-mono font-bold text-rose-700 block">{selectedEmployeeForDetail.emplNo}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Blood Group</span>
                            <span className="font-bold text-rose-600 block">{selectedEmployeeForDetail.bloodGroup}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Nationality</span>
                          <span className="font-semibold block">{selectedEmployeeForDetail.nationality}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Iqama #</span>
                          <span className="font-mono font-bold block">{selectedEmployeeForDetail.iqamaNo}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">DOB</span>
                            <span className="font-mono text-[10px] block">{selectedEmployeeForDetail.dateOfBirth}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Date of Join</span>
                            <span className="font-mono text-[10px] block font-semibold">{selectedEmployeeForDetail.dateOfJoin}</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 p-3 flex flex-col items-center justify-between text-center bg-slate-50">
                        <div className="w-full pb-1 border-b border-slate-200">
                          <span className="text-[8px] font-bold uppercase text-slate-400 block">Designation</span>
                          <span className="font-bold text-slate-900 text-[11px] block">{selectedEmployeeForDetail.tradeDesignation}</span>
                        </div>
                        <img
                          src={selectedEmployeeForDetail.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                          alt={selectedEmployeeForDetail.name}
                          className="w-18 h-22 object-cover rounded-md border border-slate-800 my-1 shadow-xs"
                        />
                        <div className="w-full pt-1 border-t border-slate-200">
                          <div className="font-mono text-[7px] text-slate-400 uppercase tracking-widest">Barcode</div>
                          <div className="h-4 bg-slate-900 rounded mx-2 my-0.5" />
                          <div className="font-mono text-[8px] text-slate-500">*{selectedEmployeeForDetail.emplNo}*</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer hover:bg-slate-800"
                  >
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span>Print Badge Document</span>
                  </button>
                </div>
              )}

              {/* TAB 3: 2nd PART - CUMULATIVE EMPLOYEES BENEFIT CALCULATION (Image 3) */}
              {detailModalTab === 'benefits' && (
                <div className="space-y-6">
                  
                  {/* Banner matching Image 3 Header */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-extrabold flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-600" />
                        <span>Cumulative Employees Benefit & Saudi Labor Law Indemnity</span>
                      </h4>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Calculation of End-of-Service Gratuity (Articles 84/85) and Leave Salary balance
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedEmployeeForDetail.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                        {selectedEmployeeForDetail.status === 'Active' ? 'Status: Active Employee' : 'Status: Inactive (Left Company)'}
                      </span>
                    </div>
                  </div>

                  {/* Calculations Table matching User Screenshot 3 */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3 border-r border-amber-200">Joining Date</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Vacation / Leave / Exit Date</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Total Days Worked</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Leave Salary Calculation</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Cumulative Leave Salary</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Paid Leave Salary</th>
                          <th className="py-2.5 px-3 border-r border-amber-200 text-emerald-800 bg-emerald-50">Balance Leave Salary</th>
                          <th className="py-2.5 px-3 border-r border-amber-200">Indemnity Reason</th>
                          <th className="py-2.5 px-4 border-r border-amber-200">Formula Rule</th>
                          <th className="py-2.5 px-3 text-right bg-amber-50">Actual Indemnity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-mono text-[11px] bg-white">
                        <tr>
                          <td className="py-3 px-3 border-r border-slate-200 font-bold">{selectedEmployeeForDetail.dateOfJoin}</td>
                          <td className="py-3 px-3 border-r border-slate-200 text-slate-500">
                            {selectedEmployeeForDetail.benefits?.vacationExitDate || 'Current Active'}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 font-bold text-slate-900">
                            {selectedEmployeeForDetail.benefits?.totalDaysWorked || 300} days
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 font-sans">
                            {selectedEmployeeForDetail.benefits?.leaveSalaryCalculationRule || 'one year 21 days'}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            SAR {(selectedEmployeeForDetail.benefits?.cumulativeAmountLeaveSalary || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200">
                            SAR {(selectedEmployeeForDetail.benefits?.paidLeaveSalary || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 font-bold text-emerald-700 bg-emerald-50/50">
                            SAR {(selectedEmployeeForDetail.benefits?.balanceLeaveSalary || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 font-sans font-bold text-slate-800">
                            {selectedEmployeeForDetail.benefits?.indemnityReason || 'Resignation'}
                          </td>
                          <td className="py-3 px-4 border-r border-slate-200 font-sans text-rose-700 font-semibold text-[10px]">
                            {selectedEmployeeForDetail.benefits?.indemnityFormula || '1/2 Basic salary per year'}
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-amber-700 bg-amber-50/50 text-xs">
                            SAR {(selectedEmployeeForDetail.benefits?.actualIndemnityAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Saudi Labor Law Explanation & Terminal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500 pb-1 border-b border-slate-200">
                        Saudi Labor Law Statutory Rules (Article 84/85)
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pl-4 leading-relaxed">
                        <li><strong>Termination by Employer:</strong> Half month basic salary for first 5 years + full 1 month basic salary per year thereafter.</li>
                        <li><strong>Resignation by Employee:</strong> Service &lt; 2 yrs = 0. Service 2-5 yrs = 1/3 indemnity. Service 5-10 yrs = 2/3 indemnity. Service &gt; 10 yrs = Full 100% indemnity.</li>
                        <li><strong>Contract Period:</strong> {selectedEmployeeForDetail.benefits?.contractCompletedPeriod || 'Completed'}.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold uppercase text-amber-400">Total Terminal Settlement Pay</div>
                        <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                          SAR {((selectedEmployeeForDetail.benefits?.actualIndemnityAmount || 0) + (selectedEmployeeForDetail.benefits?.balanceLeaveSalary || 0)).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Indemnity (SAR {(selectedEmployeeForDetail.benefits?.actualIndemnityAmount || 0).toLocaleString()}) + Balance Leave Salary (SAR {(selectedEmployeeForDetail.benefits?.balanceLeaveSalary || 0).toLocaleString()})
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 font-medium">Cumulative Workdays: {selectedEmployeeForDetail.benefits?.totalDurationDaysWorked || 300} days</span>
                        <button
                          type="button"
                          onClick={() => handleToggleEmployeeActiveStatus(selectedEmployeeForDetail.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            selectedEmployeeForDetail.status === 'Active'
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {selectedEmployeeForDetail.status === 'Active' ? 'Mark Employee Inactive (Exit)' : 'Mark Employee Active'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: SALARY REVISION HISTORY (Image 4) */}
              {detailModalTab === 'salary' && (
                <div className="space-y-6">
                  
                  {/* Current Basic & Allowances Overview */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-700 tracking-wider block">Present Compensation</span>
                      <span className="text-base font-extrabold text-emerald-950 font-mono">
                        Basic: SAR {selectedEmployeeForDetail.basicSalary.toLocaleString()} | Housing: SAR {(selectedEmployeeForDetail.houseAllowance || 0).toLocaleString()} | Vehicle: SAR {(selectedEmployeeForDetail.vehicleAllowance || 0).toLocaleString()}
                      </span>
                    </div>

                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-white text-emerald-800 border border-emerald-300 font-bold">
                      Current Basic: SAR {selectedEmployeeForDetail.basicSalary.toLocaleString()}
                    </span>
                  </div>

                  {/* Add New Revision Form (Matching Image 4) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>Log New Salary Revision (Multiple Items Allowed)</span>
                      </h4>
                      <span className="text-[10px] text-rose-600 font-semibold">May be Multiple item revision possible</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">New Revised Basic (SAR)</label>
                        <input
                          type="number"
                          id="rev-basic-input"
                          defaultValue={selectedEmployeeForDetail.basicSalary}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">New House Allowance (SAR)</label>
                        <input
                          type="number"
                          id="rev-house-input"
                          defaultValue={selectedEmployeeForDetail.houseAllowance || 0}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">New Vehicle Allowance (SAR)</label>
                        <input
                          type="number"
                          id="rev-veh-input"
                          defaultValue={selectedEmployeeForDetail.vehicleAllowance || 0}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">New Telephone Allowance (SAR)</label>
                        <input
                          type="number"
                          id="rev-tele-input"
                          defaultValue={selectedEmployeeForDetail.teleAllowance || 0}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Revision Interval</label>
                        <input
                          type="text"
                          id="rev-interval-input"
                          defaultValue="Annual Appraisal 2026"
                          placeholder="e.g. Annual Review, Mid-Year"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 font-semibold mb-1">Reason of Revision</label>
                        <input
                          type="text"
                          id="rev-reason-input"
                          defaultValue="Merit Performance Promotion & Market Index Adjustment"
                          placeholder="e.g. Promotion, Cost of Living"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Approval Attachment</label>
                        <input
                          type="text"
                          id="rev-approval-input"
                          defaultValue="MD_Executive_Approval_Signoff.pdf"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-600 font-mono text-[10px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const basicEl = document.getElementById('rev-basic-input') as HTMLInputElement;
                          const houseEl = document.getElementById('rev-house-input') as HTMLInputElement;
                          const vehEl = document.getElementById('rev-veh-input') as HTMLInputElement;
                          const teleEl = document.getElementById('rev-tele-input') as HTMLInputElement;
                          const intervalEl = document.getElementById('rev-interval-input') as HTMLInputElement;
                          const reasonEl = document.getElementById('rev-reason-input') as HTMLInputElement;

                          handleAddSalaryRevision(
                            selectedEmployeeForDetail.id,
                            Number(basicEl?.value || selectedEmployeeForDetail.basicSalary),
                            Number(houseEl?.value || 0),
                            Number(vehEl?.value || 0),
                            Number(teleEl?.value || 0),
                            intervalEl?.value || 'Annual Review',
                            reasonEl?.value || 'Merit Increase'
                          );
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Salary Revision Record</span>
                      </button>
                    </div>
                  </div>

                  {/* Revision History Log Table */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Historical Revision Timeline Log
                    </span>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3 border-r border-slate-200">Date of Revision</th>
                            <th className="py-2.5 px-3 border-r border-slate-200">Previous Basic</th>
                            <th className="py-2.5 px-3 border-r border-slate-200 text-emerald-800 bg-emerald-50/50">Revised Basic</th>
                            <th className="py-2.5 px-3 border-r border-slate-200">Revised Allowances</th>
                            <th className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">Total Revised (Gross)</th>
                            <th className="py-2.5 px-3 border-r border-slate-200">Revision Interval</th>
                            <th className="py-2.5 px-4 border-r border-slate-200">Reason of Revision</th>
                            <th className="py-2.5 px-3">Approval Attachment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-[11px] bg-white">
                          {(selectedEmployeeForDetail.salaryRevisions && selectedEmployeeForDetail.salaryRevisions.length > 0) ? (
                            selectedEmployeeForDetail.salaryRevisions.map((rev) => (
                              <tr key={rev.id} className="hover:bg-slate-50/80">
                                <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900">{rev.dateOfRevision}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-500">SAR {rev.presentBasic.toLocaleString()}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-emerald-700 bg-emerald-50/40">SAR {rev.revisedBasic.toLocaleString()}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700">
                                  H:{rev.revisedHouseAllowance} V:{rev.revisedVehicleAllowance} T:{rev.revisedTelephoneAllowance}
                                </td>
                                <td className="py-2.5 px-3 border-r border-slate-200 font-extrabold text-slate-950 text-xs">SAR {rev.revisedAmount.toLocaleString()}</td>
                                <td className="py-2.5 px-3 border-r border-slate-200 font-sans">{rev.revisionInterval}</td>
                                <td className="py-2.5 px-4 border-r border-slate-200 font-sans text-slate-800">{rev.reasonOfRevision}</td>
                                <td className="py-2.5 px-3 font-sans text-indigo-600 font-semibold flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{rev.approvalAttachName || 'Approved.pdf'}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-slate-400 font-sans">
                                No prior salary revisions recorded for this employee.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeForIdBadge(selectedEmployeeForDetail);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <IdCard className="w-3.5 h-3.5 text-rose-400" />
                  <span>Open Printable ID Badge</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Enterprise Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
