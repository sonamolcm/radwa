'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  HardHat, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Paperclip, 
  AlertCircle, 
  Filter, 
  Layers, 
  UserCheck, 
  Zap, 
  FileText,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronRight,
  XCircle,
  Eye
} from 'lucide-react';
import { Estimator, ProjectRFQ, ProjectStatus, ClientRecord } from '../../types/crm';
import { MdReviewModal } from './MdReviewModal';
import { AssignEstimatorModal } from '../crm/AssignEstimatorModal';

interface MdDashboardProps {
  projects: ProjectRFQ[];
  estimators: Estimator[];
  clients?: ClientRecord[];
  onApproveForBidding: (projectId: string, mdRemarks?: string) => void;
  onDeclineTender: (projectId: string, reason?: string) => void;
  onReassignEstimator: (projectId: string, estimatorId: string) => void;
}

export const MdDashboard: React.FC<MdDashboardProps> = ({
  projects,
  estimators,
  clients = [],
  onApproveForBidding,
  onDeclineTender,
  onReassignEstimator
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all' | 'clients'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClientName, setFilterClientName] = useState<string>('');
  
  // Modals state
  const [reviewingProject, setReviewingProject] = useState<ProjectRFQ | null>(null);
  const [projectToReassign, setProjectToReassign] = useState<ProjectRFQ | null>(null);

  // Filtered lists
  const pendingProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review');
  }, [projects]);

  const approvedProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Approved for Bidding' || p.mdStatus === 'Approved for Bidding');
  }, [projects]);

  const displayedProjects = useMemo(() => {
    let base = activeTab === 'pending' 
      ? pendingProjects 
      : activeTab === 'approved' 
      ? approvedProjects 
      : projects;

    if (filterClientName) {
      base = base.filter(p => (p.clientName || '').toLowerCase().trim() === filterClientName.toLowerCase().trim());
    }

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(p => 
      (p.proposedProjectName || '').toLowerCase().includes(q) ||
      (p.workOrderNo || '').toLowerCase().includes(q) ||
      (p.clientName || '').toLowerCase().includes(q) ||
      (p.siteName || '').toLowerCase().includes(q) ||
      (p.assignedEstimatorName && p.assignedEstimatorName.toLowerCase().includes(q))
    );
  }, [activeTab, pendingProjects, approvedProjects, projects, searchQuery, filterClientName]);

  const displayedClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(c => 
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.shortCode && c.shortCode.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
      (c.crNumber && c.crNumber.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  // Metric summaries for MD
  const optimalEstimatorsCount = estimators.filter(e => e.activeTenders === 0 || e.capacityStatus === 'Optimal Capacity').length;
  const pendingValueTotal = pendingProjects.reduce((acc, p) => acc + (p.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* MD Executive Title Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Executive Governance
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Managing Director Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tender Authorization & Estimator Allocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Review incoming construction tenders logged by CRM, verify or change the allocated quantity survey engineer, and authorize commercial bidding.
          </p>
        </div>

        {/* Live Pending Counter */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingProjects.length} Tenders Awaiting MD Approval</span>
          </div>
        </div>
      </div>

      {/* 5 MD Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Awaiting MD Review
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {pendingProjects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Requires executive sign-off
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Authorized for Bidding
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {approvedProjects.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Active in estimation pricing
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Estimator Pool Health
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {optimalEstimatorsCount} / {estimators.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Engineers at optimal capacity
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Pending Pipeline Value
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            SAR {(pendingValueTotal / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Combined estimated value
          </div>
        </div>

        {/* Registered Clients Metric Card */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs cursor-pointer transition group"
        >
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center justify-between">
            <span>Registered Clients</span>
            <Building2 className="w-4 h-4 text-blue-500 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {clients.length}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            View client corporate directory →
          </div>
        </div>

      </div>

      {/* Search & Tabs Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setActiveTab('pending'); setFilterClientName(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Awaiting MD Approval</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'pending' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {pendingProjects.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('approved'); setFilterClientName(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Authorized for Bidding</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'approved' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {approvedProjects.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('all'); setFilterClientName(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>All Tenders</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {projects.length}
              </span>
            </button>

            {/* Clients Tab */}
            <button
              onClick={() => { setActiveTab('clients'); setFilterClientName(''); }}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'clients'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Clients & Developers</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'clients' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {clients.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'clients' ? "Search client name, city, CR..." : "Search tender, client, estimator..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

        </div>

        {/* Client Filter Active Banner */}
        {filterClientName && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>
                Filtering tenders for client: <strong className="font-bold underline">{filterClientName}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {displayedProjects.length} Tenders Found
              </span>
            </div>
            <button
              onClick={() => setFilterClientName('')}
              className="px-2.5 py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 font-semibold text-xs cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

      </div>

      {/* Main View Area: Either Clients Grid OR Tenders Queue */}
      {activeTab === 'clients' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>REGISTERED CLIENTS & CONSULTANTS DIRECTORY</span>
            <span>{displayedClients.length} CLIENTS</span>
          </div>

          {displayedClients.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">
                {searchQuery ? `No Clients Matching "${searchQuery}"` : 'No Clients Registered Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clients registered in Radwa ERP CRM desk are automatically synchronized and visible here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedClients.map((client) => {
                const clientTenders = projects.filter(p => 
                  p.clientName.toLowerCase().trim() === client.companyName.toLowerCase().trim() ||
                  (client.shortCode && p.clientName.toLowerCase().trim() === client.shortCode.toLowerCase().trim())
                );
                const pendingTenders = clientTenders.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review');

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {client.shortCode || 'CLIENT'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active Client
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {client.shortCode ? client.shortCode.slice(0, 3).toUpperCase() : client.companyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate" title={client.companyName}>
                            {client.companyName}
                          </h4>
                          {client.city && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{client.city}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                        {client.contactPerson && (
                          <div className="font-medium text-slate-800 truncate">
                            Contact: {client.contactPerson}
                          </div>
                        )}
                        {client.contactEmail && (
                          <div className="truncate text-slate-500">
                            {client.contactEmail}
                          </div>
                        )}
                        {client.contactPhone && (
                          <div className="font-mono text-slate-600">
                            {client.contactPhone}
                          </div>
                        )}
                        {client.crNumber && (
                          <div className="font-mono text-slate-400 text-[11px]">
                            CR: {client.crNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-slate-500 font-medium">Tender Work Orders:</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono">
                            {clientTenders.length} Total
                          </span>
                          {pendingTenders.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-mono border border-amber-200">
                              {pendingTenders.length} Pending MD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterClientName(client.companyName);
                          setActiveTab('all');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View Tenders ({clientTenders.length})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
      /* MD Dossiers Queue */
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            {activeTab === 'pending' ? 'TENDERS AWAITING MD DECISION' : activeTab === 'approved' ? 'AUTHORIZED TENDERS' : 'ALL TENDERS REGISTER'}
          </span>
          <span>{displayedProjects.length} RECORDS</span>
        </div>

        {displayedProjects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">
              {filterClientName ? `No Tenders for Client "${filterClientName}"` : (activeTab === 'pending' ? 'All Inbound Tenders Reviewed!' : 'No Matching Records')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterClientName 
                ? 'Clear the client filter above to see all projects.' 
                : (activeTab === 'pending' 
                  ? 'There are currently no new tender dossiers waiting for Managing Director approval.'
                  : 'No projects match your current tab and search query.')}
            </p>
            {filterClientName && (
              <button
                onClick={() => setFilterClientName('')}
                className="mt-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Clear Client Filter
              </button>
            )}
          </div>
        ) : (
          displayedProjects.map((project) => {
            const assignedEst = estimators.find(e => e.id === project.assignedEstimatorId);
            const isOptimal = assignedEst?.capacityStatus === 'Optimal Capacity' || assignedEst?.activeTenders === 0;
            const isPending = project.status === 'Pending MD Approval' || project.mdStatus === 'Pending Review';

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all p-5 space-y-4"
              >
                
                {/* Top Row: Identifiers & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {project.workOrderNo}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {project.enquirySerialNo}
                    </span>
                    {project.clientRfqNo && (
                      <span className="text-xs text-slate-400">
                        Client Ref: <span className="font-mono text-slate-600">{project.clientRfqNo}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Pending MD Approval
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <Check className="h-3 w-3" />
                        Approved for Bidding
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  
                  {/* Left: Project & Scope */}
                  <div className="lg:col-span-6 space-y-1">
                    <h3 
                      onClick={() => setReviewingProject(project)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                    >
                      {project.proposedProjectName}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {project.clientName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterClientName(project.clientName);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                        title="Filter tenders for this client"
                      >
                        Filter Client
                      </button>
                      <span>•</span>
                      <span className="text-slate-500">
                        {project.siteName} ({project.projectLocation})
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 pt-1 leading-relaxed">
                      {project.projectWorkDescription}
                    </p>

                    {/* SOW Scope Tags */}
                    <div className="pt-2 flex flex-wrap gap-1">
                      {project.sowScopes.map(scope => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Middle: Estimator Allocated by CRM (MD can reassign!) */}
                  <div className="lg:col-span-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                      <span>Estimator Allocation</span>
                      {/* MD Option to Change / Reassign Estimator */}
                      <button
                        type="button"
                        onClick={() => setProjectToReassign(project)}
                        className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Change Estimator
                      </button>
                    </div>

                    {project.assignedEstimatorName ? (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {assignedEst?.initials || project.assignedEstimatorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {project.assignedEstimatorName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {project.assignedEstimatorRole || 'Estimating Engineer'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {assignedEst?.activeTenders ?? 0} Active Tenders
                            {isOptimal && (
                              <span className="text-emerald-700 font-medium ml-1">
                                (Optimal)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-rose-600 font-medium">
                        No estimator allocated yet
                      </div>
                    )}
                  </div>

                  {/* Right: Key Dates & Documents */}
                  <div className="lg:col-span-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Inquiry Received:</span>
                      <span className="font-medium text-slate-800">{project.receivedDate}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Bid Close Date:</span>
                      <span className="font-bold text-rose-600">{project.bidCloseDate}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Submission Mode:</span>
                      <span className="font-medium text-slate-800">{project.bidSubmissionType}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                      <span>{project.attachedFiles.length} Attached Drawings/Files</span>
                    </div>
                  </div>

                </div>

                {/* Bottom MD Actions Toolbar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  <div className="text-xs text-slate-500">
                    {project.mdApprovedAt ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Approved on {project.mdApprovedAt}
                      </span>
                    ) : (
                      <span>Requires Managing Director approval to commence BOQ estimation</span>
                    )}
                  </div>

                  {/* Primary Decision Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Filter Client Tenders */}
                    <button
                      type="button"
                      onClick={() => setFilterClientName(project.clientName)}
                      className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                      title="Filter all tenders for this client"
                    >
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Client Tenders</span>
                    </button>

                    {/* View Complete Dossier */}
                    <button
                      type="button"
                      onClick={() => setReviewingProject(project)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Review Dossier
                    </button>

                    {/* Change Estimator Button */}
                    <button
                      type="button"
                      onClick={() => setProjectToReassign(project)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1"
                    >
                      <HardHat className="h-3.5 w-3.5 text-slate-600" />
                      Change Estimator
                    </button>

                    {/* "Approve for Bidding" Primary Button (as requested in audio) */}
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => onApproveForBidding(project.id)}
                        className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve for Bidding
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                        Authorized
                      </span>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>
      )}

      {/* Review Modal */}
      <MdReviewModal
        isOpen={Boolean(reviewingProject)}
        onClose={() => setReviewingProject(null)}
        project={reviewingProject}
        estimators={estimators}
        onApproveForBidding={onApproveForBidding}
        onDeclineTender={onDeclineTender}
        onOpenReassignEstimator={(p) => {
          setProjectToReassign(p);
        }}
      />

      {/* Change Estimator Modal (reused from our clean light assign estimator modal) */}
      <AssignEstimatorModal
        isOpen={Boolean(projectToReassign)}
        onClose={() => setProjectToReassign(null)}
        project={projectToReassign}
        estimators={estimators}
        onAssignEstimator={onReassignEstimator}
      />

    </div>
  );
};
