'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Calculator, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Server,
  UserCheck,
  Compass,
  HardHat,
  Award,
  HeartPulse,
  Users,
  ShoppingCart,
  Boxes
} from 'lucide-react';
import { AuthUser, PRESET_USERS, UserRole } from '../../types/auth';
import { authService } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('crm');
  const [email, setEmail] = useState('crm@radwa.sa');
  const [password, setPassword] = useState('radwa123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(PRESET_USERS[role].email);
    setPassword(PRESET_USERS[role].defaultPassword);
    setErrorMessage(null);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await authService.login({ email, password });
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAsRole = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.loginAsRole(role);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleMeta: Record<UserRole, { title: string; subtitle: string; icon: any; colorClass: string; badgeText: string }> = {
    admin: {
      title: 'Super Admin Portal',
      subtitle: 'Complete enterprise administration with access to CRM, MD Executive, and Estimator modules',
      icon: Building2,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
      badgeText: 'Enterprise Admin'
    },
    crm: {
      title: 'CRM Admin Portal',
      subtitle: 'Inbound tender intake, work order registry, scope checklist, and estimator allocation',
      icon: Building2,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
      badgeText: 'Client Intake Desk'
    },
    md: {
      title: 'Managing Director Console',
      subtitle: 'Executive dossier review, workload capacity rebalancing, and commercial bidding authorization',
      icon: ShieldCheck,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeText: 'Executive Governance'
    },
    estimator: {
      title: 'Estimator Workspace',
      subtitle: 'Site review determination, AI BOQ & prompt-based resource takeoff, and bid proposal submission',
      icon: Calculator,
      colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      badgeText: 'Quantity Surveying'
    },
    operations: {
      title: 'Operations Console',
      subtitle: 'Site survey dispatch, AI checklist verification, and site reconnaissance',
      icon: Compass,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
      badgeText: 'Field Operations'
    },
    surveyor: {
      title: 'Field Surveyor Portal',
      subtitle: 'Field inspection execution, printable checklist download, ground findings, and survey report submission',
      icon: HardHat,
      colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
      badgeText: 'Field Operations'
    },
    qaqc: {
      title: 'QA/QC Quality Portal',
      subtitle: 'Inspection requests (RFI), ITP hold points, NCR logs, and site punch lists',
      icon: Award,
      colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
      badgeText: 'Quality Assurance'
    },
    hse: {
      title: 'HSE Safety Portal',
      subtitle: 'Safe man-hours, LTIFR & TRIFR calculation, incident CAPA, and Toolbox Talks',
      icon: HeartPulse,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badgeText: 'HSE & Safety'
    },
    hr: {
      title: 'HR & Personnel Portal',
      subtitle: '38-field employee joining registry, printable ID cards, Saudi indemnity, and salary revisions',
      icon: Users,
      colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
      badgeText: 'Human Resources'
    },
    purchase: {
      title: 'Procurement & Purchasing Desk',
      subtitle: 'Material Request verification, PO generation, supplier quote tracking, and delivery logistics',
      icon: ShoppingCart,
      colorClass: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      badgeText: 'Procurement'
    },
    inventory: {
      title: 'Warehouse & Inventory Control',
      subtitle: 'Central yard stock catalog, project BOQ demand reconciliation, and Material Request generation',
      icon: Boxes,
      colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeText: 'Central Warehouse'
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Background Subtle Accent */}
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Top Header & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wide uppercase mb-2 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Radwa Contracting & Trading Co.
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Enterprise CRM & Tendering ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Role-gated pipeline for tender registration, executive sign-off, AI quantity surveying, and site operations. Select your credential profile below.
          </p>
        </div>

        {/* Role Preset Cards with One-Click Access */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['crm', 'md', 'estimator', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'purchase', 'inventory'] as UserRole[]).map((r) => {
            const meta = roleMeta[r];
            const preset = PRESET_USERS[r];
            const Icon = meta.icon;
            const isSelected = selectedRole === r;

            return (
              <div
                key={r}
                onClick={() => handleSelectRoleTab(r)}
                className={`relative rounded-xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`p-2 rounded-lg border ${meta.colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {meta.badgeText}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-slate-900">
                    {meta.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500 shrink-0">User:</span>
                      <span className="font-semibold text-slate-900 truncate ml-2">{preset.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 min-w-0">
                      <span className="font-medium text-slate-500 shrink-0">Email:</span>
                      <span className="font-mono text-[11px] text-blue-600 font-semibold truncate ml-2" title={preset.email}>{preset.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLoginAsRole(r);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Traditional Form Card with Error State */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-xl mx-auto space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sign in with Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Logging in to: <strong className="text-slate-900">{roleMeta[selectedRole].title}</strong>
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Role: {selectedRole.toUpperCase()}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. crm@radwa.sa, md@radwa.sa, estimator@radwa.sa"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">
                  Default: <span className="font-mono text-slate-600">radwa123</span>
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>{isLoading ? 'Authenticating...' : `Sign in to ${roleMeta[selectedRole].title}`}</span>
            </button>
          </form>

          {/* Backend Integration Note for Django Developer */}
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2.5">
            <Server className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Django Backend Ready:</span>{' '}
              <span>
                Configured for <code className="px-1 py-0.5 rounded bg-slate-200 font-mono text-[10px]">POST /api/auth/login/</code>. 
                Will seamlessly accept JWT / session tokens when Django is connected.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
