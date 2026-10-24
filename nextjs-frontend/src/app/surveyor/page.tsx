'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SurveyorDashboard } from '@/components/surveyor/SurveyorDashboard';
import { ProjectRFQ, SiteSurveyRequest, ProjectStatus, Surveyor } from '@/types/crm';
import { INITIAL_PROJECTS, INITIAL_SURVEYORS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function SurveyorPage() {
  const [projects, setProjects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);
  const [surveyors, setSurveyors] = useState<Surveyor[]>(INITIAL_SURVEYORS);

  const handleUpdateSurveyRequest = (projectId: string, surveyRequest: SiteSurveyRequest, newProjectStatus?: ProjectStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          surveyRequest,
          status: newProjectStatus || p.status
        };
      }
      return p;
    }));
  };

  const handleUpdateSiteReview = (projectId: string, siteReview: any) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, siteReview };
      }
      return p;
    }));
  };

  const handleUpdateStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition shadow-xs">
              <span>← App Launcher</span>
            </Link>

            <Link href="/surveyor" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-base tracking-wider shadow-sm">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">RADWA ERP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
                    Surveyor Portal
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Field Surveying & Ground Inspection</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs">
                SO
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Saeed Al-Otaibi</div>
                <div className="text-[10px] text-slate-500">Senior Field Topographical Surveyor</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <SurveyorDashboard
          projects={projects}
          surveyors={surveyors}
          currentUser={PRESET_USERS.surveyor}
          onUpdateSurveyRequest={handleUpdateSurveyRequest}
          onUpdateSiteReview={handleUpdateSiteReview}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>
    </div>
  );
}
