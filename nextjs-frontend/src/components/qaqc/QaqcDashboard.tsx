import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  Settings, 
  MessageSquare, 
  Clock, 
  LayoutGrid, 
  ShieldCheck, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  HardHat, 
  Filter,
  Save,
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Building,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';
import { 
  RfiInspectionItem, 
  InspectionDiscipline, 
  ItpInspectionPoint, 
  InspectionResult,
  NcrItem,
  PunchListItem
} from '../../types/qaqc';
import { INITIAL_RFIS, INITIAL_NCRS, INITIAL_PUNCH_LIST } from '../../data/mockQaqcData';
import { REGISTERED_COMPANY_EMPLOYEES } from '../../data/mockEmployees';

interface QaqcDashboardProps {
  projects: ProjectRFQ[];
  onBackToMainMenu: () => void;
  currentUser?: {
    name: string;
    role: string;
    email: string;
  };
}

export const QaqcDashboard: React.FC<QaqcDashboardProps> = ({
  projects,
  onBackToMainMenu,
  currentUser
}) => {
  // Top nav tabs
  const [activeTab, setActiveTab] = useState<'rfi' | 'ncr' | 'punch_list'>('rfi');

  // Data states
  const [rfis, setRfis] = useState<RfiInspectionItem[]>(INITIAL_RFIS);
  const [ncrs, setNcrs] = useState<NcrItem[]>(INITIAL_NCRS);
  const [punchList, setPunchList] = useState<PunchListItem[]>(INITIAL_PUNCH_LIST);

  // View state: 'list' or 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [selectedRfi, setSelectedRfi] = useState<RfiInspectionItem | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State for editing or creating an RFI
  const [formRfiRef, setFormRfiRef] = useState<string>('RFI-NEW');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formProjectName, setFormProjectName] = useState<string>('');
  const [formWbsTask, setFormWbsTask] = useState<string>('');
  const [formDiscipline, setFormDiscipline] = useState<InspectionDiscipline>('Civil Concrete & Foundation Inspection');
  const [formItpPoint, setFormItpPoint] = useState<ItpInspectionPoint>('HOLD POINT (Work Cannot Proceed Without Sign-off)');
  const [formScheduledDateTime, setFormScheduledDateTime] = useState<string>('Oct 19, 10:32 AM');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formRadwaInspector, setFormRadwaInspector] = useState<string>('Eng. Youssef Nabil');
  const [formConsultantInspector, setFormConsultantInspector] = useState<string>('Saudi Aramco PID: Eng. Fahad Al-Zamil');
  const [formStatus, setFormStatus] = useState<InspectionResult>('Pending Inspection');
  const [formFindingsComments, setFormFindingsComments] = useState<string>('');

  // Dropdown open states
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchInput, setProjectSearchInput] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Compile available projects list
  const availableProjects = useMemo(() => {
    const list: { id: string; name: string; client: string; isAramco?: boolean }[] = [
      { id: 'proj-internal', name: 'Internal', client: 'Radwa Internal' },
      { id: 'proj-maaden-1', name: 'maaden', client: 'Maaden' },
      { id: 'proj-maaden-2', name: 'MAADEN', client: 'Maaden Phosphate' },
      { id: 'proj-abhinav', name: "Abhinav Thaj's opportunity", client: 'Industrial Client' }
    ];

    projects.forEach(p => {
      if (!list.some(item => item.id === p.id)) {
        list.push({
          id: p.id,
          name: `${p.clientShortName || p.clientName} — ${p.proposedProjectName}`,
          client: p.clientName,
          isAramco: p.clientName.toLowerCase().includes('aramco')
        });
      }
    });

    return list;
  }, [projects]);

  const filteredAvailableProjects = useMemo(() => {
    if (!projectSearchInput) return availableProjects;
    return availableProjects.filter(p => 
      p.name.toLowerCase().includes(projectSearchInput.toLowerCase()) ||
      p.client.toLowerCase().includes(projectSearchInput.toLowerCase())
    );
  }, [availableProjects, projectSearchInput]);

  // Executive KPI summary numbers
  const kpiStats = useMemo(() => {
    const total = rfis.length;
    const approved = rfis.filter(r => r.status === 'CODE 1: APPROVED / Compliant').length;
    const pending = rfis.filter(r => r.status === 'Pending Inspection').length;
    const rejected = rfis.filter(r => r.status === 'CODE 3: REJECTED / Non-Compliant').length;
    const complianceRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '100.0';
    return { total, approved, pending, rejected, complianceRate };
  }, [rfis]);

  // Open Form for "+ New"
  const handleOpenNewRfi = () => {
    const newRefNumber = `RFI-2026-000${rfis.length + 1}`;
    setSelectedRfi(null);
    setFormRfiRef(newRefNumber);
    setFormProjectId(availableProjects[0]?.id || '');
    setFormProjectName(availableProjects[0]?.name || 'Internal');
    setFormWbsTask('Civil Concrete & Foundation Inspection');
    setFormDiscipline('Civil Concrete & Foundation Inspection');
    setFormItpPoint('HOLD POINT (Work Cannot Proceed Without Sign-off)');
    setFormScheduledDateTime('Oct 19, 10:32 AM');
    setFormLocation('Zone B, Foundation Grid Ref: E-12/N-08');
    setFormRadwaInspector('Eng. Youssef Nabil');
    setFormConsultantInspector('Saudi Aramco PID: Eng. Fahad Al-Zamil');
    setFormStatus('Pending Inspection');
    setFormFindingsComments('');
    setViewMode('form');
  };

  // Open Form for Existing RFI
  const handleOpenExistingRfi = (rfi: RfiInspectionItem) => {
    setSelectedRfi(rfi);
    setFormRfiRef(rfi.rfiRef || rfi.rfiNumber || '');
    setFormProjectId(rfi.projectId || rfi.workOrderNo || '');
    setFormProjectName(rfi.projectName || '');
    setFormWbsTask(rfi.wbsTask || rfi.description || '');
    setFormDiscipline((rfi.inspectionDiscipline || rfi.discipline || 'Civil') as InspectionDiscipline);
    setFormItpPoint((rfi.itpInspectionPoint || rfi.itpHoldPoint || 'Hold Point (H)') as ItpInspectionPoint);
    setFormScheduledDateTime(rfi.scheduledDateTime || rfi.inspectionDate || '');
    setFormLocation(rfi.siteLocationGridRef || rfi.location || '');
    setFormRadwaInspector(rfi.radwaInspector || rfi.inspectorName || '');
    setFormConsultantInspector(rfi.consultantInspector || '');
    setFormStatus((rfi.status || 'Pending Inspection') as InspectionResult);
    setFormFindingsComments(rfi.findingsComments || rfi.remarks || '');
    setViewMode('form');
  };

  // Save RFI
  const handleSaveRfi = () => {
    if (!formProjectName.trim()) {
      alert('Please select or specify a project for this RFI.');
      return;
    }

    if (selectedRfi) {
      setRfis(prev => prev.map(item => item.id === selectedRfi.id ? {
        ...item,
        rfiRef: formRfiRef,
        projectId: formProjectId,
        projectName: formProjectName,
        wbsTask: formWbsTask,
        inspectionDiscipline: formDiscipline,
        itpInspectionPoint: formItpPoint,
        scheduledDateTime: formScheduledDateTime,
        siteLocationGridRef: formLocation,
        radwaInspector: formRadwaInspector,
        consultantInspector: formConsultantInspector,
        status: formStatus,
        findingsComments: formFindingsComments
      } : item));
      showToast(`✅ RFI ${formRfiRef} saved successfully.`);
    } else {
      const newRfi: RfiInspectionItem = {
        id: `rfi-${Date.now()}`,
        rfiRef: formRfiRef,
        projectId: formProjectId || 'proj-custom',
        projectName: formProjectName,
        clientName: availableProjects.find(p => p.id === formProjectId)?.client || 'Commercial Client',
        wbsTask: formWbsTask || 'General Quality Inspection',
        inspectionDiscipline: formDiscipline,
        itpInspectionPoint: formItpPoint,
        scheduledDateTime: formScheduledDateTime,
        siteLocationGridRef: formLocation || 'Site Work Area',
        radwaInspector: formRadwaInspector,
        consultantInspector: formConsultantInspector,
        status: formStatus,
        findingsComments: formFindingsComments,
        createdAt: new Date().toISOString()
      };
      setRfis(prev => [newRfi, ...prev]);
      showToast(`✅ New RFI ${formRfiRef} created successfully.`);
    }

    setViewMode('list');
  };

  // Quick template inserters
  const handleInsertPreset = (text: string) => {
    setFormFindingsComments(prev => prev ? `${prev}\n\n${text}` : text);
  };

  // Approve (CODE 1)
  const handleApproveCode1 = () => {
    setFormStatus('CODE 1: APPROVED / Compliant');
    if (selectedRfi) {
      setRfis(prev => prev.map(item => item.id === selectedRfi.id ? {
        ...item,
        status: 'CODE 1: APPROVED / Compliant',
        approvedAt: new Date().toISOString()
      } : item));
    }
    showToast(`✅ RFI ${formRfiRef} SIGNED OFF as CODE 1: APPROVED / Compliant`);
  };

  // Reject (CODE 3)
  const handleRejectCode3 = () => {
    setFormStatus('CODE 3: REJECTED / Non-Compliant');
    if (selectedRfi) {
      setRfis(prev => prev.map(item => item.id === selectedRfi.id ? {
        ...item,
        status: 'CODE 3: REJECTED / Non-Compliant',
        rejectedAt: new Date().toISOString()
      } : item));
    }
    showToast(`❌ RFI ${formRfiRef} marked as CODE 3: REJECTED / Non-Compliant`);
  };

  // Filtered RFIs
  const filteredRfis = useMemo(() => {
    return rfis.filter(r => {
      const matchesSearch = 
        r.rfiRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.wbsTask.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.siteLocationGridRef.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDiscipline = disciplineFilter === 'all' || r.inspectionDiscipline === disciplineFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesDiscipline && matchesStatus;
    });
  }, [rfis, searchQuery, disciplineFilter, statusFilter]);

  return (
    <div className="w-full space-y-4 font-sans text-slate-800">
      
      {/* ============================================================ */}
      {/* 1. QA/QC MODULE SUB-NAVIGATION (Clean Enterprise Layout)     */}
      {/* ============================================================ */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800 select-none">
        
        {/* Left: Module Title & Subnav Tabs */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Radwa QA/QC Quality</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ISO 9001 / ITP
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Inspection Requests (RFI), Non-Conformance (NCR) & Punch Lists
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('rfi'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rfi'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Inspection Requests (RFI)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-400 text-slate-950 font-black">
                {rfis.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('ncr'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ncr'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              <span>Non-Conformance (NCR)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-400 text-slate-950 font-black">
                {ncrs.filter(n => n.status !== 'Verified & Closed').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('punch_list'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'punch_list'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>Punch List / Snags</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {punchList.filter(p => p.status === 'Pending').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Quality Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>ITP Hold Points Active</span>
          </span>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-5 z-50 p-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUB-HEADER BAR (Action Button + Search + Filters + Pager) */}
      {/* ============================================================ */}
      {viewMode === 'list' && (
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          
          <div className="flex items-center gap-3">
            {activeTab === 'rfi' && (
              <button
                type="button"
                onClick={handleOpenNewRfi}
                style={{ backgroundColor: '#5b4db7' }}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-slate-800">
              <span className="text-sm font-extrabold tracking-tight">
                {activeTab === 'rfi' && 'Requests for Inspection (RFI)'}
                {activeTab === 'ncr' && 'Non-Conformance Reports (NCR)'}
                {activeTab === 'punch_list' && 'Project Punch List / Snags'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition" />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Discipline Filter */}
            {activeTab === 'rfi' && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    disciplineFilter === 'all' ? 'bg-white shadow-2xs text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Disciplines
                </button>
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('Civil Concrete & Foundation Inspection')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    disciplineFilter.includes('Civil') ? 'bg-white shadow-2xs text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Civil
                </button>
                <button
                  type="button"
                  onClick={() => setDisciplineFilter('Welding & NDT Inspection')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    disciplineFilter.includes('Welding') ? 'bg-white shadow-2xs text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Welding / NDT
                </button>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Ref, Project, Location..."
                className="w-56 sm:w-72 pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Counter Pager */}
            <div className="flex items-center gap-1 text-xs text-slate-600 pl-2 border-l border-slate-200">
              <span className="font-mono font-semibold">
                1-{filteredRfis.length} / {filteredRfis.length}
              </span>
              <div className="flex items-center gap-0.5 ml-1">
                <button type="button" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT: LIST VIEW vs FORM VIEW                      */}
      {/* ============================================================ */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
        
        {/* ======================================================== */}
        {/* EXECUTIVE KPI STATS CARDS (Top of List View)             */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'rfi' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Total RFIs Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total RFIs</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <FileText className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                {kpiStats.total}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Registered inspection points
              </div>
            </div>

            {/* Code 1 Approved Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Code 1 Approved</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2 font-mono flex items-center gap-1.5">
                <span>{kpiStats.approved}</span>
                <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-sans">
                  {kpiStats.complianceRate}%
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                Certified compliant with specs
              </div>
            </div>

            {/* Pending Inspections Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Pending Inspection</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-purple-700 mt-2 font-mono">
                {kpiStats.pending}
              </div>
              <div className="text-[11px] text-purple-700 mt-0.5 font-medium">
                Awaiting witness / hold point sign-off
              </div>
            </div>

            {/* Code 3 Non-Compliances Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-sm transition">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Code 3 Rejected</span>
                <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
                {kpiStats.rejected}
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5 font-medium">
                Requires rectification & re-inspection
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW A: LIST TABLE VIEW (Matching Image 4)               */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'rfi' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3.5 w-8 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap">RFI / MIR Ref</th>
                    <th className="py-3 px-4 whitespace-nowrap">Project</th>
                    <th className="py-3 px-4 whitespace-nowrap">WBS Task / Activity</th>
                    <th className="py-3 px-4 whitespace-nowrap">Inspection Discipline</th>
                    <th className="py-3 px-4 whitespace-nowrap">ITP Inspection Point</th>
                    <th className="py-3 px-4 whitespace-nowrap">Scheduled Date & Time</th>
                    <th className="py-3 px-4 whitespace-nowrap">Exact Site Location / Grid Ref</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">Inspection Result</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRfis.length > 0 ? (
                    filteredRfis.map(rfi => (
                      <tr
                        key={rfi.id}
                        onClick={() => handleOpenExistingRfi(rfi)}
                        className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                        </td>

                        {/* RFI / MIR Ref */}
                        <td className="py-3.5 px-4 font-black text-slate-900 group-hover:text-purple-700 whitespace-nowrap font-mono text-xs">
                          {rfi.rfiRef}
                        </td>

                        {/* Project */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/60 font-medium">
                            {rfi.projectName}
                          </span>
                        </td>

                        {/* WBS Task / Activity */}
                        <td className="py-3.5 px-4 text-slate-700 max-w-[220px] truncate font-medium" title={rfi.wbsTask}>
                          {rfi.wbsTask}
                        </td>

                        {/* Inspection Discipline with Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {rfi.inspectionDiscipline}
                        </td>

                        {/* ITP Inspection Point */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rfi.itpInspectionPoint.includes('HOLD') 
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {rfi.itpInspectionPoint}
                          </span>
                        </td>

                        {/* Scheduled Date & Time */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                          {rfi.scheduledDateTime}
                        </td>

                        {/* Exact Site Location / Grid Ref */}
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap max-w-[150px] truncate font-mono text-[11px]" title={rfi.siteLocationGridRef}>
                          {rfi.siteLocationGridRef}
                        </td>

                        {/* Inspection Result (Pills matching screenshot 4) */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${
                            rfi.status === 'CODE 1: APPROVED / Compliant'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : rfi.status === 'CODE 3: REJECTED / Non-Compliant'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {rfi.status === 'CODE 1: APPROVED / Compliant' && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                            {rfi.status === 'CODE 3: REJECTED / Non-Compliant' && <X className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />}
                            {rfi.status === 'Pending Inspection' && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                            <span>{rfi.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <div className="font-bold text-sm text-slate-800">No Inspection Requests Found</div>
                        <p className="text-xs text-slate-400 mt-1">
                          No RFIs matched your filters. Click &quot;New&quot; to register an inspection.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Showing {filteredRfis.length} quality inspection records</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-medium">All QA/QC Records Verified with Client ITP Log</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW B: NCR TAB VIEW                                     */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'ncr' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Non-Conformance Reports (NCR Log)</h2>
                <p className="text-xs text-slate-500">Track and rectify project site quality non-compliances</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                {ncrs.filter(n => n.status !== 'Verified & Closed').length} Active Non-Conformances
              </span>
            </div>

            <div className="space-y-3">
              {ncrs.map(ncr => (
                <div key={ncr.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {ncr.ncrRef}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{ncr.title}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      ncr.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {ncr.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Project:</strong> {ncr.projectName} | <strong className="text-slate-800">Discipline:</strong> {ncr.discipline}
                  </p>
                  
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">Corrective Action:</strong> {ncr.correctiveAction}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Assigned Lead: <strong>{ncr.assignedEngineer}</strong></span>
                    <span>Target Closure: <strong>{ncr.targetClosureDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW C: PUNCH LIST TAB VIEW                              */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'punch_list' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Project Punch List & Site Snags</h2>
                <p className="text-xs text-slate-500">Pre-commissioning hold items and post-construction snag list</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {punchList.length} Items Logged
              </span>
            </div>

            <div className="space-y-3">
              {punchList.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {item.itemNo}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.description}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Project:</strong> {item.projectName} | <strong className="text-slate-800">Location:</strong> {item.location}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span>Assigned Crew: <strong>{item.assignedContractor}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW D: RFI DETAIL / EDIT / CREATE FORM (Image 2)        */}
        {/* ======================================================== */}
        {viewMode === 'form' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden max-w-5xl mx-auto space-y-0 animate-in fade-in duration-200">
            
            {/* Form Top Breadcrumb Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="font-bold text-purple-700 hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Requests for Inspection (RFI)</span>
                </button>
                <span className="text-slate-400">/</span>
                <span className="font-bold text-slate-800 font-mono text-sm">{formRfiRef}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 cursor-pointer hover:text-slate-700" />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-semibold">ITP Registered</span>
              </div>
            </div>

            {/* Actions Bar + Chevron Status Pipeline (Exact match to Image 2) */}
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              
              {/* Left Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Approve (CODE 1) Green Button */}
                <button
                  type="button"
                  onClick={handleApproveCode1}
                  style={{ backgroundColor: '#16a34a' }}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve (CODE 1)</span>
                </button>

                {/* Reject (CODE 3) Red Button */}
                <button
                  type="button"
                  onClick={handleRejectCode3}
                  style={{ backgroundColor: '#dc2626' }}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>Reject (CODE 3)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRfi}
                  style={{ backgroundColor: '#5b4db7' }}
                  className="px-4 py-2 rounded-lg text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save RFI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  Back to List
                </button>
              </div>

              {/* Right: Chevron Pipeline Tracker (Exact match to Image 2) */}
              <div className="flex items-center text-xs font-bold overflow-hidden rounded-lg border border-slate-200">
                
                {/* Stage 1: Pending Inspection */}
                <div className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                  formStatus === 'Pending Inspection'
                    ? 'bg-purple-100 text-purple-900 border-r border-purple-200'
                    : 'bg-slate-50 text-slate-400 border-r border-slate-200'
                }`}>
                  <span>Pending Inspection</span>
                </div>

                {/* Stage 2: CODE 1: APPROVED / Compliant */}
                <div className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                  formStatus === 'CODE 1: APPROVED / Compliant'
                    ? 'bg-emerald-100 text-emerald-900 border-r border-emerald-300'
                    : 'bg-slate-50 text-slate-400 border-r border-slate-200'
                }`}>
                  {formStatus === 'CODE 1: APPROVED / Compliant' && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />}
                  <span>CODE 1: APPROVED / Compliant</span>
                </div>

                {/* Stage 3: CODE 3: REJECTED / Non-Compliant */}
                <div className={`px-3 py-1.5 flex items-center gap-1.5 transition ${
                  formStatus === 'CODE 3: REJECTED / Non-Compliant'
                    ? 'bg-rose-100 text-rose-900'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {formStatus === 'CODE 3: REJECTED / Non-Compliant' && <X className="w-3.5 h-3.5 text-rose-700 stroke-[3]" />}
                  <span>CODE 3: REJECTED / Non-Compliant</span>
                </div>

              </div>

            </div>

            {/* Form Main Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Form Title Heading */}
              <div>
                <input
                  type="text"
                  value={formRfiRef}
                  onChange={(e) => setFormRfiRef(e.target.value)}
                  className="text-3xl font-black text-slate-900 tracking-tight font-mono border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none w-full max-w-sm"
                  placeholder="RFI-NEW"
                />
              </div>

              {/* 2-Column Form Fields (Exact layout from Image 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                
                {/* LEFT COLUMN: INSPECTION META */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>INSPECTION META</span>
                  </h3>

                  {/* Project Dropdown (Matching Screenshot 1 & 3) */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 flex items-center justify-between cursor-pointer hover:border-purple-500 focus:ring-1 focus:ring-purple-600 shadow-2xs"
                      >
                        <span className="truncate">{formProjectName || 'Select Project...'}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>

                      {/* Dropdown Menu (Exact design from Screenshot 1 & 3) */}
                      {isProjectDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                          <div className="p-2 bg-slate-50">
                            <input
                              type="text"
                              value={projectSearchInput}
                              onChange={(e) => setProjectSearchInput(e.target.value)}
                              placeholder="Search project..."
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div className="py-1">
                            {filteredAvailableProjects.map(proj => (
                              <div
                                key={proj.id}
                                onClick={() => {
                                  setFormProjectId(proj.id);
                                  setFormProjectName(proj.name);
                                  setIsProjectDropdownOpen(false);
                                  setProjectSearchInput('');
                                }}
                                className={`px-3 py-2.5 text-xs font-semibold hover:bg-purple-50 cursor-pointer flex items-center justify-between ${
                                  formProjectName === proj.name ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-800'
                                }`}
                              >
                                <span>{proj.name}</span>
                                {formProjectName === proj.name && <Check className="w-3.5 h-3.5 text-purple-600" />}
                              </div>
                            ))}
                          </div>

                          <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                const custom = prompt('Enter custom project name:');
                                if (custom) {
                                  setFormProjectName(custom);
                                  setIsProjectDropdownOpen(false);
                                }
                              }}
                              className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                            >
                              Search more...
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WBS Task / Activity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WBS Task / Activity
                    </label>
                    <input
                      type="text"
                      value={formWbsTask}
                      onChange={(e) => setFormWbsTask(e.target.value)}
                      placeholder="Civil Concrete & Foundation Inspection"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                    />
                  </div>

                  {/* Inspection Discipline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Inspection Discipline
                    </label>
                    <select
                      value={formDiscipline}
                      onChange={(e) => setFormDiscipline(e.target.value as InspectionDiscipline)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Civil Concrete & Foundation Inspection">Civil Concrete & Foundation Inspection</option>
                      <option value="Mechanical & Industrial Piping">Mechanical & Industrial Piping</option>
                      <option value="Welding & NDT Inspection">Welding & NDT Inspection</option>
                      <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                      <option value="Protective Coating & Painting">Protective Coating & Painting</option>
                      <option value="Hydrostatic & Pressure Testing">Hydrostatic & Pressure Testing</option>
                    </select>
                  </div>

                  {/* ITP Inspection Point */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ITP Inspection Point
                    </label>
                    <select
                      value={formItpPoint}
                      onChange={(e) => setFormItpPoint(e.target.value as ItpInspectionPoint)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs cursor-pointer"
                    >
                      <option value="HOLD POINT (Work Cannot Proceed Without Sign-off)">HOLD POINT (Work Cannot Proceed Without Sign-off)</option>
                      <option value="WITNESS POINT (Inspection Required Before Next Activity)">WITNESS POINT (Inspection Required Before Next Activity)</option>
                      <option value="SURVEILLANCE POINT (Random Quality Audit)">SURVEILLANCE POINT (Random Quality Audit)</option>
                      <option value="REVIEW POINT (Document / Certificate Verification)">REVIEW POINT (Document / Certificate Verification)</option>
                    </select>
                  </div>

                </div>

                {/* RIGHT COLUMN: SCHEDULE & LOCATION */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>SCHEDULE & LOCATION</span>
                  </h3>

                  {/* Scheduled Date & Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="text"
                      value={formScheduledDateTime}
                      onChange={(e) => setFormScheduledDateTime(e.target.value)}
                      placeholder="Oct 19, 10:32 AM"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                    />
                  </div>

                  {/* Exact Site Location / Grid Ref */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Exact Site Location / Grid Ref
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. zxcfvg or Zone B, Manifold Corridor, Grid Ref: E-42/N-18"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs font-mono"
                    />
                  </div>

                  {/* Radwa QA/QC Inspector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Radwa QA/QC Inspector
                    </label>
                    <select
                      value={formRadwaInspector}
                      onChange={(e) => setFormRadwaInspector(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs cursor-pointer"
                    >
                      {REGISTERED_COMPANY_EMPLOYEES
                        .filter(e => e.department === 'QA/QC' || e.department === 'Operations')
                        .map(emp => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Consultant / Aramco PID Inspector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Consultant / Aramco PID Inspector
                    </label>
                    <input
                      type="text"
                      value={formConsultantInspector}
                      onChange={(e) => setFormConsultantInspector(e.target.value)}
                      placeholder="Saudi Aramco PID: Eng. Fahad Al-Zamil"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                    />
                  </div>

                </div>

              </div>

              {/* Bottom Section: QA/QC Findings & Comments (Exact match to Image 2) */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    className="text-xs font-bold text-purple-700 border-b-2 border-purple-600 pb-1.5 px-1 flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>QA/QC Findings & Comments</span>
                  </button>

                  {/* Quick-Fill Presets for fast inspection entry */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">
                      Quick Templates:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInsertPreset('Concrete Slump verified at 125mm. 7-day cube specimens sampled. 100% compliant with standard drawings.')}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + Slump Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertPreset('NDT RT 100% radiographic weld film reviewed. No crack, lack of fusion, or porosity. Accepted under ASME B31.3.')}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      + NDT Pass
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={formFindingsComments}
                    onChange={(e) => setFormFindingsComments(e.target.value)}
                    placeholder="Record concrete slump test results, NDT radiograph readings, or hydrotest pressure values..."
                    className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 shadow-2xs font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  Cancel & Return
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveRfi}
                    style={{ backgroundColor: '#5b4db7' }}
                    className="px-5 py-2 rounded-xl text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Inspection Request</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
};
