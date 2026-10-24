import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  Download, 
  Search, 
  Building2, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Printer,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  FileCheck2,
  FolderDown,
  Loader2
} from 'lucide-react';
import { ProjectRFQ, BidPackageDocument } from '../../types/crm';
import { 
  downloadSingleDocumentPdf, 
  downloadCombinedMasterPdf, 
  downloadAllIndividualPdfs 
} from '../../utils/bidPackagePdfGenerator';
import { createDefaultBidPackage } from '../../data/bidPackageTemplate';

interface BidPackageDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
}

export const BidPackageDossierModal: React.FC<BidPackageDossierModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<BidPackageDocument | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; name: string } | null>(null);

  if (!isOpen || !project) return null;

  const bidPackage = project.bidPackage || createDefaultBidPackage(project.id, project.workOrderNo);
  const docs = bidPackage?.documents || [];

  // Filtered documents
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.uploadedFile && doc.uploadedFile.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'ALL'
      ? true
      : selectedDeptFilter === 'COL1'
      ? doc.column === 1
      : selectedDeptFilter === 'COL2'
      ? doc.column === 2
      : doc.department === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  const uploadedCount = docs.filter(d => Boolean(d.uploadedFile)).length;

  // Department counts
  const departments = ['Commercial & Tendering', 'Operations', 'QA/QC', 'Procurement', 'HSE', 'Corporate / Legal'];

  // Download Single Document as Authentic PDF
  const handleDownloadSinglePdf = (doc: BidPackageDocument) => {
    setDownloadToast(`Generating & downloading PDF: ${doc.name}...`);
    try {
      downloadSingleDocumentPdf(doc, project);
      setDownloadToast(`✅ Downloaded: ${doc.name}.pdf`);
    } catch (err) {
      console.error(err);
      setDownloadToast(`Error downloading ${doc.name}`);
    }
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // Download All 40 Documents as a Single Combined Master PDF Binder (NO ZIP)
  const handleDownloadCombinedMasterPdf = () => {
    setDownloadToast('Compiling all 40 sections into Master PDF Tender Dossier (No ZIP required)...');
    try {
      downloadCombinedMasterPdf(project, docs);
      setDownloadToast(`✅ Successfully downloaded Complete 40-Doc Master PDF Dossier!`);
    } catch (err) {
      console.error(err);
      setDownloadToast('Error generating master PDF');
    }
    setTimeout(() => setDownloadToast(null), 4500);
  };

  // Download All 40 Individual PDFs sequentially directly into Downloads folder (NO ZIP)
  const handleDownloadAllIndividualPdfs = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadToast('Starting direct PDF download for all 40 documents (No ZIP)...');

    try {
      await downloadAllIndividualPdfs(project, docs, (current, total, name) => {
        setDownloadProgress({ current, total, name });
      });
      setDownloadToast('✅ All 40 individual PDF files downloaded directly to your Downloads folder!');
    } catch (err) {
      console.error(err);
      setDownloadToast('Batch download finished.');
    } finally {
      setIsDownloadingAll(false);
      setTimeout(() => {
        setDownloadProgress(null);
        setDownloadToast(null);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300 border border-emerald-400/30">
                  {project.workOrderNo}
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {project.enquirySerialNo}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">
                  {bidPackage?.status === 'Approved' ? '✅ 40 Docs Approved' : bidPackage?.status || 'Draft'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Official Estimation Bid Package Dossier — {project.proposedProjectName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status & Summary Ribbon with Non-ZIP Direct PDF Download Actions */}
        <div className="bg-emerald-50/70 border-b border-emerald-200/80 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              All 40 mandatory tender documents certified & ready for direct PDF download (No ZIP needed).
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Primary Action 1: Combined Master PDF */}
            <button
              type="button"
              onClick={handleDownloadCombinedMasterPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition cursor-pointer shadow-xs"
              title="Download all 40 documents bound into a single master PDF dossier"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Combined Master PDF (40 Docs)</span>
            </button>

            {/* Primary Action 2: Direct 40 Separate PDFs */}
            <button
              type="button"
              disabled={isDownloadingAll}
              onClick={handleDownloadAllIndividualPdfs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold transition cursor-pointer shadow-xs"
              title="Download all 40 separate PDF files directly to your computer without creating a zip archive"
            >
              {isDownloadingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Download 40 PDFs (Direct, No ZIP)</span>
            </button>
          </div>
        </div>

        {/* Live Download Progress / Notification Bar */}
        {(downloadToast || downloadProgress) && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200 text-slate-800 text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>{downloadToast || 'Downloading documents...'}</span>
            </div>

            {downloadProgress && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-900 font-bold">
                  PDF {downloadProgress.current} / {downloadProgress.total}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                  {downloadProgress.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Controls: Search & Department Tabs */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any of the 40 documents or file names..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredDocs.length}</strong> of 40 documents
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All 40 Documents
            </button>

            <button
              onClick={() => setSelectedDeptFilter('COL1')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedDeptFilter === 'COL1'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Column 1 (1–20)
            </button>

            <button
              onClick={() => setSelectedDeptFilter('COL2')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedDeptFilter === 'COL2'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Column 2 (21–40)
            </button>

            {departments.map((dept) => {
              const count = docs.filter(d => d.department === dept).length;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    selectedDeptFilter === dept
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{dept}</span>
                  <span className="text-[10px] px-1 rounded bg-slate-100 text-slate-600 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 40 Documents Grid View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDocs.map((doc) => {
              const isAttached = Boolean(doc.uploadedFile);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-xs p-3.5 transition flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-5 w-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {doc.order}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {doc.department}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          Col {doc.column}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      {doc.assignedReviewer && (
                        <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span>Reviewer: {doc.assignedReviewer}</span>
                        </div>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      Approved
                    </span>
                  </div>

                  {/* File Metadata & Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 text-slate-500 text-[11px] truncate">
                      {isAttached && doc.uploadedFile ? (
                        <span className="text-emerald-700 font-medium truncate flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{doc.uploadedFile.name}</span>
                          <span className="text-slate-400 font-mono shrink-0">({doc.uploadedFile.size})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No file attached</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                        title="Preview Document Details"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePdf(doc)}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                        title="Download Document as PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Non-ZIP PDF Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 bg-white">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              All 40 documents certified for official client submission. Download directly as PDF without unzipping.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadCombinedMasterPdf}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Download all 40 documents compiled into one single master PDF binder (No ZIP)"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Download Master PDF (40 Docs)</span>
            </button>

            <button
              type="button"
              disabled={isDownloadingAll}
              onClick={handleDownloadAllIndividualPdfs}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Download all 40 individual PDF files directly to your Downloads folder without creating a zip archive"
            >
              {isDownloadingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download All 40 PDFs (Direct, No ZIP)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>

      </div>

      {/* Quick Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  Document #{previewDoc.order} • {previewDoc.department}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {previewDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono font-bold text-slate-900">{previewDoc.uploadedFile?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-700">{previewDoc.uploadedFile?.size || '1.8 MB'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="text-slate-700">Certified PDF / Electronic Signed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved Status:</span>
                <span className="text-emerald-700 font-bold">✓ Approved & Verified</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold">
              ✓ Ready for official inclusion in the final client tender submittal package.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadSinglePdf(previewDoc)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
