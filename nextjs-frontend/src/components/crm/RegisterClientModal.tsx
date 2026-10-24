'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Building2, 
  MapPin, 
  Mail, 
  User, 
  FileText, 
  Paperclip, 
  CheckCircle2, 
  HelpCircle, 
  Upload, 
  Trash2,
  Zap,
  HardHat,
  ChevronDown
} from 'lucide-react';
import { Estimator, ProjectRFQ, SowDiscipline } from '../../types/crm';

interface RegisterClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimators: Estimator[];
  onRegisterClient: (newProject: ProjectRFQ) => void;
}

const ALL_SOW_SCOPES: SowDiscipline[] = [
  'Civil',
  'Electrical',
  'Mechanical',
  'HVAC',
  'Plumbing',
  'Structural',
  'Specialized Sub-Scopes'
];

export const RegisterClientModal: React.FC<RegisterClientModalProps> = ({
  isOpen,
  onClose,
  estimators,
  onRegisterClient
}) => {
  // Form fields matching Screenshot 1 & 2
  const [enquirySerialNo, setEnquirySerialNo] = useState(() => {
    const seq = Math.floor(100 + Math.random() * 900);
    return `RGC-RFQ-2026-0${seq}`;
  });
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [clientRfqNo, setClientRfqNo] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientShortName, setClientShortName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [proposedProjectName, setProposedProjectName] = useState('');
  const [clientSenderContact, setClientSenderContact] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [rfqCameToWhoseName, setRfqCameToWhoseName] = useState('');
  const [rfqReceivedThrough, setRfqReceivedThrough] = useState('Email');
  const [projectWorkDescription, setProjectWorkDescription] = useState('');
  const [sowScopes, setSowScopes] = useState<SowDiscipline[]>([]);
  const [sowCaveatsNotes, setSowCaveatsNotes] = useState('');
  const [bidExtensionDate, setBidExtensionDate] = useState('');
  const [bidCloseDate, setBidCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [bidSubmissionType, setBidSubmissionType] = useState('Email Submission');
  
  // Attachments (100% clean initial state)
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; type: string; uploadedAt: string }[]>([]);

  // Estimator selection state
  const [selectedEstimatorId, setSelectedEstimatorId] = useState<string>('');

  // Management Reviewers state (Email CC style requested in audio)
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([
    'Managing Director (MD)'
  ]);
  const [reviewerInputText, setReviewerInputText] = useState('');

  const handleAddReviewer = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (!selectedReviewers.includes(clean)) {
      setSelectedReviewers(prev => [...prev, clean]);
    }
    setReviewerInputText('');
  };

  const handleRemoveReviewer = (name: string) => {
    setSelectedReviewers(prev => prev.filter(r => r !== name));
  };

  const handleReviewerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddReviewer(reviewerInputText);
    }
  };

  if (!isOpen) return null;

  // Auto generate Enquiry Serial Number
  const handleAutoGenerateSerial = () => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const newSerial = `RGC-RFQ-2026-0${randomSeq}`;
    setEnquirySerialNo(newSerial);
  };

  // Toggle SOW checkbox
  const handleToggleSow = (scope: SowDiscipline) => {
    if (sowScopes.includes(scope)) {
      setSowScopes(sowScopes.filter(s => s !== scope));
    } else {
      setSowScopes([...sowScopes, scope]);
    }
  };

  // Auto-Assign by Capacity: picks estimator with lowest active tenders (from Screenshot 2)
  const handleAutoAssign = () => {
    if (!estimators || estimators.length === 0) return;
    const sorted = [...estimators].sort((a, b) => a.activeTenders - b.activeTenders);
    const best = sorted[0];
    if (best) {
      setSelectedEstimatorId(best.id);
    }
  };

  // Attach real uploaded files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: { id: string; name: string; size: string; type: string; uploadedAt: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      newFiles.push({
        id: `f-${Date.now()}-${i}`,
        name: f.name,
        size: `${sizeMB} MB`,
        type: f.type || 'document',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignedEst = estimators.find(est => est.id === selectedEstimatorId);
    const randomWoSeq = Math.floor(100 + Math.random() * 900);
    const workOrderNumber = `WO-2026-0${randomWoSeq}`;

    const newProject: ProjectRFQ = {
      id: `rfq-${Date.now()}`,
      enquirySerialNo: enquirySerialNo.trim() || `RGC-RFQ-2026-0${randomWoSeq}`,
      workOrderNo: workOrderNumber,
      clientRfqNo: clientRfqNo.trim() || `RFQ-${Date.now().toString().slice(-5)}`,
      receivedDate: receivedDate || new Date().toISOString().split('T')[0],
      clientName: clientName.trim(),
      clientShortName: clientShortName.trim() || clientName.trim().slice(0, 4).toUpperCase(),
      siteName: siteName.trim(),
      proposedProjectName: proposedProjectName.trim(),
      clientSenderContact: clientSenderContact.trim(),
      projectLocation: projectLocation.trim(),
      rfqCameToWhoseName: rfqCameToWhoseName.trim() || 'Central Tendering Desk',
      rfqReceivedThrough: rfqReceivedThrough || 'Email',
      projectWorkDescription: projectWorkDescription.trim() || 'Scope and requirements as per client tender package.',
      sowScopes: sowScopes.length > 0 ? sowScopes : ['Civil'],
      sowCaveatsNotes: sowCaveatsNotes.trim(),
      bidExtensionDate: bidExtensionDate || undefined,
      bidCloseDate: bidCloseDate,
      bidSubmissionType: bidSubmissionType || 'Email Submission',
      attachedFiles: attachedFiles,
      assignedEstimatorId: assignedEst ? assignedEst.id : undefined,
      assignedEstimatorName: assignedEst ? assignedEst.name : undefined,
      assignedEstimatorRole: assignedEst ? assignedEst.role : undefined,
      status: 'Pending MD Approval',
      mdStatus: 'Pending Review',
      managementReviewers: selectedReviewers,
      estimatedValue: 0,
      createdAt: new Date().toISOString()
    };

    onRegisterClient(newProject);
    onClose();
  };

  const assignedEstimatorObj = estimators.find(e => e.id === selectedEstimatorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Register Client & Inbound RFQ Tender
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in client tender details and allocate an estimator from the capacity pool.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Main 2-Column Grid matching Screenshot 1 & 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            {/* === LEFT COLUMN === */}
            <div className="space-y-4">
              
              {/* Enquiry Serial Number with Auto Generate */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enquiry Serial Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={enquirySerialNo}
                    onChange={(e) => setEnquirySerialNo(e.target.value)}
                    placeholder="RGC-RFQ-2026-0145"
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateSerial}
                    className="px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer shrink-0"
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              {/* RFQ No. (Client) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RFQ No. (Client)
                </label>
                <input
                  type="text"
                  value={clientRfqNo}
                  onChange={(e) => setClientRfqNo(e.target.value)}
                  placeholder="e.g. ghj12345"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Client Short Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Short Name
                </label>
                <input
                  type="text"
                  value={clientShortName}
                  onChange={(e) => setClientShortName(e.target.value)}
                  placeholder="e.g. MA'ADEN"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Proposed Project Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Project Name
                </label>
                <input
                  type="text"
                  value={proposedProjectName}
                  onChange={(e) => setProposedProjectName(e.target.value)}
                  placeholder="omar sohan's opportunity"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Project Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Location
                </label>
                <input
                  type="text"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="e.g. Jubail Industrial City"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* RFQ Received Through */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RFQ Received Through
                </label>
                <input
                  type="text"
                  value={rfqReceivedThrough}
                  onChange={(e) => setRfqReceivedThrough(e.target.value)}
                  placeholder="Email"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 11. Scope of Work (SOW) */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  11. Scope of Work (SOW)
                </label>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_SOW_SCOPES.map((scope) => {
                      const isChecked = sowScopes.includes(scope);
                      return (
                        <label
                          key={scope}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSow(scope)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span>{scope}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* SOW Caveats & Notes */}
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      SOW Caveats & Notes
                    </label>
                    <input
                      type="text"
                      value={sowCaveatsNotes}
                      onChange={(e) => setSowCaveatsNotes(e.target.value)}
                      placeholder="Enter any caveats or notes here..."
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bid Close Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bid Close Date
                </label>
                <input
                  type="date"
                  value={bidCloseDate}
                  onChange={(e) => setBidCloseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Bid Submission Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bid Submission Type
                </label>
                <input
                  type="text"
                  value={bidSubmissionType}
                  onChange={(e) => setBidSubmissionType(e.target.value)}
                  placeholder="Email Submission"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>

            {/* === RIGHT COLUMN === */}
            <div className="space-y-4">
              
              {/* Inquiry / RFQ Received Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry / RFQ Received Date
                </label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Client Name with Tooltip */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Client Name
                  </label>
                  <span className="text-blue-500 text-xs cursor-help" title="Primary client or developer company">
                    ?
                  </span>
                </div>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="omar sohan"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Site Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Ras-al-Khair"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Client Sender / Buyer Name & Email ID / Mob */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Sender / Buyer Name & Email ID / Mob
                </label>
                <input
                  type="text"
                  value={clientSenderContact}
                  onChange={(e) => setClientSenderContact(e.target.value)}
                  placeholder="omar@gmail.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* RFQ Came to Whose (Name) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RFQ Came to Whose (Name)
                </label>
                <input
                  type="text"
                  value={rfqCameToWhoseName}
                  onChange={(e) => setRfqCameToWhoseName(e.target.value)}
                  placeholder="Fatima Ali (Office Secretar"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Project Work Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Work Description
                </label>
                <textarea
                  rows={3}
                  value={projectWorkDescription}
                  onChange={(e) => setProjectWorkDescription(e.target.value)}
                  placeholder="erwdfguhkjmbvfcghjkljhmgfcvx"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bid Extension Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bid Extension Date
                </label>
                <input
                  type="date"
                  value={bidExtensionDate}
                  onChange={(e) => setBidExtensionDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Attach Files (PDF, DOC, XLS, ZIP, CAD) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Files (PDF, DOC, XLS, ZIP, CAD)
                </label>
                
                <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                  <input
                    type="file"
                    id="realFileInputCrm"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('realFileInputCrm')?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload PDF / Tender Documents</span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Supports PDF, DOC, XLS, ZIP, CAD (DWG/DXF) up to 50 MB
                  </p>

                  {/* List of Attached Files */}
                  {attachedFiles.length > 0 && (
                    <div className="pt-2 space-y-1.5 text-left">
                      {attachedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between px-3 py-1.5 rounded bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-slate-700 font-medium truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              ({file.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(file.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* === ESTIMATOR ASSIGNMENT SECTION (from Screenshot 2 and User Audio) === */}
          <div className="pt-4 border-t border-slate-200">
            <div className="rounded-xl p-4 border border-slate-200 bg-slate-50/40 space-y-3.5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Estimator Name
                  </h3>
                  <p className="text-xs text-slate-500">
                    Allocate an estimator before submitting for MD review.
                  </p>
                </div>

                {/* Auto-Assign by Capacity Button (from Screenshot 2) */}
                <button
                  type="button"
                  onClick={handleAutoAssign}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer shrink-0"
                >
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  Auto-Assign by Capacity
                </button>
              </div>

              {/* Dropdown Select Estimator */}
              <div>
                <select
                  value={selectedEstimatorId}
                  onChange={(e) => setSelectedEstimatorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Estimator...</option>
                  {estimators.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.name} — {est.role} ({est.activeTenders} Active Tenders - {est.capacityStatus})
                    </option>
                  ))}
                </select>
              </div>

              {/* ESTIMATOR POOL CAPACITY List (from Screenshot 2) */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  ESTIMATOR POOL CAPACITY:
                </div>

                <div className="space-y-2">
                  {estimators.map((est) => {
                    const isSelected = selectedEstimatorId === est.id;
                    const isOptimal = est.activeTenders === 0 || est.capacityStatus === 'Optimal Capacity';

                    return (
                      <div
                        key={est.id}
                        onClick={() => setSelectedEstimatorId(est.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                            {est.initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {est.name}
                              </span>
                              {isOptimal && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded border border-blue-200 text-blue-700 bg-blue-50">
                                  Optimal Capacity
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {est.role}
                            </p>
                          </div>
                        </div>

                        {/* Active Tenders Badge & Selection Radio */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium px-3 py-1 rounded border border-slate-200 bg-white text-slate-700">
                            {est.activeTenders} Active Tenders
                          </span>

                          <div className={`h-4 w-4 rounded-full flex items-center justify-center border transition ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* REVIEW FROM MANAGEMENT (Email CC style as requested in audio) */}
          <div className="pt-2">
            <div className="rounded-xl p-4 border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    Review from Management / Send For Review (CC)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Type management recipients or CC reviewers who should receive this tender dossier for review & bidding authorization.
                  </p>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full w-fit">
                  Routes to MD Dashboard
                </span>
              </div>

              {/* Email CC Style Input Box with Tag Chips */}
              <div className="p-2.5 rounded-lg border border-slate-300 bg-white flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition min-h-[44px]">
                <span className="text-xs font-semibold text-slate-400 select-none px-1">
                  Send To / CC:
                </span>

                {/* Reviewer Chips */}
                {selectedReviewers.map((reviewer) => (
                  <span
                    key={reviewer}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    <span>{reviewer}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReviewer(reviewer)}
                      className="text-slate-400 hover:text-rose-600 transition p-0.5 rounded cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}

                {/* Text Input to Type Reviewer */}
                <input
                  type="text"
                  value={reviewerInputText}
                  onChange={(e) => setReviewerInputText(e.target.value)}
                  onKeyDown={handleReviewerKeyDown}
                  placeholder={selectedReviewers.length === 0 ? "Type reviewer name, role or email and press Enter..." : "Type another name / CC and press Enter..."}
                  className="flex-1 min-w-[200px] border-none bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-1"
                />

                {reviewerInputText.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddReviewer(reviewerInputText)}
                    className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>

              {/* Quick Add Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs text-slate-500">
                <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
                {[
                  'Managing Director (MD)',
                  'Commercial Director',
                  'Technical & Operations Director',
                  'CFO / Finance Director',
                  'Head of Contracts & Legal'
                ].filter(item => !selectedReviewers.includes(item)).map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddReviewer(suggestion)}
                    className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              {assignedEstimatorObj ? (
                <span className="text-slate-700 font-medium">
                  Allocated Estimator: <strong>{assignedEstimatorObj.name}</strong> ({assignedEstimatorObj.role})
                </span>
              ) : (
                'Estimator can be assigned now or updated by MD.'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send for MD / Management Review</span>
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
