'use client';

import React from 'react';
import { 
  X, 
  CheckCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  MapPin, 
  HardHat, 
  Sparkles, 
  FileText, 
  ClipboardList,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';

interface VerifiedSurveyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onProceedToBoq: () => void;
}

export const VerifiedSurveyReportModal: React.FC<VerifiedSurveyReportModalProps> = ({
  isOpen,
  onClose,
  project,
  onProceedToBoq
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const req = project.surveyRequest;
  const checklist = req.checklist || [];
  const compliantCount = checklist.filter(i => i.status === 'Compliant / Verified').length;
  const riskCount = checklist.filter(i => i.status === 'Risk / Hazard Detected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-xs">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-semibold text-slate-200">
                  Operations Field Handback Dossier
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Status: Survey Completed & Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Verified Site Survey Findings & Reconnaissance Report
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 bg-[#FBFBFC]">
          
          {/* Metadata Row */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project / Tender</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{project.proposedProjectName}</p>
              <p className="text-[11px] text-slate-500 truncate">{project.clientName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Site Location</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.projectLocation}</span>
              </p>
              <p className="text-[11px] text-slate-500">{project.siteName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Deployed Field Surveyor</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{req.assignedSurveyorName || 'Operations Site Engineer'}</span>
              </p>
              <p className="text-[11px] text-slate-500">Certified Site Feasibility Division</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Handback Date</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{req.completedAt || 'Recently Verified'}</span>
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold">Cleared for BOQ Costing</p>
            </div>
          </div>

          {/* Section 1: Executive Operations Verification Summary */}
          <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-2xs space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">✓</span>
              Operations Field Survey Summary & Ground Findings
            </h3>
            <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p>
                {req.opsNotes || 'Field survey completed on-site by certified Operations team. All pipeline corridors, underground utilities, tie-in limits, and soil compaction levels have been inspected against preliminary IFC drawings.'}
              </p>
              {project.siteReview?.findings && (
                <p className="pt-2 border-t border-emerald-200/60 font-medium text-slate-800">
                  <strong>Specific Inspector Findings:</strong> {project.siteReview.findings}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Verified Checkpoints Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Verified Field Checkpoints ({checklist.length})
              </h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {compliantCount} Compliant
                </span>
                {riskCount > 0 && (
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {riskCount} Hazards Flagged
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
              {checklist.map((item) => (
                <div key={item.id} className="p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      {item.status === 'Compliant / Verified' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      {item.category}: {item.item}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Compliant / Verified' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-600 pl-5 text-[11px]">
                    {item.description}
                  </p>

                  {item.findings && (
                    <div className="ml-5 p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-700 mt-1">
                      <strong className="text-slate-900">Surveyor Field Observation:</strong> {item.findings}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Field data is verified. You can now calculate BOQ item rates and resources using these findings.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToBoq();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Proceed to AI BOQ Takeoff with These Findings ➔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
