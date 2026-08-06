import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { X, User, ShieldCheck, Play, Key, Mail, Lock, Sparkles, LogOut, UserPlus, LogIn, Check, Shield } from 'lucide-react';

export const JudgeAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    currentUser, 
    token,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    runAiDecisionSteps,
    language
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile'>(token ? 'profile' : 'login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState(currentUser.email || 'judge@dsrs.gov.in');
  const [loginPassword, setLoginPassword] = useState('pass123');
  const [loginRole, setLoginRole] = useState<any>(currentUser.role || 'Judge / Evaluator');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<any>('Command Officer');

  // Profile Edit State
  const [profName, setProfName] = useState(currentUser.name);
  const [profEmail, setProfEmail] = useState(currentUser.email);
  const [profRole, setProfRole] = useState<any>(currentUser.role);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await loginUser(loginEmail, loginPassword, loginRole);
      setIsAuthModalOpen(false);
    } catch (err) {
      setErrorMsg('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await registerUser(regName, regEmail, regPassword, regRole);
      setIsAuthModalOpen(false);
    } catch (err) {
      setErrorMsg('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profName, profEmail, profRole);
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  const handleQuickDemoRun = async () => {
    setIsAuthModalOpen(false);
    await runAiDecisionSteps({
      type: 'Multi-Vehicle Collision',
      location: 'Anna Nagar, Chennai',
      zone: 'Zone 1 (North)',
      severity: 'HIGH',
      caller: 'Judge Demo Suite',
      victimCount: 8,
      description: 'Highway multi-car crash with trapped passengers requiring immediate ICU trauma prep.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                {language === 'ta' ? 'அதிகாரப்பூர்வ அங்கீகாரம்' : 'Authentication & Role Security'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">JWT Session, Role switching & Command Access</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Banner */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-b border-indigo-500/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                1-Click Judge Demo Suite
              </div>
              <p className="text-[11px] text-indigo-200/80 mt-0.5">
                Run end-to-end incident declaration, 5-step AI engine & live map dispatch.
              </p>
            </div>
            <button
              onClick={handleQuickDemoRun}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Flow
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-400 bg-[var(--bg-surface)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'register'
                ? 'border-blue-500 text-blue-400 bg-[var(--bg-surface)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400 bg-[var(--bg-surface)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Evaluator / Official Role
              </label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value as any)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              >
                <option value="Judge / Evaluator">Judge / Evaluator</option>
                <option value="Command Officer">Command Officer (Admin)</option>
                <option value="Hospital Coordinator">Hospital ER Coordinator</option>
                <option value="Ambulance Driver">Ambulance Fleet Driver</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                  placeholder="judge@dsrs.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                placeholder="Dr. K. Raman"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Official Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                placeholder="raman@dsrs.gov.in"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Role Assignment
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              >
                <option value="Judge / Evaluator">Judge / Evaluator</option>
                <option value="Command Officer">Command Officer (Admin)</option>
                <option value="Hospital Coordinator">Hospital ER Coordinator</option>
                <option value="Ambulance Driver">Ambulance Fleet Driver</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Create Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)]"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? 'Creating Account...' : 'Create Command Account'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: PROFILE & LOGOUT */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-4 text-xs">
            {profileSuccessMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4" />
                {profileSuccessMsg}
              </div>
            )}

            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">JWT Session Token</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--text-secondary)] truncate bg-[var(--bg-surface)] p-1.5 rounded border border-[var(--border-subtle)]">
                {token || 'dsrs-jwt-token-active-session'}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                  Current Role
                </label>
                <select
                  value={profRole}
                  onChange={(e) => setProfRole(e.target.value as any)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] font-semibold"
                >
                  <option value="Judge / Evaluator">Judge / Evaluator</option>
                  <option value="Command Officer">Command Officer (Admin)</option>
                  <option value="Hospital Coordinator">Hospital ER Coordinator</option>
                  <option value="Ambulance Driver">Ambulance Fleet Driver</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    setActiveTab('login');
                  }}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md shadow-blue-600/30 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
