'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdDashboard } from './MdDashboard';
import { ProjectRFQ, Estimator, ClientRecord } from '../../types/crm';
import { INITIAL_PROJECT_RFQS, INITIAL_ESTIMATORS } from '../../data/mockCrmData';
import { ShieldCheck, Building2, ExternalLink } from 'lucide-react';

const DJANGO_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function MdDashboardContainer() {
  const [projects, setProjects] = useState<ProjectRFQ[]>(INITIAL_PROJECT_RFQS);
  const [estimators, setEstimators] = useState<Estimator[]>(INITIAL_ESTIMATORS);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync projects, estimators, and clients from Django SQLite Backend on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchBackendData() {
      try {
        const [projRes, estRes, clientRes] = await Promise.all([
          fetch(`${DJANGO_API_BASE}/api/projects/`),
          fetch(`${DJANGO_API_BASE}/api/estimators/`),
          fetch(`${DJANGO_API_BASE}/api/clients/`)
        ]);

        if (projRes.ok && isMounted) {
          const pData = await projRes.json();
          const pList: ProjectRFQ[] = Array.isArray(pData) ? pData : (pData.results || pData.projects || []);
          if (pList.length > 0) {
            setProjects(pList);
          }
        }

        if (estRes.ok && isMounted) {
          const eData = await estRes.json();
          const eList: Estimator[] = Array.isArray(eData) ? eData : (eData.results || eData.estimators || []);
          if (eList.length > 0) {
            setEstimators(eList);
          }
        }

        if (clientRes.ok && isMounted) {
          const cData = await clientRes.json();
          const cList: ClientRecord[] = Array.isArray(cData) ? cData : (cData.clients || cData.results || []);
          if (cList.length > 0) {
            setClients(cList);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using initial seed data.', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBackendData();
    return () => { isMounted = false; };
  }, []);

  // Action: Approve for Bidding
  const handleApproveForBidding = async (projectId: string, mdRemarks?: string) => {
    const approvedAt = new Date().toISOString().split('T')[0];
    
    // Optimistic Update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          status: 'Approved for Bidding',
          mdStatus: 'Approved for Bidding',
          mdRemarks: mdRemarks || 'Approved for commercial bidding by Managing Director.',
          mdApprovedAt: approvedAt
        };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/v1/md/projects/${projectId}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mdRemarks: mdRemarks || 'Approved for commercial bidding by Managing Director.' })
      });
    } catch (e) {
      console.error('Failed to sync MD approval with backend:', e);
    }
  };

  // Action: Decline Tender
  const handleDeclineTender = async (projectId: string, reason?: string) => {
    // Optimistic Update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          status: 'Declined / Lost',
          mdStatus: 'Declined',
          mdRemarks: reason || 'Declined during MD executive review.'
        };
      }
      return p;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/v1/md/projects/${projectId}/decline/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Declined during MD executive review.' })
      });
    } catch (e) {
      console.error('Failed to sync MD decline with backend:', e);
    }
  };

  // Action: Reassign Estimator
  const handleReassignEstimator = async (projectId: string, estimatorId: string) => {
    const selectedEst = estimators.find(e => String(e.id) === String(estimatorId));
    if (!selectedEst) return;

    // Optimistic Update
    setProjects(prev => prev.map(p => {
      if (String(p.id) === String(projectId)) {
        return {
          ...p,
          assignedEstimatorId: selectedEst.id,
          assignedEstimatorName: selectedEst.name,
          assignedEstimatorRole: selectedEst.role,
          status: (p.status === 'New RFQ' || p.status === 'Pending MD Approval') ? 'Estimator Assigned' : p.status
        };
      }
      return p;
    }));

    setEstimators(prev => prev.map(e => {
      if (String(e.id) === String(estimatorId)) {
        return { ...e, activeTenders: e.activeTenders + 1 };
      }
      return e;
    }));

    try {
      await fetch(`${DJANGO_API_BASE}/api/v1/crm/rfq/${projectId}/assign-estimator/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimatorId })
      });
    } catch (e) {
      console.error('Failed to sync estimator reallocation with backend:', e);
    }
  };

  const pendingCount = projects.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/crm" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-wider shadow-sm">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">RADWA ERP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                    MD Console (3000)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Enterprise Management Suite</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 ml-4 text-xs font-semibold">
              <Link href="/crm" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>CRM Intake Desk</span>
              </Link>
              <Link href="/md" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>MD Console</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                  {pendingCount}
                </span>
              </Link>
              <Link href="/estimator" className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5">
                <span>Estimator Workspace</span>
              </Link>
              <a
                href={`${DJANGO_API_BASE}/md/`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1"
                title="Open Django Backend (Port 8000)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Backend Template (8000)</span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${DJANGO_API_BASE}/admin/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Django Admin</span>
            </a>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-xs">
                MD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900">Managing Director</div>
                <div className="text-[10px] text-slate-500">Executive Authority</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MdDashboard
          projects={projects}
          estimators={estimators}
          clients={clients}
          onApproveForBidding={handleApproveForBidding}
          onDeclineTender={handleDeclineTender}
          onReassignEstimator={handleReassignEstimator}
        />
      </main>

    </div>
  );
}
