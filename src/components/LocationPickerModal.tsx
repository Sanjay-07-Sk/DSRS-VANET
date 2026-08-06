import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { X, MapPin, CheckCircle2, Navigation, Layers, Building2, Truck, Shield, AlertTriangle, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialLocation?: string;
  initialZone?: string;
  onConfirm: (locationData: { name: string; zone: string; lat: number; lng: number }) => void;
}

export const CHENNAI_LANDMARKS = [
  { name: 'Anna Nagar, Chennai', zone: 'Zone 1 (North)', lat: 13.0878, lng: 80.2170 },
  { name: 'Manali Industrial Estate, Chennai', zone: 'Zone 1 (North)', lat: 13.1667, lng: 80.2667 },
  { name: 'Porur Junction, Chennai', zone: 'Zone 4 (East)', lat: 13.0382, lng: 80.1565 },
  { name: 'Guindy Flyover, Chennai', zone: 'Zone 3 (South)', lat: 13.0067, lng: 80.2020 },
  { name: 'T. Nagar, Chennai', zone: 'Zone 2 (Central)', lat: 13.0418, lng: 80.2341 },
  { name: 'Adyar Canal, Chennai', zone: 'Zone 3 (South)', lat: 13.0012, lng: 80.2565 },
  { name: 'Velachery Bypass, Chennai', zone: 'Zone 3 (South)', lat: 12.9815, lng: 80.2180 },
  { name: 'Ambattur Estate, Chennai', zone: 'Zone 2 (Central)', lat: 13.1143, lng: 80.1548 },
];

