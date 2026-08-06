import React from 'react';
import { useApp } from '../context/AppContext';
import { useAppStore } from '../store/useAppStore';
import { t } from '../i18n';
import { LiveMap } from './LiveMap';
import { HardwareTelemetryPanel } from './HardwareTelemetryPanel';
import { 
  Plus, 
  AlertTriangle, 
  Flame, 
  Activity, 
  ShieldAlert, 
  Truck, 
  Building2, 
  Cpu, 
  Navigation, 
  TrendingUp,
  Hospital as HospitalIcon,
  Wifi,
  Cloud,
  CheckCircle,
  Clock,
  Radio,
  Zap,
  CheckCircle2,
  RefreshCw,
  Database,
  Layers,
  ArrowRight,
  Shield,
  Gauge,
  WifiOff,
  Server
} from 'lucide-react';

export const LiveMonitoringView: React.FC = () => {
  const { 
    incidents, 
    vehicles, 
    hospitals, 
    missions,
    setIsCreateModalOpen, 
    language 
  } = useApp();

  // Zustand Store Selectors
  const offlineState = useAppStore((state) => state.offlineState);
  const triggerOfflineSimulation = useAppStore((state) => state.triggerOfflineSimulation);
  const mapCheckpointStep = useAppStore((state) => state.mapCheckpointStep);
  const aiDecisionStream = useAppStore((state) => state.aiDecisionStream);

  // Active Mission & Target Entities
  const activeMission = missions.find(m => m.status !== 'COMPLETED') || missions[0];
  const activeIncident = incidents[0] || {
    id: 'INC-101',
    type: 'Flood - Zone 3',
    location: 'Anna Nagar, Chennai',
    severity: 'HIGH',
    victimCount: 14,
    description: 'Waterlogging level rising rapidly above 3 feet near metro station.',
    timeStr: '12:31 PM'
  };

  const matchedAmbulance = vehicles.find(v => v.id === activeMission?.ambulanceId) || vehicles.find(v => v.type === 'Ambulance') || vehicles[0];
  const matchedHospital = hospitals.find(h => h.id === activeMission?.hospitalId) || hospitals[0];

  // Aggregate fleet stats
  const ambActive = vehicles.filter(v => v.type === 'Ambulance' && v.status === 'On Mission').length;
  const ambIdle = vehicles.filter(v => v.type === 'Ambulance' && v.status === 'Idle').length;
  const totalPackets = vehicles.reduce((acc, v) => acc + (v.packetCount || 1420), 0);

  // Mission Timeline 12-Step Checkpoint Master Configuration
  const timelineSteps = [
    { step: 1, name: 'Incident Created', detail: '108 Dispatch Call Registered' },
    { step: 2, name: 'AI Analysis', detail: 'ACRN Neural Engine Evaluating' },
    { step: 3, name: 'Ambulance Assigned', detail: `${matchedAmbulance.id} Selected` },
    { step: 4, name: 'Hospital Reserved', detail: `${matchedHospital.name} ER Bay` },
    { step: 5, name: 'Mission Generated', detail: 'V2X Green Wave Clearance' },
    { step: 6, name: 'En Route Incident', detail: 'Navigating Scene via Arterial' },
    { step: 7, name: 'Arrived at Scene', detail: 'Triage & Stabilization' },
    { step: 8, name: 'Patient Loaded', detail: 'Vitals Synced to Trauma Unit' },
    { step: 9, name: 'En Route Hospital', detail: 'High-Speed ER Transit' },
    { step: 10, name: 'Hospital Arrival', detail: 'Trauma Team Entrance' },
    { step: 11, name: 'Patient Delivered', detail: 'ICU Transfer Complete' },
    { step: 12, name: 'Mission Completed', detail: 'Unit Released to Base' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 max-w-[1920px] mx-auto font-sans text-xs text-[var(--text-primary)]">
      
      {/* ==========================================
          HEADER SYSTEM STATUS BADGES BAR (12 Cols)
         ========================================== */}
      <div className="lg:col-span-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center font-bold text-red-400 font-mono text-sm">
            🏛️
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wider uppercase text-[var(--text-primary)] font-mono flex items-center gap-2">
              TN GOVT EMERGENCY COMMAND CENTER — DSRS-VANET
            </h1>
            <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
              Dynamic Smart Routing System • V2X Mesh Network • Chennai Zone
            </p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LoRa Mesh: 99.2%</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>ACRN Core: Online</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>Hospitals: 6 Synced</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-amber-400" />
            <span>Fleet: 38 Telemetry</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
            offlineState.isCloudConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
          }`}>
            {offlineState.isCloudConnected ? <Cloud className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{offlineState.isCloudConnected ? 'Cloud Online' : 'Offline Mesh Active'}</span>
          </div>
        </div>
      </div>

      {/* ==========================================
          LEFT COLUMN: Incident & Resource Intelligence (3 Cols)
         ========================================== */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Incident Summary Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Incident Intelligence
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1 font-bold text-[10px] cursor-pointer shadow-sm"
              title="Declare Emergency Incident"
            >
              <Plus className="w-3 h-3" />
              <span>+ Declare</span>
            </button>
          </div>

          {/* Active Incident Details */}
          <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-rose-500/30 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">{activeIncident.id || 'INC-101'}</span>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-0.5">{activeIncident.type}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                {activeIncident.severity}
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {activeIncident.description}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] font-mono text-[10px]">
              <div>
                <span className="text-[var(--text-tertiary)] block">Location</span>
                <span className="font-bold text-[var(--text-primary)]">{activeIncident.location}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block">Casualties</span>
                <span className="font-bold text-rose-400">{activeIncident.victimCount || 14} Injured</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Priority Engine Breakdown */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-purple-400" />
            AI Priority Engine Breakdown
          </h2>

          <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-purple-500/30 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-bold">ACRN Risk Score</span>
              <span className="font-extrabold text-rose-400 text-sm">95 / 100</span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full mt-2 overflow-hidden border border-[var(--border-subtle)]">
              <div className="h-full bg-gradient-to-r from-amber-500 to-rose-600 w-[95%]" />
            </div>
          </div>

          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Rainfall Intensity</span>
              <span className="font-bold text-blue-400">Extreme (84 mm/h)</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Traffic Congestion</span>
              <span className="font-bold text-amber-400">High (Level 4)</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">ER ICU Bed Scarcity</span>
              <span className="font-bold text-rose-400">Critical (85% Occ)</span>
            </div>
          </div>
        </div>

        {/* Ambulance Intelligence Panel */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono">
            <Truck className="w-4 h-4 text-emerald-400" />
            Ambulance Intelligence
          </h2>

          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] font-mono space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-400">{matchedAmbulance.id}</span>
              <span className="text-[10px] text-blue-400">{matchedAmbulance.driver}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div><span className="text-[var(--text-tertiary)]">Speed:</span> <span className="font-bold text-[var(--text-primary)]">{matchedAmbulance.speed || 64} km/h</span></div>
              <div><span className="text-[var(--text-tertiary)]">Fuel / Bat:</span> <span className="font-bold text-emerald-400">{matchedAmbulance.fuel || 88}%</span></div>
              <div><span className="text-[var(--text-tertiary)]">Equip:</span> <span className="font-bold text-purple-400">ALS Ready</span></div>
              <div><span className="text-[var(--text-tertiary)]">LoRa Link:</span> <span className="font-bold text-emerald-400">-82 dBm</span></div>
            </div>
          </div>
        </div>

        {/* Hospital Intelligence Panel */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono">
            <Building2 className="w-4 h-4 text-blue-400" />
            Hospital Intelligence
          </h2>

          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] font-mono space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[var(--text-primary)]">{matchedHospital.name}</span>
              <span className="text-[10px] text-emerald-400">Level 1 Trauma</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div><span className="text-[var(--text-tertiary)] font-bold">Avail Beds:</span> <span className="font-bold text-emerald-400">{matchedHospital.available}</span></div>
              <div><span className="text-[var(--text-tertiary)] font-bold">ICU Open:</span> <span className="font-bold text-rose-400">{(matchedHospital.icuBeds?.total || 20) - (matchedHospital.icuBeds?.occupied || 12)}</span></div>
            </div>
          </div>
        </div>

        {/* Hardware & LoRa Mesh Telemetry Panel */}
        <HardwareTelemetryPanel />

        {/* Explainable Decision Trace */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono">
            <Shield className="w-4 h-4 text-amber-400" />
            Explainable Decision Trace
          </h2>
          <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-secondary)] leading-relaxed">
            "Selected <strong className="text-emerald-400">{matchedAmbulance.id}</strong> due to 2.1km proximity and Advanced Life Support capability. Reserved <strong className="text-blue-400">{matchedHospital.name}</strong> as nearest Level 1 Trauma Center with open ICU bed."
          </div>
        </div>

        {/* Offline Continuity Simulation Interactive Panel */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Offline Continuity & Recovery
            </h2>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
              offlineState.isCloudConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}>
              {offlineState.isCloudConnected ? 'Cloud Online' : 'Cloud Disconnected'}
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)]">
            Demonstrate zero data loss when internet cloud connection is severed.
          </p>

          <button
            onClick={() => triggerOfflineSimulation()}
            disabled={offlineState.isSimulatingFailure}
            className={`w-full py-2.5 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              offlineState.isSimulatingFailure
                ? 'bg-amber-600/30 text-amber-400 border border-amber-500/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border border-amber-400/30'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            <span>{offlineState.isSimulatingFailure ? 'Simulating Network Failure...' : 'Simulate Network Failure'}</span>
          </button>

          {/* Offline Sync Telemetry & Progress */}
          <div className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2 font-mono text-[10px]">
            <div className="flex justify-between items-center text-[var(--text-secondary)]">
              <span>Status:</span>
              <span className="font-bold text-[var(--text-primary)] truncate max-w-[160px]">{offlineState.offlineStatusText}</span>
            </div>

            <div className="flex justify-between items-center text-[var(--text-secondary)]">
              <span>Buffered Local Events:</span>
              <span className="font-bold text-amber-400">{offlineState.bufferedEventsCount} Events</span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[9px] text-[var(--text-tertiary)]">
                <span>Cloud Sync Progress</span>
                <span className="font-bold text-emerald-400">{offlineState.syncProgressPercent}%</span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${offlineState.syncProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================
          CENTER COLUMN: Digital Twin Map & AI Decision Stream (6 Cols)
         ========================================== */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Digital Twin Map Container */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] px-2 font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              Digital Twin Map (V2X Green Wave Live)
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              60 FPS Interpolated Routing
            </span>
          </div>
          
          <LiveMap height="540px" />
        </div>

        {/* AI Decision Stream (Animated Step-by-Step Stream) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
              AI Decision Engine Stream (Live Trace)
            </h2>
            <span className="text-[10px] text-purple-400 font-bold">Auto-Scroll Stream</span>
          </div>

          {/* Animated Stream Rows */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
            {aiDecisionStream.map((s) => (
              <div
                key={s.id}
                className={`p-2.5 rounded-lg border transition-all duration-500 flex items-center justify-between gap-3 ${
                  s.status === 'selected'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : s.status === 'rejected'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : s.status === 'completed'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[var(--text-tertiary)]">{s.timestamp}</span>
                    <span className="font-bold text-xs text-[var(--text-primary)]">{s.stepName}</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{s.detail}</div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border shrink-0 ${
                  s.status === 'selected'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : s.status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==========================================
          RIGHT COLUMN: Mission Timeline & Network Telemetry (3 Cols)
         ========================================== */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Mission Timeline Card (Synchronized with Map Movement Checkpoints 1-12) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Mission Timeline (Map Sync)
            </h2>
            <span className="text-[10px] font-bold text-emerald-400">Step {mapCheckpointStep} / 12</span>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 font-mono text-[11px]">
            {timelineSteps.map((st) => {
              const isPast = st.step < mapCheckpointStep;
              const isCurrent = st.step === mapCheckpointStep;

              return (
                <div
                  key={st.step}
                  className={`p-2 rounded-lg border transition-all flex items-center gap-2.5 ${
                    isCurrent
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-60'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                    isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : isPast
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]'
                  }`}>
                    {isPast ? '✓' : st.step}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[11px]">{st.name}</div>
                    <div className="text-[9px] opacity-75 truncate">{st.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Network & System Telemetry Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-mono text-xs space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Live System Telemetry
          </h2>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">LoRa Mesh Band</span>
              <span className="font-bold text-emerald-400">868MHz + 433MHz</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Total LoRa Packets</span>
              <span className="font-bold text-blue-400">{totalPackets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Cloud Database</span>
              <span className="font-bold text-purple-400">Supabase Cloud</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Backend API Server</span>
              <span className="font-bold text-emerald-400">Node/Express Online</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
