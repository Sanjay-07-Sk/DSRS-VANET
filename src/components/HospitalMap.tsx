import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';

interface HospitalMapProps {
  height?: string;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({ height = '220px' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const hospitals = useAppStore((state) => state.hospitals);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      // Center on Chennai
      const map = L.map(containerRef.current, {
        center: [13.0400, 80.2200],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add custom Leaflet markers for 6 hospitals
    hospitals.forEach((h) => {
      const isCritical = h.status === 'Critical';
      const isHigh = h.status === 'High Occupancy';

      const iconHtml = `
        <div style="
          background: ${isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#10b981'};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ">🏥</div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-hospital-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const icuAvail = (h.icuBeds?.total || 20) - (h.icuBeds?.occupied || 12);
      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #1e293b; min-width: 200px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${h.name}</h4>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">📍 ${h.location}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-family: monospace; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 6px;">
            <div><strong>Available Beds:</strong> <span style="color: #10b981;">${h.available}</span></div>
            <div><strong>ICU Open:</strong> <span style="color: #e11d48;">${icuAvail}</span></div>
            <div><strong>Doctors:</strong> ${h.doctors || 24}</div>
            <div><strong>Blood Units:</strong> ${h.bloodUnits || 120}</div>
            <div><strong>Emergency Level:</strong> ${h.emergencyLevel || 'Level 1 Trauma'}</div>
            <div><strong>Current Load:</strong> ${h.currentLoad || h.occupancyRate}%</div>
            <div><strong>Today's Missions:</strong> ${h.todaysMissions || 24}</div>
            <div><strong>Avg Response:</strong> ${h.avgResponseTime || 11.2} min</div>
          </div>
        </div>
      `;

      const marker = L.marker([h.lat, h.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(popupHtml);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [hospitals]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-[var(--border-subtle)] relative z-0"
    />
  );
};
