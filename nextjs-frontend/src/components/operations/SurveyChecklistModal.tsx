'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Save, 
  Camera, 
  FileText, 
  HardHat, 
  MapPin, 
  CheckCircle, 
  Layers, 
  Send,
  RefreshCw
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, SurveyChecklistItem } from '../../types/crm';
import { getAiConfig, recordAiPull } from '../../utils/aiConfig';

interface SurveyChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onSaveChecklist: (projectId: string, updatedRequest: SiteSurveyRequest) => void;
}

const DEFAULT_AI_CHECKLIST_TEMPLATES: Omit<SurveyChecklistItem, 'id'>[] = [
  {
    category: 'Safety & Site Access',
    item: 'Plant Cold/Hot Work PTW & Safety Induction Level',
    description: 'Verify client/facility permit-to-work requirements, security clearance, and mandatory safety orientation courses before crew mobilization.',
    status: 'Pending Verification',
    riskLevel: 'Medium',
    photoRequired: false,
    findings: 'Aramco SAP work permit receiver required on site at all times during work.'
  },
  {
    category: 'Safety & Site Access',
    item: 'H2S Gas Detection & Escape Breathing Apparatus (EEBA)',
    description: 'Assess if working in designated toxic H2S release zones. Confirm stationary detectors and personal wireless gas monitors.',
    status: 'Pending Verification',
    riskLevel: 'High',
    photoRequired: true,
    findings: 'Zone 2 classified area. Continuous personal 4-gas detector mandatory.'
  },
  {
    category: 'Terrain & Soil Conditions',
    item: 'Soil Bearing Capacity & Plate Load Test Spots',
    description: 'Inspect subgrade compaction, presence of loose sabkha or karst cavities, and locate 3 test boreholes for foundation design.',
    status: 'Pending Verification',
    riskLevel: 'High',
    photoRequired: true,
    findings: 'Surface sabkha soil requires minimum 1.5m geotextile and sub-base stabilization.'
  },
  {
    category: 'Terrain & Soil Conditions',
    item: 'Groundwater Table Depth & Dewatering Requirement',
    description: 'Measure existing water table elevation to determine if well-point dewatering or continuous sump pumping is required during deep piping trenches.',
    status: 'Pending Verification',
    riskLevel: 'Medium',
    photoRequired: true,
    findings: 'Water table detected at 1.8m below natural ground level.'
  },
  {
    category: 'Underground Utilities',
    item: 'Ground Penetrating Radar (GPR) Multi-Frequency Scan',
    description: 'Conduct 100% GPR and electromagnetic pipe/cable locator scan across entire pipeline corridor to flag unrecorded live buried lines.',
    status: 'Pending Verification',
    riskLevel: 'High',
    photoRequired: true,
    findings: 'Two high-voltage 33kV direct-buried cables identified crossing the proposed trench corridor at chainage 0+320.'
  },
  {
    category: 'Underground Utilities',
    item: 'Cathodic Protection (CP) Test Stations & Anode Beds',
    description: 'Locate existing deep well anode groundbeds and verify electrical isolation joints to prevent induced DC interference.',
    status: 'Pending Verification',
    riskLevel: 'Low',
    photoRequired: false,
    findings: 'Existing impressed current CP system running at -1.15V CSE.'
  },
  {
    category: 'Tie-in & Battery Limits',
    item: 'Flange Face Rating, Nominal Bore & Wall Thickness (UT)',
    description: 'Physically caliper flange OD, bolt circle, ANSI class (#300/#600 RTJ or RF), and conduct ultrasonic thickness testing on existing header.',
    status: 'Pending Verification',
    riskLevel: 'High',
    photoRequired: true,
    findings: 'Tie-in nozzle N-01 is 12" ASME Class 300 WNRF Sch 40 Carbon Steel.'
  },
  {
    category: 'Tie-in & Battery Limits',
    item: 'Elevation & Exact GPS Coordinates of Manifold Flange',
    description: 'Verify 3D coordinates (Easting, Northing, Elevation) with RTK GPS against IFC engineering plot plan to prevent spool pre-fab misalignment.',
    status: 'Pending Verification',
    riskLevel: 'Medium',
    photoRequired: true,
    findings: 'Coordinates match within ±5mm tolerance of preliminary client drawing.'
  },
  {
    category: 'Logistics & Laydown',
    item: 'Heavy Mobile Crane (150T+) Outrigger Soil Pad Compaction',
    description: 'Verify access road turning radius for 40ft lowboy trailers and check soil bearing under 4 outrigger pads for heavy vessel lifting.',
    status: 'Pending Verification',
    riskLevel: 'High',
    photoRequired: true,
    findings: 'Crane setup location confirmed firm; requires 20mm steel mats under each outrigger.'
  },
  {
    category: 'Logistics & Laydown',
    item: 'Secure Material Staging Yard & Fabrication Laydown Area',
    description: 'Confirm available square meters for pipe spool laydown, security perimeter fencing, site office trailers, and temporary power generator hookup.',
    status: 'Pending Verification',
    riskLevel: 'Low',
    photoRequired: false,
    findings: '4,500 m² graded laydown area allocated near gate #3.'
  }
];

