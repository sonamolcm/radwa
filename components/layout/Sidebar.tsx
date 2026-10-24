'use client';

import React from 'react';
import { 
  LayoutGrid, 
  TableProperties, 
  Clock, 
  Users, 
  TrendingUp, 
  Calculator, 
  FileText, 
  ShieldAlert,
  Compass,
  ArrowUpRight
} from 'lucide-react';

export type CrmTab = 'kanban' | 'table' | 'deadlines' | 'clients' | 'team' | 'analytics';

interface SidebarProps {
  activeTab: CrmTab;
  setActiveTab: (tab: CrmTab) => void;
  tenderCount: number;
  urgentCount: number;
  clientCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tenderCount,
  urgentCount,
  clientCount
}) => {
  const navItems = [
    {
      id: 'kanban' as CrmTab,
      label: 'Pipeline Kanban',
      desc: 'Visual 7-Stage Tender Pipeline',
      icon: LayoutGrid,
      badge: `${tenderCount}`
    },
    {
      id: 'table' as CrmTab,
      label: 'All Bids & Tenders',
      desc: 'Master Register & Filter',
      icon: TableProperties,
      badge: null
    },
    {
      id: 'deadlines' as CrmTab,
      label: 'Deadlines & Pre-Bid',
      desc: 'Closing Alerts & Site Visits',
      icon: Clock,
      badge: urgentCount > 0 ? `${urgentCount} urgent` : null,
      urgent: urgentCount > 0
    },
    {
      id: 'clients' as CrmTab,
      label: 'Clients & Consultants',
      desc: 'Developers, Govt & PMCs',
      icon: Users,
      badge: `${clientCount}`
    },
    {
      id: 'team' as CrmTab,
      label: 'Estimators & BD Load',
      desc: 'BOQ Pricing Workload',
      icon: Calculator,
      badge: null
    },
    {
      id: 'analytics' as CrmTab,
      label: 'Win/Loss & Margins',
      desc: 'Hit Rate & Commercial KPIs',
      icon: TrendingUp,
      badge: '36.4%'
    }
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        
        {/* Module Sub-Header */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">
            <span>CRM & Pre-Award</span>
            <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono">
              Live DB
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition font-medium ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      item.urgent 
                        ? 'bg-rose-500 text-white font-bold animate-pulse'
                        : isActive
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick ERP Handover Summary Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              ★
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Tender Won Handover
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Bids marked as <strong>"Won"</strong> seamlessly transfer to the <strong>Site Project Management</strong> module with full BOQ & budget line items.
          </p>
          <div className="flex items-center justify-between text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20">
            <span>Diriyah Heritage Hotel</span>
            <span className="font-bold font-mono">READY</span>
          </div>
        </div>

      </div>

      {/* Footer / System Status */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 px-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Radwa ERP Cloud
          </span>
          <span className="font-mono text-[10px]">v2.4-PRO</span>
        </div>
      </div>
    </aside>
  );
};
