import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { X, AlertTriangle, Send, MapPin, ShieldAlert, Cpu, Calendar, Clock, Flame, Activity, Truck, Map } from 'lucide-react';
import { LocationPickerModal, CHENNAI_LANDMARKS } from './LocationPickerModal';

export const CreateIncidentModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, addIncident, language } = useApp();
  const [loading, setLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const [formData, setFormData] = useState({
    type: 'Road Accident',
    location: 'Anna Nagar, Chennai',
    zone: 'Zone 1 (North)',
    priority: 'P1 - Immediate / Critical',
    severity: 'HIGH' as 'HIGH' | 'MEDIUM' | 'LOW',
    caller: 'Command Specialist',
    victimCount: 6,
    description: 'Multi-vehicle crash with trapped passengers requiring immediate trauma extraction and ICU pre-notification.',
    date: todayStr,
    time: nowStr,
    lat: 13.0878,
    lng: 80.2170
  });

  if (!isCreateModalOpen) return null;

  if (isMapOpen) {
    return (
      <LocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        initialLat={formData.lat}
        initialLng={formData.lng}
        initialLocation={formData.location}
        initialZone={formData.zone}
        onConfirm={(locData) => {
          setFormData(prev => ({
            ...prev,
            location: locData.name,
            zone: locData.zone,
            lat: locData.lat,
            lng: locData.lng
          }));
          setIsMapOpen(false);
        }}
      />
    );
  }

  const chennaiLocations = CHENNAI_LANDMARKS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addIncident({
      type: formData.type,
      location: formData.location,
      zone: formData.zone,
      severity: formData.severity,
      caller: formData.caller,
      victimCount: formData.victimCount,
      description: `${formData.description} [Priority: ${formData.priority} | Scheduled: ${formData.date} ${formData.time}]`,
      lat: formData.lat,
      lng: formData.lng
    });
    setLoading(false);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 border border-red-500/40 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">Declare Emergency Incident</h3>
                <p className="text-xs text-[var(--text-secondary)]">Triggers end-to-end 18-step ACRN AI Command & Dispatch Workflow</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
            
            {/* Incident Type Selector Cards */}
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-2 uppercase tracking-wider">
                1. Incident Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Road Accident', label: 'Road Accident', icon: Truck, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                  { id: 'Fire', label: 'Fire Emergency', icon: Flame, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
                  { id: 'Flood', label: 'Flood Crisis', icon: Activity, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = formData.type.startsWith(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: item.id })}
                      className={`p-3 rounded-xl border text-center font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? `${item.color} ring-2 ring-blue-500 shadow-md scale-[1.02]`
                          : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Landmark */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  2. Location Landmark (Chennai)
                </label>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Preview Map / Pick on Map</span>
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={formData.location}
                  onChange={(e) => {
                    const loc = chennaiLocations.find(l => l.name === e.target.value);
                    if (loc) {
                      setFormData({
                        ...formData,
                        location: loc.name,
                        zone: loc.zone,
                        lat: loc.lat,
                        lng: loc.lng
                      });
                    } else {
                      setFormData({ ...formData, location: e.target.value });
                    }
                  }}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
                >
                  {chennaiLocations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name} ({loc.zone})
                    </option>
                  ))}
                  {!chennaiLocations.some(l => l.name === formData.location) && (
                    <option value={formData.location}>{formData.location}</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-blue-500/50 text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center justify-center"
                  title="Open Interactive Map"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Victim Count, Priority & Severity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider">
                Victim Count
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.victimCount}
                onChange={(e) => setFormData({ ...formData, victimCount: Number(e.target.value) })}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 font-mono text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              >
                <option value="P1 - Immediate / Critical">P1 - Critical</option>
                <option value="P2 - High Urgency">P2 - High</option>
                <option value="P3 - Moderate">P3 - Moderate</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider">
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 font-mono text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 font-mono text-[var(--text-primary)] font-semibold focus:outline-none focus:border-[var(--border-strong)]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[var(--text-secondary)] font-bold mb-1 uppercase tracking-wider">
              Description / Field Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl p-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 animate-pulse" />
              {loading ? 'Initiating ACRN...' : 'Confirm Incident & Launch Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

