'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Calculator, 
  Search, 
  LogOut, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Layers,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Crown,
  LayoutGrid,
  X,
  Compass,
  HardHat,
  Award,
  HeartPulse,
  Users,
  ShoppingCart,
  Boxes
} from 'lucide-react';
import { AuthUser, PRESET_USERS, UserRole } from '../../types/auth';
import { AiStatusPill } from '../layout/AiStatusPill';

export type AppId = 'crm' | 'md' | 'estimator' | 'operations' | 'surveyor' | 'qaqc' | 'hse' | 'hr' | 'purchase' | 'inventory' | 'material-requests';

interface OdooMainMenuProps {
  currentUser: AuthUser | null;
  onLaunchApp: (appId: AppId) => void;
  onLoginAsRole: (role: UserRole) => Promise<void>;
  onManualLogin: (email: string, password?: string) => Promise<void>;
  onLogout: () => void;
  pendingMdCount?: number;
  inEstimationCount?: number;
  approvedForEstimatorCount?: number;
  pendingSurveysCount?: number;
}

export const OdooMainMenu: React.FC<OdooMainMenuProps> = ({
  currentUser,
  onLaunchApp,
  onLoginAsRole,
  onManualLogin,
  onLogout,
  pendingMdCount = 0,
  inEstimationCount = 0,
  approvedForEstimatorCount = 0,
  pendingSurveysCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole>('admin');
  const [emailInput, setEmailInput] = useState('admin@radwa.sa');
  const [passwordInput, setPasswordInput] = useState('radwa123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Definition of the primary Radwa ERP applications
  const ALL_APPS = useMemo(() => [
    {
      id: 'crm' as AppId,
      name: 'CRM Admin Portal',
      subtitle: 'Client Intake & Work Orders',
      description: 'Registers inbound tenders, manages client intake, tracks SOW scopes, and assigns estimating capacity.',
      allowedRoles: ['admin', 'crm'] as UserRole[],
      badge: inEstimationCount > 0 ? `${inEstimationCount} Active` : undefined,
      badgeColor: 'bg-blue-600 text-white',
      accentLine: 'from-sky-400 via-blue-500 to-indigo-600',
      ambientGlow: 'bg-sky-500',
      tag: 'COMMERCIAL INTAKE',
      kpiMetric: inEstimationCount > 0 ? `${inEstimationCount} Active Inbound Tenders` : 'Intake Ready',
      cardBorder: 'hover:border-sky-500 hover:ring-2 hover:ring-sky-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#crm-light-grad)" />
          <path d="M16 30C16 23.3726 21.3726 18 28 18C34.6274 18 40 23.3726 40 30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="14" r="4.5" fill="#E0F2FE" />
          <rect x="21" y="28" width="14" height="15" rx="3" fill="#0369A1" />
          <path d="M24.5 33H31.5M24.5 37H29" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="crm-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'md' as AppId,
      name: 'Managing Director Console',
      subtitle: 'Executive Review & Sign-Off',
      description: 'Inspects tender dossiers, balances estimating pool capacity, and authorizes commercial bidding sign-off.',
      allowedRoles: ['admin', 'md'] as UserRole[],
      badge: pendingMdCount > 0 ? `${pendingMdCount} Pending` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold animate-pulse',
      accentLine: 'from-emerald-400 via-teal-500 to-cyan-600',
      ambientGlow: 'bg-emerald-500',
      tag: 'EXECUTIVE GOVERNANCE',
      kpiMetric: pendingMdCount > 0 ? `${pendingMdCount} Pending Authorizations` : 'Commercial Sign-Off Clear',
      cardBorder: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#md-light-grad)" />
          <path d="M28 13L39 18.5V28C39 35 34.5 41 28 43.5C21.5 41 17 35 17 28V18.5L28 13Z" fill="#10B981" />
          <path d="M23 28L26.5 31.5L33 24.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="md-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'estimator' as AppId,
      name: 'Estimator Workspace',
      subtitle: 'AI BOQ & Quantity Surveying',
      description: 'Inspects tenders, requests site surveys, runs AI BOQ cost takeoffs, and prepares final proposal bids.',
      allowedRoles: ['admin', 'estimator'] as UserRole[],
      badge: approvedForEstimatorCount > 0 ? `${approvedForEstimatorCount} Queue` : undefined,
      badgeColor: 'bg-indigo-600 text-white',
      accentLine: 'from-indigo-400 via-purple-500 to-violet-600',
      ambientGlow: 'bg-indigo-500',
      tag: 'AI BOQ & TAKEOFFS',
      kpiMetric: approvedForEstimatorCount > 0 ? `${approvedForEstimatorCount} Tenders In Estimation` : 'Estimation Queue Clear',
      cardBorder: 'hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#est-light-grad)" />
          <path d="M17 16C17 14.8954 17.8954 14 19 14H37C38.1046 14 39 14.8954 39 16V40C39 41.1046 38.1046 42 37 42H19C17.8954 42 17 41.1046 17 40V16Z" fill="#6366F1" />
          <rect x="21" y="18" width="14" height="6" rx="1.5" fill="#1E1B4B" />
          <circle cx="23" cy="29" r="1.8" fill="#FFFFFF" />
          <circle cx="28" cy="29" r="1.8" fill="#FFFFFF" />
          <circle cx="33" cy="29" r="1.8" fill="#FFFFFF" />
          <circle cx="23" cy="35" r="1.8" fill="#FFFFFF" />
          <circle cx="28" cy="35" r="1.8" fill="#FFFFFF" />
          <rect x="31.8" cy="33.8" width="2.4" height="4" rx="0.8" fill="#A5B4FC" />
          <defs>
            <linearGradient id="est-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'operations' as AppId,
      name: 'Operations Console',
      subtitle: 'Site Survey & Field Feasibility',
      description: 'Receives survey requests from Estimators, runs AI site checklist generation, and dispatches field surveyors.',
      allowedRoles: ['admin', 'operations'] as UserRole[],
      badge: pendingSurveysCount > 0 ? `${pendingSurveysCount} Requests` : undefined,
      badgeColor: 'bg-amber-600 text-white font-bold',
      accentLine: 'from-amber-400 via-orange-500 to-rose-500',
      ambientGlow: 'bg-amber-500',
      tag: 'SITE FEASIBILITY',
      kpiMetric: pendingSurveysCount > 0 ? `${pendingSurveysCount} Field Surveys Pending` : 'All Feasibilities Cleared',
      cardBorder: 'hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#ops-light-grad)" />
          <circle cx="28" cy="28" r="14" stroke="#FFFFFF" strokeWidth="2.5" />
          <polygon points="28,17 32,28 28,39 24,28" fill="#FEF3C7" />
          <polygon points="28,17 32,28 28,28" fill="#F59E0B" />
          <circle cx="28" cy="28" r="3" fill="#D97706" />
          <defs>
            <linearGradient id="ops-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'surveyor' as AppId,
      name: 'Field Surveyor Portal',
      subtitle: 'Site Inspections & Ground Reports',
      description: 'Executes physical site inspections, downloads PDF checklists, records ground findings, and submits verified reports.',
      allowedRoles: ['admin', 'surveyor', 'operations'] as UserRole[],
      badge: undefined,
      badgeColor: 'bg-teal-600 text-white font-bold',
      accentLine: 'from-teal-400 via-emerald-500 to-teal-600',
      ambientGlow: 'bg-teal-500',
      tag: 'GROUND INSPECTION',
      kpiMetric: 'Checklists & Site Observations',
      cardBorder: 'hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#surv-light-grad)" />
          <path d="M28 15C22.4772 15 18 19.4772 18 25C18 32.5 28 42 28 42C28 42 38 32.5 38 25C38 19.4772 33.5228 15 28 15Z" fill="#FFFFFF" />
          <circle cx="28" cy="25" r="4" fill="#0D9488" />
          <defs>
            <linearGradient id="surv-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0D9488" />
              <stop offset="1" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'qaqc' as AppId,
      name: 'Radwa QA/QC Quality',
      subtitle: 'Inspection Requests (RFI) & Standards',
      description: 'Manages Requests for Inspection (RFI), ITP Hold Points, Non-Conformance Reports (NCR), and Punch Lists across awarded projects.',
      allowedRoles: ['admin', 'qaqc'] as UserRole[],
      badge: 'Enterprise QA',
      badgeColor: 'bg-purple-600 text-white font-bold',
      accentLine: 'from-purple-500 via-indigo-500 to-blue-600',
      ambientGlow: 'bg-purple-500',
      tag: 'QUALITY & ITP STANDARDS',
      kpiMetric: 'RFI Approvals & Code 1/Code 3',
      cardBorder: 'hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#qaqc-light-grad)" />
          <path d="M28 14L16 20V28C16 36 21.5 43 28 45C34.5 43 40 36 40 28V20L28 14Z" fill="#FFFFFF" fillOpacity="0.9" />
          <path d="M25 28.5L22 25.5L20 27.5L25 32.5L36 21.5L34 19.5L25 28.5Z" fill="#4338CA" />
          <defs>
            <linearGradient id="qaqc-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'hse' as AppId,
      name: 'Radwa HSE Safety',
      subtitle: 'Safety KPIs, LTIFR/TRIFR & Incidents',
      description: 'Monitors site safe man-hours, auto-calculates LTIFR & TRIFR rates, tracks Incident CAPA plans, and logs daily Toolbox Talks.',
      allowedRoles: ['admin', 'hse'] as UserRole[],
      badge: 'Zero LTI',
      badgeColor: 'bg-teal-600 text-white font-bold',
      accentLine: 'from-emerald-500 via-teal-500 to-green-600',
      ambientGlow: 'bg-teal-500',
      tag: 'SAFETY & FREQUENCY RATES',
      kpiMetric: 'Zero LTI • 0.00 LTIFR Tracked',
      cardBorder: 'hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#hse-light-grad)" />
          <circle cx="28" cy="28" r="13" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <path d="M28 20V29M28 34V35" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <linearGradient id="hse-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0D9488" />
              <stop offset="1" stopColor="#115E59" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'hr' as AppId,
      name: 'Radwa HR & Personnel',
      subtitle: 'Workforce, Payroll & Muqeem/GOSI',
      description: 'Employee contracts, Iqama expiry tracking, Saudi nationalization (Nitaqat), leave management, and site worker allocations.',
      allowedRoles: ['admin', 'hr'] as UserRole[],
      badge: 'HR & Nitaqat',
      badgeColor: 'bg-rose-600 text-white font-bold',
      accentLine: 'from-rose-500 via-pink-500 to-red-600',
      ambientGlow: 'bg-rose-500',
      tag: 'WORKFORCE & NITAQAT',
      kpiMetric: 'Iqama & Saudi Nationalization',
      cardBorder: 'hover:border-rose-500 hover:ring-2 hover:ring-rose-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#hr-light-grad)" />
          <path d="M28 26C31.3137 26 34 23.3137 34 20C34 16.6863 31.3137 14 28 14C24.6863 14 22 16.6863 22 20C22 23.3137 24.6863 26 28 26Z" fill="#FFFFFF" />
          <path d="M18 38C18 33.5817 21.5817 30 26 30H30C34.4183 30 38 33.5817 38 38V40H18V38Z" fill="#FFFFFF" fillOpacity="0.85" />
          <defs>
            <linearGradient id="hr-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E11D48" />
              <stop offset="1" stopColor="#9F1239" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'inventory' as AppId,
      name: 'Radwa Inventory & Warehouse',
      subtitle: 'Central Stock & Project BOQ Reconciler',
      description: 'Central multi-yard stock catalog, automated project BOQ reconciliation against warehouse inventory, and shortfall identification.',
      allowedRoles: ['admin', 'inventory'] as UserRole[],
      badge: 'Stage 1: Yard Stock',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      accentLine: 'from-emerald-400 via-teal-500 to-green-600',
      ambientGlow: 'bg-emerald-500',
      tag: 'WAREHOUSE LOGISTICS & SKUS',
      kpiMetric: 'Multi-Yard Real-Time Inventory',
      cardBorder: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#inv-light-grad)" />
          <path d="M28 15L39 21V35L28 41L17 35V21L28 15Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M28 15V41M17 21L39 35M39 21L17 35" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="inv-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'material-requests' as AppId,
      name: 'Radwa Material Requests (MR)',
      subtitle: 'Project Shortfall Intake & QA Verification',
      description: 'Project-wise shortfall material intake, technical engineering verification, and direct transfer to the Purchase Department.',
      allowedRoles: ['admin', 'mr', 'estimator'] as UserRole[],
      badge: 'Stage 2: MR Hub',
      badgeColor: 'bg-blue-600 text-white font-bold',
      accentLine: 'from-blue-500 via-indigo-500 to-cyan-500',
      ambientGlow: 'bg-blue-500',
      tag: 'PROJECT SHORTFALLS & MR VERIFICATION',
      kpiMetric: 'Project Requisition Verification',
      cardBorder: 'hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#mr-light-grad)" />
          <path d="M19 18H37V38H19V18Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M24 24H32M24 29H32M24 34H28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 32L36 35L42 27" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="mr-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      id: 'purchase' as AppId,
      name: 'Radwa Purchase & Procurement',
      subtitle: 'Vendor PO Issuance & Supply Logistics',
      description: 'Issues official vendor purchase orders from verified MRs, tracks supplier delivery milestones, and ships goods to warehouse.',
      allowedRoles: ['admin', 'purchase'] as UserRole[],
      badge: 'Stage 3: Vendor POs',
      badgeColor: 'bg-cyan-600 text-white font-bold',
      accentLine: 'from-cyan-400 via-blue-500 to-indigo-600',
      ambientGlow: 'bg-cyan-500',
      tag: 'PURCHASE ORDERS & VENDOR SUPPLY',
      kpiMetric: 'Vendor POs & Delivery Logistics',
      cardBorder: 'hover:border-cyan-500 hover:ring-2 hover:ring-cyan-500/20',
      renderIcon: () => (
        <svg viewBox="0 0 56 56" className="w-14 h-14 sm:w-16 sm:h-16" fill="none">
          <rect width="56" height="56" rx="18" fill="url(#pur-light-grad)" />
          <path d="M16 19H20L23.5 33H36.5L39.5 23H22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25" cy="38" r="2.5" fill="#FFFFFF" />
          <circle cx="35" cy="38" r="2.5" fill="#FFFFFF" />
          <defs>
            <linearGradient id="pur-light-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0891B2" />
              <stop offset="1" stopColor="#0E7490" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ], [inEstimationCount, pendingMdCount, approvedForEstimatorCount, pendingSurveysCount]);

  // Filter apps strictly by the current logged-in role
  const visibleApps = useMemo(() => {
    if (!currentUser) return [];

    return ALL_APPS.filter(app => {
      const isRoleAllowed = app.allowedRoles.includes(currentUser.role);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        app.name.toLowerCase().includes(q) ||
        app.subtitle.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
      );

      return isRoleAllowed && matchesSearch;
    });
  }, [currentUser, searchQuery, ALL_APPS]);

  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedLoginRole(role);
    setEmailInput(PRESET_USERS[role].email);
    setPasswordInput(PRESET_USERS[role].defaultPassword);
    setLoginError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError(null);
    try {
      await onManualLogin(emailInput, passwordInput);
      setIsSwitchModalOpen(false);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsAuthenticating(true);
    setLoginError(null);
    try {
      await onLoginAsRole(role);
      setIsSwitchModalOpen(false);
    } catch (err: any) {
      setLoginError(err.message || 'Failed to authenticate.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const roleDisplayNames: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'Super Admin', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    crm: { label: 'CRM Admin', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    md: { label: 'Managing Director', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    estimator: { label: 'Lead Estimator', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    operations: { label: 'Site Operations', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    surveyor: { label: 'Field Surveyor', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    qaqc: { label: 'QA/QC Quality', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    hse: { label: 'HSE Safety', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    hr: { label: 'HR Director', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    purchase: { label: 'Purchase & Procurement', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    inventory: { label: 'Warehouse Controller', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    mr: { label: 'Material Requests & QA', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.18),transparent_75%)] pointer-events-none" />
      
      {/* Light Top Odoo Navigation Header */}
      <header className="sticky top-0 z-30 w-full px-5 sm:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity with Odoo 4-square App Launcher Icon */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white p-1.5 flex items-center justify-center shadow-xs">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-white rounded-xs" />
              <div className="bg-cyan-400 rounded-xs" />
              <div className="bg-cyan-400 rounded-xs" />
              <div className="bg-white rounded-xs" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 uppercase">
                RADWA ERP
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Main Menu
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Radwa Contracting & Trading • Enterprise Applications
            </p>
          </div>
        </div>

        {/* Center: Live App Search Bar */}
        {currentUser && (
          <div className="relative max-w-xs sm:max-w-md w-full hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition"
            />
          </div>
        )}

        {/* Right: User Profile & Role Switcher */}
        <div className="flex items-center gap-3">
          <AiStatusPill />

          {currentUser ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.avatarInitials}
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  {currentUser.role === 'admin' && (
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {currentUser.roleTitle}
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${roleDisplayNames[currentUser.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                {roleDisplayNames[currentUser.role]?.label || currentUser.role}
              </span>

              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(true)}
                title="Switch User Role"
                className="ml-1 p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer text-xs flex items-center gap-1"
              >
                <span className="hidden lg:inline text-[11px] font-medium">Switch Role</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Not signed in
              </span>
            </div>
          )}
        </div>

      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 w-full flex flex-col justify-center items-center px-4 sm:px-8 py-8 sm:py-12 max-w-7xl mx-auto">
        
        {/* CASE A: User is Authenticated ➔ Show Full-Screen Odoo Light Main Menu */}
        {currentUser ? (
          <div className="w-full flex flex-col items-center space-y-8 animate-in fade-in duration-200">
            
            {/* Header Scope Pill & Executive Headline */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs shadow-xs font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {currentUser.role === 'admin' 
                    ? `Super Admin Mode — All Enterprise Workspaces Unlocked (${visibleApps.length}/${ALL_APPS.length})`
                    : `${roleDisplayNames[currentUser.role]?.label || currentUser.role} Mode — ${visibleApps.length} Assigned Application${visibleApps.length > 1 ? 's' : ''} Accessible`
                  }
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Radwa Enterprise Applications
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {currentUser.role === 'admin' 
                  ? 'Unified Kingdom of Saudi Arabia civil contracting, tender estimation takeoffs, field operations, quality assurance, and HSE safety systems.'
                  : `Signed in as ${currentUser.name} (${currentUser.roleTitle}). Click your designated application workspace to proceed.`}
              </p>

              {/* Executive quick status chips */}
              <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-slate-800">{ALL_APPS.length} Enterprise Modules</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Zero LTI Safety Standard</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-slate-800">ISO 9001 / ITP Quality</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-800">Saudi GOSI & Aramco Ready</span>
                </div>
              </div>
            </div>

            {/* 4-Column Responsive Executive App Launcher Grid */}
            {visibleApps.length > 0 ? (
              <div className={`w-full ${
                visibleApps.length === 1 
                  ? 'max-w-sm mx-auto' 
                  : visibleApps.length === 2 
                  ? 'max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
              } pt-2`}>
                {visibleApps.map((app: any) => (
                  <div
                    key={app.id}
                    onClick={() => onLaunchApp(app.id)}
                    className={`relative group w-full rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_22px_45px_-10px_rgba(15,23,42,0.15)] ${app.cardBorder} p-6 flex flex-col items-center text-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 overflow-hidden`}
                  >
                    {/* Top ambient colored accent line */}
                    <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${app.accentLine} opacity-80 group-hover:opacity-100 transition-opacity`} />

                    {/* Corner ambient glow on hover */}
                    <div className={`absolute -top-14 -right-14 w-32 h-32 rounded-full ${app.ambientGlow} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity duration-500 pointer-events-none`} />

                    {/* Category / Discipline Pill Tag */}
                    <div className="w-full flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                        {app.tag}
                      </span>
                      {app.badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs border border-white ${app.badgeColor}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>

                    {/* Squircle Icon Container with smooth hover bounce */}
                    <div className="relative mb-3.5">
                      <div className="transition-all duration-300 group-hover:scale-105 filter drop-shadow-md group-hover:drop-shadow-xl">
                        {app.renderIcon()}
                      </div>
                    </div>

                    {/* App Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {app.name}
                    </h3>

                    {/* Subtitle */}
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {app.subtitle}
                    </span>

                    {/* Description */}
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>

                    {/* Live Metric / Context Badge */}
                    <div className="mt-3.5 w-full py-1.5 px-2.5 rounded-lg bg-slate-50 group-hover:bg-slate-100/80 border border-slate-100 text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1.5 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate">{app.kpiMetric}</span>
                    </div>

                    {/* Launch Pill Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-700 group-hover:text-white group-hover:bg-slate-900 py-2.5 rounded-xl transition-all duration-300 shadow-2xs group-hover:shadow-md">
                      <span>Launch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-sm">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  No matching applications found
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  No apps matched your search &quot;{searchQuery}&quot;. Clear search to view all authorized apps.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}

          </div>
        ) : (
          /* CASE B: User is NOT Authenticated ➔ Full-Screen Light Mode Sign-In Portal */
          <div className="w-full max-w-6xl space-y-8 animate-in fade-in duration-200">
            
            {/* Top Branding Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide uppercase mb-2 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Radwa Contracting & Trading Co.
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Enterprise CRM & Tendering ERP
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
                Role-gated application launcher. Select your credential profile below to launch authorized apps, or sign in with credentials.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 max-w-xl mx-auto">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Full-Screen Profile Cards in Crisp Light Mode (responsive grid for all departments) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {(['admin', 'crm', 'md', 'estimator', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'mr', 'purchase', 'inventory'] as UserRole[]).map((role) => {
                const userPreset = PRESET_USERS[role];
                const isSelected = selectedLoginRole === role;

                const roleVisuals = {
                  admin: {
                    badge: 'SUPER ADMIN',
                    color: 'text-rose-600 bg-rose-50 border-rose-200',
                    scope: 'All Enterprise Portals',
                    btnClass: 'bg-slate-900 hover:bg-slate-800 text-white',
                    icon: Crown
                  },
                  crm: {
                    badge: 'CRM DESK',
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    scope: 'CRM Admin Portal Only',
                    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white',
                    icon: Building2
                  },
                  md: {
                    badge: 'EXECUTIVE',
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    scope: 'MD Console Only',
                    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
                    icon: ShieldCheck
                  },
                  estimator: {
                    badge: 'MATERIAL DESK',
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                    scope: 'Estimator & Material Requests Hub',
                    btnClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
                    icon: Calculator
                  },
                  operations: {
                    badge: 'SITE OPS',
                    color: 'text-amber-600 bg-amber-50 border-amber-200',
                    scope: 'Operations Console Only',
                    btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
                    icon: Compass
                  },
                  surveyor: {
                    badge: 'FIELD SURVEYOR',
                    color: 'text-teal-600 bg-teal-50 border-teal-200',
                    scope: 'Field Surveyor Portal Only',
                    btnClass: 'bg-teal-600 hover:bg-teal-500 text-white',
                    icon: HardHat
                  },
                  qaqc: {
                    badge: 'QUALITY LEAD',
                    color: 'text-purple-600 bg-purple-50 border-purple-200',
                    scope: 'QA/QC Quality Portal Only',
                    btnClass: 'bg-purple-600 hover:bg-purple-500 text-white',
                    icon: Award
                  },
                  hse: {
                    badge: 'SAFETY OFFICER',
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                    scope: 'HSE Safety Portal Only',
                    btnClass: 'bg-teal-600 hover:bg-teal-500 text-white',
                    icon: HeartPulse
                  },
                  hr: {
                    badge: 'HR DIRECTOR',
                    color: 'text-rose-600 bg-rose-50 border-rose-200',
                    scope: 'HR & Personnel Portal Only',
                    btnClass: 'bg-rose-600 hover:bg-rose-500 text-white',
                    icon: Users
                  },
                  purchase: {
                    badge: 'PROCUREMENT',
                    color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
                    scope: 'Purchase & Vendor PO Portal Only',
                    btnClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
                    icon: ShoppingCart
                  },
                  inventory: {
                    badge: 'WAREHOUSE CONTROLLER',
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                    scope: 'Central Warehouse & Yard Reconciler',
                    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
                    icon: Boxes
                  },
                  mr: {
                    badge: 'MATERIAL QA',
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    scope: 'Material Requests & Shortfall QA Desk Only',
                    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white',
                    icon: ClipboardCheck
                  }
                };

                const visual = roleVisuals[role];
                const RoleCardIcon = visual.icon;

                return (
                  <div
                    key={role}
                    onClick={() => handleSelectRoleTab(role)}
                    className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <div className={`p-2.5 rounded-xl border ${visual.color}`}>
                          <RoleCardIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono border border-slate-200/60">
                          {visual.badge}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {userPreset.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-normal line-clamp-2" title={userPreset.roleTitle}>
                        {userPreset.roleTitle}
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wide">Access Scope</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                        </div>
                        <div className="font-semibold text-blue-600 mt-1 text-xs">{visual.scope}</div>
                      </div>

                      <div className="mt-3.5 pt-1 flex items-center justify-between text-xs text-slate-500 min-w-0">
                        <span className="font-medium text-slate-400 shrink-0">Email:</span>
                        <span className="font-mono text-slate-700 font-semibold text-xs truncate ml-2" title={userPreset.email}>
                          {userPreset.email}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLogin(role);
                        }}
                        disabled={isAuthenticating}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${visual.btnClass} disabled:opacity-50 hover:shadow-sm active:scale-[0.99]`}
                      >
                        <span>Instant Login</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Credential Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl mx-auto space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sign in with Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Signing in as: <strong className="text-slate-900">{PRESET_USERS[selectedLoginRole].name}</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedLoginRole.toUpperCase()}
                </span>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Default: radwa123
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {isAuthenticating 
                      ? 'Authenticating...' 
                      : 'Sign In'}
                  </span>
                </button>
              </form>

            </div>

          </div>
        )}

      </main>


      {/* Light Theme Role Switcher Modal (When Clicked from Header) */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-7 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Switch Application Role & Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select a credential profile below to filter visible apps
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSwitchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Selector Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(['admin', 'crm', 'md', 'estimator', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'mr', 'purchase', 'inventory'] as UserRole[]).map((role) => {
                const userPreset = PRESET_USERS[role];
                const isSelected = currentUser?.role === role;

                return (
                  <div
                    key={role}
                    onClick={() => handleQuickLogin(role)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {userPreset.name}
                        </span>
                        {role === 'admin' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {userPreset.roleTitle}
                      </p>
                      <span className="text-[10px] font-mono font-semibold text-blue-600 mt-1 block">
                        {role === 'admin' ? 'All 4 Apps Visible' : '1 App Visible'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                    >
                      Switch →
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
