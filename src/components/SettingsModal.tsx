import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { X, Settings, Sun, Moon, Laptop, Globe, Radio, Shield, Database } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    theme, 
    setTheme, 
    language, 
    setLanguage,
    systemStatus,
    toggleInternetOffline
  } = useApp();

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[var(--text-primary)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">Command Center Settings</h3>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Theme Settings */}
          <div>
            <label className="block text-[var(--text-secondary)] font-semibold mb-2 uppercase tracking-wider">
              Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 font-medium transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 font-bold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 font-medium transition-all ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Laptop className="w-5 h-5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-[var(--text-secondary)] font-semibold mb-2 uppercase tracking-wider">
              Interface Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Globe className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold text-xs">English</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Default (Global)</div>
                </div>
              </button>

              <button
                onClick={() => setLanguage('ta')}
                className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${
                  language === 'ta'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Globe className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <div className="font-semibold text-xs">தமிழ் (Tamil)</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Regional Command</div>
                </div>
              </button>
            </div>
          </div>

          {/* Hardware & Telemetry Mode */}
          <div className="border-t border-[var(--border-subtle)] pt-4 space-y-3">
            <label className="block text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
              Network & Telemetry Simulation
            </label>
            <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">LoRa Resilience Mesh Mode</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">Simulate 433MHz frequency fallback when WAN drops</div>
                </div>
              </div>
              <button
                onClick={toggleInternetOffline}
                className={`px-3 py-1.5 rounded font-mono font-bold text-[11px] border transition-all ${
                  !systemStatus.internet 
                    ? 'bg-amber-500 text-black border-amber-400' 
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                }`}
              >
                {!systemStatus.internet ? 'LoRa Active' : 'WAN Active'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-end">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-5 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
