import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { useAppStore } from '../store/useAppStore';
import { Vehicle, Hospital, Incident } from '../types';
import { 
  Layers, Navigation, Shield, Activity, Radio, Truck, AlertTriangle, 
  Clock, Zap, ArrowRight, Gauge, Compass, CheckCircle2, BatteryCharging, Fuel, Eye, Camera
} from 'lucide-react';

// Math helpers for smooth GPS tracking & heading calculation
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function getCardinalDirection(deg: number): string {
  const val = Math.floor((deg / 45) + 0.5);
  const arr = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return arr[val % 8];
}

// Fine-grained path interpolation for smooth 1-second Uber-like animation
function interpolatePath(points: [number, number][], targetStepDistanceKm: number = 0.03): [number, number][] {
  if (points.length < 2) return points;
  const result: [number, number][] = [points[0]];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dist = getHaversineDistance(p1[0], p1[1], p2[0], p2[1]);
    const steps = Math.max(1, Math.ceil(dist / targetStepDistanceKm));

    for (let j = 1; j <= steps; j++) {
      const t = j / steps;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;
      result.push([lat, lng]);
    }
  }
  return result;
}

// Fetch driving route from OSRM with fallback geometry
async function fetchOsrmDrivingRoute(start: [number, number], end: [number, number]): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0] && data.routes[0].geometry) {
        const rawCoords: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
        return interpolatePath(rawCoords, 0.025); // 25m steps
      }
    }
  } catch (err) {
    console.warn("OSRM route fallback active:", err);
  }

  // Fallback realistic road path via Chennai arterial roads
  const midLat = (start[0] + end[0]) / 2 + 0.002;
  const midLng = (start[1] + end[1]) / 2 - 0.002;
  const rawFallback: [number, number][] = [start, [midLat, midLng], end];
  return interpolatePath(rawFallback, 0.025);
}

// Leaflet Map Auto Bounds Fitter Component
const MapBoundsFitter: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
};

// Auto Follow Camera Component
const MapFollowTarget: React.FC<{ position: [number, number]; enabled: boolean }> = ({ position, enabled }) => {
  const map = useMap();
  useEffect(() => {
    if (enabled && position && position[0] && position[1]) {
      map.panTo(position, { animate: true, duration: 0.8 });
    }
  }, [position, enabled, map]);
  return null;
};

