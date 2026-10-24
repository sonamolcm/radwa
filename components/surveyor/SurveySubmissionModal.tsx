'use client';

import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Paperclip, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Send, 
  HardHat, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, AttachedFile, SurveyChecklistItem } from '../../types/crm';

interface SurveySubmissionModalProps {
  onClose: () => void;
  project: ProjectRFQ;
  onSubmit: (
    projectId: string,
    updatedRequest: SiteSurveyRequest,
    observations: string,
    uploadedDocs: AttachedFile[],
    checklist: SurveyChecklistItem[]
  ) => void;
}

export const SurveySubmissionModal: React.FC<SurveySubmissionModalProps> = ({
  onClose,
  project,
  onSubmit
}) => {
  const req = project.surveyRequest!;

  // Scanned Checklist Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<AttachedFile[]>(() => {
    if (req.uploadedSurveyDocuments && req.uploadedSurveyDocuments.length > 0) {
      return req.uploadedSurveyDocuments;
    }
    return [
      {
        id: 'doc-scan-01',
        name: `Scanned_Physical_Checklist_Signed_${project.workOrderNo}.pdf`,
        size: '2.8 MB',
        type: 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ];
  });

  // Observations Textarea
  const [observations, setObservations] = useState<string>(
    req.surveyorObservations ||
    `• Field walkthrough executed on site with GPS RTK positioning.\n` +
    `• Tie-in nozzle flange condition inspected: ASME B16.5 Class 300# confirmed with zero pitting or corrosion.\n` +
    `• Underground GPR survey verified 2 buried high-voltage cables at Ch 0+320; 1.5m hand-excavation buffer recommended.\n` +
    `• Geotechnical bearing capacity verified at 185 kPa. Laydown area is graded and ready for mobilization.`
  );

  // File input change handler (real file upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc: AttachedFile = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setUploadedDocs(prev => [...prev, newDoc]);
    }
  };

  // Quick 1-click sample scan attach
  const handleAddSampleScan = () => {
    const newDoc: AttachedFile = {
      id: `doc-${Date.now()}`,
      name: `Signed_Field_Checklist_Sheet_${uploadedDocs.length + 1}.pdf`,
      size: '2.1 MB',
      type: 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setUploadedDocs(prev => [...prev, newDoc]);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString();
    const updatedRequest: SiteSurveyRequest = {
      ...req,
      status: 'Survey Submitted',
      surveyorSubmittedAt: timestamp,
      surveyorObservations: observations,
      uploadedSurveyDocuments: uploadedDocs,
      opsNotes: `${req.opsNotes ? req.opsNotes + ' | ' : ''}Survey completed on site. Scanned checklist & observations submitted by ${req.assignedSurveyorName || 'Surveyor'}`
    };

    onSubmit(project.id, updatedRequest, observations, uploadedDocs, req.checklist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex justify-center items-start font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl my-6 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {project.workOrderNo}
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Survey Done — Upload Scanned Checklist & Submit
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {project.proposedProjectName} • <span className="font-semibold text-slate-700">{project.clientName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* STEP 1: Upload Scanned Physical Checklist */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                1. Upload Scanned Copy of Completed Checklist (PDF / Photos)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload the scanned pages of the checklist you printed, took to site, and filled by hand with signatures.
              </p>
            </div>

            {/* Dropzone Box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 text-center space-y-2 transition-all">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Drag and drop your scanned checklist PDF here, or choose a file
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-1">
                <label className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs transition">
                  Browse File (PDF / Images)
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddSampleScan}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition shadow-2xs"
                >
                  + Add Sample Signed Scan
                </button>
              </div>
            </div>

            {/* List of Attached Scanned Files */}
            <div className="space-y-2 pt-1">
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs text-slate-900 block truncate" title={doc.name}>
                        {doc.name}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {doc.size} • Attached for Operations Review
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: Ground Observations & Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                2. Site Observations & Ground Findings
              </label>
              <span className="text-[11px] text-slate-400">
                Routed to Operations & Estimator
              </span>
            </div>

            <textarea
              rows={4}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Type observations noted during the site visit (e.g. soil bearing capacity, underground cables, crane laydown, or access restrictions)..."
              required
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Submitting sends this scanned checklist and your observations directly to <strong>Operations Head (Sultan Al-Otaibi)</strong> for acceptance.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Submit to Operations</span>
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
