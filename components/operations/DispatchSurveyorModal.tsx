'use client';

import React, { useState } from 'react';
import { 
  X, 
  HardHat, 
  Calendar, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Layers, 
  Compass,
  Clock,
  Sparkles
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, Surveyor } from '../../types/crm';

interface DispatchSurveyorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  surveyors: Surveyor[];
  onDispatchSurveyor: (projectId: string, updatedRequest: SiteSurveyRequest, surveyorId: string) => void;
}

export const DispatchSurveyorModal: React.FC<DispatchSurveyorModalProps> = ({
  isOpen,
  onClose,
  project,
  surveyors,
  onDispatchSurveyor
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const surveyRequest = project.surveyRequest;

  // Selected surveyor default logic (preselect first available or matching zone)
  const [selectedSurveyorId, setSelectedSurveyorId] = useState<string>(() => {
    if (surveyRequest.assignedSurveyorId) return surveyRequest.assignedSurveyorId;
    const matchingZone = surveyors.find(s => 
      project.projectLocation.toLowerCase().includes('jubail') && s.assignedZone.toLowerCase().includes('jubail') ||
      project.projectLocation.toLowerCase().includes('yanbu') && s.assignedZone.toLowerCase().includes('yanbu')
    );
    if (matchingZone) return matchingZone.id;
    const available = surveyors.find(s => s.capacityStatus === 'Available');
    return available ? available.id : (surveyors[0]?.id || '');
  });

  const [targetDate, setTargetDate] = useState<string>(
    surveyRequest.targetSurveyDate || 
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split('T')[0];
    })()
  );

  const [opsNotes, setOpsNotes] = useState<string>(
    surveyRequest.opsNotes || 
    'Take Total Station GPS RTK equipment. Verify underground utility markings with Aramco site representative before excavation profiling.'
  );

  const [specialEquipment, setSpecialEquipment] = useState<string[]>([
    'GPS RTK Total Station',
    'Ground Penetrating Radar (GPR)',
    '4-Gas Personal H2S Detectors'
  ]);

  const EQUIPMENT_OPTIONS = [
    'GPS RTK Total Station',
    'Ground Penetrating Radar (GPR)',
    '4-Gas Personal H2S Detectors',
    'Ultrasonic Pipe Thickness Gauge',
    'Laser 3D Scanner & Drone LiDaR',
    'Dynamic Cone Penetrometer (Soil Test)'
  ];

  const toggleEquipment = (eq: string) => {
    setSpecialEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedSurveyor = surveyors.find(s => s.id === selectedSurveyorId);
    if (!assignedSurveyor) return;

    const updatedRequest: SiteSurveyRequest = {
      ...surveyRequest,
      assignedSurveyorId: assignedSurveyor.id,
      assignedSurveyorName: assignedSurveyor.name,
      targetSurveyDate: targetDate,
      status: 'Surveyor Dispatched',
      opsNotes: [
        opsNotes.trim(),
        specialEquipment.length > 0 ? `Required Equipment: ${specialEquipment.join(', ')}` : ''
      ].filter(Boolean).join(' | ')
    };

    onDispatchSurveyor(project.id, updatedRequest, assignedSurveyor.id);
    onClose();
  };

  const selectedSurveyor = surveyors.find(s => s.id === selectedSurveyorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {project.workOrderNo}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Step 3: Surveyor Handover
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Assign & Handover Survey Dossier to Field Surveyor
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Handover Dossier Package Banner */}
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border-b border-slate-200 px-6 py-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Project / Tender</span>
              <span className="font-bold text-slate-900 text-sm">{project.proposedProjectName}</span>
              <span className="text-slate-500 block text-[11px]">{project.clientName} • {project.projectLocation}</span>
            </div>

            {/* Handover bundle badges */}
            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Estimator Report Attached</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 shadow-2xs text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{surveyRequest.checklist.length} AI Checkpoints</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmDispatch} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {/* Surveyor Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2">
              Select Certified Field Surveyor *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {surveyors.map((surv) => {
                const isSelected = selectedSurveyorId === surv.id;
                const isAvailable = surv.capacityStatus === 'Available';

                return (
                  <div
                    key={surv.id}
                    onClick={() => setSelectedSurveyorId(surv.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${surv.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                            {surv.initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{surv.name}</p>
                            <p className="text-[10px] text-slate-500">{surv.role}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {surv.capacityStatus}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 mt-2">
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Zone: <strong>{surv.assignedZone}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{surv.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Active surveys: <strong>{surv.activeSurveys}</strong></span>
                      {isSelected && (
                        <span className="text-blue-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Survey Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Target On-Site Inspection Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Field report expected back within 24 hours of site inspection.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Urgency Tier
              </label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{surveyRequest.urgency}</span>
                <span className="text-[11px] text-slate-500">Requested by: {surveyRequest.requestedByEstimatorName}</span>
              </div>
            </div>
          </div>

          {/* Special Equipment Required */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Field Equipment to Allocate
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => {
                const isSelected = specialEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{eq}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational Notes / Dispatch Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Field Operations Instructions & Gate Pass Notes
            </label>
            <textarea
              rows={3}
              value={opsNotes}
              onChange={(e) => setOpsNotes(e.target.value)}
              placeholder="Instructions for the surveyor regarding client site contacts, safety permits, or specific tie-in measurements..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            {selectedSurveyor ? (
              <span>Deploying <strong>{selectedSurveyor.name}</strong> to {project.projectLocation}.</span>
            ) : (
              <span>Please select a surveyor to deploy.</span>
            )}
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
              onClick={handleConfirmDispatch}
              disabled={!selectedSurveyorId}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Handover Dossier & Dispatch Surveyor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
