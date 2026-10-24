'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  HardHat, 
  FileText, 
  Eye, 
  UserCheck, 
  Compass, 
  Paperclip,
  Check
} from 'lucide-react';
import { ProjectRFQ, SiteReviewDetails } from '../../types/crm';

interface SiteReviewModalProps {
  isOpen?: boolean;
  onClose: () => void;
  project: ProjectRFQ;
  onSaveSiteReview: (projectId: string, siteReview: SiteReviewDetails) => void;
}

export const SiteReviewModal: React.FC<SiteReviewModalProps> = ({
  isOpen = true,
  onClose,
  project,
  onSaveSiteReview
}) => {
  // Initialize form from existing project siteReview or sensible defaults
  const [isRequired, setIsRequired] = useState<boolean>(
    project.siteReview?.required ?? true
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    project.siteReview?.scheduledDate || '2026-10-24'
  );
  const [inspectorName, setInspectorName] = useState<string>(
    project.siteReview?.inspectorName || project.assignedEstimatorName || 'Farhan Qureshi (Lead Estimating Engineer)'
  );
  const [purpose, setPurpose] = useState<string>(
    project.siteReview?.purpose || 
    'Verify pipeline right-of-way access, existing underground utility clearances, soil dewatering levels, and contractor laydown area.'
  );
  const [findings, setFindings] = useState<string>(
    project.siteReview?.findings || ''
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(
    project.siteReview?.status === 'Completed'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedReview: SiteReviewDetails = {
      required: isRequired,
      status: !isRequired 
        ? 'Not Required' 
        : isCompleted 
        ? 'Completed' 
        : 'Scheduled',
      scheduledDate: isRequired ? scheduledDate : undefined,
      inspectorName: isRequired ? inspectorName.trim() : undefined,
      purpose: isRequired ? purpose.trim() : 'Desk estimation from IFC tender drawings is adequate.',
      findings: isRequired && findings.trim() ? findings.trim() : undefined,
      completedAt: isCompleted ? new Date().toISOString().split('T')[0] : undefined
    };

    onSaveSiteReview(project.id, updatedReview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Site Visit & Review Assessment
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {project.proposedProjectName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          
          {/* Project & Tender Summary Bar */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700">
              <div>
                Client: <strong className="text-slate-900">{project.clientName}</strong>
              </div>
              <div>
                Location: <strong className="text-slate-900">{project.siteName} • {project.projectLocation}</strong>
              </div>
            </div>
            <div className="text-slate-500 pt-0.5">
              Tender Drawings & Attachments: <strong>{project.attachedFiles.length} files attached</strong> (Available for desk examination).
            </div>
          </div>

          {/* Primary Decision: Site Review Needed? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Estimator Site Review Determination
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option A: Yes */}
              <div
                onClick={() => setIsRequired(true)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isRequired
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-blue-600" />
                    Physical Site Visit Required
                  </span>
                  {isRequired && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Requires on-site reconnaissance to verify soil topography, underground obstructions, right-of-way, or tie-in coordinates.
                </p>
              </div>

              {/* Option B: No */}
              <div
                onClick={() => setIsRequired(false)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  !isRequired
                    ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-slate-700" />
                    No Site Visit Needed
                  </span>
                  {!isRequired && <CheckCircle2 className="h-4 w-4 text-slate-900" />}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tender specifications, IFC drawings, and geotechnical reports are comprehensive. Direct desk BOQ takeoff is sufficient.
                </p>
              </div>

            </div>
          </div>

          {/* Conditional Fields if Site Review is Required */}
          {isRequired ? (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-4 animate-in fade-in duration-200">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Inspection Target Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Site Visit Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Assigned Site Engineer / Inspector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Site Engineer / Inspector <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      placeholder="e.g. Eng. Farhan Qureshi"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Purpose & Key Focus Areas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Site Visit Objectives & Reconnaissance Scope
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Inspect underground services, ground water table, road crossing access, and equipment staging area..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              {/* Mark as Completed & Record Findings */}
              <div className="pt-2 border-t border-blue-200/60 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Site Visit already conducted / Mark as Completed
                  </span>
                </label>

                {isCompleted && (
                  <div className="animate-in fade-in duration-150">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Site Observations & Engineering Findings
                    </label>
                    <textarea
                      rows={2}
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      placeholder="e.g. Water table observed at 1.8m depth, hard rock encountered near Ch 4+200, requires rock trenchers..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Desk Study Clearance
              </div>
              <p>
                The estimator will proceed directly to AI BOQ generation and quantity takeoff based on the client drawings and specifications.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Save Site Review Decision
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
