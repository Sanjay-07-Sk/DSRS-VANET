import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { useAppStore } from '../store/useAppStore';
import { 
  Shield, 
  Bell, 
  Settings, 
  Sun, 
  Moon, 
  User, 
  Wifi, 
  WifiOff, 
  Radio, 
  Cpu, 
  Activity, 
  Truck,
  Globe,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    theme, 
    setTheme, 
    language, 
    setLanguage, 
    systemStatus, 
    toggleInternetOffline, 
    setIsSettingsModalOpen,
    setIsAuthModalOpen,
    setIsDatasetViewerOpen,
    currentUser,
    notifications 
  } = useApp();

  const resetDemoMode = useAppStore((state) => state.resetDemoMode);
  const isPresentationMode = useAppStore((state) => state.isPresentationMode);
  const togglePresentationMode = useAppStore((state) => state.togglePresentationMode);

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('20 May 2026');
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'LIVE MONITORING', key: 'liveMonitoring' },
    { id: 'FLEET MANAGEMENT', key: 'fleetManagement' },
    { id: 'AI ANALYTICS', key: 'aiAnalytics' },
    { id: 'HOSPITAL STATUS', key: 'hospitalStatus' },
    { id: 'REPORTS', key: 'reports' },
  ];

  return (
    <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-40 select-none">
      {/* Top Header Row */}
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center border border-[var(--border-strong)] shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-sans">
                {t('appName', language)}
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border-subtle)] text-[var(--text-tertiary)] font-semibold uppercase">
                v2.4
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {t('appSubtitle', language)}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[var(--text-primary)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t(item.key, language)}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)] rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-danger)] ring-2 ring-[var(--bg-surface)] animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)]">
                  <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider">Alerts & Notifications</span>
                  <span className="text-[10px] font-mono bg-[var(--border-subtle)] px-1.5 py-0.5 rounded text-[var(--text-tertiary)]">
                    {notifications.length} New
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.map((msg, i) => (
                    <div key={i} className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-warning)] mt-1 shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="System Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* Judge Demo Reset Button */}
          <button
            onClick={resetDemoMode}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Reset Environment to Initial Demo State for Judges"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Presentation Mode Toggle Pill */}
          <button
            onClick={togglePresentationMode}
            className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
              isPresentationMode
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle Production Presentation Mode"
          >
            {isPresentationMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isPresentationMode ? 'Presentation ON' : 'Presentation Mode'}</span>
          </button>

          {/* Language Toggle Quick Pill */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'EN' : 'TA'}</span>
          </button>

          {/* User Profile Info & Judge Switcher */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-[var(--border-subtle)] hover:opacity-80 transition-opacity text-left cursor-pointer"
            title="Switch Evaluator Role / Run Demo"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-blue-400 font-mono leading-tight mt-0.5">{currentUser.role}</div>
            </div>
          </button>

          {/* Clock Display */}
          <div className="hidden lg:block text-right pl-3 border-l border-[var(--border-subtle)] font-mono text-xs">
            <div className="font-bold text-[var(--text-primary)]">{timeStr || '12:45:30 PM'}</div>
            <div className="text-[10px] text-[var(--text-tertiary)]">{dateStr}</div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="md:hidden flex overflow-x-auto border-t border-[var(--border-subtle)] px-2 py-1 gap-1 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap rounded ${
              activeTab === item.id
                ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                : 'text-[var(--text-secondary)]'
            }`}
          >
            {t(item.key, language)}
          </button>
        ))}
      </div>

      {/* System Status Strip */}
      <div className={`border-t border-[var(--border-subtle)] py-1.5 px-4 text-xs font-mono transition-colors ${
        !systemStatus.internet ? 'bg-amber-950/40 text-amber-200 border-amber-800/50' : 'bg-[var(--bg-base)] text-[var(--text-secondary)]'
      }`}>
        <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 overflow-x-auto py-0.5">
            {/* Internet Status */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-2 h-2 rounded-full ${systemStatus.internet ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-rose-500 animate-pulse'}`} />
              <span className="font-semibold">{t('internet', language)}:</span>
              <span className={systemStatus.internet ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                {systemStatus.internet ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>

            {/* LoRa Mesh */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-semibold">{t('lora', language)}:</span>
              <span className="text-emerald-400">ACTIVE (433MHz)</span>
            </div>

            {/* AI Engine */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-semibold">{t('aiEngine', language)}:</span>
              <span className="text-emerald-400">ACRN ONLINE</span>
            </div>

            {/* Hospital Feed */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-semibold">{t('hospitalFeed', language)}:</span>
              <span className="text-emerald-400">LIVE (10s)</span>
            </div>

            {/* Vehicle Feed */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-semibold">{t('vehicleFeed', language)}:</span>
              <span className="text-emerald-400">LIVE (1s)</span>
            </div>
          </div>

          {/* Dev Demo Offline Toggle Button */}
          <div className="flex items-center gap-2 shrink-0">
            {!systemStatus.internet && (
              <span className="text-[11px] font-bold uppercase tracking-wide text-amber-300 animate-pulse flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                {t('missionContinues', language)}
              </span>
            )}
            <button
              onClick={toggleInternetOffline}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                systemStatus.internet 
                  ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' 
                  : 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
              title="Simulate network loss to verify LoRa mesh resilience for demo"
            >
              {systemStatus.internet ? 'Simulate Internet Loss' : 'Restore Internet Connection'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
