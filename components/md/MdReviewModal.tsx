'use client';

import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  MapPin, 
  FileText, 
  Paperclip, 
  HardHat, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserCheck, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Estimator, ProjectRFQ } from '../../types/crm';

interface MdReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  estimators: Estimator[];
  onApproveForBidding: (projectId: string, mdRemarks?: string) => void;
  onDeclineTender: (projectId: string, reason?: string) => void;
  onOpenReassignEstimator: (project: ProjectRFQ) => void;
}

export const MdReviewModal: React.FC<MdReviewModalProps> = ({
  isOpen,
  onClose,
  project,
  estimators,
  onApproveForBidding,
  onDeclineTender,
  onOpenReassignEstimator
}) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !project) return null;

  const assignedEst = estimators.find(e => e.id === project.assignedEstimatorId);

  const handleApprove = () => {
    onApproveForBidding(project.id, remarks.trim());
    onClose();
  };

  const handleDecline = () => {
    onDeclineTender(project.id, remarks.trim() || 'Declined by Managing Director during executive review.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {project.workOrderNo}
              </span>
              <span className="font-mono text-xs text-slate-500">
                {project.enquirySerialNo}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                MD Executive Review
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              {project.proposedProjectName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Executive Estimator Review Banner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Estimator Assigned by CRM Admin:
              </span>
              {project.assignedEstimatorName ? (
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="h-9 w-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {assignedEst?.initials || project.assignedEstimatorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {project.assignedEstimatorName}
                      {assignedEst && (assignedEst.activeTenders === 0 || assignedEst.capacityStatus === 'Optimal Capacity') && (
                        <span className="text-[10px] font-medium px-2 py-0.2 rounded border border-blue-200 text-blue-700 bg-blue-50">
                          Optimal Capacity
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.assignedEstimatorRole} • {assignedEst?.activeTenders ?? 0} Active Tenders
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-rose-600 font-medium mt-1 block">
                  No Estimator Assigned yet
                </span>
              )}
            </div>

            {/* Change Estimator Button (explicitly requested by user in audio) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReassignEstimator(project);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer shrink-0"
            >
              <HardHat className="h-3.5 w-3.5 text-slate-600" />
              Change / Reassign Estimator
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Client & RFQ Information */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Client & Tender Parameters
              </h4>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-semibold text-slate-900">{project.clientName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client Short Name:</span>
                  <span className="font-medium text-slate-900">{project.clientShortName || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client RFQ Ref:</span>
                  <span className="font-mono text-slate-900">{project.clientRfqNo || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Site Location:</span>
                  <span className="text-slate-900">{project.siteName} • {project.projectLocation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Buyer Contact:</span>
                  <span className="text-slate-900">{project.clientSenderContact || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Inbound Channel:</span>
                  <span className="text-slate-900">{project.rfqReceivedThrough}</span>
                </div>
              </div>
            </div>

            {/* Scope of Work & Milestones */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scope & Tender Timeline
              </h4>

              <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Discipline Packages:</span>
                  <div className="flex flex-wrap gap-1">
                    {project.sowScopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {project.sowCaveatsNotes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-0.5">SOW Caveats & Notes:</span>
                    <p className="text-slate-700 italic">
                      "{project.sowCaveatsNotes}"
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inquiry Received:</span>
                    <span className="font-medium text-slate-900">{project.receivedDate}</span>
                  </div>
                  {project.bidExtensionDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bid Extension:</span>
                      <span className="font-medium text-slate-900">{project.bidExtensionDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bid Submission Deadline:</span>
                    <span className="font-bold text-rose-600">{project.bidCloseDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submission Mode:</span>
                    <span className="text-slate-900">{project.bidSubmissionType}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Work Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Work Description
            </h4>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {project.projectWorkDescription || 'No description provided.'}
            </div>
          </div>

          {/* Attached Files Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Attached Tender Documents ({project.attachedFiles.length})
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

          {/* MD Approval Remarks Note */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700">
              Managing Director Approval Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved. Prioritize concrete structural takeoffs and adhere to client submission deadline."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

        </div>

        {/* Modal Decision Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleDecline}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
          >
            Decline Tender
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve for Bidding
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
