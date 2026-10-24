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
  HardHat, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ChevronDown, 
  ShieldAlert, 
  Users, 
  Activity,
  FileCheck
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';
import { HseKpiReport, HseIncidentItem, ToolboxTalkItem } from '../../types/hse';
import { INITIAL_HSE_KPIS, INITIAL_HSE_INCIDENTS, INITIAL_TOOLBOX_TALKS } from '../../data/mockHseData';

interface HseDashboardProps {
  projects: ProjectRFQ[];
  onBackToMainMenu: () => void;
  currentUser?: {
    name: string;
    role: string;
    email: string;
  };
}

export const HseDashboard: React.FC<HseDashboardProps> = ({
  projects,
  onBackToMainMenu,
  currentUser
}) => {
  // Tabs: 'kpi' | 'incidents' | 'tbt'
  const [activeTab, setActiveTab] = useState<'kpi' | 'incidents' | 'tbt'>('kpi');

  // Data states
  const [kpis, setKpis] = useState<HseKpiReport[]>(INITIAL_HSE_KPIS);
  const [incidents, setIncidents] = useState<HseIncidentItem[]>(INITIAL_HSE_INCIDENTS);
  const [tbtList, setTbtList] = useState<ToolboxTalkItem[]>(INITIAL_TOOLBOX_TALKS);

  // View mode: 'list' or 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [selectedKpi, setSelectedKpi] = useState<HseKpiReport | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Form State matching Image 2
  const [formKpiRef, setFormKpiRef] = useState('HSE-KPI-001');
  const [formProjectId, setFormProjectId] = useState('proj-maaden-2');
  const [formProjectName, setFormProjectName] = useState('MAADEN');
  const [formMonth, setFormMonth] = useState('October 2026');
  const [formManHours, setFormManHours] = useState<number>(100000);
  const [formLti, setFormLti] = useState<number>(0);
  const [formTri, setFormTri] = useState<number>(0);
  const [formFirstAid, setFormFirstAid] = useState<number>(0);
  const [formNearMiss, setFormNearMiss] = useState<number>(0);

  // Dropdown state
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [projectSearchInput, setProjectSearchInput] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auto-calculated rates (Per 1 Million Hours)
  const calculatedLtifr = useMemo(() => {
    if (!formManHours || formManHours <= 0) return 0;
    return Number(((formLti * 1000000) / formManHours).toFixed(2));
  }, [formLti, formManHours]);

  const calculatedTrifr = useMemo(() => {
    if (!formManHours || formManHours <= 0) return 0;
    return Number(((formTri * 1000000) / formManHours).toFixed(2));
  }, [formTri, formManHours]);

  // Available projects list
  const availableProjects = useMemo(() => {
    const list: { id: string; name: string }[] = [
      { id: 'proj-maaden-2', name: 'MAADEN' },
      { id: 'proj-maaden-1', name: 'maaden' },
      { id: 'proj-internal', name: 'Internal' },
      { id: 'proj-abhinav', name: "Abhinav Thaj's opportunity" }
    ];

    projects.forEach(p => {
      if (!list.some(item => item.id === p.id)) {
        list.push({
          id: p.id,
          name: `${p.clientShortName || p.clientName} — ${p.proposedProjectName}`
        });
      }
    });

    return list;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projectSearchInput) return availableProjects;
    return availableProjects.filter(p => p.name.toLowerCase().includes(projectSearchInput.toLowerCase()));
  }, [availableProjects, projectSearchInput]);

  // Open Form for "+ New"
  const handleOpenNewKpi = () => {
    const nextRef = `HSE-KPI-00${kpis.length + 1}`;
    setSelectedKpi(null);
    setFormKpiRef(nextRef);
    setFormProjectId(availableProjects[0]?.id || 'proj-maaden-2');
    setFormProjectName(availableProjects[0]?.name || 'MAADEN');
    setFormMonth('October 2026');
    setFormManHours(100000);
    setFormLti(0);
    setFormTri(0);
    setFormFirstAid(0);
    setFormNearMiss(0);
    setViewMode('form');
  };

  // Open Form for Existing KPI
  const handleOpenExistingKpi = (kpi: HseKpiReport) => {
    setSelectedKpi(kpi);
    setFormKpiRef(kpi.kpiRef);
    setFormProjectId(kpi.projectId);
    setFormProjectName(kpi.projectName);
    setFormMonth(kpi.reportingMonth);
    setFormManHours(kpi.totalSafeManHours);
    setFormLti(kpi.lostTimeInjuries);
    setFormTri(kpi.totalRecordableIncidents);
    setFormFirstAid(kpi.firstAidCases);
    setFormNearMiss(kpi.nearMissReports);
    setViewMode('form');
  };

  // Save KPI Report
  const handleSaveKpi = () => {
    if (!formProjectName.trim()) {
      alert('Please specify a project for this HSE KPI report.');
      return;
    }

    if (selectedKpi) {
      setKpis(prev => prev.map(k => k.id === selectedKpi.id ? {
        ...k,
        kpiRef: formKpiRef,
        projectId: formProjectId,
        projectName: formProjectName,
        reportingMonth: formMonth,
        totalSafeManHours: Number(formManHours),
        lostTimeInjuries: Number(formLti),
        totalRecordableIncidents: Number(formTri),
        firstAidCases: Number(formFirstAid),
        nearMissReports: Number(formNearMiss),
        ltifr: calculatedLtifr,
        trifr: calculatedTrifr
      } : k));
      showToast(`✅ HSE KPI Report ${formKpiRef} updated successfully.`);
    } else {
      const newKpi: HseKpiReport = {
        id: `hse-${Date.now()}`,
        kpiRef: formKpiRef,
        projectId: formProjectId,
        projectName: formProjectName,
        clientName: 'Client Management',
        reportingMonth: formMonth,
        totalSafeManHours: Number(formManHours),
        lostTimeInjuries: Number(formLti),
        totalRecordableIncidents: Number(formTri),
        firstAidCases: Number(formFirstAid),
        nearMissReports: Number(formNearMiss),
        ltifr: calculatedLtifr,
        trifr: calculatedTrifr,
        status: 'Submitted',
        recordedBy: currentUser?.name || 'Tariq Al-Ghamdi',
        createdAt: new Date().toISOString()
      };
      setKpis(prev => [newKpi, ...prev]);
      showToast(`✅ New HSE KPI Report ${formKpiRef} recorded successfully.`);
    }

    setViewMode('list');
  };

  // Filtered KPIs for table
  const filteredKpis = useMemo(() => {
    return kpis.filter(k => 
      k.kpiRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.reportingMonth.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kpis, searchQuery]);

  return (
    <div className="w-full space-y-4 font-sans text-slate-800">
      
      {/* ============================================================ */}
      {/* 1. HSE MODULE SUB-NAVIGATION (Clean Enterprise Layout)       */}
      {/* ============================================================ */}
      <div className="bg-slate-900 text-white rounded-2xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800 select-none">
        
        {/* Left: Module Title & Subnav Tabs */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>Radwa HSE Safety</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ISO 45001
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Safe Man-Hours, LTIFR/TRIFR Metrics & Incidents
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('kpi'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kpi'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Safety KPIs (LTIFR/TRIFR)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('incidents'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'incidents'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incident Log & CAPA</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {incidents.filter(i => i.status !== 'Closed').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('tbt'); setViewMode('list'); }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tbt'
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Toolbox Talks (TBT)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-black">
                {tbtList.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Live Benchmark Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero LTI Benchmark Active</span>
          </span>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-5 z-50 p-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUB-HEADER BAR (New button + Search + Pager)              */}
      {/* ============================================================ */}
      {viewMode === 'list' && (
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          
          <div className="flex items-center gap-3">
            {activeTab === 'kpi' && (
              <button
                type="button"
                onClick={handleOpenNewKpi}
                style={{ backgroundColor: '#5b4db7' }}
                className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-slate-800">
              <span className="text-sm font-bold">
                {activeTab === 'kpi' && 'HSE KPI & Safety Rates'}
                {activeTab === 'incidents' && 'Incident Log & CAPA'}
                {activeTab === 'tbt' && 'Site Toolbox Talks (TBT)'}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer transition" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-56 sm:w-72 pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span className="font-mono font-medium">
                1-{filteredKpis.length} / {filteredKpis.length}
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
      <div className="w-full space-y-4">
        
        {/* ======================================================== */}
        {/* VIEW A: HSE KPI TABLE VIEW (Matching User Screenshot 1)  */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'kpi' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                
                {/* Header matching Screenshot 1 */}
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">
                      <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                    </th>
                    <th className="py-2.5 px-4 whitespace-nowrap">KPI Report Ref</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Project</th>
                    <th className="py-2.5 px-4 whitespace-nowrap">Reporting Month</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">Total Safe Man-Hours Worked</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">Lost Time Injuries (LTI)</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">LTIFR (LTI Frequency Rate)</th>
                    <th className="py-2.5 px-4 whitespace-nowrap text-right">TRIFR (TRI Frequency Rate)</th>
                  </tr>
                </thead>

                {/* Body matching Screenshot 1 */}
                <tbody className="divide-y divide-slate-100">
                  {filteredKpis.length > 0 ? (
                    filteredKpis.map(kpi => (
                      <tr
                        key={kpi.id}
                        onClick={() => handleOpenExistingKpi(kpi)}
                        className="hover:bg-purple-50/40 transition cursor-pointer group"
                      >
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                        </td>

                        {/* KPI Report Ref */}
                        <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-purple-700 whitespace-nowrap font-mono">
                          {kpi.kpiRef}
                        </td>

                        {/* Project */}
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {kpi.projectName}
                        </td>

                        {/* Reporting Month */}
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {kpi.reportingMonth}
                        </td>

                        {/* Total Safe Man-Hours Worked */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {kpi.totalSafeManHours.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Lost Time Injuries (LTI) */}
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                          {kpi.lostTimeInjuries}
                        </td>

                        {/* LTIFR */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {kpi.ltifr.toFixed(2)}
                        </td>

                        {/* TRIFR */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {kpi.trifr.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                        <div className="font-bold text-sm text-slate-800">No HSE KPI Reports Found</div>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredKpis.length} monthly HSE safety reports</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>Zero LTI Benchmark Active</span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW B: INCIDENT LOG TAB                                 */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'incidents' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Incident Log & Corrective Action (CAPA)</h2>
                <p className="text-xs text-slate-500">Near miss reporting, site hazard identification, and corrective actions</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {incidents.length} Incident Records Logged
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {inc.incidentRef}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
                        {inc.type}
                      </span>
                      <span className="text-xs text-slate-500">{inc.date}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Description:</strong> {inc.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">CAPA Plan:</strong> {inc.correctiveAction}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Project: <strong>{inc.projectName}</strong> | Location: <strong>{inc.location}</strong></span>
                    <span>Assigned HSE Lead: <strong>{inc.assignedOfficer}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW C: TOOLBOX TALKS TAB                                */}
        {/* ======================================================== */}
        {viewMode === 'list' && activeTab === 'tbt' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Toolbox Talks (TBT) Daily Site Briefings</h2>
                <p className="text-xs text-slate-500">Pre-shift safety talks, hazard awareness, and crew attendance records</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {tbtList.length} TBT Sessions Conducted
              </span>
            </div>

            <div className="space-y-3">
              {tbtList.map(tbt => (
                <div key={tbt.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {tbt.tbtRef}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{tbt.topic}</h3>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {tbt.attendeesCount} Workers Attended
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-800">Project:</strong> {tbt.projectName} | <strong className="text-slate-800">Date:</strong> {tbt.date} | <strong className="text-slate-800">Languages:</strong> {tbt.conductedLanguage}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">Key Hazards & Precautions:</strong> {tbt.keyHazardsDiscussed}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Supervisor: <strong>{tbt.supervisorName}</strong></span>
                    <span>Location: <strong>{tbt.siteLocation}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW D: HSE KPI FORM VIEW (Matching User Screenshot 2)   */}
        {/* ======================================================== */}
        {viewMode === 'form' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden max-w-5xl mx-auto space-y-0 animate-in fade-in duration-200">
            
            {/* Top Breadcrumb Header Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="font-bold text-purple-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>HSE KPI & Safety Rates</span>
                </button>
                <span className="text-slate-400">/</span>
                <span className="font-bold text-slate-800 font-mono">{formKpiRef}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-1 cursor-pointer hover:text-slate-700" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveKpi}
                  style={{ backgroundColor: '#5b4db7' }}
                  className="px-4 py-1.5 rounded text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Back to List
                </button>
              </div>
            </div>

            {/* Form Main Body (Exact Fields from User Screenshot 2) */}
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Form Big Title: HSE-KPI-001 */}
              <div>
                <input
                  type="text"
                  value={formKpiRef}
                  onChange={(e) => setFormKpiRef(e.target.value)}
                  className="text-2xl font-black text-slate-900 tracking-tight font-mono border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none w-full max-w-sm"
                  placeholder="HSE-KPI-001"
                />
              </div>

              {/* 2-Column Section: PERIOD & PROJECT vs CALCULATED FREQUENCY RATES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* LEFT: PERIOD & PROJECT */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
                    PERIOD & PROJECT
                  </h3>

                  {/* Project Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900 flex items-center justify-between cursor-pointer hover:border-slate-400"
                      >
                        <span className="truncate">{formProjectName || 'Select Project...'}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>

                      {isProjectDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                          <div className="p-2 bg-slate-50">
                            <input
                              type="text"
                              value={projectSearchInput}
                              onChange={(e) => setProjectSearchInput(e.target.value)}
                              placeholder="Search project..."
                              className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          <div className="py-1">
                            {filteredProjects.map(proj => (
                              <div
                                key={proj.id}
                                onClick={() => {
                                  setFormProjectId(proj.id);
                                  setFormProjectName(proj.name);
                                  setIsProjectDropdownOpen(false);
                                  setProjectSearchInput('');
                                }}
                                className={`px-3 py-2 text-xs font-semibold hover:bg-slate-100 cursor-pointer flex items-center justify-between ${
                                  formProjectName === proj.name ? 'bg-slate-100 text-purple-700 font-bold' : 'text-slate-800'
                                }`}
                              >
                                <span>{proj.name}</span>
                                {formProjectName === proj.name && <Check className="w-3.5 h-3.5 text-purple-600" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reporting Month */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reporting Month
                    </label>
                    <input
                      type="text"
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      placeholder="e.g. October 2026"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                    />
                  </div>

                  {/* Total Safe Man-Hours Worked */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Safe Man-Hours Worked
                    </label>
                    <input
                      type="number"
                      value={formManHours}
                      onChange={(e) => setFormManHours(Number(e.target.value))}
                      placeholder="e.g. 100000"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                    />
                  </div>

                </div>

                {/* RIGHT: CALCULATED FREQUENCY RATES (PER 1M HRS) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
                    CALCULATED FREQUENCY RATES (PER 1M HRS)
                  </h3>

                  {/* LTIFR */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">LTIFR (LTI Frequency Rate)</span>
                      <span className="text-lg font-mono font-black text-slate-900">
                        {calculatedLtifr.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Formula: (Lost Time Injuries × 1,000,000) / Total Safe Man-Hours</p>
                  </div>

                  {/* TRIFR */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">TRIFR (TRI Frequency Rate)</span>
                      <span className="text-lg font-mono font-black text-slate-900">
                        {calculatedTrifr.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Formula: (Total Recordable Incidents × 1,000,000) / Total Safe Man-Hours</p>
                  </div>

                </div>

              </div>

              {/* LOWER SECTION: INCIDENT & EVENT COUNTS (Exact from Screenshot 2) */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  INCIDENT & EVENT COUNTS
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Left Column Counts */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lost Time Injuries (LTI)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formLti}
                        onChange={(e) => setFormLti(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Recordable Incidents (TRI)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formTri}
                        onChange={(e) => setFormTri(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Right Column Counts */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        First Aid Cases
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formFirstAid}
                        onChange={(e) => setFormFirstAid(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Near Miss Reports
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formNearMiss}
                        onChange={(e) => setFormNearMiss(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600 shadow-2xs"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveKpi}
                  style={{ backgroundColor: '#5b4db7' }}
                  className="px-5 py-2 rounded-lg text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save HSE KPI Record</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
