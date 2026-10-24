'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  HardHat, 
  CheckCheck, 
  Camera, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, SiteReviewDetails } from '../../types/crm';

interface CompleteSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onCompleteSurvey: (
    projectId: string, 
    updatedRequest: SiteSurveyRequest, 
    siteReview: SiteReviewDetails
  ) => void;
}

export const CompleteSurveyModal: React.FC<CompleteSurveyModalProps> = ({
  isOpen,
  onClose,
  project,
  onCompleteSurvey
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const surveyRequest = project.surveyRequest;

  const [surveyFindings, setSurveyFindings] = useState<string>(
    surveyRequest.surveyorObservations ||
    `Field survey completed on-site by ${surveyRequest.assignedSurveyorName || 'Assigned Surveyor'}. ` +
    `Tie-in nozzle flanges inspected & confirmed ASME B16.5 Class 300#. ` +
    `Underground GPR scan verified 2 live 33kV cable crossings flagged in checklist. ` +
    `Excavation trench requires standard trench box shoring. Geotechnical bearing capacity verified at 185 kPa. ` +
    `Cleared for Estimator to finalize BOQ item pricing & proposal.`
  );

  const [hazardsIdentified, setHazardsIdentified] = useState<string>(
    'Live underground 33kV electrical cable crossing at Ch 0+320 requires hand-digging within 1.5 meters buffer.'
  );

  const [siteAccessibilityStatus, setSiteAccessibilityStatus] = useState<string>('Fully Accessible with Aramco Gate Pass');

  const checklist = surveyRequest.checklist || [];
  const compliantCount = checklist.filter(i => i.status === 'Compliant / Verified').length;
  const riskCount = checklist.filter(i => i.status === 'Risk / Hazard Detected').length;
  const totalCount = checklist.length;

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();

    const completedTimestamp = new Date().toISOString();

    const updatedRequest: SiteSurveyRequest = {
      ...surveyRequest,
      status: 'Completed',
      completedAt: completedTimestamp.split('T')[0],
      opsNotes: `${surveyRequest.opsNotes ? surveyRequest.opsNotes + ' | ' : ''}Survey Finalized: ${surveyFindings}`
    };

    const siteReview: SiteReviewDetails = {
      required: true,
      status: 'Completed',
      inspectorName: surveyRequest.assignedSurveyorName || 'Operations Field Surveyor',
      scheduledDate: surveyRequest.targetSurveyDate || new Date().toISOString().split('T')[0],
      purpose: surveyRequest.surveyReason,
      findings: surveyFindings,
      completedAt: completedTimestamp.split('T')[0]
    };

    onCompleteSurvey(project.id, updatedRequest, siteReview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Site Verification Complete
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Complete Survey & Return Dossier to Estimator
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project & Surveyor Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="font-bold text-slate-800 text-sm block">{project.proposedProjectName}</span>
            <span className="text-slate-500">{project.clientName} • {project.projectLocation}</span>
          </div>

          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Field Surveyor:</span>
            <span className="font-bold text-slate-900 text-xs">
              {surveyRequest.assignedSurveyorName || 'Assigned Surveyor'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinalize} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {/* Checklist Verification KPI Summary */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                AI Checklist Ground Validation
              </span>
              <p className="text-[11px] text-emerald-800">
                All assigned survey checkpoints have been audited on-site.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                {compliantCount}/{totalCount} Verified
              </span>
              {riskCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-300">
                  {riskCount} Hazards Flagged
                </span>
              )}
            </div>
          </div>

          {/* Survey Findings Narrative */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Field Survey Findings & Geotechnical Summary *
            </label>
            <textarea
              rows={4}
              required
              value={surveyFindings}
              onChange={(e) => setSurveyFindings(e.target.value)}
              placeholder="Detail ground dimensions, elevation readings, pipe wall thicknesses, soil conditions..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This summary will be transmitted directly to Estimator <strong>{surveyRequest.requestedByEstimatorName}</strong> to finalize BOQ item unit rates.
            </p>
          </div>

          {/* Uploaded Scanned Physical Checklist & Site Reports from Surveyor */}
          {surveyRequest.uploadedSurveyDocuments && surveyRequest.uploadedSurveyDocuments.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-950 block text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                Attached Physical Checklist Scan & Field Evidence:
              </span>
              <div className="space-y-1.5">
                {surveyRequest.uploadedSurveyDocuments.map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-lg bg-white border border-emerald-100 flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.size} • Attached by {surveyRequest.assignedSurveyorName || 'Surveyor'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      Verified Scanned Copy
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hazards & Site Restrictions */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Safety Hazards, Underground Obstacles & Caveats
            </label>
            <input
              type="text"
              value={hazardsIdentified}
              onChange={(e) => setHazardsIdentified(e.target.value)}
              placeholder="e.g., Underground live cables, proximity to live flaring, shoring required..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Site Accessibility Status */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Site Accessibility & Gate Clearance Status
            </label>
            <input
              type="text"
              value={siteAccessibilityStatus}
              onChange={(e) => setSiteAccessibilityStatus(e.target.value)}
              placeholder="e.g., Fully Accessible with Aramco Gate Pass..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Return Workflow Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block text-xs">
              ⚡ Workflow Impact:
            </span>
            <p className="text-[11px] leading-relaxed">
              Submitting this survey will update the project tender state back to <strong>Under BOQ Estimation</strong>. The Estimator Workspace will receive the complete ground report, allowing Farhan Qureshi to calculate final bid margins and issue the commercial proposal.
            </p>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleFinalize}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Return to Estimator</span>
          </button>
        </div>

      </div>
    </div>
  );
};
