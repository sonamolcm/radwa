'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Upload, 
  FileText, 
  Send, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  HardHat, 
  Plus, 
  Trash2,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { ProjectRFQ, SiteSurveyRequest, SurveyChecklistItem } from '../../types/crm';

interface FieldInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  onSubmitSurvey: (
    projectId: string, 
    updatedRequest: SiteSurveyRequest, 
    observations: string,
    checklist: SurveyChecklistItem[]
  ) => void;
}

export const FieldInspectionModal: React.FC<FieldInspectionModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmitSurvey
}) => {
  if (!isOpen || !project || !project.surveyRequest) return null;

  const req = project.surveyRequest;

  // Local state for items
  const [checklist, setChecklist] = useState<SurveyChecklistItem[]>(() => {
    return req.checklist.map(item => ({
      ...item,
      // If still pending, default to Compliant for ease of field verification
      status: item.status === 'Pending Verification' ? 'Compliant / Verified' : item.status,
      findings: item.findings || ''
    }));
  });

  // Observations textarea
  const [observations, setObservations] = useState<string>(
    req.surveyorObservations || 
    `• Field walkthrough executed across 1.8km pipeline corridor with GPS RTK positioning.\n` +
    `• Tie-in nozzle flange condition inspected: ASME B16.5 Class 300# confirmed with zero pitting or corrosion.\n` +
    `• Underground GPR survey verified 2 buried high-voltage cables at Ch 0+320; 1.5m hand-excavation buffer recommended.\n` +
    `• Soil plate load test confirmed 195 kPa bearing capacity on existing compacted sand. Laydown area is ready.`
  );

  // Photo attachments state
  const [photos, setPhotos] = useState<Array<{ id: string; name: string; url: string; time: string }>>([
    {
      id: 'p1',
      name: 'Tie-In_Nozzle_Ultrasonic_Scan.jpg',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80',
      time: '10:45 AM (Geotagged)'
    },
    {
      id: 'p2',
      name: 'GPR_Utility_Crossings_Ch0+320.jpg',
      url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
      time: '11:15 AM (Geotagged)'
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Handle status update per item
  const handleItemStatusChange = (id: string, newStatus: SurveyChecklistItem['status']) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // Handle findings text per item
  const handleItemFindingsChange = (id: string, findingsText: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, findings: findingsText } : item));
  };

  // Quick fill sample photo
  const handleAddSamplePhoto = () => {
    const newP = {
      id: `p-${Date.now()}`,
      name: `Site_Field_Photo_${checklist.length + 1}.jpg`,
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Geotagged)`
    };
    setPhotos(prev => [...prev, newP]);
  };

  // Submit Survey Done handler
  const handleSurveyDone = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toISOString();
    const updatedRequest: SiteSurveyRequest = {
      ...req,
      status: 'Survey Submitted',
      surveyorSubmittedAt: timestamp,
      surveyorObservations: observations,
      checklist: checklist,
      opsNotes: `${req.opsNotes ? req.opsNotes + ' | ' : ''}Survey findings submitted by ${req.assignedSurveyorName || 'Surveyor'}`
    };

    onSubmitSurvey(project.id, updatedRequest, observations, checklist);
    onClose();
  };

  const categories = ['All', ...Array.from(new Set(checklist.map(c => c.category)))];
  const filteredItems = activeCategory === 'All' 
    ? checklist 
    : checklist.filter(c => c.category === activeCategory);

  const verifiedCount = checklist.filter(c => c.status === 'Compliant / Verified').length;
  const hazardCount = checklist.filter(c => c.status === 'Risk / Hazard Detected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {project.workOrderNo}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Ground Site Inspection & Verification Form
                </span>
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

        {/* Content Body */}
        <form onSubmit={handleSurveyDone} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Progress / Status Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Checkpoints</span>
              <strong className="text-lg font-black text-slate-900">{checklist.length}</strong>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">Verified Compliant</span>
              <strong className="text-lg font-black text-emerald-700">{verifiedCount}</strong>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-700 uppercase block">Hazards Detected</span>
              <strong className="text-lg font-black text-rose-700">{hazardCount}</strong>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[11px] font-bold text-teal-700 uppercase block">Evidence Photos</span>
              <strong className="text-lg font-black text-teal-700">{photos.length}</strong>
            </div>
          </div>

          {/* Checklist Verification Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. Verify Technical Checkpoints
                </h3>
                <p className="text-xs text-slate-500">
                  Mark each item according to your observations and take measured values
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
                      activeCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Checklist Items Stream */}
            <div className="space-y-2.5">
              {filteredItems.map((item, idx) => {
                const isCompliant = item.status === 'Compliant / Verified';
                const isHazard = item.status === 'Risk / Hazard Detected';
                const isNa = item.status === 'Not Applicable';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      isHazard 
                        ? 'bg-rose-50/50 border-rose-300' 
                        : isCompliant 
                        ? 'bg-white border-slate-200 hover:border-slate-300' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                            {item.category}
                          </span>
                          {item.photoRequired && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                              📷 Photo Req
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {item.item}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'Compliant / Verified')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                            isCompliant
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'Risk / Hazard Detected')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
                            isHazard
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Hazard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleItemStatusChange(item.id, 'Not Applicable')}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                            isNa
                              ? 'bg-slate-700 text-white border-slate-800'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>

                    {/* Findings & Measured Values Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Log measured values, laser coordinates, or specific field condition..."
                        value={item.findings || ''}
                        onChange={(e) => handleItemFindingsChange(item.id, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Observations & Field Findings (User Request Core Requirement) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 block">
                2. Surveyor's Overall Ground Observations & Findings
              </label>
              <span className="text-[11px] text-slate-500">
                Transferred directly to Operations & Estimator
              </span>
            </div>

            <textarea
              rows={4}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Type your field findings, access constraints, soil conditions, underground utility clashes, or any specific remarks for the Operations department and Estimator..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono leading-relaxed shadow-2xs"
              required
            />
          </div>

          {/* Photo Evidence & Attachments */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  3. Field Photos & Evidence Attachments ({photos.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Geotagged site photos supporting your checklist findings
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Site Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs">
                  <div className="h-24 bg-slate-200 overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-2 space-y-0.5">
                    <p className="text-[11px] font-bold text-slate-800 truncate" title={photo.name}>
                      {photo.name}
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold block">
                      {photo.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Submitting will package these verified checkpoints & observations and route them to <strong>Operations Head (Sultan Al-Otaibi)</strong> for final sign-off.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Cancel / Save Draft
              </button>

              {/* The "Survey Done" button explicitly requested by the user */}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Survey Done (Submit to Operations)</span>
                <Send className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