export const SurveyChecklistModal: React.FC<SurveyChecklistModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveChecklist
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const surveyRequest = project.surveyRequest;
  const [checklist, setChecklist] = useState<SurveyChecklistItem[]>(() => {
    if (surveyRequest.checklist && surveyRequest.checklist.length > 0) {
      return surveyRequest.checklist;
    }
    // Generate initial items
    return DEFAULT_AI_CHECKLIST_TEMPLATES.map((item, idx) => ({
      ...item,
      id: `chk-${Date.now()}-${idx}`
    }));
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAnalysisLog, setAiAnalysisLog] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New item draft state
  const [newItemCategory, setNewItemCategory] = useState<SurveyChecklistItem['category']>('Safety & Site Access');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemRisk, setNewItemRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newItemPhoto, setNewItemPhoto] = useState(true);

  const categories: ('All' | SurveyChecklistItem['category'])[] = [
    'All',
    'Safety & Site Access',
    'Terrain & Soil Conditions',
    'Underground Utilities',
    'Tie-in & Battery Limits',
    'Logistics & Laydown'
  ];

  // AI Checklist Generation from Tender Documents & Drawings
  const handleRegenerateAi = async () => {
    setIsGeneratingAi(true);
    const docsCount = project.attachedFiles?.length || 0;
    const docsNames = (project.attachedFiles || []).map(f => f.name).join(', ');

    setAiAnalysisLog([
      `Scanning ${docsCount} Attached Tender Documents & Drawings (${docsNames || 'Standard RFQ Specs'})...`,
      `Parsing engineering disciplines: ${project.sowScopes.join(', ')}...`,
      `Checking site hazard classification for ${project.projectLocation}...`,
      `Connecting to AI Engine for Saudi Aramco & RC compliance review...`,
      'Generating tailored reconnaissance checkpoints...'
    ]);

    try {
      const aiConfig = getAiConfig();
      const res = await fetch('/api/generate-survey-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          apiKey: aiConfig.apiKey,
          apiEndpoint: aiConfig.apiEndpoint,
          model: aiConfig.model
        })
      });

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('radwa_open_ai_config_limit_exceeded'));
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.checklist) && json.checklist.length > 0) {
        recordAiPull();
        setChecklist(json.checklist);
        setAiAnalysisLog(prev => [
          ...prev,
          `Generated ${json.checklist.length} verified inspection checkpoints via ${json.source === 'openai' ? 'OpenAI GPT' : 'Parametric EPC Engine'}.`
        ]);
      }
    } catch (err: any) {
      console.error('Failed to generate AI checklist:', err);
      setAiAnalysisLog(prev => [...prev, `API Error: ${err?.message || 'Check connection'}. Fallback applied.`]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Status update on checklist item
  const handleUpdateItemStatus = (id: string, status: SurveyChecklistItem['status']) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  // Risk level update
  const handleUpdateRisk = (id: string, riskLevel: 'Low' | 'Medium' | 'High') => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, riskLevel } : item))
    );
  };

  // Findings text update
  const handleUpdateFindings = (id: string, findings: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, findings } : item))
    );
  };

  // Delete checklist item
  const handleDeleteItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem: SurveyChecklistItem = {
      id: `custom-chk-${Date.now()}`,
      category: newItemCategory,
      item: newItemTitle.trim(),
      description: newItemDesc.trim() || 'Custom on-site verification checkpoint defined by Operations.',
      status: 'Pending Verification',
      riskLevel: newItemRisk,
      photoRequired: newItemPhoto,
      findings: ''
    };

    setChecklist(prev => [newItem, ...prev]);
    setNewItemTitle('');
    setNewItemDesc('');
    setShowAddForm(false);
  };

  // Save checklist and advance status
  const handleSaveAndApprove = (newStatus: SiteSurveyRequest['status'] = 'Checklist Ready') => {
    const updatedRequest: SiteSurveyRequest = {
      ...surveyRequest,
      status: newStatus,
      checklist
    };

    onSaveChecklist(project.id, updatedRequest);
    onClose();
  };

  // Filtered items
  const filteredItems = checklist.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const compliantCount = checklist.filter(i => i.status === 'Compliant / Verified').length;
  const riskCount = checklist.filter(i => i.status === 'Risk / Hazard Detected').length;
  const pendingCount = checklist.filter(i => i.status === 'Pending Verification').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {project.workOrderNo}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  surveyRequest.urgency === 'Critical 48h'
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : surveyRequest.urgency === 'Urgent'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  Urgency: {surveyRequest.urgency}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Status: {surveyRequest.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                AI Site Survey Checklist & Hazard Evaluation
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerateAi}
              disabled={isGeneratingAi}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Analyzing Project...' : 'Re-Generate AI Checklist'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Context & Request Details Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Project & Client</span>
            <span className="font-bold text-slate-800 text-sm block truncate">{project.proposedProjectName}</span>
            <span className="text-slate-500 font-medium">{project.clientName} • {project.projectLocation}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Estimator Request Reason</span>
            <p className="text-slate-700 text-[11px] line-clamp-2 italic">
              {surveyRequest.surveyReason || 'General site topography, underground utility validation and tie-in survey.'}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Checklist Stats</span>
              <div className="flex items-center gap-2 mt-0.5 font-semibold text-[11px]">
                <span className="text-emerald-700 font-bold">{compliantCount} Compliant</span>
                <span className="text-slate-300">•</span>
                <span className="text-rose-700 font-bold">{riskCount} Risks Flagged</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-700 font-bold">{pendingCount} Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Processing Banner */}
        {isGeneratingAi && (
          <div className="bg-amber-500/10 border-b border-amber-200 px-6 py-3 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-600 animate-spin" />
            <div className="space-y-0.5 text-xs">
              <p className="font-bold text-amber-900">Radwa Construction AI is synthesizing site survey requirements...</p>
              <p className="text-[11px] text-amber-700">{aiAnalysisLog[aiAnalysisLog.length - 1]}</p>
            </div>
          </div>
        )}

        {/* Categories Bar & Quick Filter */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Actions & Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Compliant / Verified">Compliant / Verified</option>
              <option value="Risk / Hazard Detected">Risk / Hazard Detected</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
          </div>
        </div>

        {/* Add Custom Item Inline Form */}
        {showAddForm && (
          <form onSubmit={handleAddCustomItem} className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3 animate-in fade-in duration-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-600" />
                Add Custom Survey Checkpoint
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="Safety & Site Access">Safety & Site Access</option>
                  <option value="Terrain & Soil Conditions">Terrain & Soil Conditions</option>
                  <option value="Underground Utilities">Underground Utilities</option>
                  <option value="Tie-in & Battery Limits">Tie-in & Battery Limits</option>
                  <option value="Logistics & Laydown">Logistics & Laydown</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inspection Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Verify 132kV overhead transmission line sag clearance..."
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Description / SOP Instructions</label>
                <input
                  type="text"
                  placeholder="Instructions for the surveyor on ground..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Risk Level</label>
                  <select
                    value={newItemRisk}
                    onChange={(e) => setNewItemRisk(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={newItemPhoto}
                    onChange={(e) => setNewItemPhoto(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Photo Required</span>
                </label>

                <button
                  type="submit"
                  className="mt-4 ml-auto px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Add Item
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Checklist Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <HardHat className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">No checklist items in this category or status filter</p>
              <p className="text-xs text-slate-400 mt-1">Try switching categories or clicking "Re-Generate AI Checklist"</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isCompliant = item.status === 'Compliant / Verified';
              const isRisk = item.status === 'Risk / Hazard Detected';
              const isPending = item.status === 'Pending Verification';

              return (
                <div 
                  key={item.id} 
                  className={`pt-3 first:pt-0 rounded-xl p-3.5 transition-all border ${
                    isRisk 
                      ? 'bg-rose-50/40 border-rose-200' 
                      : isCompliant 
                      ? 'bg-emerald-50/30 border-emerald-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                        #{index + 1}
                      </span>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {item.item}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.riskLevel === 'High'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            Risk: {item.riskLevel}
                          </span>

                          {item.photoRequired && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              Photo Req
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Inline Findings & Notes */}
                        <div className="pt-2">
                          <input
                            type="text"
                            value={item.findings || ''}
                            onChange={(e) => handleUpdateFindings(item.id, e.target.value)}
                            placeholder="Add surveyor findings, measured dimensions, or ground observations..."
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs text-slate-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions Dropdown */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateItemStatus(item.id, e.target.value as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isCompliant
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : isRisk
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : isPending
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Pending Verification">Pending Verification</option>
                        <option value="Compliant / Verified">Compliant / Verified</option>
                        <option value="Risk / Hazard Detected">Risk / Hazard Detected</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete checkpoint"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{checklist.length}</span> total checklist points synthesized for field execution.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndApprove('Pending AI Checklist')}
              className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndApprove('Checklist Ready')}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Checklist & Ready for Dispatch</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
