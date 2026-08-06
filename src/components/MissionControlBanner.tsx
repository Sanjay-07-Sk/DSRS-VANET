import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Navigation, Hospital, CheckCircle2, Clock, Truck, Activity, ArrowRight } from 'lucide-react';
import { MissionStatus } from '../types';

export const MissionControlBanner: React.FC = () => {
  const { missions } = useApp();

  const activeMission = missions.find(m => m.status !== 'COMPLETED') || missions[0];

  if (!activeMission) return null;

  const steps: { status: MissionStatus; label: string }[] = [
    { status: 'CREATED', label: '1. Declared' },
    { status: 'HOSPITAL_ACKNOWLEDGED', label: '2. Hosp ACK' },
    { status: 'AMBULANCE_EN_ROUTE', label: '3. En Route' },
    { status: 'PATIENT_PICKED_UP', label: '4. Loaded' },
    { status: 'TRANSPORTING_TO_HOSPITAL', label: '5. Transport' },
    { status: 'PATIENT_DELIVERED', label: '6. Delivered' },
    { status: 'COMPLETED', label: '7. Completed' }
  ];

  const handleForceComplete = async (mId: string) => {
    try {
      await fetch(`/api/missions/${mId}/complete`, { method: 'PATCH' });
    } catch (err) {
      console.error("Error completing mission", err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border-b border-blue-500/30 p-3 shadow-lg select-none">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
        
        {/* Left ID & Emergency Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold font-mono shadow-inner">
            <Truck className="w-5 h-5 animate-pulse text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold font-mono text-sm text-white">{activeMission.id}</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px] font-mono font-bold border border-blue-400/30">
                ACRN {activeMission.acrnConfidence}% Confidence
              </span>
            </div>
            <div className="text-[11px] text-blue-200/80 font-medium">
              {activeMission.emergencyType} @ {activeMission.location} → <strong className="text-white">{activeMission.hospitalName}</strong>
            </div>
          </div>
        </div>

        {/* Center Step Tracker Progress */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-1 overflow-x-auto py-1 max-w-2xl justify-center font-mono">
          {steps.map((s, idx) => {
            const isDone = activeMission.stepIndex > idx + 1 || activeMission.status === s.status || activeMission.status === 'COMPLETED';
            const isCurrent = activeMission.status === s.status;

            return (
              <div key={s.status} className="flex items-center gap-1.5 shrink-0">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-500 text-white border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-black/30 text-[var(--text-tertiary)] border-transparent'
                }`}>
                  {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : null}
                  <span>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right ETA & Force Complete Action */}
        <div className="flex items-center gap-3 shrink-0 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-blue-200/70 uppercase">Est. V2X Arrival</div>
            <div className="text-xs font-bold text-emerald-400">{activeMission.etaMinutes} mins</div>
          </div>
          {activeMission.status !== 'COMPLETED' && (
            <button
              onClick={() => handleForceComplete(activeMission.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-md transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete Mission
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
