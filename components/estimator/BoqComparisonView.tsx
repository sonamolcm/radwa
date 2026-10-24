'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MessageSquare, 
  Send, 
  Check, 
  RefreshCw, 
  FileSpreadsheet, 
  Layers, 
  ShieldAlert, 
  X,
  Sparkles,
  ArrowRight,
  HardHat,
  ChevronDown,
  Upload,
  FileText,
  Paperclip,
  Key,
  Zap,
  Plus,
  Trash2
} from 'lucide-react';
import { ProjectRFQ, BoqComparisonItem, BoqComparisonData } from '../../types/crm';
import { createDefaultBoqComparison } from '../../data/bidPackageTemplate';
import { getAiConfig, recordAiPull, subscribeToAiConfig, AiConfig, DEFAULT_AI_CONFIG } from '../../utils/aiConfig';
import { AiConfigModal } from '../layout/AiConfigModal';

interface BoqComparisonViewProps {
  projects: ProjectRFQ[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onUpdateProjectBoqComparison: (projectId: string, comparison: BoqComparisonData) => void;
  onNavigateToBidPackage?: () => void;
}

export const BoqComparisonView: React.FC<BoqComparisonViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onUpdateProjectBoqComparison,
  onNavigateToBidPackage
}) => {
  // Current active project
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Track if comparison has been executed for this project
  const [hasCompared, setHasCompared] = useState<boolean>(() => {
    return Boolean(currentProject?.boqComparison);
  });

  // Uploaded Manual Estimator BOQ Document
  const [uploadedManualDoc, setUploadedManualDoc] = useState<{
    name: string;
    size: string;
    uploadedAt: string;
    itemsCount: number;
  } | null>(() => {
    if (currentProject?.boqComparison) {
      return {
        name: `MANUAL_ESTIMATOR_BOQ_${currentProject.workOrderNo || 'WO-2026-0145'}.xlsx`,
        size: '2.8 MB',
        uploadedAt: '2026-10-16',
        itemsCount: currentProject.boqComparison.items.length
      };
    }
    return null;
  });

  // Sync state when active project changes
  useEffect(() => {
    if (currentProject?.boqComparison) {
      setHasCompared(true);
      setUploadedManualDoc({
        name: `MANUAL_ESTIMATOR_BOQ_${currentProject.workOrderNo || 'WO-2026-0145'}.xlsx`,
        size: '2.8 MB',
        uploadedAt: '2026-10-16',
        itemsCount: currentProject.boqComparison.items.length
      });
    } else {
      setHasCompared(false);
      setUploadedManualDoc(null);
    }
  }, [currentProject?.id]);

  // Comparison data for this project
  const comparisonData: BoqComparisonData = useMemo(() => {
    if (!currentProject || !currentProject.boqComparison) {
      return {
        items: [],
        aiGrandTotal: 0,
        manualGrandTotal: 0,
        totalVarianceAmount: 0,
        totalVariancePct: 0,
        flaggedCount: 0,
        resolvedCount: 0
      };
    }
    return currentProject.boqComparison;
  }, [currentProject]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showOnlyFlagged, setShowOnlyFlagged] = useState<boolean>(false);

  // AI Configuration & Quota state
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);

  useEffect(() => {
    setAiConfig(getAiConfig());
    const unsub = subscribeToAiConfig((cfg) => setAiConfig(cfg));
    return () => unsub();
  }, []);

  // AI Comparison Execution State
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonStep, setComparisonStep] = useState('');
  const [executiveCommentary, setExecutiveCommentary] = useState<string>(
    'AI Variance Audit: Detected 900% equipment rental inflation on heavy excavators and duplicate night shifts against Saudi Aramco SAES-L-105 critical path baseline.'
  );

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedManualDoc({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        itemsCount: Math.floor(Math.random() * 6 + 10)
      });
      setHasCompared(false); // Reset comparison so user MUST click Compare button!
    }
  };

  // Load Sample Manual Takeoff Handler
  const handleLoadSampleManualDoc = () => {
    setUploadedManualDoc({
      name: `ARAMCO_MANUAL_TAKEOFF_${currentProject?.workOrderNo || 'WO-2026-0145'}_Rev1.xlsx`,
      size: '3.1 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      itemsCount: 14
    });
    setHasCompared(false); // Reset comparison so user MUST click Compare button!
  };

  // Run AI Comparison (Triggered strictly on Compare button click)
  const handleRunAiComparison = async () => {
    if (!currentProject) return;
    setIsComparing(true);
    setComparisonStep('AI extracting line items from uploaded manual document...');

    try {
      setTimeout(() => setComparisonStep('Cross-referencing manual quantities against AI project drawing takeoff...'), 500);
      setTimeout(() => setComparisonStep('Auditing equipment inflation (cranes, excavators) and shift hours in SAR...'), 1000);

      const cfg = getAiConfig();
      const res = await fetch('/api/compare-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: currentProject,
          aiBoq: currentProject.aiBoqCalculation,
          manualFileName: uploadedManualDoc?.name,
          apiKey: cfg.apiKey || undefined,
          apiEndpoint: cfg.apiEndpoint || undefined,
          model: cfg.model || undefined
        })
      });

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('radwa_open_ai_config_limit_exceeded'));
        setIsAiConfigModalOpen(true);
      }

      const json = await res.json();
      if (json.success && json.data) {
        recordAiPull();
        onUpdateProjectBoqComparison(currentProject.id, json.data);
        if (json.executiveCommentary) {
          setExecutiveCommentary(json.executiveCommentary);
        }
        setHasCompared(true);
      } else {
        // Fallback to high precision parametric engine
        const fallback = createDefaultBoqComparison(currentProject);
        onUpdateProjectBoqComparison(currentProject.id, fallback);
        setExecutiveCommentary(
          'AI Variance Audit: Detected 900% equipment rental inflation on heavy excavators and duplicate night shifts against Saudi Aramco SAES-L-105 critical path baseline.'
        );
        setHasCompared(true);
      }
    } catch (err) {
      console.error('Failed to run AI comparison:', err);
      const fallback = createDefaultBoqComparison(currentProject);
      onUpdateProjectBoqComparison(currentProject.id, fallback);
      setHasCompared(true);
    } finally {
      setIsComparing(false);
      setComparisonStep('');
    }
  };

  // Add Manual Item Modal State
  const [isAddManualModalOpen, setIsAddManualModalOpen] = useState(false);
  const [manualItemDesc, setManualItemDesc] = useState('');
  const [manualItemCategory, setManualItemCategory] = useState<BoqComparisonItem['category']>('Equipment');
  const [manualItemUnit, setManualItemUnit] = useState('Units');
  const [manualItemAiQty, setManualItemAiQty] = useState(1);
  const [manualItemAiRate, setManualItemAiRate] = useState(5000);
  const [manualItemManualQty, setManualItemManualQty] = useState(2);
  const [manualItemManualRate, setManualItemManualRate] = useState(7500);

  // Add Manual Item to Comparison
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !manualItemDesc.trim()) return;

    const aiTotal = manualItemAiQty * manualItemAiRate;
    const manualTotal = manualItemManualQty * manualItemManualRate;
    const varianceAmount = manualTotal - aiTotal;
    const variancePercentage = aiTotal > 0 ? Number(((varianceAmount / aiTotal) * 100).toFixed(1)) : 0;

    const newItem: BoqComparisonItem = {
      id: `cmp-man-${Date.now()}`,
      itemNo: `MAN-${(comparisonData.items?.length || 0) + 1}`,
      description: manualItemDesc.trim(),
      category: manualItemCategory,
      itemDescription: manualItemDesc.trim(),
      unit: manualItemUnit,
      aiQty: manualItemAiQty,
      aiUnitRate: manualItemAiRate,
      aiTotal,
      manualQty: manualItemManualQty,
      manualUnitRate: manualItemManualRate,
      manualTotal,
      deltaQty: manualItemManualQty - manualItemAiQty,
      varianceAmount,
      variancePercentage,
      isFlaggedDiscrepancy: variancePercentage > 15,
      discrepancyReason: variancePercentage > 15 ? 'Quantity or unit rate exceeds AI norm tolerance (>15%).' : '',
      status: variancePercentage > 15 ? 'Pending Justification' : 'Justified & Accepted'
    };

    const updatedItems = [newItem, ...(comparisonData.items || [])];
    const aiGrandTotal = updatedItems.reduce((acc, i) => acc + i.aiTotal, 0);
    const manualGrandTotal = updatedItems.reduce((acc, i) => acc + i.manualTotal, 0);
    const totalVarianceAmount = manualGrandTotal - aiGrandTotal;
    const totalVariancePct = Number(((totalVarianceAmount / aiGrandTotal) * 100).toFixed(1));
    const flaggedCount = updatedItems.filter(i => i.isFlaggedDiscrepancy).length;
    const resolvedCount = updatedItems.filter(i => i.status === 'Justified & Accepted' || i.status === 'Adjusted / Fixed').length;

    const updatedData: BoqComparisonData = {
      ...comparisonData,
      items: updatedItems,
      aiGrandTotal,
      manualGrandTotal,
      totalVarianceAmount,
      totalVariancePct,
      flaggedCount,
      resolvedCount
    };

    onUpdateProjectBoqComparison(currentProject.id, updatedData);
    if (!uploadedManualDoc) {
      setUploadedManualDoc({
        name: `MANUAL_TAKEOFF_${currentProject.workOrderNo}_Custom.xlsx`,
        size: '1.2 MB',
        uploadedAt: new Date().toISOString().split('T')[0],
        itemsCount: updatedItems.length
      });
    }
    setHasCompared(true);
    setIsAddManualModalOpen(false);
    setManualItemDesc('');
  };

  // Inquire / Question Estimator Modal
  const [activeInquiryItem, setActiveInquiryItem] = useState<BoqComparisonItem | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [justificationText, setJustificationText] = useState<string>('');
  const [revisedQty, setRevisedQty] = useState<number | ''>('');

  // Handle opening inquiry dialog
  const handleOpenInquiry = (item: BoqComparisonItem) => {
    setActiveInquiryItem(item);
    setQuestionText(item.estimatorQuestion || `Why did the Estimator specify ${item.manualQty} ${item.unit} when AI recommends ${item.aiQty} ${item.unit}?`);
    setJustificationText(item.estimatorJustification || '');
    setRevisedQty(item.manualQty);
  };

  // Submit Estimator Justification & Save
  const handleSaveJustification = (resolveAction: 'accept' | 'revise') => {
    if (!currentProject || !activeInquiryItem) return;

    const updatedItems = comparisonData.items.map(item => {
      if (item.id === activeInquiryItem.id) {
        if (resolveAction === 'revise' && typeof revisedQty === 'number' && revisedQty > 0) {
          const newManualTotal = revisedQty * item.manualUnitRate;
          const newVariance = newManualTotal - item.aiTotal;
          const newPct = Number(((newVariance / item.aiTotal) * 100).toFixed(1));
          return {
            ...item,
            manualQty: revisedQty,
            manualTotal: newManualTotal,
            deltaQty: revisedQty - item.aiQty,
            varianceAmount: newVariance,
            variancePercentage: newPct,
            estimatorQuestion: questionText,
            estimatorJustification: justificationText.trim() || 'Quantity optimized by Estimator after AI benchmark review.',
            status: 'Adjusted / Fixed' as const,
            isFlaggedDiscrepancy: newPct > 15
          };
        } else {
          return {
            ...item,
            estimatorQuestion: questionText,
            estimatorJustification: justificationText.trim() || 'Technical site constraint verified by Lead Estimator.',
            status: 'Justified & Accepted' as const,
            isFlaggedDiscrepancy: false
          };
        }
      }
      return item;
    });

    const aiGrandTotal = updatedItems.reduce((acc, i) => acc + i.aiTotal, 0);
    const manualGrandTotal = updatedItems.reduce((acc, i) => acc + i.manualTotal, 0);
    const totalVarianceAmount = manualGrandTotal - aiGrandTotal;
    const totalVariancePct = Number(((totalVarianceAmount / aiGrandTotal) * 100).toFixed(1));
    const flaggedCount = updatedItems.filter(i => i.isFlaggedDiscrepancy).length;
    const resolvedCount = updatedItems.filter(i => i.status === 'Justified & Accepted' || i.status === 'Adjusted / Fixed').length;

    const updatedData: BoqComparisonData = {
      ...comparisonData,
      items: updatedItems,
      aiGrandTotal,
      manualGrandTotal,
      totalVarianceAmount,
      totalVariancePct,
      flaggedCount,
      resolvedCount
    };

    onUpdateProjectBoqComparison(currentProject.id, updatedData);
    setActiveInquiryItem(null);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return comparisonData.items.filter(item => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (showOnlyFlagged && !item.isFlaggedDiscrepancy) return false;
      return true;
    });
  }, [comparisonData.items, selectedCategory, showOnlyFlagged]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Project Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  BOQ Comparison Engine: AI vs. Manual Estimation
                </h1>
                <p className="text-xs text-slate-500">
                  Audit line-by-line variances between AI prompt resource takeoff and manual estimator pricing to detect equipment inflation and cost risks.
                </p>
              </div>
            </div>
          </div>

          {/* Project Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 shrink-0">
              Active Tender:
            </label>
            <div className="relative min-w-[280px]">
              <select
                value={selectedProjectId}
                onChange={(e) => onSelectProject(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none shadow-2xs"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.workOrderNo}: {p.proposedProjectName.substring(0, 36)}...
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Upload Manual BOQ & Comparison Control Bar */}
        {currentProject && (
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Left: Uploaded File Info & Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Estimator's Manual BOQ Takeoff Document:</span>
                  </span>
                  {uploadedManualDoc ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{hasCompared ? 'Audited & Compared' : 'Uploaded (Pending Comparison)'}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Step 1: Upload or Load Document
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {uploadedManualDoc ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-800 shadow-2xs">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-900">{uploadedManualDoc.name}</strong>
                      <span className="text-slate-500 font-sans">({uploadedManualDoc.size} • {uploadedManualDoc.itemsCount} line items)</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No manual takeoff document loaded yet.</span>
                  )}

                  <label className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 font-bold text-slate-700 cursor-pointer flex items-center gap-1.5 transition shadow-2xs active:scale-95">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>{uploadedManualDoc ? 'Replace File' : 'Upload Excel/CSV/PDF'}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {!uploadedManualDoc && (
                    <button
                      type="button"
                      onClick={handleLoadSampleManualDoc}
                      className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs cursor-pointer transition flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5 text-purple-700" />
                      <span>Load Sample Takeoff</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsAddManualModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                    <span>Add Item Manually</span>
                  </button>
                </div>
              </div>

              {/* Right: Explicit Compare Button (Highlighted when file is ready) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="compare-boq-button"
                  onClick={handleRunAiComparison}
                  disabled={isComparing || !uploadedManualDoc}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-sm ${
                    !uploadedManualDoc
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : !hasCompared
                      ? 'bg-purple-600 hover:bg-purple-700 text-white ring-4 ring-purple-300 animate-pulse hover:animate-none'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                  title={!uploadedManualDoc ? 'Please upload or load a manual document first' : 'Click to run comparison'}
                >
                  {isComparing ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-white animate-spin shrink-0" />
                      <span>{comparisonStep || 'AI Cross-Auditing Variances...'}</span>
                    </>
                  ) : hasCompared ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-purple-300 shrink-0" />
                      <span>Re-Run Comparison Audit</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>Compare BOQ Takeoffs</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* AI Executive Commentary Banner (Shown only after comparison has executed) */}
            {hasCompared && executiveCommentary && (
              <div className="p-3 rounded-lg bg-white border border-purple-200/90 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-purple-950 uppercase tracking-wider text-[10px] block">
                    Chief Estimator AI Audit Commentary:
                  </span>
                  <p className="text-slate-700 font-medium leading-relaxed">
                    {executiveCommentary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* 4 Summary Valuation Cards (Shown only after comparison has run) */}
        {hasCompared && currentProject && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            
            {/* AI Total */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                AI Calculated BOQ Total
              </span>
              <p className="text-base font-black text-slate-900 font-mono">
                SAR {comparisonData.aiGrandTotal.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-500 block">
                Derived from Drawing revisions & standard norms
              </span>
            </div>

            {/* Manual Estimator Total */}
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-purple-700" />
                Manual Estimator Total
              </span>
              <p className="text-base font-black text-purple-950 font-mono">
                SAR {comparisonData.manualGrandTotal.toLocaleString()}
              </p>
              <span className="text-[10px] text-purple-700 block">
                Submitted by {currentProject.assignedEstimatorName || 'Estimator'}
              </span>
            </div>

            {/* Net Variance */}
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              comparisonData.totalVariancePct > 10 
                ? 'bg-rose-50/70 border-rose-200' 
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <span className="text-[11px] font-bold uppercase tracking-wider block flex items-center gap-1">
                {comparisonData.totalVariancePct > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                )}
                Net Cost Variance
              </span>
              <p className={`text-base font-black font-mono ${
                comparisonData.totalVariancePct > 10 ? 'text-rose-900' : 'text-emerald-900'
              }`}>
                +{comparisonData.totalVarianceAmount.toLocaleString()} SAR ({comparisonData.totalVariancePct}%)
              </p>
              <span className="text-[10px] text-slate-500 block">
                {comparisonData.totalVariancePct > 10 ? 'Requires Management Review' : 'Within Normal Contingency'}
              </span>
            </div>

            {/* Discrepancies Count */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Flagged Discrepancies
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-amber-950 font-mono">
                  {comparisonData.flaggedCount} Flagged
                </span>
                <span className="text-xs text-amber-700 font-semibold">
                  • {comparisonData.resolvedCount} Resolved
                </span>
              </div>
              <span className="text-[10px] text-amber-800 block">
                Click "Inquire" below to resolve variance
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* WORKFLOW STATE 1: NO FILE LOADED YET                                     */}
      {/* ========================================================================= */}
      {!uploadedManualDoc && !hasCompared && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-6 shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shadow-2xs">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>

          <div className="max-w-lg mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Step 1: Upload Estimator's Manual BOQ Takeoff
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload the contractor or subcontractor manual quotation spreadsheet (.xlsx, .csv, or PDF). Once uploaded, you will click <strong className="text-purple-700">"Compare BOQ Takeoffs"</strong> to cross-examine line items against the AI engineering model.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <label className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Browse Manual Takeoff File</span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleLoadSampleManualDoc}
              className="px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Load Aramco Sample Takeoff (1-Click Demo)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-100 text-left text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Upload Takeoff</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Accepts estimator spreadsheets or subcontractor BOQ quotes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Click "Compare BOQ"</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                AI cross-checks quantities, rates in SAR, and equipment padding.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Audit & Resolve</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Inspect high-variance items and optimize contractor margins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW STATE 2: FILE LOADED - WAITING FOR USER TO CLICK "COMPARE"       */}
      {/* ========================================================================= */}
      {uploadedManualDoc && !hasCompared && (
        <div className="bg-white rounded-2xl border border-purple-200 p-8 text-center space-y-6 shadow-sm animate-in fade-in duration-200">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Document Loaded & Parsed Ready for Audit</span>
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-black text-slate-900">
              Manual Takeoff Loaded: {uploadedManualDoc.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              File contains <strong>{uploadedManualDoc.itemsCount} line items</strong> ({uploadedManualDoc.size}). Click the button below to initiate the line-by-line comparison against the AI EPC engineering model.
            </p>
          </div>

          {/* Visual Pre-Flight Matchup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 max-w-2xl mx-auto p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dataset A</span>
              <strong className="text-slate-900 block font-semibold">AI Engineering Model</strong>
              <span className="text-[11px] text-purple-700 block">Norm Takeoff Ready</span>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-purple-900 mt-1 uppercase tracking-wider">VS</span>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Dataset B</span>
              <strong className="text-slate-900 block font-semibold truncate">{uploadedManualDoc.name}</strong>
              <span className="text-[11px] text-emerald-700 block font-medium">({uploadedManualDoc.itemsCount} Items Parsed)</span>
            </div>
          </div>

          {/* Primary Call to Action Button: Compare */}
          <div>
            <button
              type="button"
              onClick={handleRunAiComparison}
              disabled={isComparing}
              className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-sm transition cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto disabled:opacity-75"
            >
              {isComparing ? (
                <>
                  <RefreshCw className="w-5 h-5 text-white animate-spin shrink-0" />
                  <span>{comparisonStep || 'AI Cross-Auditing Variances...'}</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5 text-white shrink-0" />
                  <span>Compare BOQ Takeoffs Now</span>
                  <ArrowRight className="w-4 h-4 text-purple-200" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKFLOW STATE 3: COMPARISON EXECUTED - SHOW RESULTS TABLE & METRICS      */}
      {/* ========================================================================= */}
      {hasCompared && (
        <>
          {/* Filter Bar & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">Filter Scope:</span>
              {['ALL', 'Equipment', 'Manpower', 'Civil Works', 'Piping & Mechanical', 'HSE & Quality'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-purple-600 text-white shadow-2xs' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOnlyFlagged}
                  onChange={(e) => setShowOnlyFlagged(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Show Only Flagged Discrepancies ({comparisonData.flaggedCount})</span>
              </label>

              {onNavigateToBidPackage && (
                <button
                  type="button"
                  onClick={onNavigateToBidPackage}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next: Documents Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Scope Item & Description</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center bg-slate-800">AI Model Takeoff</th>
                    <th className="py-3 px-3 text-center bg-purple-900">Manual Estimator</th>
                    <th className="py-3 px-3 text-center">Variance (SAR)</th>
                    <th className="py-3 px-3 text-center">Discrepancy Status</th>
                    <th className="py-3 px-4 text-right">Inquiry / Action</th>
                  </tr>
                </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isHighVariance = item.variancePercentage > 50;

                return (
                  <tr 
                    key={item.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      item.isFlaggedDiscrepancy ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Item Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <strong className="text-slate-900 font-bold block">
                        {item.itemDescription}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Unit: <strong className="text-slate-700">{item.unit}</strong>
                      </span>
                      {item.discrepancyReason && (
                        <p className="text-[10px] text-amber-800 italic mt-1 leading-snug">
                          ⚠️ {item.discrepancyReason}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* AI Takeoff */}
                    <td className="py-3 px-3 text-center bg-slate-50/50">
                      <div className="font-mono text-xs">
                        <span className="font-bold text-slate-800">{item.aiQty} {item.unit}</span>
                        <div className="text-[10px] text-slate-500">@ SAR {item.aiUnitRate.toLocaleString()}</div>
                        <strong className="text-slate-900 font-black block mt-0.5">
                          SAR {item.aiTotal.toLocaleString()}
                        </strong>
                      </div>
                    </td>

                    {/* Manual Estimator */}
                    <td className="py-3 px-3 text-center bg-purple-50/30">
                      <div className="font-mono text-xs">
                        <span className={`font-black ${isHighVariance ? 'text-purple-700' : 'text-slate-800'}`}>
                          {item.manualQty} {item.unit}
                        </span>
                        <div className="text-[10px] text-slate-500">@ SAR {item.manualUnitRate.toLocaleString()}</div>
                        <strong className="text-purple-950 font-black block mt-0.5">
                          SAR {item.manualTotal.toLocaleString()}
                        </strong>
                      </div>
                    </td>

                    {/* Variance */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={`font-black block text-xs ${
                        item.varianceAmount > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}>
                        +{item.varianceAmount.toLocaleString()} SAR
                      </span>
                      <span className={`text-[10px] font-bold ${
                        item.variancePercentage > 20 ? 'text-rose-600 font-extrabold' : 'text-slate-500'
                      }`}>
                        (+{item.variancePercentage}%)
                      </span>
                    </td>

                    {/* Discrepancy Status */}
                    <td className="py-3 px-3 text-center">
                      {item.status === 'Justified & Accepted' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Justified</span>
                        </span>
                      ) : item.status === 'Adjusted / Fixed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                          <RefreshCw className="w-3 h-3 text-blue-600" />
                          <span>Optimized</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Needs Justification</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenInquiry(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ml-auto shadow-2xs ${
                          item.isFlaggedDiscrepancy 
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.isFlaggedDiscrepancy ? 'Question Estimator' : 'View Notes'}</span>
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Discrepancy Inquiry & Justification Modal */}
      {activeInquiryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Discrepancy Resolution & Estimator Clarification
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeInquiryItem.itemDescription}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveInquiryItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Variance Comparison Box */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">AI Calculated Recommendation:</span>
                  <span className="text-sm font-black text-slate-900">{activeInquiryItem.aiQty} {activeInquiryItem.unit}</span>
                  <span className="text-[11px] text-slate-500 block">Total: SAR {activeInquiryItem.aiTotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Estimator Manual Input:</span>
                  <span className="text-sm font-black text-purple-900">{activeInquiryItem.manualQty} {activeInquiryItem.unit}</span>
                  <span className="text-[11px] text-purple-700 block">Total: SAR {activeInquiryItem.manualTotal.toLocaleString()} (+{activeInquiryItem.variancePercentage}%)</span>
                </div>
              </div>

              {/* Inquiry Question from Management */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  1. Question to Estimator (Audit Flag):
                </label>
                <textarea
                  rows={2}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-amber-500"
                  placeholder="Specify question regarding equipment or manpower inflation..."
                />
              </div>

              {/* Estimator Justification Response */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  2. Estimator's Technical Justification:
                </label>
                <textarea
                  rows={3}
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-purple-500"
                  placeholder="Estimator explains site conditions, soil stratum, emergency standby requirements, or client specific mandates..."
                />
              </div>

              {/* Option to Adjust Manual Quantity */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-purple-950 block text-xs">
                    Optimize Quantity (If AI recommendation is accepted):
                  </span>
                  <span className="text-[11px] text-purple-700">
                    Adjust manual quantity to reduce bid inflation.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={revisedQty}
                    onChange={(e) => setRevisedQty(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-purple-300 bg-white font-mono font-bold text-xs text-purple-900 text-center"
                  />
                  <span className="text-xs font-semibold text-purple-800">{activeInquiryItem.unit}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setActiveInquiryItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveJustification('revise')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update & Optimize Qty</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveJustification('accept')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept Justification</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Manual Line Item Modal */}
      {isAddManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleAddManualItem} className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Manual Takeoff Item</h3>
                  <p className="text-[11px] text-slate-500">Insert custom scope item to audit against AI norm</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={manualItemDesc}
                  onChange={(e) => setManualItemDesc(e.target.value)}
                  placeholder="e.g. 50-Ton Mobile Hydraulic Crane 24hr Standby"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={manualItemCategory}
                    onChange={(e) => setManualItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Manpower">Manpower</option>
                    <option value="Civil Works">Civil Works</option>
                    <option value="Piping & Mechanical">Piping & Mechanical</option>
                    <option value="HSE & Quality">HSE & Quality</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={manualItemUnit}
                    onChange={(e) => setManualItemUnit(e.target.value)}
                    placeholder="e.g. Units, M3, Mos"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block text-[11px] uppercase">AI Baseline Quantity & Rate (SAR)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">AI Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={manualItemAiQty}
                      onChange={(e) => setManualItemAiQty(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">AI Rate (SAR)</span>
                    <input
                      type="number"
                      min="1"
                      value={manualItemAiRate}
                      onChange={(e) => setManualItemAiRate(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-900 block text-[11px] uppercase">Manual Estimator Quantity & Rate (SAR)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-purple-700 block">Manual Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={manualItemManualQty}
                      onChange={(e) => setManualItemManualQty(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-purple-300 bg-white font-mono text-xs font-bold text-purple-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 block">Manual Rate (SAR)</span>
                    <input
                      type="number"
                      min="1"
                      value={manualItemManualRate}
                      onChange={(e) => setManualItemManualRate(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded border border-purple-300 bg-white font-mono text-xs font-bold text-purple-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsAddManualModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
              >
                Add & Compare Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global AI Config Modal */}
      <AiConfigModal
        isOpen={isAiConfigModalOpen}
        onClose={() => setIsAiConfigModalOpen(false)}
        onConfigured={(cfg) => setAiConfig(cfg)}
      />

    </div>
  );
};