// Custom Leaflet DivIcon Creators
const createAmbulanceIcon = (heading: number, isTransporting: boolean) => {
  return L.divIcon({
    className: 'custom-uber-ambulance-marker',
    html: `
      <div style="position:relative; width:46px; height:46px; display:flex; align-items:center; justify-content:center;">
        <!-- Pulsing V2X Signal Halo -->
        <div style="position:absolute; inset:-8px; border-radius:50%; background:${isTransporting ? 'rgba(249,115,22,0.35)' : 'rgba(37,99,235,0.35)'}; border:2px dashed ${isTransporting ? '#f97316' : '#2563eb'}; animation: spin 4s linear infinite;"></div>
        <!-- Rotated Vehicle Body -->
        <div style="transform: rotate(${heading}deg); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); width:38px; height:38px; border-radius:50%; background:${isTransporting ? '#ea580c' : '#2563eb'}; border:3px solid #ffffff; box-shadow:0 4px 16px rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; color:white; font-size:19px;">
          🚑
        </div>
        <!-- Direction Arrow Indicator -->
        <div style="position:absolute; top:-2px; transform: rotate(${heading}deg); transform-origin: center 25px; font-size:11px; color:#ffffff; text-shadow:0 1px 3px black;">▲</div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23]
  });
};

const createIdleVehicleIcon = (emoji: string, bg: string) => {
  return L.divIcon({
    className: 'custom-idle-vehicle-marker',
    html: `
      <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:-3px; border-radius:50%; background:rgba(16,185,129,0.25); border:1px solid #10b981;"></div>
        <div style="width:30px; height:30px; border-radius:50%; background:${bg}; border:2px solid #ffffff; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:15px;">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createIncidentIcon = () => {
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:-8px; border-radius:50%; background:rgba(239,68,68,0.3); border:2px solid #ef4444; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width:38px; height:38px; border-radius:50%; background:#dc2626; border:3px solid #ffffff; box-shadow:0 0 20px rgba(220,38,38,0.9); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:20px;">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const createHospitalIcon = (status: string) => {
  const bg = status === "Critical" ? "#dc2626" : status === "High Occupancy" ? "#d97706" : "#059669";
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
        <div style="width:36px; height:36px; border-radius:10px; background:${bg}; border:2.5px solid #ffffff; box-shadow:0 4px 14px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-family:monospace; font-size:18px;">
          🏥
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

export const LiveMap: React.FC<{ height?: string }> = ({ height = "580px" }) => {
  const { vehicles, hospitals, incidents, missions } = useApp();

  // Camera Auto Follow Toggle for Judges
  const [autoFollow, setAutoFollow] = useState(true);

  // Active Mission & Targets
  const activeMission = missions.find(m => m.status !== 'COMPLETED') || missions[0];
  const activeIncident = incidents[0] || { id: 'INC-101', type: 'Road Accident', lat: 13.0878, lng: 80.2170, location: 'Anna Nagar, Chennai', description: 'Emergency Command Center Priority Zone' };
  const activeHospital = hospitals.find(h => h.id === activeMission?.hospitalId) || hospitals[0] || { id: 'HOSP-01', name: 'City Hospital', lat: 13.0827, lng: 80.2707, available: 42 };

  // Assigned vehicle ID
  const assignedAmbulanceId = activeMission?.ambulanceId || 'AMB-01';

  // Full Route Waypoints (Leg 1: Hospital -> Incident | Leg 2: Incident -> Hospital)
  const [leg1Waypoints, setLeg1Waypoints] = useState<[number, number][]>([]);
  const [leg2Waypoints, setLeg2Waypoints] = useState<[number, number][]>([]);
  const [fullRouteWaypoints, setFullRouteWaypoints] = useState<[number, number][]>([]);
  const [routeLoaded, setRouteLoaded] = useState(false);

  // Animated Ambulance Telemetry State
  const [stepIndex, setStepIndex] = useState(0);
  const [heading, setHeading] = useState(120);
  const [speed, setSpeed] = useState(64); // km/h
  const [fuel] = useState(88); // %
  const [battery] = useState(92); // %
  const [stageLabel, setStageLabel] = useState<string>('En route to Incident Site');
  const [currentLeg, setCurrentLeg] = useState<'LEG1' | 'PICKUP' | 'LEG2' | 'DELIVERED'>('LEG1');

  // Map Layer Filters
  const [layers, setLayers] = useState({
    activeAmbulance: true,
    idleVehicles: true,
    hospitals: true,
    routePolyline: true,
  });

  // Fetch OSRM Road Geometry on Mission Change
  useEffect(() => {
    let isMounted = true;
    async function loadRoutes() {
      setRouteLoaded(false);
      const hospCoords: [number, number] = [activeHospital.lat, activeHospital.lng];
      const incCoords: [number, number] = [activeIncident.lat, activeIncident.lng];

      // Fetch Leg 1: Hospital -> Incident
      const leg1 = await fetchOsrmDrivingRoute(hospCoords, incCoords);
      // Fetch Leg 2: Incident -> Hospital
      const leg2 = await fetchOsrmDrivingRoute(incCoords, hospCoords);

      if (!isMounted) return;

      // 4 static pause points at Incident site for victim loading & triage
      const pickupPausePoints: [number, number][] = Array(4).fill(incCoords);
      
      const full = [...leg1, ...pickupPausePoints, ...leg2];
      setLeg1Waypoints(leg1);
      setLeg2Waypoints(leg2);
      setFullRouteWaypoints(full);
      setStepIndex(0);
      setRouteLoaded(true);
    }

    loadRoutes();
    return () => { isMounted = false; };
  }, [activeIncident.lat, activeIncident.lng, activeHospital.lat, activeHospital.lng, activeMission?.id]);

  // Smooth Movement Timer (1-second tick)
  useEffect(() => {
    if (!routeLoaded || fullRouteWaypoints.length < 2) return;

    const timer = setInterval(() => {
      setStepIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex >= fullRouteWaypoints.length) {
          setCurrentLeg('DELIVERED');
          setStageLabel('Patient Delivered to ER Bay • Mission Completed');
          useAppStore.getState().setMapCheckpointStep(12);
          return fullRouteWaypoints.length - 1;
        }

        const currentPos = fullRouteWaypoints[nextIndex];
        const prevPos = fullRouteWaypoints[prevIndex];

        // Determine current leg phase & sync Mission Timeline Checkpoints (6 to 12)
        if (nextIndex < leg1Waypoints.length) {
          setCurrentLeg('LEG1');
          setStageLabel('En route to Incident Site ⚠️ (V2X Green Wave)');
          const leg1Progress = nextIndex / Math.max(1, leg1Waypoints.length);
          if (leg1Progress < 0.5) {
            useAppStore.getState().setMapCheckpointStep(6);
          } else {
            useAppStore.getState().setMapCheckpointStep(6);
          }
        } else if (nextIndex < leg1Waypoints.length + 4) {
          setCurrentLeg('PICKUP');
          const pickupOffset = nextIndex - leg1Waypoints.length;
          if (pickupOffset <= 1) {
            setStageLabel('Arrived at Incident Scene ⚠️');
            useAppStore.getState().setMapCheckpointStep(7);
          } else {
            setStageLabel('Victim Secured & Patient Loaded');
            useAppStore.getState().setMapCheckpointStep(8);
          }
        } else {
          setCurrentLeg('LEG2');
          const leg2Index = nextIndex - (leg1Waypoints.length + 4);
          const leg2Progress = leg2Index / Math.max(1, leg2Waypoints.length);
          if (leg2Progress < 0.8) {
            setStageLabel('High-Speed Emergency Transport to Hospital ER 🏥');
            useAppStore.getState().setMapCheckpointStep(9);
          } else if (leg2Progress < 0.95) {
            setStageLabel('Arrived at Hospital Trauma Entrance 🏥');
            useAppStore.getState().setMapCheckpointStep(10);
          } else {
            setStageLabel('Patient Delivered to ER Bay');
            useAppStore.getState().setMapCheckpointStep(11);
          }
        }

        // Calculate Bearing Heading
        if (currentPos[0] !== prevPos[0] || currentPos[1] !== prevPos[1]) {
          const newBearing = getBearing(prevPos[0], prevPos[1], currentPos[0], currentPos[1]);
          setHeading(newBearing);
        }

        // Realistic Speed Variation (58 - 72 km/h)
        const randomSpeed = Math.floor(58 + Math.random() * 14);
        setSpeed(randomSpeed);

        return nextIndex;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [routeLoaded, fullRouteWaypoints, leg1Waypoints.length]);

  // Current Position & Distance calculations
  const currentPos: [number, number] = fullRouteWaypoints[stepIndex] || [activeHospital.lat, activeHospital.lng];
  
  let remainingDistanceKm = 0;
  for (let i = stepIndex; i < fullRouteWaypoints.length - 1; i++) {
    const p1 = fullRouteWaypoints[i];
    const p2 = fullRouteWaypoints[i + 1];
    remainingDistanceKm += getHaversineDistance(p1[0], p1[1], p2[0], p2[1]);
  }

  const etaMins = (remainingDistanceKm / (speed || 60)) * 60;
  const progressPercent = fullRouteWaypoints.length > 0 
    ? Math.min(100, Math.round((stepIndex / (fullRouteWaypoints.length - 1)) * 100))
    : 0;

  // Route Polyline Splits: Leg 1 (Blue) vs Leg 2 (Orange)
  const leg1Polyline = leg1Waypoints;
  const leg2Polyline = leg2Waypoints;

  // Idle vehicles list (excluding active assigned vehicle)
  const idleVehiclesList = vehicles.filter(v => v.id !== assignedAmbulanceId);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-strong)] shadow-2xl bg-[var(--bg-surface)] font-sans" style={{ height }}>
      
      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto Bounds Fitter on Mount */}
        {fullRouteWaypoints.length > 0 && (
          <MapBoundsFitter points={[ [activeHospital.lat, activeHospital.lng], [activeIncident.lat, activeIncident.lng] ]} />
        )}

        {/* Camera Auto Follow */}
        <MapFollowTarget position={currentPos} enabled={autoFollow} />

        {/* Route Polylines */}
        {layers.routePolyline && leg1Polyline.length > 1 && (
          /* Leg 1: Base/Hospital -> Incident Site (Blue) */
          <Polyline
            positions={leg1Polyline}
            pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.85, dashArray: '6, 8' }}
          />
        )}

        {layers.routePolyline && leg2Polyline.length > 1 && (
          /* Leg 2: Incident Site -> Hospital ER (Orange) */
          <Polyline
            positions={leg2Polyline}
            pathOptions={{ color: '#f97316', weight: 6, opacity: 0.9 }}
          />
        )}

        {/* Incident Marker */}
        <Marker position={[activeIncident.lat, activeIncident.lng]} icon={createIncidentIcon()}>
          <Popup>
            <div className="p-1 font-sans text-slate-900 text-xs">
              <div className="font-bold text-sm text-red-600 flex items-center gap-1">
                ⚠️ {activeIncident.type}
              </div>
              <div className="font-semibold text-slate-800 mt-1">{activeIncident.location}</div>
              <p className="mt-1 text-[11px] text-slate-600">{activeIncident.description || 'Emergency Command Center Priority Zone'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Hospital Markers */}
        {layers.hospitals && hospitals.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={createHospitalIcon(h.status || 'Normal')}>
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

        {/* Idle Parked Fleet Units (Ambulances, Fire Trucks, Police Cars) */}
        {layers.idleVehicles && idleVehiclesList.map((v) => {
          const emoji = v.type === 'Ambulance' ? '🚑' : v.type === 'Fire Truck' ? '🚒' : v.type === 'Police Vehicle' ? '🚓' : '🚁';
          const bg = v.type === 'Ambulance' ? '#3b82f6' : v.type === 'Fire Truck' ? '#dc2626' : '#4f46e5';
          return (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={createIdleVehicleIcon(emoji, bg)}>
              <Popup>
                <div className="p-1 font-sans text-slate-900 text-xs">
                  <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                    {emoji} {v.id} ({v.type})
                  </div>
                  <div className="text-emerald-700 font-bold mt-0.5">Status: AVAILABLE (Parked)</div>
                  <div className="font-mono text-[11px] text-slate-600 mt-0.5">Base: {v.location}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Dispatched Ambulance Marker */}
        {layers.activeAmbulance && (
          <Marker
            position={currentPos}
            icon={createAmbulanceIcon(heading, currentLeg === 'LEG2')}
          >
            <Popup>
              <div className="p-1 font-sans text-slate-900 text-xs">
                <div className="font-bold text-sm text-blue-700 flex items-center gap-1">
                  🚑 {assignedAmbulanceId} (Active V2X Green Wave)
                </div>
                <div className="mt-1 font-mono text-[11px] space-y-0.5">
                  <div>Speed: <strong className="text-blue-600">{speed} km/h</strong></div>
                  <div>Heading: <strong>{Math.round(heading)}° ({getCardinalDirection(heading)})</strong></div>
                  <div>Phase: <strong className="text-emerald-700">{stageLabel}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* PATIENT DELIVERED SUCCESS BANNER OVERLAY */}
      {currentLeg === 'DELIVERED' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 text-xs tracking-wide animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span>Patient Delivered to Hospital ER Bay — Mission Accomplished!</span>
        </div>
      )}

      {/* TOP-LEFT TELEMETRY OVERLAY HUD */}
      <div className="absolute top-3 left-3 z-[1000] max-w-sm w-full pointer-events-auto">
        <div className="bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-strong)] rounded-2xl p-3.5 shadow-2xl space-y-2.5">
          
          {/* Header Title & Status */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Truck className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-[var(--text-primary)] flex items-center gap-1.5">
                  {assignedAmbulanceId} • V2X Live Navigation
                </div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Real-time GPS Tracking Active (1s)
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/30">
              ACRN V2X
            </span>
          </div>

          {/* Mission Stage Indicator */}
          <div className="p-2 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl font-mono text-[11px]">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">Mission Status</div>
            <div className="text-xs font-bold text-blue-300 mt-0.5 truncate">{stageLabel}</div>
          </div>

          {/* Key Telemetry Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="p-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl">
              <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold flex items-center justify-center gap-0.5">
                <Gauge className="w-3 h-3 text-emerald-400" /> Speed
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{speed} <span className="text-[9px]">km/h</span></div>
            </div>

            <div className="p-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl">
              <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold flex items-center justify-center gap-0.5">
                <Compass className="w-3 h-3 text-indigo-400" /> Heading
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{Math.round(heading)}° <span className="text-[9px] text-indigo-300">{getCardinalDirection(heading)}</span></div>
            </div>

            <div className="p-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl">
              <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold flex items-center justify-center gap-0.5">
                <Navigation className="w-3 h-3 text-amber-400" /> Dist
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{remainingDistanceKm.toFixed(1)} <span className="text-[9px]">km</span></div>
            </div>

            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="text-[9px] text-emerald-400 uppercase font-bold flex items-center justify-center gap-0.5">
                <Clock className="w-3 h-3" /> ETA
              </div>
              <div className="text-xs font-extrabold text-emerald-300 mt-0.5">{etaMins < 0.1 ? '0.1' : etaMins.toFixed(1)} <span className="text-[9px]">m</span></div>
            </div>
          </div>

          {/* Additional Telemetry: Fuel & Battery */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="flex items-center justify-between p-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" /> Fuel
              </span>
              <span className="font-bold text-[var(--text-primary)]">{fuel}%</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[var(--text-tertiary)] flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 text-emerald-400" /> Battery
              </span>
              <span className="font-bold text-[var(--text-primary)]">{battery}%</span>
            </div>
          </div>

          {/* Mission Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-secondary)]">
              <span>Mission Progress</span>
              <span className="font-bold text-blue-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* TOP-RIGHT MAP CONTROLS & CAMERA OVERLAY */}
      <div className="absolute top-3 right-3 z-[1000] pointer-events-auto space-y-2">
        
        {/* Camera Auto Follow Toggle for Judges */}
        <button
          onClick={() => setAutoFollow(!autoFollow)}
          className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center justify-between gap-2 shadow-lg ${
            autoFollow
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-600/30'
              : 'bg-[var(--bg-surface)]/95 text-[var(--text-secondary)] border-[var(--border-strong)] hover:text-[var(--text-primary)]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Auto-Follow Camera
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-extrabold ${autoFollow ? 'bg-white text-blue-700' : 'bg-gray-700 text-gray-300'}`}>
            {autoFollow ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Layer Toggles Card */}
        <div className="bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-strong)] rounded-2xl p-3 shadow-2xl text-xs font-mono space-y-1.5 min-w-[160px]">
          <div className="flex items-center justify-between font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1 mb-1 text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> GIS Layers
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={layers.activeAmbulance}
              onChange={(e) => setLayers({ ...layers, activeAmbulance: e.target.checked })}
              className="accent-blue-500 rounded"
            />
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Active Unit
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={layers.idleVehicles}
              onChange={(e) => setLayers({ ...layers, idleVehicles: e.target.checked })}
              className="accent-emerald-500 rounded"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Idle Units
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={layers.hospitals}
              onChange={(e) => setLayers({ ...layers, hospitals: e.target.checked })}
              className="accent-emerald-600 rounded"
            />
            <span className="w-2 h-2 rounded bg-emerald-600 text-white text-[8px] font-bold px-0.5">H</span> Hospitals
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={layers.routePolyline}
              onChange={(e) => setLayers({ ...layers, routePolyline: e.target.checked })}
              className="accent-amber-500 rounded"
            />
            <span className="w-3 h-0.5 bg-amber-500 inline-block rounded" /> Route Line
          </label>
        </div>

      </div>

      {/* FLOATING TRANSPARENT LEGEND (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-strong)] rounded-xl p-2.5 shadow-xl text-[10px] font-mono space-y-1 min-w-[170px] pointer-events-auto">
        <div className="font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1 mb-1 uppercase tracking-wider flex items-center gap-1">
          <Eye className="w-3 h-3 text-blue-400" /> Route Color Legend
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="w-3 h-1 bg-blue-600 rounded inline-block" />
          <span>En Route to Incident Site</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="w-3 h-1 bg-amber-500 rounded inline-block" />
          <span>Patient Transport to Hospital</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          <span>Emergency Incident Site</span>
        </div>
      </div>

    </div>
  );
};
