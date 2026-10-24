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
  Calculator,
  Send,
  Download,
  ArrowRight,
  Eye,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  Compass,
  Sparkles,
  Lock,
  CheckCheck,
  Scale
} from 'lucide-react';
import { 
  Estimator, 
  ProjectRFQ, 
  ProjectStatus, 
  SowDiscipline, 
  SiteReviewDetails, 
  AiBoqCalculation,
  SiteSurveyRequest,
  BidPackage,
  BoqComparisonData
} from '../../types/crm';
import { BoqEstimationModal } from './BoqEstimationModal';
import { ProposalPreviewModal } from './ProposalPreviewModal';
import { SiteReviewModal } from './SiteReviewModal';
import { RequestSurveyModal } from './RequestSurveyModal';
import { ProjectDetailModal } from '../crm/ProjectDetailModal';
import { VerifiedSurveyReportModal } from './VerifiedSurveyReportModal';
import { TrackOperationsProgressModal } from './TrackOperationsProgressModal';
import { BoqComparisonView } from './BoqComparisonView';
import { BidPackageUploadView } from './BidPackageUploadView';

interface EstimatorDashboardProps {
  projects: ProjectRFQ[];
  estimators: Estimator[];
  initialTopTab?: 'workspace' | 'comparison' | 'upload_docs';
  initialProjectId?: string;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onSaveEstimation: (projectId: string, estimatedValue: number, boqNotes: string, calculation?: AiBoqCalculation) => void;
  onUpdateSiteReview: (projectId: string, siteReview: SiteReviewDetails) => void;
  onRequestSurvey?: (projectId: string, surveyRequest: SiteSurveyRequest) => void;
  onUpdateBidPackage?: (projectId: string, bidPackage: BidPackage, sendToCrm?: boolean) => void;
  onUpdateBoqComparison?: (projectId: string, comparison: BoqComparisonData) => void;
}

