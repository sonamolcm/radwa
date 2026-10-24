import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  Mail, 
  FileText, 
  Paperclip, 
  HardHat, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Download,
  ExternalLink,
  FileCheck2,
  Scale
} from 'lucide-react';
import { ProjectRFQ, ProjectStatus, BidPackageDocument } from '../../types/crm';
import { BidPackageDossierModal } from './BidPackageDossierModal';
import { 
  downloadSingleDocumentPdf, 
  downloadCombinedMasterPdf, 
  downloadAllIndividualPdfs 
} from '../../utils/bidPackagePdfGenerator';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onOpenAssignEstimator: (project: ProjectRFQ) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenBoqComparison?: (project: ProjectRFQ) => void;
}

const ALL_STATUSES: ProjectStatus[] = [
  'New RFQ',
  'Estimator Assigned',
  'Under BOQ Estimation',
  'Bid Submitted',
  'Under Negotiation',
  'Won / Active Project',
  'Declined / Lost'
];

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  isOpen,
  onClose,
  project,
  onOpenAssignEstimator,
  onUpdateStatus,
  onOpenBoqComparison
}) => {
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  if (!isOpen || !project) return null;

  // Compute current step index for visual pipeline
  const getStageIndex = (status: ProjectStatus) => {
    switch (status) {
      case 'New RFQ': return 0;
      case 'Estimator Assigned': return 1;
      case 'Under BOQ Estimation': return 2;
      case 'Bid Submitted': return 3;
      case 'Under Negotiation': return 4;
      case 'Won / Active Project': return 5;
      case 'Declined / Lost': return -1;
      default: return 1;
    }
  };

  const currentStageIdx = getStageIndex(project.status);

  const STAGES = [
    { label: 'Intake RFQ', status: 'New RFQ' },
    { label: 'Estimator Assigned', status: 'Estimator Assigned' },
    { label: 'BOQ Takeoff', status: 'Under BOQ Estimation' },
    { label: 'Bid Submittal', status: 'Bid Submitted' },
    { label: 'Negotiation', status: 'Under Negotiation' },
    { label: 'Won / Awarded', status: 'Won / Active Project' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
        
        {/* Executive Header Banner */}
        <div className="relative overflow-hidden px-6 sm:px-8 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>RADWA COMMERCIAL DOSSIER</span>
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-slate-200 border border-white/15">
                WO #{project.workOrderNo}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {project.enquirySerialNo}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              {project.proposedProjectName}
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            {onOpenBoqComparison && (
              <button
                type="button"
                onClick={() => {
                  onOpenBoqComparison(project);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-900/30"
                title="Jump directly to Estimator BOQ Comparison & Variance Audit"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Open in BOQ Compare</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Visual Tender Lifecycle Pipeline Stepper */}
        <div className="bg-slate-900/95 px-6 sm:px-8 py-2.5 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {STAGES.map((st, idx) => {
              const isPast = currentStageIdx > idx;
              const isCurrent = currentStageIdx === idx;
              return (
                <div key={st.label} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all w-full justify-center ${
                    isCurrent 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-1 ring-blue-400' 
                      : isPast 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                    <span className="truncate">{st.label}</span>
                  </div>
                  {idx < STAGES.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50/50">
          
          {/* Status & Estimator Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Current Stage / Lifecycle Status</span>
                <span className="font-normal text-slate-400">Click to advance</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={project.status}
                  onChange={(e) => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
                  className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Estimator info */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Assigned Lead Estimator</span>
                <button
                  type="button"
                  onClick={() => onOpenAssignEstimator(project)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  {project.assignedEstimatorId ? 'Reassign' : 'Allocate'}
                </button>
              </label>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                {project.assignedEstimatorName ? (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {project.assignedEstimatorName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {project.assignedEstimatorName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {project.assignedEstimatorRole || 'Estimating Engineer'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-400 pl-2">
                    No estimator currently assigned
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={() => onOpenAssignEstimator(project)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer shadow-2xs"
                >
                  Change
                </button>
              </div>
            </div>

          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Client & RFQ Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Client & RFQ Specifications</span>
              </h4>

              <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Client Organization:</span>
                  <span className="font-bold text-slate-900">{project.clientName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Client Short Code:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {project.clientShortName || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Client RFQ Number:</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {project.clientRfqNo || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Project Site Facility:</span>
                  <span className="font-semibold text-slate-800">{project.siteName || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Kingdom Location:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {project.projectLocation || '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Client Buyer Contact:</span>
                  <span className="font-medium text-slate-800">{project.clientSenderContact || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Intake Channel:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">{project.rfqReceivedThrough}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Logged In Officer:</span>
                  <span className="font-semibold text-slate-900">{project.rfqCameToWhoseName}</span>
                </div>
              </div>
            </div>

            {/* Scope of Work (SOW) & Schedule */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Scope of Work & Commercial Deadlines</span>
              </h4>

              <div className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block mb-2">SOW Disciplines Included:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.sowScopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {project.sowCaveatsNotes && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Estimating Caveats & Notes:
                    </span>
                    <p className="text-xs italic leading-relaxed">
                      "{project.sowCaveatsNotes}"
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Received Date:
                    </span>
                    <span className="font-bold text-slate-900">{project.receivedDate}</span>
                  </div>
                  {project.bidExtensionDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Extension Granted:</span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{project.bidExtensionDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      Bid Submission Deadline:
                    </span>
                    <span className="font-black text-rose-600 text-sm bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
                      {project.bidCloseDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Submission Format:</span>
                    <span className="font-semibold text-slate-800">{project.bidSubmissionType}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Work Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Work Description
            </h4>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {project.projectWorkDescription || 'No description provided.'}
            </div>
          </div>

          {/* Attached Files Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached RFQ Documents ({project.attachedFiles.length})
            </h4>
            
            {project.attachedFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <div className="truncate">
                      <div className="font-medium text-slate-800 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {file.size}
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 hover:underline shrink-0 cursor-pointer">
                      Download
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No documents attached.</p>
            )}
          </div>

          {/* Approved Bid Package (40 Documents) Transmitted from Estimator to CRM */}
          {project.bidPackage && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white p-4 rounded-2xl border border-emerald-300/80">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Estimator Bid Package ({project.bidPackage.documents.filter(d => d.uploadedFile).length}/40 Attached)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Compiled across 5 Departments: QA/QC (10) • HSE (3) • Operations (12) • Procurement (4) • Legal & Commercial (11)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                    project.bidPackage.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {project.bidPackage.status}
                  </span>

                  {/* Master PDF Download */}
                  <button
                    type="button"
                    onClick={() => downloadCombinedMasterPdf(project, project.bidPackage?.documents || [])}
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Download complete 40-doc dossier as a single master PDF binder (No ZIP)"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Master PDF</span>
                  </button>

                  {/* 40 Separate PDFs Download */}
                  <button
                    type="button"
                    onClick={() => downloadAllIndividualPdfs(project, project.bidPackage?.documents || [])}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    title="Download all 40 separate individual PDF files directly to your computer (No ZIP)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>40 PDFs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDossierOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Full Table</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
                {project.bidPackage.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 text-xs transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block truncate" title={doc.name}>
                        {doc.order}. {doc.name}
                      </span>
                      {doc.uploadedFile ? (
                        <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                          ✓ {doc.uploadedFile.name} ({doc.uploadedFile.size})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block italic">
                          File generated & verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {doc.department}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadSingleDocumentPdf(doc, project)}
                        className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 px-2 py-1 rounded-md border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer flex items-center gap-1"
                        title="Download this document as PDF"
                      >
                        <Download className="w-2.5 h-2.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Tender Registered: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            Close Dossier
          </button>
        </div>

      </div>

      <BidPackageDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        project={project}
      />

    </div>
  );
};
