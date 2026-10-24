'use client';

import React from 'react';
import { 
  X, 
  Clock, 
  HardHat, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Compass,
  Lock,
  CheckCheck
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';

interface TrackOperationsProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
}

export const TrackOperationsProgressModal: React.FC<TrackOperationsProgressModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const req = project.surveyRequest;
  const isPendingChecklist = req.status === 'Pending AI Checklist';
  const isChecklistReady = req.status === 'Checklist Ready';
  const isDispatched = req.status === 'Surveyor Dispatched';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 flex items-center justify-center shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-semibold text-slate-200">
                  Live Operations Status
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Site Survey Routing & Dispatch Progress
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700 overflow-y-auto">
          
          {/* Lock notice alert */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>BOQ Estimation Stage Gated</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              This tender has been routed to the <strong>Operations Console (Sultan Al-Otaibi)</strong>. In accordance with Radwa EPC governance, BOQ takeoffs and commercial bid proposals are locked until Operations verifies ground conditions and returns the survey findings.
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Operations Dispatch Milestones
            </h3>

            <div className="space-y-3">
              {/* Milestone 1: Request Logged */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">1. Survey Feasibility Report Submitted</span>
                    <span className="text-[10px] text-slate-400">Date: {req.requestedAt}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Submitted by {req.requestedByEstimatorName} with {req.urgency} urgency. Routed to Operations Console.
                  </p>
                </div>
              </div>

              {/* Milestone 2: AI Checklist */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isPendingChecklist
                  ? 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-300'
                  : 'border-emerald-200 bg-emerald-50/50'
              }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  isPendingChecklist
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {isPendingChecklist ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">2. AI Hazard & Scope Checklist Synthesis</span>
                    <span className={`text-[10px] font-bold ${isPendingChecklist ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {isPendingChecklist ? 'In Progress at Operations' : 'Completed (Ready)'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {isPendingChecklist 
                      ? 'Operations Head is evaluating project scope to generate tailored checkpoints (GPR radar, soil boreholes, tie-in limits).'
                      : `${req.checklist.length} safety & technical checkpoints synthesized and approved by Operations.`}
                  </p>
                </div>
              </div>

              {/* Milestone 3: Field Surveyor Dispatched */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isDispatched
                  ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-300'
                  : isChecklistReady
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-slate-200 bg-slate-50 opacity-60'
              }`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                  isDispatched
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  <HardHat className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">3. Field Surveyor Mobilization & Site Reconnaissance</span>
                    <span className="text-[10px] font-bold text-indigo-700">
                      {isDispatched ? 'Surveyor on Site' : 'Awaiting Dispatch'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {isDispatched
                      ? `Surveyor ${req.assignedSurveyorName} deployed to ${project.projectLocation}. Target date: ${req.targetSurveyDate}.`
                      : 'Operations will assign certified surveyor once gate pass permits are authorized.'}
                  </p>
                </div>
              </div>

              {/* Milestone 4: Handback to Estimator */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 opacity-60 flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                  <CheckCheck className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <span className="font-bold text-slate-900 block">4. Verified Report Returned to Estimator</span>
                  <p className="text-slate-600 text-[11px]">
                    Operations completes survey verification and releases BOQ estimation lock.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Switch to <strong>Operations Console</strong> to execute checklist & dispatch.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