// Helper to calculate distance in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Marker Icons
const createIncidentIcon = () => {
  return L.divIcon({
    className: 'custom-picker-incident-marker',
    html: `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:-8px; border-radius:50%; background:rgba(239,68,68,0.35); border:2px solid #ef4444; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width:38px; height:38px; border-radius:50%; background:#dc2626; border:3px solid #ffffff; box-shadow:0 0 20px rgba(220,38,38,0.9); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:20px;">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const createHospitalIcon = () => {
  return L.divIcon({
    className: 'custom-picker-hospital-marker',
    html: `
      <div style="width:32px; height:32px; border-radius:8px; background:#059669; border:2.5px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
        🏥
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createVehicleIcon = (emoji: string, bg: string) => {
  return L.divIcon({
    className: 'custom-picker-vehicle-marker',
    html: `
      <div style="width:30px; height:30px; border-radius:50%; background:${bg}; border:2px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:14px;">
        ${emoji}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Map subcomponents
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true, duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat = 13.0878,
  initialLng = 80.2170,
  initialLocation = 'Anna Nagar, Chennai',
  initialZone = 'Zone 1 (North)',
  onConfirm,
}) => {
  const { hospitals, vehicles } = useApp();

  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [selectedName, setSelectedName] = useState(initialLocation);
  const [selectedZone, setSelectedZone] = useState(initialZone);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat);
      setSelectedLng(initialLng);
      setSelectedName(initialLocation);
      setSelectedZone(initialZone);
    }
  }, [isOpen, initialLat, initialLng, initialLocation, initialZone]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Function to update location based on coordinates clicked or landmark selected
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);

    // Find closest known landmark
    let closest = CHENNAI_LANDMARKS[0];
    let minDist = getDistanceKm(lat, lng, closest.lat, closest.lng);

    for (const lm of CHENNAI_LANDMARKS) {
      const dist = getDistanceKm(lat, lng, lm.lat, lm.lng);
      if (dist < minDist) {
        minDist = dist;
        closest = lm;
      }
    }

    if (minDist <= 1.5) {
      setSelectedName(closest.name);
      setSelectedZone(closest.zone);
    } else {
      // Zone estimation by coordinates
      let zone = 'Zone 1 (North)';
      if (lat < 13.02 && lng > 80.20) zone = 'Zone 3 (South)';
      else if (lat < 13.06 && lng < 80.18) zone = 'Zone 4 (East)';
      else if (lat < 13.06 && lng >= 80.18) zone = 'Zone 2 (Central)';
      
      setSelectedName(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setSelectedZone(zone);
    }
  };

  const handleLandmarkSelect = (lm: typeof CHENNAI_LANDMARKS[0]) => {
    setSelectedLat(lm.lat);
    setSelectedLng(lm.lng);
    setSelectedName(lm.name);
    setSelectedZone(lm.zone);
  };

  const handleConfirm = () => {
    onConfirm({
      name: selectedName,
      zone: selectedZone,
      lat: selectedLat,
      lng: selectedLng,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-sans overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-[85vw] h-[85vh] max-w-6xl max-h-[900px] flex flex-col overflow-hidden"
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shadow-inner">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-wide flex items-center gap-2">
                    Select Incident Location
                    <span className="text-xs font-mono font-normal text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      Interactive Dispatch Map
                    </span>
                  </h3>
                  <div className="text-xs text-[var(--text-secondary)] font-mono flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-emerald-400">{selectedName}</span>
                    <span>•</span>
                    <span className="text-[var(--text-tertiary)]">{selectedZone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-[11px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-base)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
                  Click map or pick landmark to set pin
                </span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] border border-transparent hover:border-[var(--border-subtle)] transition-all"
                  title="Close Map (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRESET LANDMARKS QUICK SELECT BAR */}
            <div className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)] px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-tertiary)] shrink-0 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" /> Presets:
              </span>
              {CHENNAI_LANDMARKS.map((lm) => {
                const isSelected = selectedName === lm.name;
                return (
                  <button
                    key={lm.name}
                    onClick={() => handleLandmarkSelect(lm)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap shrink-0 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-bold scale-[1.02]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {lm.name.split(',')[0]}
                  </button>
                );
              })}
            </div>

            {/* MAP CANVAS AREA */}
            <div className="relative flex-1 w-full bg-[var(--bg-base)] overflow-hidden">
              <MapContainer
                center={[selectedLat, selectedLng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onClick={handleMapClick} />
                <MapRecenter lat={selectedLat} lng={selectedLng} />

                {/* Selected Incident Pin */}
                <Marker position={[selectedLat, selectedLng]} icon={createIncidentIcon()}>
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 text-xs">
                      <div className="font-bold text-sm text-red-600 flex items-center gap-1">
                        ⚠️ Incident Location Pin
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">{selectedName}</div>
                      <div className="font-mono text-[11px] text-slate-600">{selectedZone}</div>
                      <div className="font-mono text-[10px] text-blue-700 mt-1">
                        GPS: {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Surrounding Hospitals */}
                {hospitals.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lng]} icon={createHospitalIcon()}>
                    <Popup>
                      <div className="p-1 font-sans text-slate-900 text-xs">
                        <div className="font-bold text-sm text-emerald-800 flex items-center gap-1">
                          🏥 {h.name}
                        </div>
                        <div className="text-slate-600 mt-0.5">{h.location}</div>
                        <div className="font-mono text-[11px] text-emerald-700 font-bold mt-1">
                          Available Beds: {h.available} / {h.totalCapacity}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Surrounding Fleet Units (Ambulance, Fire, Police) */}
                {vehicles.map((v) => {
                  const emoji = v.type === 'Ambulance' ? '🚑' : v.type === 'Fire Truck' ? '🚒' : v.type === 'Police Vehicle' ? '🚓' : '🚁';
                  const bg = v.type === 'Ambulance' ? '#2563eb' : v.type === 'Fire Truck' ? '#dc2626' : '#4f46e5';
                  return (
                    <Marker key={v.id} position={[v.lat, v.lng]} icon={createVehicleIcon(emoji, bg)}>
                      <Popup>
                        <div className="p-1 font-sans text-slate-900 text-xs">
                          <div className="font-bold text-sm text-blue-900 flex items-center gap-1">
                            {emoji} {v.id} ({v.type})
                          </div>
                          <div className="text-slate-600 mt-0.5">Status: <strong className="text-blue-700">{v.status}</strong></div>
                          <div className="font-mono text-[11px] text-slate-700 mt-0.5">Location: {v.location}</div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* MAP LEGEND OVERLAY */}
              <div className="absolute bottom-4 left-4 z-[1000] bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-strong)] rounded-xl p-3 shadow-xl text-xs font-mono space-y-1.5 min-w-[180px] pointer-events-auto">
                <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1 mb-1 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Map Legend
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="text-base">⚠️</span>
                  <span>Incident Site (Selected)</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="text-base">🏥</span>
                  <span>Trauma Hospital</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="text-base">🚑</span>
                  <span>Emergency Ambulance</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="text-base">🚓</span>
                  <span>Police Patrol Unit</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="text-base">🚒</span>
                  <span>Fire Brigade Unit</span>
                </div>
              </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 font-sans">
              
              {/* Telemetry Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto font-mono text-xs">
                <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                  <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold">Latitude</div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{selectedLat.toFixed(4)}</div>
                </div>

                <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                  <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold">Longitude</div>
                  <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{selectedLng.toFixed(4)}</div>
                </div>

                <div className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] col-span-2 sm:col-span-2">
                  <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold">Selected Address & Zone</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">{selectedName} ({selectedZone})</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Location</span>
                </button>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
