import React from 'react';
import { Hospital } from '../types';
import { useAppStore } from '../store/useAppStore';
import { 
  X, 
  Building2, 
  Bed, 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  PhoneCall, 
  ShieldAlert, 
  Clock, 
  Truck, 
  MapPin, 
  Syringe, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface HospitalDetailsModalProps {
  hospitalId: string | null;
  onClose: () => void;
}

export const HospitalDetailsModal: React.FC<HospitalDetailsModalProps> = ({ hospitalId, onClose }) => {
  const hospitals = useAppStore((state) => state.hospitals);
  const vehicles = useAppStore((state) => state.vehicles);
  const missions = useAppStore((state) => state.missions);

  if (!hospitalId) return null;

  const hospital = hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return null;

  const hospitalMissions = missions.filter((m) => m.hospitalId === hospital.id || m.hospitalName === hospital.name);
  const nearbyAmbulances = vehicles.filter((v) => v.type === 'Ambulance' && (v.assignedHospital === hospital.name || v.location.includes(hospital.location.split(',')[0])));

  const icuAvail = (hospital.icuBeds?.total || 20) - (hospital.icuBeds?.occupied || 12);
  const ventAvail = (hospital.ventilators?.total || 12) - (hospital.ventilators?.occupied || 6);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[var(--text-primary)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-surface)] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono">
                <h2 className="text-base font-extrabold text-[var(--text-primary)]">{hospital.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  hospital.status === 'Critical'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : hospital.status === 'High Occupancy'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  • {hospital.status} ({hospital.occupancyRate}% Load)
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {hospital.location} • {hospital.emergencyLevel || 'Level 1 Trauma Center'}
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

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          
          {/* Top Capacity Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Bed className="w-4 h-4" />
                <span>Available Beds</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-400">{hospital.available}</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{hospital.occupied} / {hospital.totalCapacity} Occupied</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                <HeartPulse className="w-4 h-4" />
                <span>ICU Open Beds</span>
              </div>
              <div className="text-xl font-extrabold text-rose-400">{icuAvail} Avail</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{hospital.icuBeds?.occupied || 12} / {hospital.icuBeds?.total || 20} In Use</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                <Activity className="w-4 h-4" />
                <span>Ventilators</span>
              </div>
              <div className="text-xl font-extrabold text-purple-400">{ventAvail} Avail</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{hospital.ventilators?.occupied || 6} / {hospital.ventilators?.total || 12} In Use</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                <Stethoscope className="w-4 h-4" />
                <span>Medical Staff</span>
              </div>
              <div className="text-xl font-extrabold text-[var(--text-primary)]">{hospital.doctors || 28} Doctors</div>
              <div className="text-[10px] text-[var(--text-tertiary)] mt-1">{hospital.nurses || 58} ER Nurses</div>
            </div>
          </div>

          {/* Hospital Profile Details */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-3 font-mono">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <Building2 className="w-4 h-4 text-blue-400" />
              Hospital Emergency Profile
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Emergency Level</span>
                <span className="font-bold text-emerald-400">{hospital.emergencyLevel || 'Level 1 Trauma'}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Blood Reserve Units</span>
                <span className="font-bold text-rose-400">{hospital.bloodUnits || 120} Units</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Today's Missions</span>
                <span className="font-bold text-[var(--text-primary)]">{hospital.todaysMissions || 32} Missions</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Avg Response Time</span>
                <span className="font-bold text-amber-400">{hospital.avgResponseTime || 10.4} min</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Chief Medical Officer</span>
                <span className="font-bold text-[var(--text-primary)]">{hospital.chiefMedicalOfficer || 'Dr. R. Sundaram, MD (Trauma)'}</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[10px]">Emergency Hotline</span>
                <span className="font-bold text-rose-400">{hospital.contactPhone || '+91 44 2621 1000'}</span>
              </div>
            </div>
          </div>

          {/* Section: Nearby Ambulances & Live Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nearby Ambulances */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <Truck className="w-4 h-4 text-emerald-400" />
                Assigned / Nearby Ambulances ({nearbyAmbulances.length})
              </h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] font-mono">
                {nearbyAmbulances.map((amb) => (
                  <div key={amb.id} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400">{amb.id}</span>
                      <span className="text-[var(--text-tertiary)] ml-2">{amb.driver}</span>
                    </div>
                    <span className="text-blue-400 font-bold">{amb.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Alerts */}
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Hospital Alerts
              </h3>
              <div className="space-y-2 text-xs">
                {(hospital.alerts || ['ICU Capacity at High Occupancy', 'Trauma Bay Standby Active']).map((alert, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section: Mission History */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2 font-mono">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
              <FileText className="w-4 h-4 text-purple-400" />
              Hospital Mission History ({hospitalMissions.length} Missions Logged)
            </h3>
            <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
              {hospitalMissions.slice(0, 5).map((m) => (
                <div key={m.id} className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-400">{m.id}</span>
                    <span className="text-[var(--text-secondary)] ml-2">{m.emergencyType}</span>
                    <span className="text-[var(--text-tertiary)] ml-2">Unit: {m.ambulanceId}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{m.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-xs hover:opacity-90 transition-all shadow-md"
          >
            Close Hospital Profile
          </button>
        </div>

      </div>
    </div>
  );
};
