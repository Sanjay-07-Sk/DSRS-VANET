import React from 'react';
import { useApp } from '../context/AppContext';
import { Cpu, CheckCircle2, Loader2, Sparkles, X, ShieldAlert, ArrowRight } from 'lucide-react';

export const AiEngineModal: React.FC = () => {
  const { isAiEngineModalOpen, setIsAiEngineModalOpen, aiRunnerSteps } = useApp();

  if (!isAiEngineModalOpen) return null;

  const isAllCompleted = aiRunnerSteps.every(s => s.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                ACRN AI Decision Engine
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  Live Execution
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Step-by-step algorithmic emergency dispatch & negotiation</p>
            </div>
          </div>
          {isAllCompleted && (
            <button
              onClick={() => setIsAiEngineModalOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Steps */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {aiRunnerSteps.map((step) => (
              <div 
                key={step.step}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  step.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : step.status === 'processing'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-[var(--bg-base)] border-[var(--border-subtle)] opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : step.status === 'processing' ? (
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-dashed border-[var(--text-tertiary)] flex items-center justify-center text-[10px] font-mono text-[var(--text-tertiary)] font-bold">
                        {step.step}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                      {step.step}. {step.title}
                    </h4>
                    {step.result && (
                      <div className="text-xs font-mono font-semibold text-emerald-400 mt-1">
                        {step.result}
                      </div>
                    )}
                    {step.detail && (
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                        {step.detail}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border">
                  {step.status === 'completed' ? (
                    <span className="text-emerald-400 border-emerald-500/30">Done</span>
                  ) : step.status === 'processing' ? (
                    <span className="text-indigo-400 border-indigo-500/30 animate-pulse">Running</span>
                  ) : (
                    <span className="text-[var(--text-tertiary)] border-transparent">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer controls */}
          {isAllCompleted ? (
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4" />
                Mission Dispatched & Tracked Live on Map
              </div>
              <button
                onClick={() => setIsAiEngineModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>View Live Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-2 text-center text-xs font-mono text-[var(--text-tertiary)] animate-pulse">
              Computing optimal V2X route & hospital bed availability...
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
