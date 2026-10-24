'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EstimatorDashboard } from './EstimatorDashboard';
import { 
  ProjectRFQ, 
  Estimator, 
  ProjectStatus, 
  SiteReviewDetails, 
  AiBoqCalculation, 
  SiteSurveyRequest, 
  BidPackage, 
  BoqComparisonData 
} from '@/types/crm';
import { INITIAL_PROJECT_RFQS, INITIAL_ESTIMATORS } from '@/data/mockCrmData';
import { Calculator, ShieldCheck, Building2, ExternalLink } from 'lucide-react';

const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface EstimatorDashboardContainerProps {
  initialProjects?: ProjectRFQ[];
  initialEstimators?: Estimator[];
}

export default function EstimatorDashboardContainer({
  initialProjects = INITIAL_PROJECT_RFQS,
  initialEstimators = INITIAL_ESTIMATORS,
}: EstimatorDashboardContainerProps) {
  const [projects, setProjects] = useState<ProjectRFQ[]>(initialProjects);
  const [estimators, setEstimators] = useState<Estimator[]>(initialEstimators);
  const [loading, setLoading] = useState(true);

  // Sync projects and estimators from Django SQLite Backend on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendData() {
      try {
        const [projRes, estRes] = await Promise.all([
          fetch(`${DJANGO_API_BASE}/api/projects/`),
          fetch(`${DJANGO_API_BASE}/api/estimators/`),
        ]);

        if (projRes.ok && isMounted) {
          const pData = await projRes.json();
          const pList: ProjectRFQ[] = Array.isArray(pData) ? pData : (pData.projects || pData.results || []);
          if (pList.length > 0) {
            setProjects(pList);
          }
        }

        if (estRes.ok && isMounted) {
          const eData = await estRes.json();
          const eList: Estimator[] = Array.isArray(eData) ? eData : (eData.estimators || eData.results || []);
          if (eList.length > 0) {
            setEstimators(eList);
          }
        }
      } catch (err) {
        console.warn('Django backend unavailable, running with initial dataset.', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBackendData();
    return () => { isMounted = false; };
  }, []);

  // Action: Update tender workflow status (e.g. 'Bid Submitted')
  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return { ...p, status: newStatus };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to sync status update with Django backend:', err);
    }
  };

  // Action: Save BOQ estimation line takeoffs & pricing
  const handleSaveEstimation = async (
    projectId: string,
    estimatedValue: number,
    boqNotes: string,
    calculation?: AiBoqCalculation
  ) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          estimatedValue,
          sowCaveatsNotes: boqNotes || p.sowCaveatsNotes,
          aiBoqCalculation: calculation || p.aiBoqCalculation,
          status: p.status === 'Approved for Bidding' ? 'Under BOQ Estimation' : p.status,
        };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/estimation/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimatedValue,
          boqNotes,
          calculation,
        }),
      });
    } catch (err) {
      console.error('Failed to sync estimation with Django backend:', err);
    }
  };

  // Action: Save site review checklist & inspection protocol
  const handleUpdateSiteReview = async (projectId: string, siteReview: SiteReviewDetails) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return { ...p, siteReview };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/site-review/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteReview }),
      });
    } catch (err) {
      console.error('Failed to sync site review with Django backend:', err);
    }
  };

  // Action: Request pre-bid site survey from field operations
  const handleRequestSurvey = async (projectId: string, surveyRequest: SiteSurveyRequest) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          surveyRequest,
          status: 'Survey In Progress',
        };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/survey-request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyRequest,
          newProjectStatus: 'Survey In Progress',
        }),
      });
    } catch (err) {
      console.error('Failed to sync survey request with Django backend:', err);
    }
  };

  // Action: Update 40-doc bid package dossier
  const handleUpdateBidPackage = async (
    projectId: string,
    bidPackage: BidPackage,
    sendToCrm?: boolean
  ) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          bidPackage,
          status: sendToCrm ? 'Bid Submitted' : p.status,
        };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/bid-package/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidPackage,
          sendToCrm: Boolean(sendToCrm),
        }),
      });
    } catch (err) {
      console.error('Failed to sync bid package with Django backend:', err);
    }
  };

  // Action: Update BOQ comparison & variance audit data
  const handleUpdateBoqComparison = async (projectId: string, comparison: BoqComparisonData) => {
    // Optimistic UI update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return { ...p, boqComparison: comparison };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/projects/${projectId}/boq-comparison/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boqComparison: comparison }),
      });
    } catch (err) {
      console.error('Failed to sync BOQ comparison with Django backend:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-base tracking-wider shadow-sm">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">RADWA ERP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                    Estimator Workspace
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Quantity Surveying & Commercial Bidding</div>
              </div>
            </Link>

            {/* Navigation Switcher */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4 text-xs font-semibold">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>CRM Intake Desk</span>
              </Link>
              <Link
                href="/md"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>MD Console</span>
              </Link>
              <Link
                href="/estimator"
                className="px-3 py-1.5 rounded-lg bg-purple-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-purple-200" />
                <span>Estimator Workspace</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${DJANGO_API_BASE}/estimator/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
              title="Open Django Backend Estimator Console on Port 8000"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Django Backend (8000)</span>
            </a>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center font-bold text-xs">
                FQ
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Farhan Qureshi</div>
                <div className="text-[10px] text-slate-500">Lead Estimating Engineer</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EstimatorDashboard
          projects={projects}
          estimators={estimators}
          onUpdateStatus={handleUpdateStatus}
          onSaveEstimation={handleSaveEstimation}
          onUpdateSiteReview={handleUpdateSiteReview}
          onRequestSurvey={handleRequestSurvey}
          onUpdateBidPackage={handleUpdateBidPackage}
          onUpdateBoqComparison={handleUpdateBoqComparison}
        />
      </main>
    </div>
  );
}
