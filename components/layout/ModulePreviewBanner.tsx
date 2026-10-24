'use client';

import React from 'react';
import { HardHat, Truck, DollarSign, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { ERP_DASHBOARDS } from './Navbar';

interface ModulePreviewBannerProps {
  activeDashboard: string;
  onResetToCrm: () => void;
}

export const ModulePreviewBanner: React.FC<ModulePreviewBannerProps> = ({
  activeDashboard,
  onResetToCrm
}) => {
  if (activeDashboard === 'crm') return null;

  const currentMod = ERP_DASHBOARDS.find(d => d.id === activeDashboard) || ERP_DASHBOARDS[1];
  const Icon = currentMod.icon;

  return (
    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-amber-500/30 shadow-xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                ERP MODULE #2
              </span>
              <span className="text-xs text-slate-400">Integrated Suite</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              {currentMod.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5">
              {currentMod.desc}. This module is connected to CRM Admin: won tenders flow directly here with full bill of quantities and specifications.
            </p>
          </div>
        </div>

        <button
          onClick={onResetToCrm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md shadow-amber-500/20 shrink-0"
        >
          <span>Return to CRM Admin Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
