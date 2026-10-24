'use client';

import React, { useState, useMemo } from 'react';
import { 
  HardHat, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  Download, 
  Printer, 
  Send, 
  CheckCheck, 
  Search, 
  ArrowRight, 
  Building2, 
  Layers, 
  Check, 
  Eye, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { ProjectRFQ, ProjectStatus, SiteSurveyRequest, Surveyor, SurveyChecklistItem } from '../../types/crm';
import { AuthUser } from '../../types/auth';
import { PrintableChecklistModal } from './PrintableChecklistModal';
import { FieldInspectionModal } from './FieldInspectionModal';
import { SurveySubmissionModal } from './SurveySubmissionModal';
import { ProjectDetailModal } from '../crm/ProjectDetailModal';
import { getAiConfig, recordAiPull } from '../../utils/aiConfig';

import { downloadChecklistPDF } from '../../utils/pdfGenerator';

interface SurveyorDashboardProps {
  projects: ProjectRFQ[];
  surveyors: Surveyor[];
  currentUser: AuthUser | null;
  onUpdateSurveyRequest: (projectId: string, surveyRequest: SiteSurveyRequest, newProjectStatus?: ProjectStatus) => void;
  onUpdateSiteReview?: (projectId: string, siteReview: any) => void;
  onUpdateStatus?: (projectId: string, newStatus: ProjectStatus) => void;
}

export const SurveyorDashboard: React.FC<SurveyorDashboardProps> = ({
  projects,
  surveyors,
  currentUser,
  onUpdateSurveyRequest,
  onUpdateSiteReview,
  onUpdateStatus
}) => {
  // Filter state
  const [activeTab, setActiveTab] = useState<'all' | 'pending_departure' | 'in_progress' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [printableProject, setPrintableProject] = useState<ProjectRFQ | null>(null);
  const [submissionProject, setSubmissionProject] = useState<ProjectRFQ | null>(null);
  const [detailProject, setDetailProject] = useState<ProjectRFQ | null>(null);
  const [isGeneratingAiForProject, setIsGeneratingAiForProject] = useState<string | null>(null);
  const [aiGenMessage, setAiGenMessage] = useState<string>('');

  // Active surveyor (defaults to logged-in user or first surveyor)
  const activeSurveyor = useMemo(() => {
    if (currentUser?.role === 'surveyor') {
      const match = surveyors.find(s => s.name.toLowerCase().includes(currentUser.name.toLowerCase()) || s.email === currentUser.email);
      if (match) return match;
    }
    return surveyors[0] || {
      id: 'surv-01',
      name: 'Tariq Al-Ghamdi',
      initials: 'TG',
      role: 'Senior Field Surveyor & HSE Inspector',
      assignedZone: 'Western & Eastern Industrial Provinces',
      activeSurveys: 1,
      phone: '+966 55 987 6543',
      email: 'tariq.ghamdi@radwa.sa',
      capacityStatus: 'Available'
    };
  }, [currentUser, surveyors]);

  // All survey projects that have checklists ready or surveyor dispatched/completed
  const allAssignedSurveys = useMemo(() => {
    return projects.filter(p => {
      const req = p.surveyRequest;
      if (!req) return false;
      // Show if surveyor is dispatched, en route, submitted, completed, or checklist is ready
      return Boolean(
        req.status === 'Surveyor Dispatched' ||
        req.status === 'Surveyor En Route' ||
        req.status === 'Survey Submitted' ||
        req.status === 'Completed' ||
        req.status === 'Checklist Ready'
      );
    });
  }, [projects]);

  // Filtered surveys according to active tab
  const filteredSurveys = useMemo(() => {
    let list = allAssignedSurveys;

    if (activeTab === 'pending_departure') {
      list = list.filter(p => p.surveyRequest?.status === 'Surveyor Dispatched' || p.surveyRequest?.status === 'Checklist Ready');
    } else if (activeTab === 'in_progress') {
      list = list.filter(p => p.surveyRequest?.status === 'Surveyor En Route');
    } else if (activeTab === 'submitted') {
      list = list.filter(p => p.surveyRequest?.status === 'Survey Submitted' || p.surveyRequest?.status === 'Completed');
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(p => 
      p.proposedProjectName.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.workOrderNo.toLowerCase().includes(q) ||
      p.projectLocation.toLowerCase().includes(q)
    );
  }, [allAssignedSurveys, activeTab, searchQuery]);

  // Counts for tabs
  const pendingDepartureCount = allAssignedSurveys.filter(p => 
    p.surveyRequest?.status === 'Surveyor Dispatched' || p.surveyRequest?.status === 'Checklist Ready'
  ).length;

  const inProgressCount = allAssignedSurveys.filter(p => 
    p.surveyRequest?.status === 'Surveyor En Route'
  ).length;

  const submittedCount = allAssignedSurveys.filter(p => 
    p.surveyRequest?.status === 'Survey Submitted' || p.surveyRequest?.status === 'Completed'
  ).length;

  // ACTION 2: Depart for Site Survey (Notify Operations)
  const handleDepartForSite = (project: ProjectRFQ) => {
    if (!project.surveyRequest) return;

    const departureTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedRequest: SiteSurveyRequest = {
      ...project.surveyRequest,
      status: 'Surveyor En Route',
      surveyorDepartedAt: departureTime,
      opsNotes: `${project.surveyRequest.opsNotes ? project.surveyRequest.opsNotes + ' | ' : ''}Surveyor departed to site at ${departureTime}`
    };

    onUpdateSurveyRequest(project.id, updatedRequest, 'Survey In Progress');
  };

  // Submit completed survey findings
  const handleSaveInspection = (
    projectId: string, 
    updatedRequest: SiteSurveyRequest, 
    observations: string,
    checklist: SurveyChecklistItem[]
  ) => {
    onUpdateSurveyRequest(projectId, updatedRequest, 'Survey In Progress');
  };

  // ACTION 1: Download Official Checklist (Automatically runs AI tender document & drawing analysis if checklist empty or forced)
  const handleDownloadOrGenerateChecklist = async (project: ProjectRFQ, forceRegenerate = false) => {
    if (!project.surveyRequest) return;

    const hasChecklist = project.surveyRequest.checklist && project.surveyRequest.checklist.length > 0;

    if (!hasChecklist || forceRegenerate) {
      setIsGeneratingAiForProject(project.id);
      const docsCount = project.attachedFiles?.length || 0;
      setAiGenMessage(`AI analyzing ${docsCount} tender documents & drawings...`);

      try {
        const aiConfig = getAiConfig();
        const res = await fetch('/api/generate-survey-checklist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project,
            apiKey: aiConfig.apiKey,
            apiEndpoint: aiConfig.apiEndpoint,
            model: aiConfig.model
          })
        });

        if (res.status === 429) {
          window.dispatchEvent(new CustomEvent('radwa_open_ai_config_limit_exceeded'));
        }

        const json = await res.json();
        if (json.success && Array.isArray(json.checklist) && json.checklist.length > 0) {
          recordAiPull();
          const updatedReq: SiteSurveyRequest = {
            ...project.surveyRequest,
            checklist: json.checklist,
            status: 'Checklist Ready'
          };
          const updatedProject: ProjectRFQ = {
            ...project,
            surveyRequest: updatedReq
          };
          onUpdateSurveyRequest(project.id, updatedReq, 'Survey Required');
          await downloadChecklistPDF(updatedProject);
        } else {
          // Fallback to basic download
          downloadChecklistPDF(project);
        }
      } catch (err) {
        console.error('AI checklist generation failed, downloading existing:', err);
        downloadChecklistPDF(project);
      } finally {
        setIsGeneratingAiForProject(null);
        setAiGenMessage('');
      }
    } else {
      downloadChecklistPDF(project);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans select-none">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Field Surveyor Portal
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                On-Site Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect site tasks, download PDF checklists, notify departure, and submit verified ground reports to Operations.
            </p>
          </div>
        </div>

        {/* Surveyor Profile Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
            {activeSurveyor.initials || 'TG'}
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              {activeSurveyor.name}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {activeSurveyor.assignedZone}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            activeTab === 'all' ? 'text-slate-300' : 'text-slate-400'
          }`}>
            All Tasks
          </span>
          <span className="text-xl font-black block mt-0.5">
            {allAssignedSurveys.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending_departure')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'pending_departure'
              ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            activeTab === 'pending_departure' ? 'text-blue-100' : 'text-slate-400'
          }`}>
            Ready to Mobilize
          </span>
          <span className="text-xl font-black block mt-0.5">
            {pendingDepartureCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'in_progress'
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            activeTab === 'in_progress' ? 'text-amber-100' : 'text-slate-400'
          }`}>
            En Route / On Site
          </span>
          <span className="text-xl font-black block mt-0.5">
            {inProgressCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submitted')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'submitted'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            activeTab === 'submitted' ? 'text-emerald-100' : 'text-slate-400'
          }`}>
            Submitted to Ops
          </span>
          <span className="text-xl font-black block mt-0.5">
            {submittedCount}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter survey tasks by tender name, client, work order or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
        />
      </div>

      {/* Survey Tasks List */}
      <div className="space-y-4">
        {filteredSurveys.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              No Survey Tasks Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When Operations dispatches you to a project site, the inspection task and checklist will show up here.
            </p>
          </div>
        ) : (
          filteredSurveys.map((project) => {
            const req = project.surveyRequest!;
            const isDeparted = req.status === 'Surveyor En Route' || req.status === 'Survey Submitted' || req.status === 'Completed';
            const isSubmitted = req.status === 'Survey Submitted';
            const isCompleted = req.status === 'Completed';

            return (
              <div
                key={project.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 ${
                  isSubmitted 
                    ? 'border-emerald-300 ring-1 ring-emerald-500/10' 
                    : isDeparted 
                    ? 'border-amber-300 ring-1 ring-amber-500/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row: Work Order, Urgency, Status */}
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
                        Target Date: <strong className="text-slate-700">{req.targetSurveyDate || 'Immediate'}</strong>
                      </span>
                    </div>

                    <h2 
                      onClick={() => setDetailProject(project)}
                      className="text-base font-bold text-slate-900 hover:text-teal-600 transition cursor-pointer"
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
                      <span>•</span>
                      <span className="text-slate-400">
                        Requested by: <strong className="text-slate-600">{req.requestedByEstimatorName}</strong>
                      </span>
                    </p>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {isCompleted ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved & Handed to Estimator</span>
                      </span>
                    ) : isSubmitted ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Survey Done (Pending Ops Review)</span>
                      </span>
                    ) : isDeparted ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        <span>On Site / Mobilized ({req.surveyorDepartedAt || 'In Progress'})</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ready to Mobilize</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Scope & Ground Instructions */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                    Field Scope & Verification Requirement:
                  </span>
                  <p className="italic text-slate-600 whitespace-pre-line">
                    "{req.surveyReason}"
                  </p>
                  {req.accessRestrictions && (
                    <p className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-rose-700 font-medium">
                      ⚠️ Access & Security: {req.accessRestrictions}
                    </p>
                  )}
                </div>

                {/* Surveyor Written Observations Preview (If Already Entered) */}
                {req.surveyorObservations && (
                  <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
                    <span className="font-bold block text-[11px] text-teal-950 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-teal-700" />
                      Surveyor's Logged Observations:
                    </span>
                    <p className="font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                      {req.surveyorObservations}
                    </p>
                  </div>
                )}

                {/* Main Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                  
                  {/* Left: Checklist Preview & Tender Details */}
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setPrintableProject(project)}
                      className="text-slate-700 hover:text-teal-700 font-semibold underline cursor-pointer flex items-center gap-1.5"
                      title="Preview interactive checklist or print dialog"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.checklist.length} Checkpoints (View / Print)</span>
                    </button>

                    <span>•</span>

                    <button
                      type="button"
                      onClick={() => setDetailProject(project)}
                      className="text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Tender Docs</span>
                    </button>
                  </div>

                  {/* Right: Core Workflow Actions in Strict Order (1st: Download, 2nd: Depart, 3rd: Survey Done) */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                    
                    {/* 1st: Download Checklist (PDF) - AI Drawing & Document Analysis */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadOrGenerateChecklist(project)}
                        disabled={isGeneratingAiForProject === project.id}
                        style={{ backgroundColor: '#0f766e', color: '#ffffff' }}
                        className="px-4 py-2 rounded-xl text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:bg-teal-800 hover:shadow-md whitespace-nowrap active:scale-95 disabled:opacity-75"
                        title={req.checklist.length === 0 ? "AI will review uploaded tender drawings & generate checklist PDF" : "Download official PDF checklist to take to site"}
                      >
                        {isGeneratingAiForProject === project.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 text-white animate-spin shrink-0" />
                            <span className="text-white font-black tracking-tight">{aiGenMessage || 'AI Scanning Drawings...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-white shrink-0" />
                            <span className="text-white font-black tracking-tight">
                              {req.checklist.length === 0 ? '1. AI Generate & Download' : '1. Download Checklist'}
                            </span>
                          </>
                        )}
                      </button>

                      {/* AI Re-Scan Drawings button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadOrGenerateChecklist(project, true)}
                        disabled={isGeneratingAiForProject === project.id}
                        className="p-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition cursor-pointer flex items-center justify-center shadow-2xs active:scale-95"
                        title="Force AI to re-scan uploaded drawings & update checklist"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      </button>
                    </div>

                    {/* 2nd: Depart for Survey */}
                    {!isDeparted ? (
                      <button
                        type="button"
                        onClick={() => handleDepartForSite(project)}
                        style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                        className="px-4 py-2 rounded-xl text-slate-950 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:bg-amber-600 hover:shadow-md whitespace-nowrap active:scale-95"
                        title="2nd: Click when departing for the site with printed checklist"
                      >
                        <Car className="w-4 h-4 text-slate-950 shrink-0" />
                        <span className="text-slate-950 font-black tracking-tight">2. Depart for Survey</span>
                      </button>
                    ) : (
                      <span 
                        style={{ backgroundColor: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
                        className="text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 border shadow-2xs whitespace-nowrap"
                      >
                        <Car className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>On Site ({req.surveyorDepartedAt || 'Mobilized'})</span>
                      </span>
                    )}

                    {/* 3rd: Survey Done */}
                    {!isSubmitted && !isCompleted ? (
                      <button
                        type="button"
                        onClick={() => setSubmissionProject(project)}
                        style={{ backgroundColor: '#059669', color: '#ffffff' }}
                        className="px-4 py-2 rounded-xl text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-sm hover:bg-emerald-700 hover:shadow-md whitespace-nowrap active:scale-95"
                        title="3rd: Upload scanned checklist, enter observations, and submit to Operations"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
                        <span className="text-white font-black tracking-tight">3. Survey Done</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmissionProject(project)}
                        style={{ backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}
                        className="px-3.5 py-2 rounded-xl border font-bold text-xs transition cursor-pointer flex items-center gap-2 whitespace-nowrap hover:bg-emerald-100"
                        title="View or modify submitted survey dossier"
                      >
                        <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Survey Submitted (Edit)</span>
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Survey Done Modal - Scanned Physical Checklist Upload & Ground Observations */}
      {submissionProject && submissionProject.surveyRequest && (
        <SurveySubmissionModal
          project={submissionProject}
          onClose={() => setSubmissionProject(null)}
          onSubmit={(projectId, updatedRequest) => {
            onUpdateSurveyRequest(projectId, updatedRequest, 'Survey In Progress');
            setSubmissionProject(null);
          }}
        />
      )}

      {/* Printable & Interactive PDF Checklist Modal - Conditionally Mounted */}
      {printableProject && printableProject.surveyRequest && (
        <PrintableChecklistModal
          onClose={() => setPrintableProject(null)}
          project={printableProject}
          onSaveSurvey={(projectId, updatedRequest, isSubmitted) => {
            onUpdateSurveyRequest(projectId, updatedRequest, isSubmitted ? 'Survey In Progress' : undefined);
            if (isSubmitted) {
              setPrintableProject(null);
            }
          }}
        />
      )}

      {/* Tender Details Modal */}
      {detailProject && (
        <ProjectDetailModal
          isOpen={true}
          onClose={() => setDetailProject(null)}
          project={detailProject}
          onOpenAssignEstimator={() => {}}
          onUpdateStatus={(pId, newStatus) => {
            if (onUpdateStatus) onUpdateStatus(pId, newStatus);
          }}
        />
      )}

    </div>
  );
};
