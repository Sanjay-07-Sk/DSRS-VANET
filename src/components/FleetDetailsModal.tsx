import React from 'react';
import { Vehicle } from '../types';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  Truck, 
  User, 
  Activity, 
  MapPin, 
  Radio, 
  Wrench, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  Fuel, 
  BatteryCharging, 
  Gauge, 
  Compass, 
  Building2, 
  FileText 
} from 'lucide-react';

interface FleetDetailsModalProps {
  vehicleId: string | null;
  onClose: () => void;
}

export const FleetDetailsModal: React.FC<FleetDetailsModalProps> = ({ vehicleId, onClose }) => {
  const vehicles = useAppStore((state) => state.vehicles);
  const missions = useAppStore((state) => state.missions);
  const incidents = useAppStore((state) => state.incidents);

  if (!vehicleId) return null;

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return null;

  const activeMission = missions.find((m) => m.id === vehicle.missionId || m.ambulanceId === vehicle.id);
  const assignedIncident = incidents.find((i) => i.id === vehicle.incidentId || i.id === activeMission?.emergencyId);
  const vehicleMissions = missions.filter((m) => m.ambulanceId === vehicle.id);

  const timelineSteps = [
    { title: 'Mission Created', time: activeMission?.createdAt ? new Date(activeMission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30 PM', done: (activeMission?.stepIndex || 0) >= 1 },
    { title: 'Hospital Ack & Reserved', time: activeMission?.hospitalAckTime || '12:31 PM', done: (activeMission?.stepIndex || 0) >= 2 },
    { title: 'Vehicle En Route', time: activeMission?.createdAt ? '12:33 PM' : '12:33 PM', done: (activeMission?.stepIndex || 0) >= 3 },
    { title: 'Patient Picked Up', time: activeMission?.pickupTime || '12:38 PM', done: (activeMission?.stepIndex || 0) >= 4 },
    { title: 'Transporting to ER', time: '12:42 PM', done: (activeMission?.stepIndex || 0) >= 5 },
    { title: 'Patient Delivered', time: activeMission?.deliveredTime || '12:45 PM', done: (activeMission?.stepIndex || 0) >= 6 },
    { title: 'Mission Completed', time: activeMission?.completedAt ? new Date(activeMission.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:48 PM', done: (activeMission?.stepIndex || 0) >= 7 },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[var(--text-primary)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-surface)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-lg">
              {vehicle.type === 'Ambulance' ? '🚑' : vehicle.type === 'Fire Truck' ? '🚒' : vehicle.type === 'Police Vehicle' ? '🚓' : '🚁'}
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">{vehicle.id}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  vehicle.status === 'On Mission'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : vehicle.status === 'Active'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  • {vehicle.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {vehicle.type} • Telemetry Sync Live ({vehicle.lastUpdate})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Top 4 Realtime KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Fuel className="w-4 h-4" />
                <span>Fuel Level</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--text-primary)]">{vehicle.fuel}%</div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${vehicle.fuel}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                <BatteryCharging className="w-4 h-4" />
                <span>Battery Status</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--text-primary)]">{vehicle.battery}%</div>
              <div className="h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${vehicle.battery}%` }} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Gauge className="w-4 h-4" />
                <span>Current Speed</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--text-primary)]">{vehicle.speed} km/h</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">Heading: {vehicle.heading}°</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                <Radio className="w-4 h-4" />
                <span>Comm Status</span>
              </div>
              <div className="text-sm font-extrabold text-[var(--text-primary)] truncate">{vehicle.commStatus || 'LoRa Mesh Active'}</div>
              <div className="text-[10px] text-emerald-400 mt-1">{vehicle.packetCount || 1420} Packets Received</div>
            </div>
          </div>

          {/* Section: Driver & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Driver Details Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <User className="w-4 h-4 text-blue-400" />
                Driver Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Driver Name</span>
                  <span className="font-bold text-[var(--text-primary)]">{vehicle.driver}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Driver ID</span>
                  <span className="font-mono text-blue-400">{vehicle.driverId || 'DRV-1042'}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Phone</span>
                  <span className="font-mono text-[var(--text-primary)]">{vehicle.driverPhone || '+91 98400 48210'}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Current Shift</span>
                  <span className="font-mono text-emerald-400">{vehicle.driverShift || 'Day Shift (08:00 - 16:00)'}</span>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Card */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Emergency Contacts
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Command Dispatcher:</span>
                  <span className="font-bold text-[var(--text-primary)]">{vehicle.emergencyContacts?.dispatcher || 'Dispatcher R. Nair (+91 44 2829 9901)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Zonal Supervisor:</span>
                  <span className="font-bold text-[var(--text-primary)]">{vehicle.emergencyContacts?.supervisor || 'Capt. R. Deshmukh (+91 98400 11223)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Emergency Hotline:</span>
                  <span className="font-bold text-rose-400">{vehicle.emergencyContacts?.emergencyLine || '108 Command Hotline'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section: GPS & Telemetry Details */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
              <MapPin className="w-4 h-4 text-red-400" />
              Live GPS & LoRa Mesh Telemetry
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Location Name</span>
                <span className="font-bold text-[var(--text-primary)]">{vehicle.location}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Latitude / Longitude</span>
                <span className="font-bold text-blue-400">{vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">LoRa RSSI / SNR</span>
                <span className="font-bold text-emerald-400">
                  {vehicle.loraStats?.rssi || -82} dBm / {vehicle.loraStats?.snr || 12.4} dB
                </span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Packet Loss Rate</span>
                <span className="font-bold text-emerald-400">{vehicle.loraStats?.packetLoss || 0.5}%</span>
              </div>
            </div>
          </div>

          {/* Section: Current Mission Details & 7-Step Interactive Timeline */}
          {activeMission && (
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-blue-500/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-mono">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Active Mission Details ({activeMission.id})
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono text-[10px] font-bold">
                  ETA: {activeMission.etaMinutes} min • ACRN Confidence: {activeMission.acrnConfidence}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Emergency Type</span>
                  <span className="font-bold text-[var(--text-primary)]">{activeMission.emergencyType}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Assigned Hospital</span>
                  <span className="font-bold text-emerald-400">{activeMission.hospitalName}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[10px]">Incident ID</span>
                  <span className="font-bold text-blue-400">{activeMission.emergencyId}</span>
                </div>
              </div>

              {/* 7-Step Timeline */}
              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <h4 className="text-[10px] font-mono uppercase text-[var(--text-tertiary)] mb-3">Mission Step Progress Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 font-mono text-[10px]">
                  {timelineSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        step.done
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-60'
                      }`}
                    >
                      <div className="font-bold">Step {idx + 1}</div>
                      <div className="truncate text-[9px] mt-0.5">{step.title}</div>
                      <div className="text-[8px] opacity-75 mt-0.5">{step.time}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Section: Maintenance Log & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Maintenance Log */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <Wrench className="w-4 h-4 text-purple-400" />
                Maintenance Log & Service
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Maintenance Status:</span>
                  <span className="font-bold text-emerald-400">{vehicle.maintenanceStatus || 'OK'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Last Service Date:</span>
                  <span className="text-[var(--text-primary)]">{vehicle.lastServiceDate || '2026-04-15'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Next Inspection Due:</span>
                  <span className="text-[var(--text-primary)]">{vehicle.nextServiceDate || '2026-06-15'}</span>
                </div>
              </div>
            </div>

            {/* Mission History */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <FileText className="w-4 h-4 text-amber-400" />
                Mission History ({vehicleMissions.length} Missions)
              </h3>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-[11px] font-mono">
                {vehicleMissions.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-1.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-400">{m.id}</span>
                      <span className="text-[var(--text-secondary)] ml-2">{m.emergencyType}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{m.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            Close Telemetry Details
          </button>
        </div>

      </div>
    </div>
  );
};
