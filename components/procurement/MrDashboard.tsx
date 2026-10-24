'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Boxes, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Printer, 
  Eye, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  DollarSign, 
  Layers, 
  Tag, 
  ChevronRight,
  TrendingUp,
  FolderOpen,
  Calendar,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';
import { 
  MaterialRequest, 
  MaterialRequestItem, 
  MaterialRequestPriority, 
  MaterialRequestStatus,
  consolidateMaterialRequests 
} from '../../types/inventory';
import { INITIAL_MATERIAL_REQUESTS } from '../../data/mockInventoryData';

interface MrDashboardProps {
  projects?: ProjectRFQ[];
  currentUser: any;
  initialProjectId?: string;
  onNavigateToPurchase?: () => void;
  onNavigateToInventory?: () => void;
  onBackToMainMenu?: () => void;
}

export const MrDashboard: React.FC<MrDashboardProps> = ({
  projects = [],
  currentUser,
  initialProjectId,
  onNavigateToPurchase,
  onNavigateToInventory,
  onBackToMainMenu
}) => {
  // Shared persistent material requests (Strictly 1 MR per Project)
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(() => {
    let list = INITIAL_MATERIAL_REQUESTS;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('radwa_material_requests');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map((mr: MaterialRequest) => {
              if (mr.id === 'mr-2026-0041' && (!mr.items || mr.items.length < 4)) {
                return {
                  ...INITIAL_MATERIAL_REQUESTS[0],
                  status: mr.status
                };
              }
              return mr;
            });
          }
        } catch (e) {
          console.error('Failed to parse radwa_material_requests', e);
        }
      }
    }
    const consolidated = consolidateMaterialRequests(list);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
    }
    return consolidated;
  });

  const saveMaterialRequests = (newReqs: MaterialRequest[]) => {
    const consolidated = consolidateMaterialRequests(newReqs);
    setMaterialRequests(consolidated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Ensure any existing localStorage duplicates and missed items are automatically sanitized on mount
  useEffect(() => {
    const syncFromStorage = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('radwa_material_requests');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            let needsUpdate = false;
            const sanitized = parsed.map((mr: MaterialRequest) => {
              if (mr.id === 'mr-2026-0041' && (!mr.items || mr.items.length < 4)) {
                needsUpdate = true;
                return {
                  ...INITIAL_MATERIAL_REQUESTS[0],
                  status: mr.status
                };
              }
              return mr;
            });
            const consolidated = consolidateMaterialRequests(sanitized);
            if (needsUpdate || consolidated.length !== parsed.length) {
              localStorage.setItem('radwa_material_requests', JSON.stringify(consolidated));
            }
            setMaterialRequests(consolidated);
          } catch (e) {
            console.error(e);
          }
        }
      }
    };

    syncFromStorage();
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('focus', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('focus', syncFromStorage);
    };
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // View Mode: 'project_list' | 'project_detail'
  // (User's audio: "Material Request-inte dashboard open cheyyumpol aadyam oro oro project-ukal
  //  list cheythu kaanikkanam. Aa list cheytha project-ukal open cheythu nokkumpol aa project-inu
  //  vannekkana Material Request enthaanennullathu kaanikkanam.")
  const [viewMode, setViewMode] = useState<'project_list' | 'project_detail'>(() => {
    return initialProjectId ? 'project_detail' : 'project_list';
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (initialProjectId) return initialProjectId;
    return materialRequests[0]?.projectId || materialRequests[0]?.workOrderNo || null;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Verification Checklist state for active MR inspection
  const [verificationNotes, setVerificationNotes] = useState('Technical specifications checked against tender BOQ & SAES standards. Shortfall confirmed unavailable in central yard.');
  const [specComplianceChecked, setSpecComplianceChecked] = useState(true);
  const [stockDepletionChecked, setStockDepletionChecked] = useState(true);
  const [leadTimeAcceptable, setLeadTimeAcceptable] = useState(true);

  // Group Material Requests by Project / Work Order (Strictly 1 MR per Project)
  const projectGroups = useMemo(() => {
    const consolidated = consolidateMaterialRequests(materialRequests);
    return consolidated.map(mr => ({
      projectId: mr.projectId,
      workOrderNo: mr.workOrderNo,
      projectName: mr.projectName,
      clientName: mr.clientName,
      activeMr: mr,
      requests: [mr],
      totalItemsCount: mr.items.length,
      totalEstimatedCost: mr.totalEstimatedCost,
      highestPriority: mr.priority,
      hasPending: mr.status === 'Pending Verification',
      allVerified: mr.status === 'Verified & Sent to Purchase',
      latestRequestedDate: mr.requestedDate,
      targetDeliveryDate: mr.targetDeliveryDate,
      requester: mr.requestedBy
    }));
  }, [materialRequests]);

  // Filtered Project Groups for the list view
  const filteredProjectGroups = useMemo(() => {
    return projectGroups.filter(pg => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        pg.workOrderNo.toLowerCase().includes(q) ||
        pg.projectName.toLowerCase().includes(q) ||
        pg.clientName.toLowerCase().includes(q) ||
        pg.requests.some(r => r.mrNumber.toLowerCase().includes(q) || r.items.some(i => i.name.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q)));

      const matchesStatus = 
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && pg.hasPending) ||
        (statusFilter === 'Verified' && pg.requests.some(r => r.status === 'Verified & Sent to Purchase')) ||
        (statusFilter === 'PO Issued' && pg.requests.some(r => r.status === 'PO Issued'));

      const matchesPriority = priorityFilter === 'All' || pg.highestPriority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projectGroups, searchQuery, statusFilter, priorityFilter]);

  // Active Project Group when in detail view
  const activeProjectGroup = useMemo(() => {
    if (!selectedProjectId) return projectGroups[0] || null;
    return projectGroups.find(pg => pg.projectId === selectedProjectId || pg.workOrderNo === selectedProjectId) || projectGroups[0] || null;
  }, [projectGroups, selectedProjectId]);

  // Active single consolidated Material Request for the selected project (Strictly ONE MR per project)
  const activeMr = useMemo(() => {
    if (!activeProjectGroup) return null;
    return activeProjectGroup.activeMr || activeProjectGroup.requests[0] || null;
  }, [activeProjectGroup]);

  const activeProjectMrs = useMemo(() => {
    return activeMr ? [activeMr] : [];
  }, [activeMr]);

  // Top overall stats
  const stats = useMemo(() => {
    const totalProjects = projectGroups.length;
    const totalMrs = materialRequests.length;
    const pendingMrs = materialRequests.filter(m => m.status === 'Pending Verification').length;
    const verifiedMrs = materialRequests.filter(m => m.status === 'Verified & Sent to Purchase').length;
    const totalValue = materialRequests.reduce((acc, m) => acc + m.totalEstimatedCost, 0);

    return { totalProjects, totalMrs, pendingMrs, verifiedMrs, totalValue };
  }, [projectGroups, materialRequests]);

  // Action: Open project detail view
  const handleOpenProjectDetail = (projId: string) => {
    setSelectedProjectId(projId);
    setViewMode('project_detail');
  };

  // Action: Handle Verify & Send to Purchase Dashboard
  // User's audio: "അത് verify ചെയ്തിട്ട് Purchase-ന്റെ dashboard-ലേക്ക് അയക്കണം"
  const handleVerifyAndSendToPurchase = (mrId: string) => {
    const updated = materialRequests.map(mr => {
      if (mr.id === mrId) {
        return {
          ...mr,
          status: 'Verified & Sent to Purchase' as const,
          approvalStatus: 'Approved by MD' as const,
          approvedBy: currentUser?.name || 'Eng. Tariq Al-Mansour (Managing Director)',
          approvedAt: new Date().toISOString().slice(0, 10),
          procurementOfficer: 'Eng. Khalid Al-Ghamdi',
          notes: `${mr.notes ? mr.notes + ' • ' : ''}Verified by Material Desk: ${verificationNotes}`
        };
      }
      return mr;
    });

    saveMaterialRequests(updated);
    showToast(`✅ Material Request verified & authorized! Status: Transferred to Purchase Department.`);
  };

  // Demo / Re-test Action: Reset back to Pending Verification
  const handleResetToPending = (mrId: string) => {
    const updated = materialRequests.map(mr => {
      if (mr.id === mrId) {
        return {
          ...mr,
          status: 'Pending Verification' as const,
          approvalStatus: 'Pending' as const,
          approvedBy: undefined,
          approvedAt: undefined
        };
      }
      return mr;
    });

    saveMaterialRequests(updated);
    showToast(`🔄 MR set to 'Pending Verification'. You can now test clicking Verify!`);
  };

  const getPriorityBadge = (p: MaterialRequestPriority) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Normal':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusBadge = (s: MaterialRequestStatus) => {
    switch (s) {
      case 'Pending Verification':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Verified & Sent to Purchase':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'RFQ Sent to Vendors':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'PO Issued':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Goods Received in Inventory (GRN)':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-xs font-semibold leading-relaxed">
            {toastMessage}
          </div>
        </div>
      )}

      {/* Top Banner & Hub Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                Radwa Supply Chain Desk
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-blue-300 font-mono font-bold">
                Stage 2: Material Requests (MR) Verification Hub
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-cyan-400" />
              <span>Material Requests Hub</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Project-wise shortfall material intake, technical engineering verification, and direct transfer to the Purchase Department.
            </p>
          </div>

          {/* Department Information Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Department</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Quantity Surveying & Material Verification</span>
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Authorized Officer</span>
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Farhan Qureshi</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Active Projects with MRs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{stats.totalProjects}</span>
              <span className="text-[11px] text-slate-400">Projects Queued</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">
              Pending Verification
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">{stats.pendingMrs}</span>
              <span className="text-[11px] text-slate-400">Awaiting Sign-off</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">
              Verified & Sent to Purchase
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">{stats.verifiedMrs}</span>
              <span className="text-[11px] text-slate-400">Transferred to PO</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
              Total Requisition Value
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                SAR {(stats.totalValue / 1000000).toFixed(2)}M
              </span>
              <span className="text-[11px] text-slate-400">Shortfall Demand</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* VIEW 1: PROJECTS DIRECTORY (LIST OF ALL PROJECTS WITH MRS)          */}
      {/* (User's audio: "Material Request-inte dashboard open cheyyumpol      */}
      {/*  aadyam oro oro project-ukal list cheythu kaanikkanam")              */}
      {/* ==================================================================== */}
      {viewMode === 'project_list' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Search, Filter & Quick Nav Bar */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <span>Project Material Requisitions Directory</span>
              </h2>
              <p className="text-xs text-slate-500">
                Select any project below to inspect its shortfall materials, review technical specs, and authorize transfer to Purchase.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Work Order, Project, Client..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({projectGroups.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'Pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({projectGroups.filter(p => p.hasPending).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('Verified')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    statusFilter === 'Verified' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Verified ({projectGroups.filter(p => p.allVerified).length})
                </button>
              </div>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjectGroups.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Project Requisitions Found</h3>
                <p className="text-xs text-slate-500 mt-1">No material requests matched your search or status filter.</p>
                {onNavigateToInventory && (
                  <button
                    type="button"
                    onClick={onNavigateToInventory}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                  >
                    Open Inventory Reconciler to Generate MR
                  </button>
                )}
              </div>
            ) : (
              filteredProjectGroups.map((group) => (
                <div
                  key={group.projectId || group.workOrderNo}
                  onClick={() => handleOpenProjectDetail(group.projectId || group.workOrderNo)}
                  className="rounded-3xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                        {group.workOrderNo}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(group.highestPriority)}`}>
                          {group.highestPriority}
                        </span>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          group.hasPending 
                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {group.hasPending ? 'Pending' : 'Verified'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {group.projectName}
                    </h3>

                    <p className="text-xs text-slate-500 truncate">
                      Client: <span className="font-semibold text-slate-700">{group.clientName}</span>
                    </p>
                  </div>

                  {/* Card Body Metrics */}
                  <div className="p-5 space-y-3 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Items to Buy</span>
                        <span className="text-sm font-black text-rose-600 font-mono">
                          {group.totalItemsCount} Materials
                        </span>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Cost</span>
                        <span className="text-sm font-black text-slate-900 font-mono">
                          SAR {group.totalEstimatedCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">MR Document:</span>
                        <span className="font-mono font-bold text-blue-600">
                          {group.requests.map(r => r.mrNumber).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Delivery:</span>
                        <span className="font-mono text-slate-700">{group.targetDeliveryDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Requisition by {group.requester.split(' ')[0]}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProjectDetail(group.projectId || group.workOrderNo);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Open MR Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VIEW 2: PROJECT MATERIAL REQUEST INSPECTOR & VERIFIER                */}
      {/* (User's audio: "Aa list cheytha project-ukal open cheythu nokkumpol   */}
      {/*  aa project-inu vannekkana Material Request enthaanennullathu        */}
      {/*  kaanikkanam. Ennittu athu verify cheythittu Purchase-inte            */}
      {/*  dashboard-ilekku ayakkanam.")                                       */}
      {/* ==================================================================== */}
      {viewMode === 'project_detail' && activeProjectGroup && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Back Navigation Bar */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setViewMode('project_list')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to All Projects Directory</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Active Project:</span>
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                {activeProjectGroup.workOrderNo}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-xs hidden md:inline">
                {activeProjectGroup.projectName}
              </span>
            </div>
          </div>

          {/* Project Details Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-blue-600 text-white shadow-xs">
                    {activeProjectGroup.workOrderNo}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    Client: <strong className="text-slate-900">{activeProjectGroup.clientName}</strong>
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(activeProjectGroup.highestPriority)}`}>
                    {activeProjectGroup.highestPriority} Priority
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {activeProjectGroup.projectName}
                </h2>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  Total Shortfall Budget
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  SAR {activeProjectGroup.totalEstimatedCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* PROMINENT HIGHLIGHTED PENDING NOTIFICATION (AS EXPLICITLY REQUESTED BY USER) */}
            {activeMr?.status === 'Pending Verification' && (
              <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 shadow-xl shadow-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-pulse">
                    <Clock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                        ⏳ ACTION REQUIRED: PENDING VERIFICATION
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                        From Central Yard Reconciler
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      Material Request {activeMr.mrNumber} is Awaiting Technical Engineering Verification!
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                      This requisition was dispatched from the Warehouse Stock Reconciler. Before it can be routed to the Purchase Department for supplier PO issuance, the Lead Estimator / Material QA Engineer must inspect and verify the specifications below.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleVerifyAndSendToPurchase(activeMr.id)}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm transition-all duration-200 flex items-center gap-2.5 shadow-xl shadow-emerald-950/20 cursor-pointer ring-4 ring-emerald-400/40 hover:scale-105 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>✓ Verify Material Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Verified: Prominent Verified Confirmation Banner */}
            {activeMr?.status === 'Verified & Sent to Purchase' && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-400 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                        ✓ VERIFIED BY ENGINEERING
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Status: Ready for Purchase</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5">
                      Requisition {activeMr.mrNumber} is Verified & Transferred to Purchase Department
                    </h3>
                    <p className="text-xs text-slate-600">
                      Technical specifications approved. Procurement Officer Eng. Khalid Al-Ghamdi will see this upon logging in to issue Purchase Orders.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetToPending(activeMr.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset to Pending (Test Flow)</span>
                </button>
              </div>
            )}

            {/* Single Consolidated Material Request for this Project (Exactly 1 MR) */}
            {activeMr ? (
              <div 
                key={activeMr.id} 
                className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-xs space-y-0"
              >
                {/* Requisition Header Strip */}
                <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                        OFFICIAL MATERIAL REQUISITION
                      </span>
                      <span className="font-mono text-cyan-300 font-black text-sm">
                        {activeMr.mrNumber}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(activeMr.status)}`}>
                        {activeMr.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300">
                      Requisitioned by: <strong className="text-white">{activeMr.requestedBy}</strong> ({activeMr.department}) • Target Site Delivery: <span className="font-mono text-cyan-200 font-bold">{activeMr.targetDeliveryDate}</span>
                    </p>
                  </div>

                  {/* Top Action Button */}
                  <div>
                    {activeMr.status === 'Pending Verification' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Action Needed: Verify Request</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleVerifyAndSendToPurchase(activeMr.id)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-900/40 cursor-pointer ring-2 ring-emerald-400/50 hover:scale-105 active:scale-95 duration-150"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ Verify Material Request & Send to Purchase</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>✓ Verified & Sent to Purchase</span>
                        </span>


                        {/* Testing / Demo Reset Button */}
                        <button
                          type="button"
                          onClick={() => handleResetToPending(activeMr.id)}
                          title="Reset to Pending Verification for demonstration & testing"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Reset for Testing</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* The Core Materials Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 text-center">#</th>
                        <th className="py-3 px-4">Item SKU & Technical Specification</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-2 text-center">Unit</th>
                        <th className="py-3 px-3 text-center bg-rose-50 text-rose-900 font-black border-x border-rose-200">
                          Shortfall to Buy (Qty)
                        </th>
                        <th className="py-3 px-3 text-right">Unit Rate (SAR)</th>
                        <th className="py-3 px-4 text-right">Line Total (SAR)</th>
                        <th className="py-3 px-3">Suggested Vendor</th>
                        <th className="py-3 px-2 text-center">QA Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {activeMr.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-[10px] text-cyan-700 font-black tracking-wide">
                              {item.itemCode}
                            </div>
                            <div className="font-bold text-slate-900 text-xs mt-0.5">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-sm">
                              {item.specification}
                            </div>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {item.category}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-center font-mono font-bold text-slate-600">
                            {item.unit}
                          </td>

                          {/* Highlighted Shortfall Quantity to Buy */}
                          <td className="py-3 px-3 text-center bg-rose-50/60 border-x border-rose-200">
                            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-xs">
                              {item.requestedQuantity} {item.unit}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            SAR {item.unitCost.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            <span className="text-rose-700 font-black">
                              SAR {item.totalCost.toLocaleString()}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-[11px] font-medium text-slate-700 truncate max-w-[160px] block">
                              {item.preferredVendor || 'Aramco Approved Stockist'}
                            </span>
                          </td>

                          <td className="py-3 px-2 text-center">
                            {activeMr.status === 'Pending Verification' ? (
                              <span className="inline-flex items-center text-amber-600 text-[10px] font-bold" title="Awaiting Technical Sign-off">
                                ⏳ Pending QA
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-emerald-600 text-[10px] font-bold" title="Specification verified">
                                ✓ Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MR Requisition Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 max-w-xl">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                      Engineering Justification & Shortfall Notes
                    </span>
                    <p className="text-slate-700 italic text-[11px]">
                      &ldquo;{activeMr.notes || 'Consolidated shortfall demand directly verified against central warehouse stock.'}&rdquo;
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Requisition Total Shortfall
                    </span>
                    <span className="font-mono font-black text-slate-900 text-base text-emerald-600">
                      SAR {activeMr.totalEstimatedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No Material Request Found for this Project</p>
                <p className="text-xs text-slate-400 mt-1">Open Inventory Reconciler to generate a shortfall request.</p>
              </div>
            )}
          </div>

          {/* QA/QC Engineering Sign-Off Panel */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                Engineering QA/QC Verification & Purchase Authorization
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={specComplianceChecked}
                  onChange={(e) => setSpecComplianceChecked(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800 block">SOW & Spec Compliance</span>
                  <span className="text-[11px] text-slate-500">Materials verified against Aramco / Client technical scope.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={stockDepletionChecked}
                  onChange={(e) => setStockDepletionChecked(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Yard Stock Exhaustion</span>
                  <span className="text-[11px] text-slate-500">Central inventory stock confirmed insufficient.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={leadTimeAcceptable}
                  onChange={(e) => setLeadTimeAcceptable(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Lead Time Acceptable</span>
                  <span className="text-[11px] text-slate-500">Supplier delivery aligns with site execution target.</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                QA/QC Verification Notes
              </label>
              <input
                type="text"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Enter technical audit remarks or vendor compliance comments..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bottom Verification & Send Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Verifying Officer: <strong className="text-slate-800">{currentUser?.name || 'Farhan Qureshi (Lead Estimator & Procurement Lead)'}</strong>
              </div>

              {activeProjectMrs.some(m => m.status === 'Pending Verification') ? (
                <button
                  type="button"
                  onClick={() => {
                    const pending = activeProjectMrs.find(m => m.status === 'Pending Verification');
                    if (pending) {
                      handleVerifyAndSendToPurchase(pending.id);
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs transition flex items-center gap-2.5 shadow-xl shadow-emerald-900/20 cursor-pointer ring-2 ring-emerald-500/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Complete Technical QA Audit & Authorize Transfer to Purchase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>QA Audit Completed & Verified • Transferred to Purchase</span>
                  </span>
                  {activeMr && (
                    <button
                      type="button"
                      onClick={() => handleResetToPending(activeMr.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset to Pending (Test)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
