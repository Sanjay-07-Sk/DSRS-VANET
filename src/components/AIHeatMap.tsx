import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useAppStore } from '../store/useAppStore';

interface AIHeatMapProps {
  height?: string;
}

export const AIHeatMap: React.FC<AIHeatMapProps> = ({ height = '360px' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const incidents = useAppStore((state) => state.incidents);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      // Center on Chennai
      const map = L.map(containerRef.current, {
        center: [13.0500, 80.2100],
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

    // Convert 250+ incidents to heat points: [lat, lng, intensity]
    const heatPoints: Array<[number, number, number]> = incidents.map((inc) => {
      const intensity = inc.severity === 'HIGH' ? 0.9 : inc.severity === 'MEDIUM' ? 0.6 : 0.3;
      return [inc.lat, inc.lng, intensity];
    });

    // Clear existing heat layers if any
    map.eachLayer((layer: any) => {
      if (layer._heat) {
        map.removeLayer(layer);
      }
    });

    // Render HeatLayer with Green -> Yellow -> Orange -> Red colors
    if ((L as any).heatLayer) {
      const heatLayer = (L as any).heatLayer(heatPoints, {
        radius: 28,
        blur: 18,
        maxZoom: 15,
        minOpacity: 0.45,
        gradient: {
          0.2: '#10b981', // Green
          0.45: '#eab308', // Yellow
          0.7: '#f59e0b', // Orange
          1.0: '#ef4444'  // Red
        }
      });
      heatLayer.addTo(map);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [incidents]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden border border-[var(--border-subtle)] relative z-0 shadow-md"
    />
  );
};
