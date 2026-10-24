'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  HardHat, 
  Calendar, 
  MapPin, 
  Clock, 
  Paperclip, 
  AlertCircle, 
  ChevronRight, 
  Layers, 
  UserCheck, 
  FileText,
  UserPlus,
  RefreshCw,
  Eye,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Estimator, ProjectRFQ, ProjectStatus } from '../../types/crm';
import { RegisterClientModal } from './RegisterClientModal';
import { AssignEstimatorModal } from './AssignEstimatorModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { BidPackageDossierModal } from './BidPackageDossierModal';

interface CrmAdminDashboardViewProps {
  projects: ProjectRFQ[];
  estimators: Estimator[];
  onRegisterClient: (newProject: ProjectRFQ) => void;
  onAssignEstimator: (projectId: string, estimatorId: string) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenBoqComparison?: (project: ProjectRFQ) => void;
}

export const CrmAdminDashboardView: React.FC<CrmAdminDashboardViewProps> = ({
  projects,
  estimators,
  onRegisterClient,
  onAssignEstimator,
  onUpdateStatus,
  onOpenBoqComparison
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('ALL');
  const [selectedEstimatorFilter, setSelectedEstimatorFilter] = useState<string>('ALL');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<ProjectRFQ | null>(null);
  const [projectToAssign, setProjectToAssign] = useState<ProjectRFQ | null>(null);
  const [bidPackageDossierProject, setBidPackageDossierProject] = useState<ProjectRFQ | null>(null);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        p.proposedProjectName.toLowerCase().includes(q) ||
        p.workOrderNo.toLowerCase().includes(q) ||
        p.enquirySerialNo.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientShortName.toLowerCase().includes(q) ||
        p.siteName.toLowerCase().includes(q) ||
        p.projectLocation.toLowerCase().includes(q) ||
        (p.assignedEstimatorName && p.assignedEstimatorName.toLowerCase().includes(q))
      );

      const matchesStatus = selectedStatusTab === 'ALL'
        ? true
        : selectedStatusTab === 'Approved Bid Packages'
        ? p.bidPackage?.status === 'Approved'
        : p.status === selectedStatusTab;

      const matchesEstimator = selectedEstimatorFilter === 'ALL' 
        ? true 
        : selectedEstimatorFilter === 'UNASSIGNED' 
        ? !p.assignedEstimatorId 
        : p.assignedEstimatorId === selectedEstimatorFilter;

      return matchesSearch && matchesStatus && matchesEstimator;
    });
  }, [projects, searchQuery, selectedStatusTab, selectedEstimatorFilter]);

  // Metric summaries
  const totalProjectsCount = projects.length;
  const inEstimationCount = projects.filter(p => ['Approved for Bidding', 'Under BOQ Estimation'].includes(p.status)).length;
  const approvedBidPackagesCount = projects.filter(p => p.bidPackage?.status === 'Approved').length;
  const optimalEstimatorsCount = estimators.filter(e => e.activeTenders === 0 || e.capacityStatus === 'Optimal Capacity').length;
  const pendingMdCount = projects.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review').length;

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'New RFQ':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending MD Approval':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved for Bidding':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Estimator Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Under BOQ Estimation':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Bid Submitted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Under Negotiation':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Won / Active Project':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Declined / Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>CRM Intake & Commercial Registry</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
              ISO 9001 / FIDIC
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Inbound Tender Intake & Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Register client tenders, assign engineering estimating capacity, track site feasibility surveys, and synchronize complete 40-document bid dossiers.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Register New Client Tender</span>
            <ChevronRight className="h-4 w-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 5 Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Projects */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Total Projects & RFQs</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {totalProjectsCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>All registered client tenders</span>
          </div>
        </div>

        {/* Card 2: In Estimation */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>In Estimation</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {inEstimationCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Assigned to engineering pool</span>
          </div>
        </div>

        {/* Card 3: Highlighted Approved Bid Packages */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-300/80 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Approved Packages
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {approvedBidPackagesCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>40/40 Docs in CRM Desk</span>
          </div>
        </div>

        {/* Card 4: Optimal Estimators */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-500" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Estimator Capacity</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {optimalEstimatorsCount} <span className="text-sm font-semibold text-slate-400">/ {estimators.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Optimal & ready for tenders</span>
          </div>
        </div>

        {/* Card 5: Awaiting MD Approval */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-400 to-rose-500" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>MD Sign-Off</span>
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">
            {pendingMdCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Sent for executive sign-off</span>
          </div>
        </div>

      </div>

      {/* Filter Toolbar: Search, Status Segments, and Estimator Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, WO #, serial, client or location..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>

          {/* Estimator Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
              Filter by Estimator:
            </span>
            <select
              value={selectedEstimatorFilter}
              onChange={(e) => setSelectedEstimatorFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">All Estimators ({estimators.length})</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {estimators.map(est => (
                <option key={est.id} value={est.id}>
                  {est.name} ({est.activeTenders} Active - {est.capacityStatus})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Clean Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 pt-3">
          {[
            { id: 'ALL', label: 'All Projects', count: projects.length },
            { id: 'Approved Bid Packages', label: '✅ Approved Bid Packages (40 Docs)', count: approvedBidPackagesCount },
            { id: 'Pending MD Approval', label: 'Pending MD Approval', count: projects.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review').length },
            { id: 'Approved for Bidding', label: 'Approved by MD', count: projects.filter(p => p.status === 'Approved for Bidding' || p.mdStatus === 'Approved for Bidding').length },
            { id: 'Under BOQ Estimation', label: 'Under Estimation', count: projects.filter(p => p.status === 'Under BOQ Estimation').length },
            { id: 'Bid Submitted', label: 'Bid Submitted', count: projects.filter(p => p.status === 'Bid Submitted').length },
            { id: 'Won / Active Project', label: 'Won / Awarded', count: projects.filter(p => p.status === 'Won / Active Project').length }
          ].map(tab => {
            const isActive = selectedStatusTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Projects List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>SHOWING {filteredProjects.length} PROJECTS</span>
          <span>LIST REGISTER</span>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No Projects Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No tender records matched your filter criteria. Register a new client or reset the filter.
            </p>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register as a New Client
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const assignedEstObj = estimators.find(e => e.id === project.assignedEstimatorId);
              const isOptimalEst = assignedEstObj?.capacityStatus === 'Optimal Capacity' || assignedEstObj?.activeTenders === 0;

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all p-5 space-y-3.5"
                >
                  
                  {/* Top Row: Work Order & Serial Number + Status Badge */}
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
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Middle Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    
                    {/* Project Name & Scope */}
                    <div className="lg:col-span-6 space-y-1">
                      <h2 
                        onClick={() => setDetailProject(project)}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                      >
                        {project.proposedProjectName}
                      </h2>

                      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Building2 className="h-3.5 w-3.5 text-slate-500" />
                          {project.clientName}
                          {project.clientShortName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                              {project.clientShortName}
                            </span>
                          )}
                        </span>

                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {project.siteName} • {project.projectLocation}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 pt-1 leading-relaxed">
                        {project.projectWorkDescription}
                      </p>
                    </div>

                    {/* Assigned Estimator Box */}
                    <div className="lg:col-span-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                        <span>Assigned Estimator</span>
                        <button
                          type="button"
                          onClick={() => setProjectToAssign(project)}
                          className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                        >
                          {project.assignedEstimatorId ? 'Reassign' : 'Allocate'}
                        </button>
                      </div>

                      {project.assignedEstimatorName ? (
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {assignedEstObj?.initials || project.assignedEstimatorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {project.assignedEstimatorName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {project.assignedEstimatorRole || 'Estimating Engineer'}
                            </div>
                            {isOptimalEst && (
                              <span className="inline-block text-[10px] font-medium text-emerald-600">
                                Optimal Capacity (0 Active)
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-slate-500">
                            Not yet assigned
                          </div>
                          <button
                            type="button"
                            onClick={() => setProjectToAssign(project)}
                            className="w-full py-1 px-2 rounded border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition cursor-pointer"
                          >
                            + Assign Estimator
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dates & SOW Disciplines */}
                    <div className="lg:col-span-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" /> Received:
                        </span>
                        <span className="font-medium text-slate-800">
                          {project.receivedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> Bid Close:
                        </span>
                        <span className="font-semibold text-rose-600">
                          {project.bidCloseDate}
                        </span>
                      </div>

                      {project.attachedFiles.length > 0 && (
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5 text-slate-400" /> Attached:
                          </span>
                          <span className="font-mono text-[11px] text-slate-700">
                            {project.attachedFiles.length} file(s)
                          </span>
                        </div>
                      )}

                      {/* SOW Scope Chips */}
                      <div className="pt-1 flex flex-wrap gap-1">
                        {project.sowScopes.map(scope => (
                          <span 
                            key={scope}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Official 40-Doc Approved Bid Package Banner */}
                  {project.bidPackage?.status === 'Approved' && (
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-emerald-950">
                              Official Bid Package Approved (40 of 40 Documents Received)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/90 text-emerald-900 border border-emerald-300">
                              ✓ Direct in CRM Admin Desk
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Certified by Estimator: QA/QC (10) • HSE (3) • Operations (12) • Procurement (4) • Legal & Commercial (11)
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBidPackageDossierProject(project)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>View 40 Bid Documents</span>
                      </button>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">
                      Logged into Radwa CRM Register
                    </span>

                    <div className="flex items-center gap-2">
                      {project.bidPackage?.status === 'Approved' && (
                        <button
                          type="button"
                          onClick={() => setBidPackageDossierProject(project)}
                          className="px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold transition cursor-pointer flex items-center gap-1.5 text-xs shadow-2xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>40 Bid Docs Received</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDetailProject(project)}
                        className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Full Dossier
                      </button>

                      <button
                        type="button"
                        onClick={() => setProjectToAssign(project)}
                        className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Assign / Rebalance
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modals */}
      <RegisterClientModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        estimators={estimators}
        onRegisterClient={onRegisterClient}
      />

      <AssignEstimatorModal
        isOpen={Boolean(projectToAssign)}
        onClose={() => setProjectToAssign(null)}
        project={projectToAssign}
        estimators={estimators}
        onAssignEstimator={onAssignEstimator}
      />

      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        onClose={() => setDetailProject(null)}
        project={detailProject}
        onOpenAssignEstimator={(p) => setProjectToAssign(p)}
        onUpdateStatus={onUpdateStatus}
        onOpenBoqComparison={onOpenBoqComparison}
      />

      <BidPackageDossierModal
        isOpen={Boolean(bidPackageDossierProject)}
        onClose={() => setBidPackageDossierProject(null)}
        project={bidPackageDossierProject}
      />

    </div>
  );
};
