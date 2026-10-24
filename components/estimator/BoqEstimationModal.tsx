'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calculator, 
  HardHat, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  Compass, 
  DollarSign, 
  Truck, 
  Key, 
  RefreshCw,
  Eye,
  Paperclip,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { 
  ProjectRFQ, 
  AiBoqCalculation, 
  ManpowerResource, 
  HseResource, 
  QaQcResource, 
  EquipmentResource, 
  BoqLineItem 
} from '../../types/crm';
import { getAiConfig, recordAiPull, subscribeToAiConfig, AiConfig, DEFAULT_AI_CONFIG } from '../../utils/aiConfig';
import { AiConfigModal } from '../layout/AiConfigModal';

interface BoqEstimationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onSaveEstimation: (projectId: string, estimatedValue: number, boqNotes: string, calculation?: AiBoqCalculation) => void;
  onOpenSiteReview?: (project: ProjectRFQ) => void;
  onOpenProposalPreview?: (project: ProjectRFQ) => void;
}

export const BoqEstimationModal: React.FC<BoqEstimationModalProps> = ({
  isOpen = true,
  onClose,
  project,
  onSaveEstimation,
  onOpenSiteReview,
  onOpenProposalPreview
}) => {
  // Stepper state: Step 1 (Document BOQ) -> Step 2 (Prompt Resource Takeoff)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Active sub-tab in Step 2 resource breakdown
  const [activeResourceTab, setActiveResourceTab] = useState<'manpower' | 'hse' | 'qaqc' | 'equipment'>('manpower');

  // Step 2 Prompt input state
  const [promptInput, setPromptInput] = useState<string>(() =>
    project?.aiBoqCalculation?.promptUsed || ''
  );

  // AI Configuration & Quota state
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setAiConfig(getAiConfig());
    const unsub = subscribeToAiConfig((cfg) => setAiConfig(cfg));
    return () => unsub();
  }, []);

  // Loading state during generation
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Editable lists
  const [boqLineItems, setBoqLineItems] = useState<BoqLineItem[]>([]);
  const [manpower, setManpower] = useState<ManpowerResource[]>([]);
  const [hse, setHse] = useState<HseResource[]>([]);
  const [qaqc, setQaQc] = useState<QaQcResource[]>([]);
  const [equipmentRentals, setEquipmentRentals] = useState<EquipmentResource[]>([]);
  const [marginPct, setMarginPct] = useState<number>(16.5);
  const [preliminariesPct, setPreliminariesPct] = useState<number>(8.0);
  const [notes, setNotes] = useState<string>(() =>
    project?.sowCaveatsNotes || ''
  );

  // Sync state when project changes or initial load
  useEffect(() => {
    if (!project) return;

    if (project.aiBoqCalculation) {
      setBoqLineItems(project.aiBoqCalculation.boqLineItems || []);
      setManpower(project.aiBoqCalculation.manpower || []);
      setHse(project.aiBoqCalculation.hse || []);
      setQaQc(project.aiBoqCalculation.qaqc || []);
      setEquipmentRentals(project.aiBoqCalculation.equipmentRentals || []);
      setMarginPct(project.aiBoqCalculation.totals.marginPct || 16.5);
    } else {
      // Keep empty initially: user MUST click "Generate BOQ" button to generate items
      setBoqLineItems([]);
    }
  }, [project?.id]);

  // Step 1: Generate Initial BOQ from Documents & Drawings
  const handleGenerateStep1Boq = async () => {
    if (!project) return;
    setIsGenerating(true);
    setGenerationStep('Scanning attached drawings Revision C & SOW specifications...');

    try {
      const currentCfg = getAiConfig();
      setTimeout(() => setGenerationStep('Extracting scope packages: Civil, Mechanical, Piping, Electrical...'), 400);
      setTimeout(() => setGenerationStep('Applying Saudi contractor standard unit rates...'), 800);

      const res = await fetch('/api/generate-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate standard BOQ schedule from drawings and tender specifications',
          project,
          apiKey: currentCfg.apiKey || undefined,
          apiEndpoint: currentCfg.apiEndpoint || undefined,
          model: currentCfg.model || undefined
        })
      });

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('radwa_open_ai_config_limit_exceeded'));
        setIsAiConfigModalOpen(true);
      }

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          recordAiPull();
          const calc: AiBoqCalculation = json.data;
          setBoqLineItems(calc.boqLineItems || []);
          // Pre-populate default resources
          if (!manpower.length) setManpower(calc.manpower || []);
          if (!hse.length) setHse(calc.hse || []);
          if (!qaqc.length) setQaQc(calc.qaqc || []);
          if (!equipmentRentals.length) setEquipmentRentals(calc.equipmentRentals || []);
        }
      }
    } catch (err) {
      console.error('Failed to generate initial BOQ:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Step 2: Generate Resources from Operational Prompt
  const handleGenerateStep2Resources = async (customPrompt?: string) => {
    const textToRun = (customPrompt || promptInput).trim();
    if (!textToRun) return;

    setIsGenerating(true);
    setGenerationStep(`Analyzing directive: "${textToRun.slice(0, 35)}..."`);

    try {
      const currentCfg = getAiConfig();
      setTimeout(() => setGenerationStep('Calculating required manpower, certified welders & riggers...'), 500);
      setTimeout(() => setGenerationStep('Computing HSE safety team, QA/QC testing & heavy equipment rentals...'), 1000);

      const res = await fetch('/api/generate-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          project,
          apiKey: currentCfg.apiKey || undefined,
          apiEndpoint: currentCfg.apiEndpoint || undefined,
          model: currentCfg.model || undefined
        })
      });

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('radwa_open_ai_config_limit_exceeded'));
        setIsAiConfigModalOpen(true);
      }

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          recordAiPull();
          const calc: AiBoqCalculation = json.data;
          setManpower(calc.manpower || []);
          setHse(calc.hse || []);
          setQaQc(calc.qaqc || []);
          setEquipmentRentals(calc.equipmentRentals || []);
        }
      }
    } catch (err) {
      console.error('Failed to calculate resources:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Dynamic calculations based on current table rows
  const directMaterialCost = boqLineItems.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
  const totalManpowerCost = manpower.reduce((acc, item) => acc + (item.totalCost || 0), 0);
  const totalHseCost = hse.reduce((acc, item) => acc + (item.totalCost || 0), 0);
  const totalQaqcCost = qaqc.reduce((acc, item) => acc + (item.totalCost || 0), 0);
  const totalEquipmentCost = equipmentRentals.reduce((acc, item) => acc + (item.totalCost || 0), 0);

  const directTotal = directMaterialCost + totalManpowerCost + totalEquipmentCost + totalHseCost + totalQaqcCost;
  const overheadsAndPreliminaries = Math.round(directTotal * (preliminariesPct / 100));
  const subTotal = directTotal + overheadsAndPreliminaries;
  const marginAmount = Math.round(subTotal * (marginPct / 100));
  const totalCommercialBidPrice = subTotal + marginAmount;

  // Total Headcount
  const totalHeadcount = manpower.reduce((acc, item) => acc + item.count, 0);

  // Save Estimation Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const updatedCalc: AiBoqCalculation = {
      promptUsed: promptInput,
      projectSummary: 'AI Generated BOQ & Resource Takeoff',
      estimatedDurationMonths: 12,
      manpower,
      hse,
      qaqc,
      equipmentRentals,
      boqLineItems,
      totals: {
        directMaterialCost,
        manpowerCost: totalManpowerCost,
        equipmentCost: totalEquipmentCost,
        hseCost: totalHseCost,
        qaqcCost: totalQaqcCost,
        overheadsAndPreliminaries,
        marginPct,
        marginAmount,
        totalCommercialBidPrice
      },
      generatedAt: new Date().toISOString()
    };

    onSaveEstimation(project.id, totalCommercialBidPrice, notes.trim(), updatedCalc);
    onClose();
  };

  // Prompt Templates for Step 2
  const promptTemplates = [
    'Lay 10 kilometer pipeline with trenching, dewatering in marshy soil, HDPE encasement, 2 valve stations, and 24/7 crew shifts',
    'Industrial turnkey civil foundations, heavy equipment crane pads, mass concrete pour & batching plant setup',
  ];

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {project.workOrderNo}
                  </span>
                  <span className="font-mono text-xs text-slate-500">
                    {project.enquirySerialNo}
                  </span>
                  {project.mdStatus === 'Approved for Bidding' && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> MD Approved for Bidding
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {project.proposedProjectName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Site Review Link */}
              {onOpenSiteReview && (
                <button
                  type="button"
                  onClick={() => onOpenSiteReview(project)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Compass className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {project.siteReview?.status === 'Completed'
                      ? 'Site Review: Completed'
                      : project.siteReview?.status === 'Scheduled'
                      ? `Site Visit: ${project.siteReview.scheduledDate}`
                      : project.siteReview?.status === 'Not Required'
                      ? 'Site Visit: Desk Cleared'
                      : 'Site Review Decision'}
                  </span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Operations Verified Site Survey Findings Banner */}
          {project.surveyRequest?.status === 'Completed' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Operations Site Survey Verified:</strong> Field measurements, underground utility clearances, and soil compaction confirmed by {project.surveyRequest.assignedSurveyorName || 'Operations'}. Integrated into BOQ costing parameters.
                </span>
              </div>
              <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 text-[10px] shrink-0 self-start sm:self-auto">
                Verified {project.surveyRequest.completedAt || 'Recently'}
              </span>
            </div>
          )}

          {/* TWO-STEP WORKFLOW STEPPER (AS REQUESTED BY USER) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center gap-3 ${
                currentStep === 1
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 opacity-80'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                1
              </div>
              <div className="truncate">
                <div className={`text-xs font-bold truncate ${currentStep === 1 ? 'text-blue-900' : 'text-slate-700'}`}>
                  Step 1: AI BOQ from Drawings & Docs
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {boqLineItems.length} Items Generated (SAR ${(directMaterialCost / 1000000).toFixed(2)}M Direct)
                </div>
              </div>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center gap-3 ${
                currentStep === 2
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 opacity-80'
              }`}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}>
                2
              </div>
              <div className="truncate">
                <div className={`text-xs font-bold truncate ${currentStep === 2 ? 'text-blue-900' : 'text-slate-700'}`}>
                  Step 2: Operational Prompt & Resources
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Manpower ({totalHeadcount}), HSE, QA/QC & Equipment
                </div>
              </div>
            </button>

          </div>

        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
          
          {/* ======================================================== */}
          {/* STEP 1: INITIAL AI BOQ GENERATION FROM DOCUMENTS & SPECS */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Document Analyzer Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Tender Documents Analyzed by AI ({project.attachedFiles.length} Files)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateStep1Boq}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Re-Scan Documents & Regenerate BOQ</span>
                  </button>
                </div>

                {/* File tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  {project.attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700">
                      <span className="font-mono font-medium">{file.name}</span>
                      <span className="text-[10px] text-slate-400">({file.size})</span>
                    </div>
                  ))}
                  <div className="text-xs text-slate-500">
                    SOW: <strong>{project.sowScopes.join(', ')}</strong> • Location: <strong>{project.siteName}</strong>
                  </div>
                </div>

                {isGenerating && (
                  <div className="text-xs font-semibold text-blue-700 flex items-center gap-2 animate-pulse pt-1">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>{generationStep}</span>
                  </div>
                )}
              </div>

              {/* The AI-Generated Bill of Quantities Table OR Empty State with Generate BOQ Button */}
              {boqLineItems.length === 0 ? (
                <div 
                  style={{ backgroundColor: '#ffffff', border: '1.5px dashed #cbd5e1' }}
                  className="rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-xs"
                >
                  <div 
                    style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                    className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner"
                  >
                    <Sparkles className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="space-y-1.5 max-w-md">
                    <h3 style={{ color: '#0f172a' }} className="text-base font-extrabold">
                      No Bill of Quantities (BOQ) Generated Yet
                    </h3>
                    <p style={{ color: '#64748b' }} className="text-xs leading-relaxed">
                      Click the button below to parse attached tender documents, drawings revision C, and scope packages using the AI estimation engine. No products will be listed until generated.
                    </p>
                  </div>

                  {isGenerating && (
                    <div 
                      style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}
                      className="px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-pulse"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>{generationStep || 'Analyzing drawings & calculating unit rates...'}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGenerateStep1Boq}
                    disabled={isGenerating}
                    style={{ 
                      backgroundColor: '#2563eb', 
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-xs shadow-md transition cursor-pointer hover:opacity-95 active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{isGenerating ? 'Analyzing Drawings & Generating BOQ...' : 'Generate BOQ'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#0f172a' }} className="font-extrabold">
                        AI GENERATED BILL OF QUANTITIES (BOQ SCHEDULE)
                      </span>
                      <span 
                        style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}
                        className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
                      >
                        {boqLineItems.length} Line Items
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateStep1Boq}
                      disabled={isGenerating}
                      style={{ backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1' }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? 'Regenerating...' : 'Re-Generate BOQ'}</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5 w-16">Item #</th>
                          <th className="px-4 py-2.5">Scope Package</th>
                          <th className="px-4 py-2.5">Description & Specification</th>
                          <th className="px-4 py-2.5 text-center w-16">Unit</th>
                          <th className="px-4 py-2.5 text-right w-24">Quantity</th>
                          <th className="px-4 py-2.5 text-right w-28">Unit Rate (SAR)</th>
                          <th className="px-4 py-2.5 text-right w-36">Total Amount (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {boqLineItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2 font-mono text-slate-500">{item.itemNo}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {item.package}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-medium text-slate-800">{item.description}</td>
                            <td className="px-4 py-2 text-center font-mono text-slate-600">{item.unit}</td>
                            <td className="px-4 py-2 text-right font-mono font-semibold text-slate-900">{item.quantity.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-600">SAR {item.unitRate.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">SAR {item.totalAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={6} className="px-4 py-2.5 uppercase tracking-wide">
                            Subtotal Direct Works & Civil / Mechanical Scope:
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-slate-900">
                            SAR {directMaterialCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Step 1 Approval & Transition Card (Estimator reviews first) */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs mt-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Review AI-Generated BOQ Schedule
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Verify all drawing scope quantities above. Once approved, proceed to Step 2 to enter operational prompt and calculate manpower, HSE, QA/QC, and equipment.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                    >
                      <span>Approve BOQ & Continue to Step 2</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: OPERATIONAL PROMPT & RESOURCE BREAKDOWN          */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Confirmed BOQ Status Pill */}
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Step 1 BOQ Verified: <strong>SAR {directMaterialCost.toLocaleString()}</strong> ({boqLineItems.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Edit BOQ Schedule
                </button>
              </div>

              {/* The Operational Prompt Box ("athinte adiyil oru prompt adikkanulla option") */}
              <div className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3.5 shadow-2xs">
                
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Step 2: Operational Execution Prompt (AI Engine)
                    </h3>
                  </div>
                </div>

                {/* The Prompt Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-700">
                    Enter operational prompt to calculate manpower, HSE, QA/QC, and equipment:
                  </label>
                  
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="e.g. Lay 10 kilometer pipeline with trenching, dewatering in marshy soil, HDPE encasement, 2 valve stations, and 24/7 crew shifts..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Quick Prompts */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-medium text-slate-500">Quick Templates:</span>
                    {promptTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPromptInput(template);
                          handleGenerateStep2Resources(template);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer text-left truncate max-w-xs"
                        title={template}
                      >
                        {template.slice(0, 42)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Resources Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">
                    {isGenerating ? (
                      <span className="text-blue-600 font-semibold flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        {generationStep}
                      </span>
                    ) : (
                      <span>
                        Total Headcount: <strong>{totalHeadcount} Personnel</strong> • Heavy Equipment: <strong>{equipmentRentals.reduce((acc, e) => acc + e.quantity, 0)} Units</strong>
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleGenerateStep2Resources()}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>{isGenerating ? 'Calculating...' : 'Calculate Resources with AI'}</span>
                  </button>
                </div>

              </div>

              {/* Four Resource Breakdown Tabs */}
              <div className="space-y-3">
                
                {/* Tabs Header */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
                  
                  <button
                    type="button"
                    onClick={() => setActiveResourceTab('manpower')}
                    className={`px-3.5 py-2 rounded-t-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeResourceTab === 'manpower'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <HardHat className="h-3.5 w-3.5" />
                    <span>Manpower Requirements</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeResourceTab === 'manpower' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {totalHeadcount} Staff (SAR ${(totalManpowerCost / 1000).toFixed(0)}k)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveResourceTab('hse')}
                    className={`px-3.5 py-2 rounded-t-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeResourceTab === 'hse'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>HSE & Safety Team</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeResourceTab === 'hse' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      SAR ${(totalHseCost / 1000).toFixed(0)}k
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveResourceTab('qaqc')}
                    className={`px-3.5 py-2 rounded-t-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeResourceTab === 'qaqc'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                    <span>QA/QC Testing & Inspection</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeResourceTab === 'qaqc' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      SAR ${(totalQaqcCost / 1000).toFixed(0)}k
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveResourceTab('equipment')}
                    className={`px-3.5 py-2 rounded-t-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      activeResourceTab === 'equipment'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5 text-amber-400" />
                    <span>Vehicle & Equipment Rentals</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeResourceTab === 'equipment' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      SAR ${(totalEquipmentCost / 1000).toFixed(0)}k
                    </span>
                  </button>

                </div>

                {/* RESOURCE TAB: MANPOWER */}
                {activeResourceTab === 'manpower' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Designation / Role</th>
                          <th className="px-4 py-2.5">Trade</th>
                          <th className="px-4 py-2.5 text-center">Headcount</th>
                          <th className="px-4 py-2.5 text-center">Duration</th>
                          <th className="px-4 py-2.5 text-right">Monthly Rate</th>
                          <th className="px-4 py-2.5 text-right">Total Cost (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {manpower.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2 font-medium text-slate-800">{row.role}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {row.trade}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center font-mono font-bold text-slate-900">{row.count}</td>
                            <td className="px-4 py-2 text-center font-mono text-slate-500">{row.durationMonths} Mos</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-600">SAR {row.monthlyRate.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-slate-900">SAR {row.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={2} className="px-4 py-2.5 uppercase tracking-wide">
                            Total Manpower Headcount & Deployment:
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono text-blue-700 text-sm">
                            {totalHeadcount} Staff
                          </td>
                          <td></td>
                          <td></td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-slate-900">
                            SAR {totalManpowerCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RESOURCE TAB: HSE */}
                {activeResourceTab === 'hse' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">HSE Position / Safety Provision</th>
                          <th className="px-4 py-2.5 text-center">Headcount</th>
                          <th className="px-4 py-2.5">Compliance & Operational Scope</th>
                          <th className="px-4 py-2.5 text-right">Monthly Provision</th>
                          <th className="px-4 py-2.5 text-right">Total Cost (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {hse.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2.5 font-medium text-slate-800">{row.role}</td>
                            <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-900">{row.count}</td>
                            <td className="px-4 py-2.5 text-slate-600">{row.requirements}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-600">SAR {row.monthlyCost.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">SAR {row.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={4} className="px-4 py-2.5 uppercase tracking-wide">
                            Total HSE & Environmental Safety Program:
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-slate-900">
                            SAR {totalHseCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RESOURCE TAB: QA/QC */}
                {activeResourceTab === 'qaqc' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">QA/QC Role / Inspection Discipline</th>
                          <th className="px-4 py-2.5 text-center">Inspectors</th>
                          <th className="px-4 py-2.5">Inspection Scope & Testing Standard</th>
                          <th className="px-4 py-2.5 text-right">Monthly Provision</th>
                          <th className="px-4 py-2.5 text-right">Total Cost (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {qaqc.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2.5 font-medium text-slate-800">{row.role}</td>
                            <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-900">{row.count}</td>
                            <td className="px-4 py-2.5 text-slate-600">{row.testingScope}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-600">SAR {row.monthlyCost.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">SAR {row.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={4} className="px-4 py-2.5 uppercase tracking-wide">
                            Total Quality Control, NDT & Testing:
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-slate-900">
                            SAR {totalQaqcCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RESOURCE TAB: EQUIPMENT */}
                {activeResourceTab === 'equipment' && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Equipment Description</th>
                          <th className="px-4 py-2.5">Classification</th>
                          <th className="px-4 py-2.5 text-center">Qty</th>
                          <th className="px-4 py-2.5 text-center">Duration</th>
                          <th className="px-4 py-2.5 text-right">Monthly Rental</th>
                          <th className="px-4 py-2.5 text-right">Total Rental Cost (SAR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {equipmentRentals.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2.5 font-medium text-slate-800">{row.equipmentName}</td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                {row.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-center font-mono font-bold text-slate-900">{row.quantity}</td>
                            <td className="px-4 py-2.5 text-center font-mono text-slate-500">{row.durationMonths} Mos</td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-600">SAR {row.monthlyRental.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">SAR {row.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                          <td colSpan={2} className="px-4 py-2.5 uppercase tracking-wide">
                            Total Plant, Heavy Machinery & Fleet Rentals:
                          </td>
                          <td className="px-4 py-2.5 text-center font-mono text-amber-700 text-sm">
                            {equipmentRentals.reduce((acc, e) => acc + e.quantity, 0)} Units
                          </td>
                          <td></td>
                          <td></td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-slate-900">
                            SAR {totalEquipmentCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

              {/* Combined Valuation Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total Commercial Bid Summary (BOQ + Resources)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">1. Direct BOQ Works</span>
                    <span className="font-mono font-bold text-sm text-slate-900">SAR {directMaterialCost.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">2. Manpower Deployments</span>
                    <span className="font-mono font-bold text-sm text-slate-900">SAR {totalManpowerCost.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">3. Equipment Rentals</span>
                    <span className="font-mono font-bold text-sm text-slate-900">SAR {totalEquipmentCost.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">4. HSE & QA/QC Program</span>
                    <span className="font-mono font-bold text-sm text-slate-900">SAR {(totalHseCost + totalQaqcCost).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-xs">
                      <label className="font-semibold text-slate-700 block">Preliminaries & Overheads (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={preliminariesPct}
                        onChange={(e) => setPreliminariesPct(Number(e.target.value))}
                        className="w-24 mt-1 px-2.5 py-1 text-xs font-mono font-bold rounded border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div className="text-xs">
                      <label className="font-semibold text-slate-700 block">Contractor Margin (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={marginPct}
                        onChange={(e) => setMarginPct(Number(e.target.value))}
                        className="w-24 mt-1 px-2.5 py-1 text-xs font-mono font-bold rounded border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Recommended Total Commercial Bid Price (Lump Sum)
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-black text-slate-900">
                      SAR {totalCommercialBidPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Step 1 (BOQ)</span>
              </button>
            )}

            {onOpenProposalPreview && (
              <button
                type="button"
                onClick={() => onOpenProposalPreview(project)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                <span>Preview Proposal Sheet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Approve BOQ & Next: Resource Planning</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Save Final Estimation & Update Bid</span>
              </button>
            )}
          </div>

        </div>

      </div>

      <AiConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
        onConfigured={(cfg) => setAiConfig(cfg)}
      />
    </div>
  );
};
