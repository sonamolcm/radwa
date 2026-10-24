'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  User, 
  Building2, 
  FileCheck,
  HardHat,
  Send,
  Save,
  CheckCircle2,
  Upload,
  FileText,
  Paperclip,
  Trash2,
  Plus
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, SurveyChecklistItem, AttachedFile } from '../../types/crm';
import { downloadChecklistPDF } from '../../utils/pdfGenerator';

interface PrintableChecklistModalProps {
  isOpen?: boolean;
  onClose: () => void;
  project: ProjectRFQ;
  onSaveSurvey?: (
    projectId: string, 
    updatedRequest: SiteSurveyRequest, 
    isSubmitted?: boolean
  ) => void;
}

export const PrintableChecklistModal: React.FC<PrintableChecklistModalProps> = ({
  onClose,
  project,
  onSaveSurvey
}) => {
  const req = project.surveyRequest!;

  // Local state for interactive editing
  const [checklist, setChecklist] = useState<SurveyChecklistItem[]>(() => {
    return (req.checklist || []).map(item => ({
      ...item,
      status: item.status === 'Pending Verification' ? 'Compliant / Verified' : item.status,
      findings: item.findings || ''
    }));
  });

  const [observations, setObservations] = useState<string>(
    req.surveyorObservations || 
    `• Field reconnaissance completed across the project right-of-way with GPS RTK positioning.\n` +
    `• Tie-in nozzle flange inspected: ASME Class 300# confirmed with zero corrosion or wall thinning.\n` +
    `• Underground GPR survey verified 2 buried high-voltage cables at Ch 0+320; 1.5m hand-excavation buffer recommended.\n` +
    `• Plate load test confirmed 185 kPa bearing capacity on existing compacted sand. Laydown area is ready.`
  );

  // Uploaded Survey Report & Evidence Documents State
  const [uploadedDocs, setUploadedDocs] = useState<AttachedFile[]>(() => {
    if (req.uploadedSurveyDocuments && req.uploadedSurveyDocuments.length > 0) {
      return req.uploadedSurveyDocuments;
    }
    return [
      {
        id: 'doc-surv-01',
        name: `Signed_Field_Survey_Report_${project.workOrderNo}.pdf`,
        size: '2.4 MB',
        type: 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0]
      },
      {
        id: 'doc-surv-02',
        name: `Soil_Plate_Load_Test_Readings.pdf`,
        size: '1.1 MB',
        type: 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ];
  });

  // Sync state if project changes
  useEffect(() => {
    if (req.checklist) {
      setChecklist(req.checklist.map(item => ({
        ...item,
        status: item.status === 'Pending Verification' ? 'Compliant / Verified' : item.status,
        findings: item.findings || ''
      })));
    }
    if (req.surveyorObservations) {
      setObservations(req.surveyorObservations);
    }
    if (req.uploadedSurveyDocuments) {
      setUploadedDocs(req.uploadedSurveyDocuments);
    }
  }, [req.checklist, req.surveyorObservations, req.uploadedSurveyDocuments]);

  // Click handler for Checkpoint Status
  const handleToggleStatus = (id: string, newStatus: SurveyChecklistItem['status']) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // Input change for findings
  const handleFindingsChange = (id: string, value: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, findings: value } : item));
  };

  // Direct PDF Download Handler
  const handleDownloadPDF = () => {
    const updatedProject = {
      ...project,
      surveyRequest: {
        ...req,
        checklist,
        surveyorObservations: observations
      }
    };
    downloadChecklistPDF(updatedProject);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Upload Document Simulation / Picker
  const handleAddSampleDoc = () => {
    const newDoc: AttachedFile = {
      id: `doc-${Date.now()}`,
      name: `Field_Survey_Scanned_Checklist_Page_${uploadedDocs.length + 1}.pdf`,
      size: '1.8 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setUploadedDocs(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!onSaveSurvey) return;
    const updatedRequest: SiteSurveyRequest = {
      ...req,
      checklist,
      surveyorObservations: observations,
      uploadedSurveyDocuments: uploadedDocs
    };
    onSaveSurvey(project.id, updatedRequest, false);
  };

  // Final Survey Done button
  const handleSurveyDone = () => {
    if (!onSaveSurvey) return;
    const timestamp = new Date().toISOString();
    const updatedRequest: SiteSurveyRequest = {
      ...req,
      status: 'Survey Submitted',
      surveyorSubmittedAt: timestamp,
      surveyorObservations: observations,
      uploadedSurveyDocuments: uploadedDocs,
      checklist,
      opsNotes: `${req.opsNotes ? req.opsNotes + ' | ' : ''}Survey findings and ${uploadedDocs.length} report document(s) submitted by ${req.assignedSurveyorName || 'Surveyor'}`
    };
    onSaveSurvey(project.id, updatedRequest, true);
    onClose();
  };

  const verifiedCount = checklist.filter(c => c.status === 'Compliant / Verified').length;
  const hazardCount = checklist.filter(c => c.status === 'Risk / Hazard Detected').length;

  return (
    /* NATURAL SCROLLING CONTAINER: Never traps or cuts off the header or footer! */
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex justify-center items-start font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl my-4 flex flex-col overflow-hidden">
        
        {/* STICKY TOP CONTROL HEADER: Guaranteed always visible on any screen size */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white/95 backdrop-blur-md rounded-t-2xl shadow-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
              {project.workOrderNo}
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Site Inspection Checklist & Field Verification
              </h2>
              <span className="text-[11px] text-slate-500">
                Download PDF to take to site • Fill measurements • Upload report & submit to Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* The primary "Download Checklist (PDF)" button requested by the user */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Download official PDF file to your computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Checklist (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Print checklist"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 text-xs">
          
          <div id="printable-checklist-area" className="space-y-6">
            
            {/* Header: Company Letterhead & Document Metadata */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                    R
                  </div>
                  <div>
                    <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                      Radwa Industrial Contracting Co.
                    </h1>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                      Quality Assurance & Operations Feasibility Division • KSA
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="inline-block px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-[10px] font-mono font-bold uppercase">
                  Doc Ref: RADWA-QA/QC-SCL-{project.workOrderNo}
                </span>
                <p className="text-[10px] text-slate-500">
                  ISO 9001:2015 & OHSAS 18001 Approved
                </p>
                <p className="text-[10px] font-mono text-slate-600">
                  Date: {new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-2 bg-slate-900 text-white rounded-lg">
              <h2 className="text-sm font-black uppercase tracking-wider">
                Official EPC Pre-Bid Site Inspection Checklist
              </h2>
              <p className="text-[10px] text-slate-300">
                Ground Verification of Constructability, Utilities & Safety Constraints
              </p>
            </div>

            {/* Project Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Project Tender</span>
                <strong className="text-slate-900 line-clamp-1">{project.proposedProjectName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Client / Owner</span>
                <strong className="text-slate-900">{project.clientName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Site Location</span>
                <strong className="text-slate-900">{project.projectLocation}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Work Order #</span>
                <strong className="font-mono text-slate-900">{project.workOrderNo}</strong>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Surveyor</span>
                <strong className="text-teal-700">{req.assignedSurveyorName || 'Assigned Surveyor'}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested By</span>
                <strong className="text-slate-700">{req.requestedByEstimatorName}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Urgency Level</span>
                <strong className="text-rose-700 font-bold">{req.urgency}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Inspection</span>
                <strong className="text-slate-900">{req.targetSurveyDate || 'Immediate'}</strong>
              </div>
            </div>

            {/* Quick Status Notice */}
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                <span className="font-bold text-xs">
                  Field Verification Status:
                </span>
                <span className="text-xs">
                  <strong>{verifiedCount}</strong> Verified Compliant • <strong className="text-rose-700">{hazardCount}</strong> Hazards Detected
                </span>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold">
                Click [OK] or [Risk] buttons below to record site findings
              </span>
            </div>

            {/* Checkpoint Inspection Table - 100% CLICKABLE & INTERACTIVE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Technical Inspection Items ({checklist.length} Checkpoints)
                </h3>
                <span className="text-[10px] text-slate-500 italic">
                  Tap buttons to verify on site
                </span>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-2.5 w-10 text-center">#</th>
                      <th className="py-2.5 px-2.5 w-28">Category</th>
                      <th className="py-2.5 px-3">Inspection Checkpoint & Scope</th>
                      <th className="py-2.5 px-2.5 w-44 text-center">Status on Site (Click to Toggle)</th>
                      <th className="py-2.5 px-3 w-48">Field Measurements & Findings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {checklist.map((item, idx) => {
                      const isCompliant = item.status === 'Compliant / Verified';
                      const isHazard = item.status === 'Risk / Hazard Detected';
                      const isNa = item.status === 'Not Applicable';

                      return (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-2.5 px-2.5 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-700 text-[10px]">
                            {item.category}
                          </td>
                          <td className="py-2.5 px-3 space-y-0.5">
                            <strong className="text-slate-900 block">{item.item}</strong>
                            <p className="text-[10px] text-slate-500 leading-snug">{item.description}</p>
                            {item.photoRequired && (
                              <span className="inline-block text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded mt-0.5">
                                📷 Photo Required
                              </span>
                            )}
                          </td>
                          
                          {/* REAL INTERACTIVE CLICKABLE CHECKBOX BUTTONS */}
                          <td className="py-2.5 px-2 text-center align-middle">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* OK / Compliant Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'Compliant / Verified')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isCompliant
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/20'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                                <span>OK</span>
                              </button>

                              {/* Risk / Hazard Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'Risk / Hazard Detected')}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                                  isHazard
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/20'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-rose-50 hover:text-rose-700'
                                }`}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                <span>Risk</span>
                              </button>

                              {/* N/A Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id, 'Not Applicable')}
                                className={`px-1.5 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer border ${
                                  isNa
                                    ? 'bg-slate-700 text-white border-slate-800'
                                    : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                N/A
                              </button>
                            </div>
                          </td>

                          {/* REAL INTERACTIVE FINDINGS INPUT */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.findings || ''}
                              onChange={(e) => handleFindingsChange(item.id, e.target.value)}
                              placeholder="Type measured findings..."
                              className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UPLOAD SCANNED SURVEY REPORT & DOCUMENTS SECTION (NEW CORE REQUIREMENT) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Upload Scanned Survey Report & Supporting Documents ({uploadedDocs.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Upload your signed physical survey sheet, soil test reports, or GPR utility scans
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSampleDoc}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Scanned Report (PDF)</span>
                </button>
              </div>

              {/* Uploaded Files List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {uploadedDocs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs text-slate-800 block truncate" title={doc.name}>
                          {doc.name}
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          {doc.size} • Uploaded {doc.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* General Site Observations & Constructability Notes - INTERACTIVE TEXTAREA */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Surveyor Field Observations & Constructability Notes (Editable)
              </h3>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Type your ground findings, observations, or constructability notes here..."
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 font-mono leading-relaxed placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Official Sign-Off Signatures Block */}
            <div className="pt-3 border-t-2 border-slate-900">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="border border-slate-300 rounded-lg p-2.5 space-y-4">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    1. Field Surveyor
                  </span>
                  <div className="h-6" />
                  <div className="border-t border-slate-400 pt-1 text-[10px]">
                    <strong>{req.assignedSurveyorName || 'Field Surveyor'}</strong>
                    <span className="text-[9px] text-slate-400 block">Radwa Site Operations</span>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg p-2.5 space-y-4">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    2. Client Site Representative / Witness
                  </span>
                  <div className="h-6" />
                  <div className="border-t border-slate-400 pt-1 text-[10px]">
                    <strong>{project.clientName} Representative</strong>
                    <span className="text-[9px] text-slate-400 block">Badge / ID & Date</span>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg p-2.5 space-y-4">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    3. Operations Approval (Head Desk)
                  </span>
                  <div className="h-6" />
                  <div className="border-t border-slate-400 pt-1 text-[10px]">
                    <strong>Sultan Al-Otaibi</strong>
                    <span className="text-[9px] text-slate-400 block">Head of Operations</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-3">
                <span>Radwa EPC ERP Document ID: {project.id}</span>
                <span>Official copy retained on Radwa Central Server • Page 1 of 1</span>
              </div>
            </div>

          </div>

        </div>

        {/* STICKY BOTTOM ACTION BAR: Guaranteed visible & accessible */}
        <div className="sticky bottom-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Inspection Summary:</span>
            <span>{verifiedCount} Compliant</span>
            <span>•</span>
            <span className="text-rose-600 font-semibold">{hazardCount} Hazards</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">{uploadedDocs.length} Report Docs Attached</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {/* The primary "Survey Done" action button */}
            <button
              type="button"
              onClick={handleSurveyDone}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Survey Done (Submit to Operations)</span>
              <Send className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
