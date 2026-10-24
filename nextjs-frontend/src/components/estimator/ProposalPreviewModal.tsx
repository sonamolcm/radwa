'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';
import { ProjectRFQ } from '../../types/crm';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onConfirmSubmit?: (projectId: string) => void;
}

export const ProposalPreviewModal: React.FC<ProposalPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  onConfirmSubmit
}) => {
  if (!isOpen || !project) return null;

  const totalValue = project.aiBoqCalculation?.totals.totalCommercialBidPrice || project.estimatedValue || 0;
  const civilShare = Math.round(totalValue * 0.38);
  const structuralShare = Math.round(totalValue * 0.28);
  const mepShare = Math.round(totalValue * 0.20);
  const preliminariesShare = Math.round(totalValue * 0.14);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Commercial Bid Proposal Document Preview
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {project.workOrderNo} • {project.enquirySerialNo}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letterhead & Proposal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-800">
          
          {/* Corporate Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-slate-900 uppercase">
                  RADWA CONTRACTING & TRADING CO.
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                  L.L.C.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                General Building, Industrial Infrastructure & EPC Contracting<br />
                Commercial Registration: 2050012948 • Kingdom of Saudi Arabia
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 font-mono space-y-0.5">
              <div>Ref: <strong className="text-slate-900">{project.workOrderNo}/COMM</strong></div>
              <div>Date: {new Date().toISOString().split('T')[0]}</div>
              <div>Validity: <strong>90 Calendar Days</strong></div>
            </div>
          </div>

          {/* Recipient & Client Reference */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Submitted To:
            </div>
            <div className="text-sm font-bold text-slate-900">
              {project.clientName}
            </div>
            <div className="text-slate-600">
              Project Site: <strong className="text-slate-800">{project.siteName}</strong> ({project.projectLocation})
            </div>
            {project.clientRfqNo && (
              <div className="text-slate-500 font-mono">
                Client Inquiry Reference: {project.clientRfqNo}
              </div>
            )}
            <div className="text-slate-500">
              Attention: {project.clientSenderContact}
            </div>
          </div>

          {/* Project Subject Line */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Commercial Proposal Subject:
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              {project.proposedProjectName}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {project.projectWorkDescription}
            </p>
          </div>

          {/* Scope Coverage */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Scope of Work Coverage:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {project.sowScopes.map(scope => (
                <div key={scope} className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white text-xs font-medium text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{scope}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Commercial Pricing Schedule */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Commercial Pricing Schedule (Lump Sum BOQ)</span>
              {project.aiBoqCalculation && (
                <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                  AI Computed via Directive: "{project.aiBoqCalculation.promptUsed.slice(0, 40)}..."
                </span>
              )}
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 w-16">Item</th>
                    <th className="px-4 py-2.5">Scope Package Description</th>
                    <th className="px-4 py-2.5 text-right w-40">Price (SAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.aiBoqCalculation?.boqLineItems && project.aiBoqCalculation.boqLineItems.length > 0 ? (
                    <>
                      {project.aiBoqCalculation.boqLineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 font-mono text-slate-500">{item.itemNo}</td>
                          <td className="px-4 py-2 font-medium text-slate-800">
                            <div>{item.description}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Package: {item.package} • Qty: {item.quantity.toLocaleString()} {item.unit} @ SAR {item.unitRate.toLocaleString()}/unit
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">
                            SAR {item.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50">
                        <td className="px-4 py-2 font-mono text-slate-500">M.00</td>
                        <td className="px-4 py-2 font-medium text-slate-800">
                          Dedicated Project Manpower & Technical Staff Deployment ({project.aiBoqCalculation.manpower.reduce((acc, m) => acc + m.count, 0)} Headcount)
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">
                          SAR {project.aiBoqCalculation.totals.manpowerCost.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="px-4 py-2 font-mono text-slate-500">E.00</td>
                        <td className="px-4 py-2 font-medium text-slate-800">
                          Heavy Plant, Mobile Cranes & Equipment Rental Fleet ({project.aiBoqCalculation.equipmentRentals.reduce((acc, e) => acc + e.quantity, 0)} Units)
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">
                          SAR {project.aiBoqCalculation.totals.equipmentCost.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="px-4 py-2 font-mono text-slate-500">Q.00</td>
                        <td className="px-4 py-2 font-medium text-slate-800">
                          HSE Safety Compliance & QA/QC Third-Party Testing Program
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">
                          SAR {(project.aiBoqCalculation.totals.hseCost + project.aiBoqCalculation.totals.qaqcCost).toLocaleString()}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-slate-500">01.00</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">Civil, Site Grading & Heavy Earthworks</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">SAR {civilShare.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-slate-500">02.00</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">Structural Steel Fabrication, Erection & Reinforced Concrete Works</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">SAR {structuralShare.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-slate-500">03.00</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">Mechanical, Electrical, Instrumentation & Piping (MEP Packages)</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">SAR {mepShare.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-mono text-slate-500">04.00</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">Site Preliminaries, Testing, HSE & Project Management Overheads</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900">SAR {preliminariesShare.toLocaleString()}</td>
                      </tr>
                    </>
                  )}
                  
                  {/* Total Row */}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="px-4 py-3 text-right uppercase tracking-wider text-xs">
                      Total Lump Sum Offer (Excluding VAT):
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm sm:text-base text-slate-900">
                      SAR {totalValue.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Assumptions & Qualifications */}
          {project.sowCaveatsNotes && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
              <div className="font-bold text-slate-700">Commercial Qualifications & Assumptions:</div>
              <p className="text-slate-600 leading-relaxed">{project.sowCaveatsNotes}</p>
            </div>
          )}

          {/* Signatures & Approvals */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Prepared By</div>
              <div className="font-bold text-slate-900 mt-1">{project.assignedEstimatorName || 'Senior Estimating Engineer'}</div>
              <div className="text-slate-500">{project.assignedEstimatorRole || 'Commercial Estimations Dept.'}</div>
              <div className="mt-3 text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> BOQ Verified & Computed
              </div>
            </div>

            <div className="text-right">
              <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Management Authorization</div>
              <div className="font-bold text-slate-900 mt-1">Eng. Tariq Al-Radwa</div>
              <div className="text-slate-500">Managing Director / Commercial Board</div>
              <div className="mt-3 text-[11px] font-mono text-emerald-700 flex items-center justify-end gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> MD Approved for Bidding
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Close Preview
          </button>

          {onConfirmSubmit && project.status !== 'Bid Submitted' && (
            <button
              onClick={() => {
                onConfirmSubmit(project.id);
                onClose();
              }}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Confirm & Submit Formal Bid</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
