'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Calculator, 
  Lock, 
  Mail, 
  User,
  Eye,
  EyeOff,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { AuthUser, PRESET_USERS, UserRole } from '../../types/auth';
import { authService } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('admin@radwa.sa');
  const [password, setPassword] = useState('radwa123');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await authService.login({ email, password });
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify corporate credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const prefix = email.split('@')[0] as UserRole;
    const resolvedRole: UserRole = PRESET_USERS[prefix] ? prefix : 'admin';

    const newUser: AuthUser = {
      id: `u-${Date.now()}`,
      name: fullName,
      email: email,
      role: resolvedRole,
      roleTitle: PRESET_USERS[resolvedRole]?.roleTitle || 'Corporate Directorate',
      department: PRESET_USERS[resolvedRole]?.roleTitle || 'Corporate Directorate',
      avatarInitials: fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'RU',
      token: 'token-' + Date.now()
    };
    onLoginSuccess(newUser);
  };

  const handleQuickLoginAsRole = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.loginAsRole(role);
      onLoginSuccess(user);
    } catch (err: any) {
      const preset = PRESET_USERS[role];
      const fallbackUser: AuthUser = {
        ...preset,
        token: 'token-' + Date.now()
      };
      onLoginSuccess(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080809] text-zinc-100 flex flex-col justify-center items-center py-10 px-4 relative overflow-x-hidden antialiased selection:bg-white selection:text-black">
      
      {/* Deep Ambient Vignette Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(35,35,42,0.35)_0%,rgba(8,8,9,1)_75%)] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.035),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-[460px] z-10 space-y-6">

        {/* Main Luxury Dark Monochrome Card */}
        <div className="bg-[#121214] border border-white/[0.08] rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-black/80 transition-all">

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authMode === 'signin' ? (
            /* SIGN IN VIEW (Reference Image 1) */
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[11px] font-medium tracking-[0.26em] text-zinc-400 uppercase">
                  RADWA CONTRACTING & TRADING
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.04em] font-normal uppercase mt-3 mb-1">
                  WELCOME BACK
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Please enter your details to connect
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em] text-zinc-300 uppercase mb-2">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@radwa.sa"
                      required
                      className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 pl-11 pr-4 py-3.5 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em] text-zinc-300 uppercase mb-2">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 pl-11 pr-11 py-3.5 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-zinc-500 hover:text-zinc-200 transition cursor-pointer p-1"
                      title="Toggle Password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-zinc-300 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white transition">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-700 text-white accent-white cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact Radwa IT Administrator at it@radwa.sa for credentials reset.')}
                    className="hover:text-white underline underline-offset-4 transition cursor-pointer text-zinc-300"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Pure White Primary Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-[0.18em] uppercase transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] mt-2 disabled:opacity-50"
                >
                  <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                </button>
              </form>

              {/* Switch to Sign Up */}
              <div className="text-center pt-2">
                <p className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-white hover:text-zinc-300 font-medium underline underline-offset-4 cursor-pointer ml-1 transition"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* SIGN UP VIEW (Reference Image 2) */
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-[11px] font-medium tracking-[0.26em] text-zinc-400 uppercase">
                  RADWA CONTRACTING & TRADING
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl text-white tracking-[0.04em] font-normal uppercase mt-3 mb-1">
                  CREATE ACCOUNT
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Begin your exclusive journey
                </p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em] text-zinc-300 uppercase mb-2">
                    FULL NAME
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Eng. Ahmed Al-Ghamdi"
                      required
                      className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 pl-11 pr-4 py-3.5 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em] text-zinc-300 uppercase mb-2">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@radwa.sa"
                      required
                      className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 pl-11 pr-4 py-3.5 transition"
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.14em] text-zinc-300 uppercase mb-2">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#0a0a0c] border border-zinc-800 focus:border-zinc-400 focus:outline-none rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 pl-11 pr-11 py-3.5 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-zinc-500 hover:text-zinc-200 transition cursor-pointer p-1"
                      title="Toggle Password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-[0.18em] uppercase transition duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] mt-3"
                >
                  <span>CREATE ACCOUNT</span>
                </button>
              </form>

              {/* Switch to Sign In */}
              <div className="text-center pt-2">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-white hover:text-zinc-300 font-medium underline underline-offset-4 cursor-pointer ml-1 transition"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Quick 1-Click Role Access */}
        <div className="bg-[#121214]/80 border border-white/[0.06] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              Quick 1-Click Role Access
            </span>
            <span className="text-[10px] font-mono text-zinc-500">11 Portals</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {(['admin', 'crm', 'md', 'estimator', 'operations', 'surveyor', 'qaqc', 'hse', 'hr', 'purchase', 'inventory'] as UserRole[]).map((r) => {
              const preset = PRESET_USERS[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickLoginAsRole(r)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0a0a0c] hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-left transition cursor-pointer group"
                  title={`${preset.name} (${preset.roleTitle})`}
                >
                  <div className="text-[10px] font-semibold text-zinc-300 group-hover:text-white uppercase truncate">
                    {r}
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">
                    {preset.name.split(' ').slice(-1)[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corporate Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-zinc-400">
            Radwa Contracting & Trading Ltd. • Jubail Industrial City, KSA
          </p>
          <p className="text-[10px] text-zinc-400 font-mono">
            Aramco SAPMT Vendor #10048291 • Sabic Approved #208411
          </p>
        </div>

      </div>

    </div>
  );
};