export const EstimatorDashboard: React.FC<EstimatorDashboardProps> = ({
  projects,
  estimators,
  initialTopTab = 'workspace',
  initialProjectId,
  onUpdateStatus,
  onSaveEstimation,
  onUpdateSiteReview,
  onRequestSurvey,
  onUpdateBidPackage,
  onUpdateBoqComparison
}) => {
  // Top 3 Navigation Tabs matching user screenshot: Estimator Workspace | BOQ Comparison | Documents Upload
  const [topTab, setTopTab] = useState<'workspace' | 'comparison' | 'upload_docs'>(initialTopTab);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || '');

  // Synchronize with incoming initialTopTab or initialProjectId prop
  React.useEffect(() => {
    if (initialTopTab) setTopTab(initialTopTab);
  }, [initialTopTab]);

  React.useEffect(() => {
    if (initialProjectId) setSelectedProjectId(initialProjectId);
  }, [initialProjectId]);

  // Selected estimator view (defaults to Farhan Qureshi)
  const [selectedEstimatorId, setSelectedEstimatorId] = useState<string>(
    estimators[1]?.id || estimators[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'active' | 'submitted' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'closing_soon' | 'md_authorized'>('all');

  // Modals
  const [boqProject, setBoqProject] = useState<ProjectRFQ | null>(null);
  const [detailProject, setDetailProject] = useState<ProjectRFQ | null>(null);
  const [previewProposalProject, setPreviewProposalProject] = useState<ProjectRFQ | null>(null);
  const [siteReviewProject, setSiteReviewProject] = useState<ProjectRFQ | null>(null);
  const [requestSurveyProject, setRequestSurveyProject] = useState<ProjectRFQ | null>(null);
  const [verifiedReportProject, setVerifiedReportProject] = useState<ProjectRFQ | null>(null);
  const [trackOpsProject, setTrackOpsProject] = useState<ProjectRFQ | null>(null);

  const currentEstimator = estimators.find(e => e.id === selectedEstimatorId) || estimators[0];

  // Tenders strictly authorized by the MD for bidding & estimation
  const authorizedProjects = useMemo(() => {
    return projects.filter(p => 
      p.status === 'Approved for Bidding' || 
      p.status === 'Under BOQ Estimation' || 
      p.status === 'Survey Required' ||
      p.status === 'Survey In Progress' ||
      p.status === 'Bid Submitted' || 
      p.status === 'Under Negotiation' || 
      p.status === 'Won / Active Project' ||
      p.mdStatus === 'Approved for Bidding'
    );
  }, [projects]);

  // Tenders assigned to this estimator that have been approved by the MD
  const estimatorTenders = useMemo(() => {
    if (selectedEstimatorId === 'ALL') return authorizedProjects;
    return authorizedProjects.filter(p => p.assignedEstimatorId === selectedEstimatorId);
  }, [authorizedProjects, selectedEstimatorId]);

  // Active tenders in pricing / approved by MD
  const activeTenders = useMemo(() => {
    return estimatorTenders.filter(p => 
      ['Approved for Bidding', 'Under BOQ Estimation', 'Survey Required', 'Survey In Progress'].includes(p.status) ||
      (p.mdStatus === 'Approved for Bidding' && p.status !== 'Bid Submitted' && p.status !== 'Won / Active Project' && p.status !== 'Declined / Lost')
    );
  }, [estimatorTenders]);

  const submittedTenders = useMemo(() => {
    return estimatorTenders.filter(p => 
      ['Bid Submitted', 'Under Negotiation', 'Won / Active Project'].includes(p.status)
    );
  }, [estimatorTenders]);

  const displayedTenders = useMemo(() => {
    let base = activeTab === 'active' 
      ? activeTenders 
      : activeTab === 'submitted' 
      ? submittedTenders 
      : estimatorTenders;

    // Scope discipline filter
    if (selectedScopeFilter !== 'ALL') {
      base = base.filter(p => p.sowScopes.includes(selectedScopeFilter as SowDiscipline));
    }

    // Urgency filter
    if (urgencyFilter === 'closing_soon') {
      base = base.filter(p => p.bidCloseDate.includes('10-26') || p.bidCloseDate.includes('10-30') || p.bidCloseDate.includes('11-0'));
    } else if (urgencyFilter === 'md_authorized') {
      base = base.filter(p => p.status === 'Approved for Bidding' || p.mdStatus === 'Approved for Bidding');
    }

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase().trim();
    return base.filter(p => 
      p.proposedProjectName.toLowerCase().includes(q) ||
      p.workOrderNo.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.siteName.toLowerCase().includes(q) ||
      p.enquirySerialNo.toLowerCase().includes(q)
    );
  }, [activeTab, activeTenders, submittedTenders, estimatorTenders, selectedScopeFilter, urgencyFilter, searchQuery]);

  // Metrics (clean zero default)
  const totalPricingValue = activeTenders.reduce((acc, p) => acc + (p.estimatedValue || p.aiBoqCalculation?.totals.totalCommercialBidPrice || 0), 0);
  const imminentDeadlinesCount = activeTenders.filter(p => {
    return p.bidCloseDate && (p.bidCloseDate.includes('10-26') || p.bidCloseDate.includes('10-30'));
  }).length;

  const handleMarkBidSubmitted = (projectId: string) => {
    onUpdateStatus(projectId, 'Bid Submitted');
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Main Estimator Tabs (Matching User Request & High-Visibility Design) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
        <button
          type="button"
          onClick={() => setTopTab('workspace')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            topTab === 'workspace'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Estimator Workspace</span>
        </button>

        <button
          type="button"
          id="tab-boq-comparison"
          onClick={() => setTopTab('comparison')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            topTab === 'comparison'
              ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300'
              : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Scale className="w-4 h-4 text-purple-700" />
          <span>2. BOQ Comparison & Variance Audit</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
            Compare
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTopTab('upload_docs')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${
            topTab === 'upload_docs'
              ? 'bg-purple-700 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Documents Upload (40-Doc Dossier)</span>
        </button>
      </div>

      {topTab === 'comparison' ? (
        <BoqComparisonView
          projects={authorizedProjects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onUpdateProjectBoqComparison={(pId, data) => {
            if (onUpdateBoqComparison) onUpdateBoqComparison(pId, data);
          }}
          onNavigateToBidPackage={() => setTopTab('upload_docs')}
        />
      ) : topTab === 'upload_docs' ? (
        <BidPackageUploadView
          projects={authorizedProjects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onUpdateProjectBidPackage={(pId, pkg, sendToCrm) => {
            if (onUpdateBidPackage) onUpdateBidPackage(pId, pkg, sendToCrm);
          }}
        />
      ) : (
        <>
          {/* Top Estimator Persona & Workload Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {currentEstimator?.initials || 'EST'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {currentEstimator?.name}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentEstimator?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Specialty: {currentEstimator?.specialty || 'Industrial & EPC Civil Estimations'} • {currentEstimator?.activeTenders ?? 0} Active Tenders
            </p>
          </div>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 self-start md:self-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Switch Estimator View:
          </span>
          <select
            value={selectedEstimatorId}
            onChange={(e) => setSelectedEstimatorId(e.target.value)}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="ALL">All Estimators (Combined View)</option>
            {estimators.map(est => (
              <option key={est.id} value={est.id}>
                {est.name} ({est.role.split(' ')[1] || est.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Estimator Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Active Bids in Queue
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {activeTenders.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Assigned & authorized by MD
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Closing Within 10 Days
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {imminentDeadlinesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            High-priority bid deadlines
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Total Pipeline Value
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            SAR {(totalPricingValue / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Active cost takeoff volume
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Capacity Status
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {selectedEstimatorId === 'ALL'
              ? `${estimators.filter(e => e.capacityStatus === 'Optimal Capacity').length} Optimal`
              : (currentEstimator?.capacityStatus || 'Optimal Capacity')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Workload allocation balance
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>BOQ Pricing Queue</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'active' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeTenders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('submitted')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'submitted'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>Submitted Proposals</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'submitted' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {submittedTenders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>All Assigned Tenders</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {estimatorTenders.length}
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
              placeholder="Search assigned tenders..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

        </div>

        {/* Sub-Filter Row: Scope and Urgency */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium">Filter by Priority:</span>
            {[
              { id: 'all', label: 'All Bids' },
              { id: 'closing_soon', label: 'Closing Soon (< 14 Days)' },
              { id: 'md_authorized', label: 'MD Authorized Only' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setUrgencyFilter(filter.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  urgencyFilter === filter.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Discipline Scope:</span>
            <select
              value={selectedScopeFilter}
              onChange={(e) => setSelectedScopeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Disciplines</option>
              <option value="Civil">Civil</option>
              <option value="Structural">Structural</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Specialized Sub-Scopes">Specialized Sub-Scopes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estimator Tenders Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
          <span>
            {activeTab === 'active' ? 'TENDERS READY FOR BOQ COST ESTIMATION' : 'TENDERS LIST'}
          </span>
          <span>{displayedTenders.length} ASSIGNED</span>
        </div>

        {displayedTenders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <HardHat className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No Authorized Tenders in Estimator Queue
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Only tender opportunities approved by the Managing Director in Executive Review will appear here for BOQ cost estimation. Any newly registered RFQs currently awaiting MD sign-off will automatically appear once authorized.
            </p>
          </div>
        ) : (
          displayedTenders.map((project) => {
            const isApprovedByMd = project.status === 'Approved for Bidding' || project.mdStatus === 'Approved for Bidding';
            const isSubmitted = project.status === 'Bid Submitted';
            const isSurveyCompleted = Boolean(project.surveyRequest && project.surveyRequest.status === 'Completed');
            const isSurveyPending = Boolean(project.surveyRequest && project.surveyRequest.status !== 'Completed');
            const isBoqLocked = isSurveyPending;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all p-5 space-y-4"
              >
                
                {/* Top Row: Identifiers & Badges */}
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
                    {/* MD Authorization Stamp */}
                    {isApprovedByMd && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        MD Authorized for Bidding
                      </span>
                    )}

                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-100 text-slate-700">
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Middle Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  
                  {/* Left: Project Details & Scope */}
                  <div className="lg:col-span-6 space-y-1">
                    <h3 
                      onClick={() => setDetailProject(project)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                    >
                      {project.proposedProjectName}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-semibold text-slate-800">
                        {project.clientName}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">
                        {project.siteName} ({project.projectLocation})
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 pt-1 leading-relaxed">
                      {project.projectWorkDescription}
                    </p>

                    {/* SOW Scope Chips */}
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

                    {/* Site Review Status Badge & Fast Action */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      {project.siteReview?.status === 'Completed' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Site Visit Completed (Findings Recorded)
                        </span>
                      ) : project.siteReview?.status === 'Scheduled' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Compass className="h-3 w-3 text-amber-600" />
                          Site Visit Scheduled: {project.siteReview.scheduledDate} ({project.siteReview.inspectorName})
                        </span>
                      ) : project.siteReview?.status === 'Not Required' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Check className="h-3 w-3 text-slate-500" />
                          Desk Study Cleared (No Site Visit Needed)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSiteReviewProject(project)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1"
                        >
                          <Compass className="h-3 w-3" />
                          Site Review Decision Pending
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle: Commercial & Pricing Estimation Hub */}
                  <div className="lg:col-span-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500">
                      Commercial Bid Estimate
                    </div>

                    <div className="text-base sm:text-lg font-bold font-mono text-slate-900">
                      SAR {(project.estimatedValue || 25000000).toLocaleString()}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      Includes Civil, Structural, MEP and standard preliminaries markup.
                    </p>
                  </div>

                  {/* Right: Key Dates & Documents */}
                  <div className="lg:col-span-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Inquiry Received:</span>
                      <span className="font-medium text-slate-800">{project.receivedDate}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Bid Close Deadline:</span>
                      <span className="font-bold text-rose-600">{project.bidCloseDate}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Submission Mode:</span>
                      <span className="font-medium text-slate-800">{project.bidSubmissionType}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                      <span>{project.attachedFiles.length} Tender Drawings / Docs</span>
                    </div>
                  </div>

                </div>

                {/* Gated Site Survey Pending Alert Banner (Estimator Locked) */}
                {isSurveyPending && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-200 text-amber-900 font-bold">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                        </span>
                        <span className="font-bold text-amber-950 text-xs">
                          Site Survey Gating: Routed to Operations Department
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        Operations Status: {project.surveyRequest?.status}
                      </span>
                    </div>
                    <p className="text-amber-900 text-xs leading-relaxed">
                      {project.surveyRequest?.status === 'Pending AI Checklist' && '⏳ Operations is currently evaluating your feasibility report and synthesizing the AI site hazard checklist.'}
                      {project.surveyRequest?.status === 'Checklist Ready' && '📋 Operations has authorized the AI checklist and is allocating specialized equipment & certified surveyor.'}
                      {project.surveyRequest?.status === 'Surveyor Dispatched' && `👷 Surveyor ${project.surveyRequest.assignedSurveyorName || 'Assigned'} is mobilized on-site in ${project.projectLocation}. Target inspection: ${project.surveyRequest.targetSurveyDate}.`}
                    </p>
                    <div className="text-[11px] text-amber-800 font-medium pt-1.5 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600 inline shrink-0" />
                        <span>BOQ Costing & Proposal Submission are locked until Operations returns verified site measurements.</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setTrackOpsProject(project)}
                        className="font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <span>Track Operations Progress</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Site Survey Completed & Returned Banner (Estimator Unlocked) */}
                {isSurveyCompleted && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-200 text-emerald-900 font-bold">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
                        </span>
                        <span className="font-bold text-emerald-950 text-xs">
                          Site Survey Verified & Returned by Operations
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Survey Complete • {project.surveyRequest?.completedAt}
                      </span>
                    </div>
                    <p className="text-emerald-900 text-xs leading-relaxed">
                      {project.surveyRequest?.opsNotes || 'Field verification completed on site. Utility clearances, tie-in measurements, and soil tests have been verified and returned to you.'}
                    </p>
                    <div className="text-[11px] text-emerald-800 font-medium pt-1.5 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 inline shrink-0" />
                        <span>Gating released: AI BOQ & Resources Takeoff is now unlocked with verified ground data.</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setVerifiedReportProject(project)}
                        className="font-bold text-emerald-900 hover:text-emerald-950 underline cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <span>View Verified Field Report</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Estimator Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  <div className="text-xs text-slate-500">
                    {project.mdRemarks ? (
                      <span className="text-slate-700 italic">
                        MD Note: "{project.mdRemarks}"
                      </span>
                    ) : isBoqLocked ? (
                      <span className="text-amber-800 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Awaiting Operations field survey completion</span>
                      </span>
                    ) : isSurveyCompleted ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Survey verified — Ready for BOQ takeoff & bid pricing</span>
                      </span>
                    ) : (
                      <span>Ready for quantity survey & rate takeoff calculations</span>
                    )}
                  </div>

                  {/* Interactive Estimation Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* View Full Dossier */}
                    <button
                      type="button"
                      onClick={() => setDetailProject(project)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Dossier
                    </button>

                    {/* If Survey is Pending: Only Tracker is Active, BOQ and Bid are Gated/Locked */}
                    {isBoqLocked ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setTrackOpsProject(project)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Compass className="h-3.5 w-3.5 text-amber-600" />
                          <span>Track Survey ({project.surveyRequest?.status})</span>
                        </button>

                        {/* Locked BOQ Button */}
                        <button
                          type="button"
                          onClick={() => setTrackOpsProject(project)}
                          className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                          title="Locked: Physical site measurements required before BOQ calculation"
                        >
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          <span>BOQ Locked (Awaiting Survey)</span>
                        </button>

                        {/* Locked Proposal Button */}
                        <button
                          type="button"
                          disabled
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed flex items-center gap-1"
                        >
                          <Lock className="h-3.5 w-3.5 text-slate-300" />
                          <span>Proposal Sheet</span>
                        </button>

                        {/* Locked Submit Button */}
                        <button
                          type="button"
                          disabled
                          className="px-4 py-1.5 rounded-md text-xs font-semibold text-slate-400 bg-slate-200 border border-slate-200 cursor-not-allowed flex items-center gap-1.5"
                        >
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Submit Bid Proposal</span>
                        </button>
                      </>
                    ) : (
                      /* If Survey is NOT pending (either completed or not required) */
                      <>
                        {/* If survey completed: View Report Button */}
                        {isSurveyCompleted ? (
                          <button
                            type="button"
                            onClick={() => setVerifiedReportProject(project)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>View Site Report</span>
                          </button>
                        ) : (
                          /* If no survey requested yet: Can perform desk review or request survey */
                          <>
                            <button
                              type="button"
                              onClick={() => setSiteReviewProject(project)}
                              className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                            >
                              <Compass className="h-3.5 w-3.5 text-blue-600" />
                              <span>Site Review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRequestSurveyProject(project)}
                              className="px-3 py-1.5 rounded-md text-xs font-semibold border border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Compass className="h-3.5 w-3.5 text-amber-700" />
                              <span>Request Survey</span>
                            </button>
                          </>
                        )}

                        {/* Proposal Sheet (Unlocked) */}
                        <button
                          type="button"
                          onClick={() => setPreviewProposalProject(project)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
                          Proposal Sheet
                        </button>

                        {/* Open BOQ Calculator Modal with AI Sparkles (Unlocked) */}
                        <button
                          type="button"
                          onClick={() => setBoqProject(project)}
                          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                            isSurveyCompleted 
                              ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-500/20' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>{isSurveyCompleted ? '⚡ AI BOQ (Using Site Data)' : 'AI BOQ & Resources Takeoff'}</span>
                        </button>

                        {/* Compare BOQ Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setTopTab('comparison');
                          }}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Compare AI generated BOQ vs Manual Estimator BOQ"
                        >
                          <Scale className="h-3.5 w-3.5 text-purple-600" />
                          <span>Compare BOQ</span>
                        </button>

                        {/* Bid Documents (40) Upload Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setTopTab('upload_docs');
                          }}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Upload 40-document Bid Package & send for approval"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Bid Docs (40)</span>
                        </button>

                        {/* Submit Bid Proposal (Unlocked) */}
                        {!isSubmitted ? (
                          <button
                            type="button"
                            onClick={() => handleMarkBidSubmitted(project.id)}
                            className="px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Submit Bid Proposal
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Bid Proposal Submitted
                          </span>
                        )}
                      </>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* BOQ Estimation Modal */}
      {boqProject && (
        <BoqEstimationModal
          isOpen={true}
          onClose={() => setBoqProject(null)}
          project={boqProject}
          onSaveEstimation={onSaveEstimation}
          onOpenSiteReview={(p) => setSiteReviewProject(p)}
          onOpenProposalPreview={(p) => setPreviewProposalProject(p)}
        />
      )}

      {/* Site Review Modal */}
      {siteReviewProject && (
        <SiteReviewModal
          isOpen={true}
          onClose={() => setSiteReviewProject(null)}
          project={siteReviewProject}
          onSaveSiteReview={onUpdateSiteReview}
        />
      )}

      {/* Formal Proposal Preview Modal */}
      {previewProposalProject && (
        <ProposalPreviewModal
          isOpen={true}
          onClose={() => setPreviewProposalProject(null)}
          project={previewProposalProject}
          onConfirmSubmit={handleMarkBidSubmitted}
        />
      )}

      {/* Request Survey Modal */}
      {requestSurveyProject && (
        <RequestSurveyModal
          isOpen={true}
          onClose={() => setRequestSurveyProject(null)}
          project={requestSurveyProject}
          onRequestSurvey={onRequestSurvey || (() => {})}
        />
      )}

      {/* Project Detail Modal */}
      {detailProject && (
        <ProjectDetailModal
          isOpen={true}
          onClose={() => setDetailProject(null)}
          project={detailProject}
          onOpenAssignEstimator={() => {}}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Verified Survey Report Modal */}
      {verifiedReportProject && (
        <VerifiedSurveyReportModal
          isOpen={true}
          onClose={() => setVerifiedReportProject(null)}
          project={verifiedReportProject}
          onProceedToBoq={() => {
            if (verifiedReportProject) {
              setBoqProject(verifiedReportProject);
              setVerifiedReportProject(null);
            }
          }}
        />
      )}

      {/* Track Operations Progress Modal */}
      {trackOpsProject && (
        <TrackOperationsProgressModal
          isOpen={true}
          onClose={() => setTrackOpsProject(null)}
          project={trackOpsProject}
        />
      )}

    </div>
  );
};
