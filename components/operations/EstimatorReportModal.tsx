'use client';

import React from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  HardHat, 
  MapPin, 
  ExternalLink,
  Layers,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, EstimatorSurveyReport } from '../../types/crm';

interface EstimatorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onGenerateAiChecklist: () => void;
}

export const EstimatorReportModal: React.FC<EstimatorReportModalProps> = ({
  isOpen,
  onClose,
  project,
  onGenerateAiChecklist
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const surveyRequest = project.surveyRequest;
  const report: EstimatorSurveyReport = surveyRequest.estimatorReport || {
    reportTitle: `Site Feasibility & Verification Justification Report: ${project.proposedProjectName}`,
    estimatorName: surveyRequest.requestedByEstimatorName || 'Farhan Qureshi',
    estimatorRole: 'Lead EPC & Piping Estimating Engineer',
    submittedDate: surveyRequest.requestedAt || new Date().toISOString().split('T')[0],
    urgency: surveyRequest.urgency,
    executiveSummary: surveyRequest.surveyReason || 
      'Following comprehensive review of client tender specifications, IFC plot plans, and bill of quantities, critical physical uncertainties have been identified at the site limit. A physical reconnaissance survey is mandatory to prevent severe variation risk and ensure accurate BOQ rate pricing.',
    tenderDocsReviewed: [
      {
        docName: 'IFC-ENG-PLT-001 (Overall Plant General Arrangement & Piping Corridor)',
        docType: 'Engineering Plot Plan',
        keyObservation: 'Corridor crosses several unconfirmed underground utility easements near tie-in battery limit.'
      },
      {
        docName: 'SOW-TS-MEC-2026-Rev2 (Mechanical Piping & Equipment Specification)',
        docType: 'Technical Tender Spec',
        keyObservation: 'Requires cold tap tie-in to 24" high-pressure fuel line; flange rating & thickness must be confirmed on-site.'
      },
      {
        docName: 'GEO-SOIL-BRIEF-2025 (Preliminary Geotechnical Soil Boring Report)',
        docType: 'Geotechnical Study',
        keyObservation: 'High water table detected between 1.5m - 2.2m below NGL. Heavy shoring and dewatering expected.'
      }
    ],
    criticalSiteRisks: [
      {
        category: 'Underground Utilities',
        risk: 'Direct-buried high-voltage cables and existing potable water trunk lines along pipeline route.',
        impactOnBoq: 'Excavation classification (Manual vs Mechanical), trench safety protection, and utility sleeve casing costs.',
        requiredVerification: 'Continuous Ground Penetrating Radar (GPR) scan along 1.2km right-of-way corridor.'
      },
      {
        category: 'Battery Limit Tie-In',
        risk: 'Potential misalignment or corrosion on existing client header flange nozzle.',
        impactOnBoq: 'Spool pre-fabrication tolerances, crane lifting rigging, and plant shutdown outage hours.',
        requiredVerification: 'Ultrasonic thickness (UT) testing and 3D RTK GPS coordinate logging of tie-in flange.'
      },
      {
        category: 'Access & Soil Compaction',
        risk: 'Sub-base bearing capacity insufficient for 150T mobile crawler crane outriggers.',
        impactOnBoq: 'Crane mat rentals, gravel base stabilization, and temporary access road grading.',
        requiredVerification: 'Dynamic cone penetrometer soil test at designated heavy crane lift station.'
      }
    ],
    siteAccessProtocols: surveyRequest.accessRestrictions || 
      'Industrial restricted high-security zone. Mandatory Saudi Aramco SAP / Royal Commission security clearance, certified work permit receiver, and personal 4-gas H2S monitor.',
    targetCompletionDate: surveyRequest.targetSurveyDate || 'Immediate',
    estimatorSignature: 'Farhan Qureshi, PE (Lead Estimator - Quantity Surveying Division)'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Document Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  Estimator Feasibility Dossier
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  report.urgency === 'Critical 48h'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : report.urgency === 'Urgent'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                }`}>
                  Urgency: {report.urgency}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Estimator's Site Feasibility & Survey Justification Report
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 bg-[#FBFBFC]">
          
          {/* Metadata Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project / Tender</span>
              <p className="font-bold text-slate-900 mt-0.5 text-xs truncate">{project.proposedProjectName}</p>
              <p className="text-[11px] text-slate-500 truncate">{project.clientName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Site Location</span>
              <p className="font-bold text-slate-900 mt-0.5 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.projectLocation}</span>
              </p>
              <p className="text-[11px] text-slate-500">{project.siteName}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Prepared By Estimator</span>
              <p className="font-bold text-slate-900 mt-0.5 text-xs flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{report.estimatorName}</span>
              </p>
              <p className="text-[11px] text-slate-500">{report.estimatorRole}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Timeline Directives</span>
              <p className="font-bold text-slate-900 mt-0.5 text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Survey Target: {report.targetCompletionDate}</span>
              </p>
              <p className="text-[11px] text-slate-400">Submitted: {report.submittedDate}</p>
            </div>
          </div>

          {/* Section 1: Executive Summary / Why Survey is Needed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px]">1</span>
              Estimator Feasibility Analysis & Site Visit Justification
            </h3>
            <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {report.executiveSummary}
            </div>
          </div>

          {/* Section 2: Tender Documents & IFC Drawings Reviewed by Estimator */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">2</span>
              Tender Drawings & Engineering Specifications Reviewed
            </h3>
            <p className="text-xs text-slate-500">
              The Estimator studied the following documents from the client tender dossier before issuing this physical survey request:
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
              {report.tenderDocsReviewed.map((doc, idx) => (
                <div key={idx} className="p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {doc.docName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200 shrink-0">
                      {doc.docType}
                    </span>
                  </div>
                  <p className="text-slate-600 pl-5 text-[11px] leading-relaxed">
                    <strong className="text-slate-700">Estimator Key Finding:</strong> {doc.keyObservation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Critical Clashes & Uncertainties Requiring Operations Ground Verification */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[11px]">3</span>
                Critical Site Risks Requiring Field Verification
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {report.criticalSiteRisks.length} Key Checkpoints
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {report.criticalSiteRisks.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      {item.category}: {item.risk}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">Impact on BOQ & Pricing:</span>
                      <p className="text-slate-600 mt-0.5">{item.impactOnBoq}</p>
                    </div>

                    <div className="p-2 rounded bg-amber-50/60 border border-amber-100 text-amber-900">
                      <span className="font-bold text-amber-800 block text-[10px] uppercase">Field Verification Required:</span>
                      <p className="mt-0.5">{item.requiredVerification}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Site Access & Security Protocols */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              Site Access Directives & Gate Pass Authorization
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
              {report.siteAccessProtocols}
            </p>
          </div>

          {/* Estimator Formal Sign-off */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Submission Sign-off</span>
              <p className="font-bold text-slate-800 mt-0.5">{report.estimatorSignature}</p>
              <p className="text-[11px] text-slate-500">Radwa EPC Quantity Surveying & Cost Engineering Department</p>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 text-emerald-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dossier Formally Routed to Operations</span>
            </div>
          </div>

        </div>

        {/* Modal Footer with Direct Pipeline Action */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Next Action: Feed this Estimator Report into AI to synthesize the customized site inspection checklist.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
            >
              Close Dossier
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onGenerateAiChecklist();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>⚡ Generate AI Checklist from This Report</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
