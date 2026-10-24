'use client';

import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Sparkles, 
  HardHat, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  CheckCheck, 
  Layers, 
  ArrowRight, 
  FileText, 
  User, 
  Clock, 
  Check,
  Search,
  Eye
} from 'lucide-react';
import { 
  ProjectRFQ, 
  ProjectStatus, 
  SiteSurveyRequest, 
  Surveyor, 
  SiteReviewDetails 
} from '../../types/crm';
import { SurveyChecklistModal } from './SurveyChecklistModal';
import { DispatchSurveyorModal } from './DispatchSurveyorModal';
import { CompleteSurveyModal } from './CompleteSurveyModal';
import { EstimatorReportModal } from './EstimatorReportModal';
import { ProjectDetailModal } from '../crm/ProjectDetailModal';

interface OperationsDashboardProps {
  projects: ProjectRFQ[];
  surveyors: Surveyor[];
  onUpdateSurveyRequest: (projectId: string, surveyRequest: SiteSurveyRequest, newProjectStatus?: ProjectStatus) => void;
  onUpdateSiteReview: (projectId: string, siteReview: SiteReviewDetails) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  projects,
  surveyors,
  onUpdateSurveyRequest,
  onUpdateSiteReview,
  onUpdateStatus
}) => {
  // Simple 3 Steps Tab State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [checklistProject, setChecklistProject] = useState<ProjectRFQ | null>(null);
  const [dispatchProject, setDispatchProject] = useState<ProjectRFQ | null>(null);
  const [completeProject, setCompleteProject] = useState<ProjectRFQ | null>(null);
  const [reportProject, setReportProject] = useState<ProjectRFQ | null>(null);
  const [detailProject, setDetailProject] = useState<ProjectRFQ | null>(null);

  // All survey projects
  const surveyProjects = useMemo(() => {
    return projects.filter(p => Boolean(p.surveyRequest));
  }, [projects]);

  // Step 1: Incoming requests from Estimator needing AI Checklist
  const step1Projects = useMemo(() => {
    return surveyProjects.filter(p => p.surveyRequest?.status === 'Pending AI Checklist');
  }, [surveyProjects]);

  // Step 2: Checklist generated, ready to assign surveyor
  const step2Projects = useMemo(() => {
    return surveyProjects.filter(p => p.surveyRequest?.status === 'Checklist Ready');
  }, [surveyProjects]);

  // Step 3: Surveyor dispatched, en route, submitted, or completed
  const step3Projects = useMemo(() => {
    return surveyProjects.filter(p => 
      p.surveyRequest?.status === 'Surveyor Dispatched' || 
      p.surveyRequest?.status === 'Surveyor En Route' || 
      p.surveyRequest?.status === 'Survey Submitted' || 
      p.surveyRequest?.status === 'Completed'
    );
  }, [surveyProjects]);

  // Active list based on selected step
  const currentList = useMemo(() => {
    const list = activeStep === 1 
      ? step1Projects 
      : activeStep === 2 
      ? step2Projects 
      : step3Projects;

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.proposedProjectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.workOrderNo.toLowerCase().includes(q) ||
      p.projectLocation.toLowerCase().includes(q)
    );
  }, [activeStep, step1Projects, step2Projects, step3Projects, searchQuery]);

  // Save checklist handler
  const handleSaveChecklist = (projectId: string, updatedRequest: SiteSurveyRequest) => {
    onUpdateSurveyRequest(projectId, updatedRequest);
    // Automatically switch to step 2 so user sees it ready to assign
    setActiveStep(2);
  };

  // Dispatch surveyor handler
  const handleDispatchSurveyor = (projectId: string, updatedRequest: SiteSurveyRequest, surveyorId: string) => {
    onUpdateSurveyRequest(projectId, updatedRequest, 'Survey In Progress');
    // Switch to step 3 to track surveyor & approve
    setActiveStep(3);
  };

  // Complete survey and return to estimator
  const handleCompleteSurvey = (
    projectId: string, 
    updatedRequest: SiteSurveyRequest, 
    siteReview: SiteReviewDetails
  ) => {
    onUpdateSurveyRequest(projectId, updatedRequest, 'Under BOQ Estimation');
    onUpdateSiteReview(projectId, siteReview);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans select-none">
      
      {/* Super Clean, Modern Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Site Operations Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simple 3-step pipeline: Create Checklist ➔ Assign Surveyor ➔ Approve & Return to Estimator
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Sultan Al-Otaibi (Operations Head)
          </span>
        </div>
      </div>

      {/* 3 Simple Tabs - Step 1, Step 2, Step 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Step 1 Button */}
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeStep === 1
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              activeStep === 1 ? 'text-amber-100' : 'text-slate-400'
            }`}>
              Step 1
            </span>
            <span className="font-extrabold text-sm block">
              1. New Survey Requests
            </span>
            <span className={`text-xs block ${activeStep === 1 ? 'text-amber-100' : 'text-slate-500'}`}>
              Create Checklist
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            activeStep === 1 
              ? 'bg-white text-amber-700' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {step1Projects.length}
          </span>
        </button>

        {/* Step 2 Button */}
        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeStep === 2
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              activeStep === 2 ? 'text-blue-100' : 'text-slate-400'
            }`}>
              Step 2
            </span>
            <span className="font-extrabold text-sm block">
              2. Assign Surveyor
            </span>
            <span className={`text-xs block ${activeStep === 2 ? 'text-blue-100' : 'text-slate-500'}`}>
              Send Checklist to Field
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            activeStep === 2 
              ? 'bg-white text-blue-700' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {step2Projects.length}
          </span>
        </button>

        {/* Step 3 Button */}
        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            activeStep === 3
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="space-y-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              activeStep === 3 ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              Step 3
            </span>
            <span className="font-extrabold text-sm block">
              3. Approve & Return
            </span>
            <span className={`text-xs block ${activeStep === 3 ? 'text-emerald-100' : 'text-slate-500'}`}>
              Send to Estimator
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
            activeStep === 3 
              ? 'bg-white text-emerald-700' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {step3Projects.length}
          </span>
        </button>

      </div>

      {/* Search Input for Quick Finding */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter tenders by name, client, work order or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
        />
      </div>

      {/* Clean Cards Stream for the Selected Step */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              {activeStep === 1 && 'No Pending Survey Requests'}
              {activeStep === 2 && 'No Checklists Waiting to Assign'}
              {activeStep === 3 && 'No Surveys to Approve'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeStep === 1 && 'When Estimators request a site visit, they will show up here.'}
              {activeStep === 2 && 'Generate a checklist in Step 1 to move tenders here.'}
              {activeStep === 3 && 'Assign a surveyor in Step 2 to track and verify findings here.'}
            </p>
          </div>
        ) : (
          currentList.map((project) => {
            const req = project.surveyRequest!;
            const isCompleted = req.status === 'Completed';

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Header Row: Title, WO, Urgency */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {project.workOrderNo}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        req.urgency === 'Critical 48h'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : req.urgency === 'Urgent'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {req.urgency}
                      </span>
                      <span className="text-xs text-slate-400">
                        Requested by: <strong className="text-slate-700">{req.requestedByEstimatorName}</strong>
                      </span>
                    </div>

                    <h2 
                      onClick={() => setDetailProject(project)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                    >
                      {project.proposedProjectName}
                    </h2>

                    <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-700">{project.clientName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{project.projectLocation}</span>
                      </span>
                    </p>
                  </div>

                  {/* Status Tag */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 border ${
                    activeStep === 1 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : activeStep === 2 
                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : req.status === 'Survey Submitted'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse font-black'
                      : req.status === 'Surveyor En Route'
                      ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}>
                    {activeStep === 1 && 'Needs Checklist'}
                    {activeStep === 2 && `${req.checklist.length} Checkpoints Ready`}
                    {activeStep === 3 && (
                      isCompleted 
                        ? '✓ Returned to Estimator' 
                        : req.status === 'Survey Submitted'
                        ? '⚡ Survey Done (Pending Ops Approval)'
                        : req.status === 'Surveyor En Route'
                        ? `🚗 En Route to Site (${req.assignedSurveyorName})`
                        : `Surveyor on Site (${req.assignedSurveyorName})`
                    )}
                  </span>
                </div>

                {/* Reason Note */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                    Estimator's Survey Requirement:
                  </span>
                  <p className="italic text-slate-600">
                    "{req.surveyReason}"
                  </p>
                </div>

                {/* Surveyor Written Observations & Checkpoint Findings (In Step 3) */}
                {activeStep === 3 && (req.surveyorObservations || req.status === 'Survey Submitted') && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        Surveyor's Submitted Field Findings ({req.assignedSurveyorName || 'Assigned Surveyor'}):
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                        {req.checklist.filter(i => i.status === 'Compliant / Verified').length} Verified • {req.checklist.filter(i => i.status === 'Risk / Hazard Detected').length} Hazards
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                      {req.surveyorObservations || 'Field verification completed with GPS RTK positioning. All site checkpoints inspected.'}
                    </p>

                    {req.uploadedSurveyDocuments && req.uploadedSurveyDocuments.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-900">
                          Attached Survey Reports:
                        </span>
                        {req.uploadedSurveyDocuments.map(doc => (
                          <span key={doc.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-emerald-200 text-[10px] font-medium text-slate-700 shadow-2xs">
                            <FileText className="w-3 h-3 text-rose-500" />
                            <span>{doc.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Single, Clear Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  
                  {/* Left: View Dossier / Notes */}
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setReportProject(project)}
                      className="text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Estimator Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetailProject(project)}
                      className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tender Details</span>
                    </button>
                  </div>

                  {/* Right: The ONE Main Action Button */}
                  <div className="flex items-center gap-2">
                    {/* STEP 1 ACTION: Generate Checklist */}
                    {activeStep === 1 && (
                      <button
                        type="button"
                        onClick={() => setChecklistProject(project)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>Generate Checklist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* STEP 2 ACTION: Assign Surveyor */}
                    {activeStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setDispatchProject(project)}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <HardHat className="w-4 h-4" />
                        <span>Assign & Send to Surveyor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* STEP 3 ACTION: Verify & Return to Estimator */}
                    {activeStep === 3 && (
                      !isCompleted ? (
                        <button
                          type="button"
                          onClick={() => setCompleteProject(project)}
                          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>Approve & Send to Estimator</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCompleteProject(project)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>View Approved Findings</span>
                        </button>
                      )
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* AI Checklist Modal */}
      <SurveyChecklistModal
        isOpen={Boolean(checklistProject)}
        onClose={() => setChecklistProject(null)}
        project={checklistProject}
        onSaveChecklist={handleSaveChecklist}
      />

      {/* Assign Surveyor Modal */}
      <DispatchSurveyorModal
        isOpen={Boolean(dispatchProject)}
        onClose={() => setDispatchProject(null)}
        project={dispatchProject}
        surveyors={surveyors}
        onDispatchSurveyor={handleDispatchSurveyor}
      />

      {/* Complete & Return Modal */}
      <CompleteSurveyModal
        isOpen={Boolean(completeProject)}
        onClose={() => setCompleteProject(null)}
        project={completeProject}
        onCompleteSurvey={handleCompleteSurvey}
      />

      {/* Estimator Report Modal */}
      <EstimatorReportModal
        isOpen={Boolean(reportProject)}
        onClose={() => setReportProject(null)}
        project={reportProject}
        onGenerateAiChecklist={() => {
          if (reportProject) {
            setChecklistProject(reportProject);
          }
        }}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        isOpen={Boolean(detailProject)}
        onClose={() => setDetailProject(null)}
        project={detailProject}
        onOpenAssignEstimator={() => {}}
        onUpdateStatus={onUpdateStatus}
      />

    </div>
  );
};
