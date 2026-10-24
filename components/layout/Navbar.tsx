'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  Briefcase, 
  Truck, 
  HardHat, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onOpenNewTender: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeDashboard: string;
  setActiveDashboard: (d: string) => void;
  urgentCount: number;
}

export const ERP_DASHBOARDS = [
  {
    id: 'crm',
    title: 'CRM & Tendering Admin',
    desc: 'Leads, Bidding, BOQ Estimations, Client Accounts & Bid Bonds',
    icon: Briefcase,
    color: 'amber',
    badge: 'Active Module'
  },
  {
    id: 'pm',
    title: 'Site Project Management',
    desc: 'Daily Site Logs, Gantt Milestones, Labor/Machinery on site, Work progress',
    icon: HardHat,
    color: 'blue',
    badge: 'Next in Pipeline'
  },
  {
    id: 'procurement',
    title: 'Procurement & Materials',
    desc: 'Material Indents (PR), POs, Goods Received (GRN), Site Inventory & Suppliers',
    icon: Truck,
    color: 'emerald',
    badge: 'Integrated'
  },
  {
    id: 'finance',
    title: 'BOQ, Commercial & Billing',
    desc: 'Budget vs Actual, Cost Codes, Client RA Invoices & Subcontractor billing',
    icon: DollarSign,
    color: 'purple',
    badge: 'Integrated'
  },
  {
    id: 'hse',
    title: 'HSE & Quality Control',
    desc: 'Site Safety Audits, Incident Reports, Inspection Requests (RFI/MIR)',
    icon: ShieldCheck,
    color: 'teal',
    badge: 'Integrated'
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTender,
  searchQuery,
  setSearchQuery,
  activeDashboard,
  setActiveDashboard,
  urgentCount
}) => {
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Dashboard Switcher */}
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Building2 className="h-5 w-5 text-slate-950" />
              <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[9px] font-bold text-amber-400 ring-1 ring-amber-400">
                R
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                  RADWA
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  CONSTRUCTION ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Enterprise Engineering & Contracting
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Dashboard Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDashboardMenu(!showDashboardMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold text-amber-600 dark:text-amber-400">Module:</span>
              <span>CRM & Tendering Admin</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showDashboardMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDashboardMenu(false)} 
                />
                <div className="absolute left-0 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-20">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      ERP Operational Dashboards
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      5 Modules
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {ERP_DASHBOARDS.map((dash) => {
                      const Icon = dash.icon;
                      const isActive = dash.id === activeDashboard;
                      return (
                        <button
                          key={dash.id}
                          onClick={() => {
                            setActiveDashboard(dash.id);
                            setShowDashboardMenu(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition ${
                            isActive
                              ? 'bg-amber-500/10 border border-amber-500/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent'
                          }`}
                        >
                          <div className={`mt-0.5 p-2 rounded-md ${
                            isActive 
                              ? 'bg-amber-500 text-slate-950' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold truncate ${
                                isActive ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {dash.title}
                              </span>
                              {isActive ? (
                                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                                  CURRENT
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">
                                  {dash.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {dash.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenders, clients, ref codes (e.g. RDW-TND), or location..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Add Tender CTA */}
          <button
            onClick={onOpenNewTender}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Tender / Lead</span>
            <span className="sm:hidden">New Bid</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Tender Alerts"
            >
              <Bell className="h-5 w-5" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {urgentCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-84 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-20">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Critical Tender Alerts
                    </span>
                    <span className="text-[11px] text-rose-500 font-semibold">
                      {urgentCount} Closing Soon
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                    <div className="py-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Green Horizon Luxury Villas
                      </p>
                      <p className="text-[11px] text-rose-500 font-medium">
                        Submission closes in 2 days (Oct 18)
                      </p>
                      <span className="text-[10px] text-slate-400">BOQ finalized; pending final signoff</span>
                    </div>
                    <div className="py-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        King Abdullah Port Logistics Hub
                      </p>
                      <p className="text-[11px] text-amber-500 font-medium">
                        Technical envelope under review (Closes Oct 20)
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs ring-2 ring-amber-500/30">
              ZA
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Zaid Al-Harbi
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                VP Business Dev & CRM
              </p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
