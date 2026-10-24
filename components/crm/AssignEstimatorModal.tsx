'use client';

import React, { useState } from 'react';
import { X, HardHat, Zap, CheckCircle2, UserCheck } from 'lucide-react';
import { Estimator, ProjectRFQ } from '../../types/crm';

interface AssignEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectRFQ | null;
  estimators: Estimator[];
  onAssignEstimator: (projectId: string, estimatorId: string) => void;
}

export const AssignEstimatorModal: React.FC<AssignEstimatorModalProps> = ({
  isOpen,
  onClose,
  project,
  estimators,
  onAssignEstimator
}) => {
  const [selectedEstimatorId, setSelectedEstimatorId] = useState<string>(
    project?.assignedEstimatorId || ''
  );

  if (!isOpen || !project) return null;

  // Auto-Assign by Capacity: picks estimator with lowest active tenders
  const handleAutoAssign = () => {
    if (!estimators || estimators.length === 0) return;
    const sorted = [...estimators].sort((a, b) => a.activeTenders - b.activeTenders);
    const best = sorted[0];
    if (best) {
      setSelectedEstimatorId(best.id);
    }
  };

  const handleConfirm = () => {
    if (!selectedEstimatorId) return;
    onAssignEstimator(project.id, selectedEstimatorId);
    onClose();
  };

  const currentAssigned = estimators.find(e => e.id === selectedEstimatorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assign Estimator to Project
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review current workload capacity across engineers & allocate.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project Context Box */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-semibold text-slate-600">
              {project.workOrderNo} • {project.enquirySerialNo}
            </span>
            <div className="text-sm font-bold text-slate-900 truncate max-w-sm">
              {project.proposedProjectName}
            </div>
            <div className="text-xs text-slate-500">
              Client: <span className="font-medium text-slate-700">{project.clientName}</span> ({project.siteName})
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleAutoAssign}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition cursor-pointer shrink-0"
          >
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            Auto-Assign by Capacity
          </button>
        </div>

        {/* Estimators Pool Capacity List */}
        <div className="p-6 max-h-[50vh] overflow-y-auto space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            ESTIMATOR POOL CAPACITY:
          </div>

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
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                    {est.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
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

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs text-slate-500">
            {currentAssigned ? (
              <span className="text-emerald-700 font-medium">
                Allocating: {currentAssigned.name}
              </span>
            ) : (
              'Select an estimator from the pool'
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!selectedEstimatorId}
              onClick={handleConfirm}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition cursor-pointer"
            >
              Confirm Allocation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
