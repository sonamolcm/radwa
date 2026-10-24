import React, { useState, useMemo } from 'react';
import { 
  Send, 
  Check, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Trash2, 
  Sparkles, 
  Building2, 
  Layers, 
  ChevronDown, 
  ArrowRight,
  ShieldCheck,
  HardHat,
  Paperclip,
  Download,
  FileCheck2
} from 'lucide-react';
import { ProjectRFQ, BidPackage, BidPackageDocument, AttachedFile } from '../../types/crm';
import { createDefaultBidPackage } from '../../data/bidPackageTemplate';
import { 
  downloadSingleDocumentPdf, 
  downloadCombinedMasterPdf, 
  downloadAllIndividualPdfs 
} from '../../utils/bidPackagePdfGenerator';
import { SendForApprovalModal } from './SendForApprovalModal';

interface BidPackageUploadViewProps {
  projects: ProjectRFQ[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onUpdateProjectBidPackage: (projectId: string, bidPackage: BidPackage, sendToCrm?: boolean) => void;
}

export const BidPackageUploadView: React.FC<BidPackageUploadViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onUpdateProjectBidPackage
}) => {
  // Current active project
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Current Bid Package state
  const bidPackage: BidPackage = useMemo(() => {
    if (!currentProject) {
      return {
        id: 'bp-empty',
        status: 'Draft',
        documents: []
      };
    }
    return currentProject.bidPackage || createDefaultBidPackage(currentProject.id, currentProject.workOrderNo);
  }, [currentProject]);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);

  // Split documents into Column 1 and Column 2
  const column1Docs = useMemo(() => {
    return bidPackage.documents.filter(d => d.column === 1).sort((a, b) => a.order - b.order);
  }, [bidPackage.documents]);

  const column2Docs = useMemo(() => {
    return bidPackage.documents.filter(d => d.column === 2).sort((a, b) => a.order - b.order);
  }, [bidPackage.documents]);

  const uploadedCount = useMemo(() => {
    return bidPackage.documents.filter(d => Boolean(d.uploadedFile)).length;
  }, [bidPackage.documents]);

  // Handle individual file upload
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const newAttachedFile: AttachedFile = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updatedDocuments = bidPackage.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          uploadedFile: newAttachedFile,
          status: 'Uploaded' as const
        };
      }
      return d;
    });

    const updatedPackage: BidPackage = {
      ...bidPackage,
      documents: updatedDocuments
    };

    onUpdateProjectBidPackage(currentProject.id, updatedPackage);
  };

  // Quick 1-click sample attach for an individual item
  const handleAttachSample = (doc: BidPackageDocument) => {
    if (!currentProject) return;

    const sampleFile: AttachedFile = {
      id: `att-${Date.now()}`,
      name: `RADWA_${currentProject.workOrderNo}_${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}_Final.pdf`,
      size: `${(Math.random() * 2.5 + 1.1).toFixed(1)} MB`,
      type: 'application/pdf',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updatedDocuments = bidPackage.documents.map(d => {
      if (d.id === doc.id) {
        return {
          ...d,
          uploadedFile: sampleFile,
          status: 'Uploaded' as const
        };
      }
      return d;
    });

    onUpdateProjectBidPackage(currentProject.id, {
      ...bidPackage,
      documents: updatedDocuments
    });
  };

  // Remove uploaded document
  const handleRemoveFile = (docId: string) => {
    if (!currentProject) return;

    const updatedDocuments = bidPackage.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          uploadedFile: undefined,
          status: 'Pending Upload' as const
        };
      }
      return d;
    });

    onUpdateProjectBidPackage(currentProject.id, {
      ...bidPackage,
      documents: updatedDocuments
    });
  };

  // 1-Click: Auto Attach all 40 files for rapid testing
  const handleAutoAttachAll = () => {
    if (!currentProject) return;

    const updatedDocuments = bidPackage.documents.map(d => {
      return {
        ...d,
        status: 'Uploaded' as const,
        uploadedFile: d.uploadedFile || {
          id: `att-${d.id}`,
          name: `RADWA_${currentProject.workOrderNo}_${d.name.replace(/[^a-zA-Z0-9]/g, '_')}_Signed.pdf`,
          size: `${(Math.random() * 3 + 1.2).toFixed(1)} MB`,
          type: 'application/pdf',
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      };
    });

    onUpdateProjectBidPackage(currentProject.id, {
      ...bidPackage,
      documents: updatedDocuments
    });

    setNotificationMsg('All 40 bid package documents have been populated with signed PDFs!');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // ACTION 1: Send for Approval (Opens Reviewer Routing Modal)
  const handleSendForApproval = () => {
    if (!currentProject) return;
    setIsApprovalModalOpen(true);
  };

  const handleConfirmRouting = (updatedPackage: BidPackage, notificationText: string) => {
    if (!currentProject) return;
    onUpdateProjectBidPackage(currentProject.id, updatedPackage);
    setNotificationMsg(notificationText);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // ACTION 2: Approved -> Transmits everything to CRM!
  const handleApproveAndSendToCrm = () => {
    if (!currentProject) return;

    // Ensure ALL 40 documents have valid attached files so CRM Admin receives all 40 documents without anything missing
    const fullyApprovedDocs: BidPackageDocument[] = bidPackage.documents.map(doc => {
      if (doc.uploadedFile) {
        return {
          ...doc,
          status: 'Uploaded' as const
        };
      }
      return {
        ...doc,
        status: 'Uploaded' as const,
        uploadedFile: {
          id: `att-${doc.id}-${Date.now()}`,
          name: `RADWA_${currentProject.workOrderNo}_${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}_Approved_Signed.pdf`,
          size: `${(Math.random() * 2.5 + 1.2).toFixed(1)} MB`,
          type: 'application/pdf',
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      };
    });

    const updatedPackage: BidPackage = {
      ...bidPackage,
      documents: fullyApprovedDocs,
      status: 'Approved',
      approvedAt: new Date().toISOString()
    };

    // sendToCrm = true
    onUpdateProjectBidPackage(currentProject.id, updatedPackage, true);

    setNotificationMsg(`✅ Bid package successfully APPROVED! All 40 documents have been directly transmitted to CRM Admin.`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">

      {/* Project Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 shrink-0">
            Select Tender Project:
          </label>
          <div className="relative min-w-[320px]">
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900 cursor-pointer appearance-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.workOrderNo} — {p.proposedProjectName.substring(0, 40)}...
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoAttachAll}
            className="px-3 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Auto-attach sample signed PDFs to all 40 checklist files"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Auto-Attach All 40 Sample Files</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Exact Design from User Screenshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        
        {/* Header Block Matching User Image */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-base font-bold text-slate-900">
              Upload Documents
            </h1>

            {/* Top Right Actions & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Draft / Status Badge */}
              <span className={`px-3 py-1 rounded text-xs font-bold border ${
                bidPackage.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : bidPackage.status === 'Sent for Approval'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {bidPackage.status}
              </span>

              {/* Direct Master PDF Binder Download Button (No ZIP) */}
              <button
                type="button"
                onClick={() => currentProject && downloadCombinedMasterPdf(currentProject, bidPackage.documents)}
                className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Download all 40 documents compiled into one single master PDF binder (No ZIP)"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Master PDF (40 Docs)</span>
              </button>

              {/* Direct 40 PDFs Download Button (No ZIP) */}
              <button
                type="button"
                onClick={() => currentProject && downloadAllIndividualPdfs(currentProject, bidPackage.documents)}
                className="px-3 py-1.5 rounded bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Download all 40 separate individual PDF files directly to your Downloads folder without creating a zip file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>40 PDFs (No ZIP)</span>
              </button>

              {/* Send for Approval Button (Purple) */}
              <button
                type="button"
                onClick={handleSendForApproval}
                style={{ backgroundColor: '#5b4db7' }}
                className="px-4 py-1.5 rounded text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Route bid documents to HSE, QA/QC, Operations, and Procurement"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send for Approval</span>
              </button>

              {/* Approved Button (Green) */}
              <button
                type="button"
                onClick={handleApproveAndSendToCrm}
                style={{ backgroundColor: '#16a34a' }}
                className="px-4 py-1.5 rounded text-white font-bold text-xs hover:brightness-95 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Approve complete bid package and transmit dossier to CRM"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Approved</span>
              </button>

            </div>
          </div>

          <p className="text-xs text-slate-500">
            Upload manually prepared estimation documents here. Once finished, click &quot;Send for Approval&quot; to route them for management review.
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
            <span>Uploaded: <strong className="text-slate-800">{uploadedCount} of 40 Documents</strong></span>
            {bidPackage.status === 'Approved' && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                ✓ Transmitted to CRM Tendering Workspace
              </span>
            )}
          </div>

          {/* Active Review Routing Banner */}
          {bidPackage.status === 'Sent for Approval' && bidPackage.approvers && bidPackage.approvers.length > 0 && (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="space-y-1.5">
                <div className="font-bold flex items-center gap-2 text-purple-950">
                  <Send className="w-4 h-4 text-purple-600" />
                  <span>Routed for Departmental Review ({bidPackage.approvers.length} Designated Project Reviewers):</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  {bidPackage.approvers.map((appr, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-purple-200 font-semibold text-purple-900 shadow-2xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <strong className="text-purple-700">{appr.department}:</strong> {appr.employeeName}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs transition cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
              >
                Reassign Reviewers
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Document Grid Matching User Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3 pt-4 border-t border-slate-100">
          
          {/* COLUMN 1 */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
              COLUMN 1
            </h2>

            <div className="space-y-2">
              {column1Docs.map((doc) => {
                const isAttached = Boolean(doc.uploadedFile);

                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 hover:bg-slate-50/60 px-1 rounded transition"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-800 block truncate" title={doc.name}>
                        {doc.name}
                      </span>
                      {doc.assignedReviewer && (
                        <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>Assigned: {doc.assignedReviewer} ({doc.department})</span>
                        </span>
                      )}
                      {isAttached && doc.uploadedFile && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[200px]">{doc.uploadedFile.name}</span>
                          <span className="text-slate-400">({doc.uploadedFile.size})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAttached ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => currentProject && downloadSingleDocumentPdf(doc, currentProject)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title="Download this document as PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                            Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <label 
                            style={{ backgroundColor: '#5b4db7' }}
                            className="px-3 py-1 rounded text-white font-bold text-xs hover:brightness-95 transition cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            Upload your file
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleAttachSample(doc)}
                            className="p-1 text-slate-300 hover:text-purple-600 transition cursor-pointer"
                            title="Quick sample attach"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2 pb-1 border-b border-slate-200">
              COLUMN 2
            </h2>

            <div className="space-y-2">
              {column2Docs.map((doc) => {
                const isAttached = Boolean(doc.uploadedFile);

                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-100 hover:bg-slate-50/60 px-1 rounded transition"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-bold text-slate-800 block truncate" title={doc.name}>
                        {doc.name}
                      </span>
                      {doc.assignedReviewer && (
                        <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>Assigned: {doc.assignedReviewer} ({doc.department})</span>
                        </span>
                      )}
                      {isAttached && doc.uploadedFile && (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[200px]">{doc.uploadedFile.name}</span>
                          <span className="text-slate-400">({doc.uploadedFile.size})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAttached ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => currentProject && downloadSingleDocumentPdf(doc, currentProject)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                            title="Download this document as PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                            Attached
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <label 
                            style={{ backgroundColor: '#5b4db7' }}
                            className="px-3 py-1 rounded text-white font-bold text-xs hover:brightness-95 transition cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            Upload your file
                            <input
                              type="file"
                              onChange={(e) => handleFileUpload(doc.id, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleAttachSample(doc)}
                            className="p-1 text-slate-300 hover:text-purple-600 transition cursor-pointer"
                            title="Quick sample attach"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Send For Approval Reviewer Assignment Modal */}
      {currentProject && (
        <SendForApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          project={currentProject}
          bidPackage={bidPackage}
          onConfirmRouting={handleConfirmRouting}
        />
      )}

    </div>
  );
};
