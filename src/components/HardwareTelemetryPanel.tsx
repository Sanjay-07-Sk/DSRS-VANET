import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Radio, Cpu, Activity, Signal, Zap, CheckCircle2 } from 'lucide-react';

export const HardwareTelemetryPanel: React.FC = () => {
  const hardwareTelemetry = useAppStore((state) => state.hardwareTelemetry);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] font-mono">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Hardware & LoRa Mesh Telemetry
        </h2>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          ESP32 Online
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        {/* ESP32 Status */}
        <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <div className="text-[9px] text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> ESP32 Gateway Node
          </div>
          <div className="font-extrabold text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {hardwareTelemetry.esp32Status}
          </div>
        </div>

        {/* LoRa SX1276 Link */}
        <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <div className="text-[9px] text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Radio className="w-3 h-3 text-blue-400" /> LoRa Mesh Link
          </div>
          <div className="font-extrabold text-blue-400 text-xs mt-0.5">
            {hardwareTelemetry.loraLink} (868MHz)
          </div>
        </div>

        {/* Signal RSSI */}
        <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <div className="text-[9px] text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Signal className="w-3 h-3 text-purple-400" /> Signal RSSI
          </div>
          <div className="font-extrabold text-purple-400 text-xs mt-0.5">
            {hardwareTelemetry.rssi} dBm
          </div>
        </div>

        {/* Signal SNR */}
        <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <div className="text-[9px] text-[var(--text-tertiary)] uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Signal SNR
          </div>
          <div className="font-extrabold text-emerald-400 text-xs mt-0.5">
            +{hardwareTelemetry.snr} dB
          </div>
        </div>
      </div>

      {/* Extended Telemetry Footer Bar */}
      <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] font-mono text-[10px] space-y-1">
        <div className="flex justify-between">
          <span className="text-[var(--text-tertiary)]">Packet Counter:</span>
          <span className="font-bold text-blue-400">{hardwareTelemetry.packetCount.toLocaleString()} Packets</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-tertiary)]">Comm Quality / Heartbeat:</span>
          <span className="font-bold text-emerald-400">{hardwareTelemetry.commQuality}% • {hardwareTelemetry.lastHeartbeat}</span>
        </div>
      </div>
    </div>
  );
};
