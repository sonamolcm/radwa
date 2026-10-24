'use client';

import React, { useState, useEffect } from 'react';
import { Estimator, ProjectRFQ, ProjectStatus } from '@/types/crm';
import { CrmAdminDashboardView } from './CrmAdminDashboardView';
import { 
  registerClientAction, 
  assignEstimatorAction, 
  updateProjectStatusAction 
} from '@/actions/crm';

interface CrmDashboardContainerProps {
  initialProjects: ProjectRFQ[];
  estimators: Estimator[];
}

export default function CrmDashboardContainer({
  initialProjects,
  estimators,
}: CrmDashboardContainerProps) {
  const [projects, setProjects] = useState<ProjectRFQ[]>(initialProjects);

  // Sync state if server component re-renders with new props
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleRegisterClient = async (newProjectData: ProjectRFQ) => {
    const tempId = newProjectData.id;
    // Optimistic UI update
    setProjects((prev) => [newProjectData, ...prev]);

    // Dispatch Server Action to Django
    const res = await registerClientAction(newProjectData);
    if (res.success && res.data) {
      // Replace optimistic temp project with real persisted project from Django SQLite
      setProjects((prev) => prev.map((p) => (p.id === tempId ? (res.data as ProjectRFQ) : p)));
    } else {
      alert(res.error || 'Failed to register project on Django server.');
      // Revert if failed
      setProjects((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  const handleAssignEstimator = async (projectId: string, estimatorId: string) => {
    const targetEstimator = estimators.find((e) => e.id === estimatorId);

    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              assignedEstimatorId: estimatorId,
              assignedEstimatorName: targetEstimator?.name,
              assignedEstimatorRole: targetEstimator?.role,
              status: p.status === 'New RFQ' ? 'Estimator Assigned' : p.status,
            }
          : p
      )
    );

    // Dispatch Server Action to Django
    const res = await assignEstimatorAction(projectId, estimatorId);
    if (res.success && res.data) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? (res.data as ProjectRFQ) : p)));
    } else {
      alert(res.error || 'Failed to assign estimator on Django server.');
      setProjects(initialProjects);
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    // Optimistic update
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status: newStatus,
              mdStatus:
                newStatus === 'Approved for Bidding'
                  ? 'Approved for Bidding'
                  : newStatus === 'Pending MD Approval'
                  ? 'Pending Review'
                  : p.mdStatus,
            }
          : p
      )
    );

    // Dispatch Server Action to Django
    const res = await updateProjectStatusAction(projectId, newStatus);
    if (res.success && res.data) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? (res.data as ProjectRFQ) : p)));
    } else {
      alert(res.error || 'Failed to update status on Django server.');
      setProjects(initialProjects);
    }
  };

  return (
    <CrmAdminDashboardView
      projects={projects}
      estimators={estimators}
      onRegisterClient={handleRegisterClient}
      onAssignEstimator={handleAssignEstimator}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
