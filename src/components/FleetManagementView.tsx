import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { 
  Filter, 
  Truck, 
  Activity, 
  ShieldAlert, 
  Eye, 
  Plus, 
  Bell, 
  RefreshCw, 
  Wrench,
  BatteryCharging,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Compass,
  MapPin,
  Radio,
  Zap,
  Fuel
} from 'lucide-react';
import { FleetDetailsModal } from './FleetDetailsModal';

export const FleetManagementView: React.FC = () => {
  const { vehicles, missions, setIsCreateModalOpen, language } = useApp();

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [missionFilter, setMissionFilter] = useState('All');
  const [locationZone, setLocationZone] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Filter logic
  const filteredVehicles = vehicles.filter(v => {
    if (typeFilter !== 'All' && v.type !== typeFilter) return false;
    if (statusFilter !== 'All' && v.status !== statusFilter) return false;
    if (missionFilter !== 'All' && !v.mission.includes(missionFilter)) return false;
    if (locationZone && !v.location.toLowerCase().includes(locationZone.toLowerCase()) && !v.zone.toLowerCase().includes(locationZone.toLowerCase())) return false;
    return true;
  });

  // Fleet Overview distribution
  const ambulances = vehicles.filter(v => v.type === 'Ambulance').length;
  const fireTrucks = vehicles.filter(v => v.type === 'Fire Truck').length;
  const policeVehicles = vehicles.filter(v => v.type === 'Police Vehicle').length;
  const drones = vehicles.filter(v => v.type === 'Drone').length;

  const fleetPieData = [
    { name: 'Ambulances', value: ambulances, color: '#22c55e' },
    { name: 'Fire Trucks', value: fireTrucks, color: '#ef4444' },
    { name: 'Police Vehicles', value: policeVehicles, color: '#3b82f6' },
    { name: 'Drones', value: drones, color: '#8b5cf6' }
  ];

  // Mission distribution
  const onMissionCount = vehicles.filter(v => v.status === 'On Mission').length;
  const activeCount = vehicles.filter(v => v.status === 'Active').length;
  const idleCount = vehicles.filter(v => v.status === 'Idle').length;

  const missionPieData = [
    { name: 'On Emergency Mission', value: onMissionCount, color: '#22c55e' },
    { name: 'Patrol / Active', value: activeCount, color: '#3b82f6' },
    { name: 'Standby / Idle', value: idleCount, color: '#f59e0b' }
  ];

  // Average telemetry metrics
  const avgFuel = Math.round(vehicles.reduce((acc, v) => acc + v.fuel, 0) / (vehicles.length || 1));
  const avgBattery = Math.round(vehicles.reduce((acc, v) => acc + v.battery, 0) / (vehicles.length || 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 max-w-[1920px] mx-auto font-sans">
      
      {/* LEFT COLUMN: Filters, Fleet Distribution & Fuel/Battery Status (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Filters Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              {t('filters', language)}
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">V2X Live</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                {t('vehicleType', language)}
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] font-mono"
              >
                <option value="All">All Types ({vehicles.length})</option>
                <option value="Ambulance">Ambulance ({ambulances})</option>
                <option value="Fire Truck">Fire Truck ({fireTrucks})</option>
                <option value="Police Vehicle">Police Vehicle ({policeVehicles})</option>
                <option value="Drone">Drone ({drones})</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                {t('status', language)}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] font-mono"
              >
                <option value="All">All Statuses</option>
                <option value="On Mission">On Mission ({onMissionCount})</option>
                <option value="Active">Active ({activeCount})</option>
                <option value="Idle">Idle ({idleCount})</option>
              </select>
            </div>

            <div>
              <label className="block text-[var(--text-secondary)] font-semibold mb-1 uppercase tracking-wider">
                Location Zone
              </label>
              <input
                type="text"
                placeholder="e.g. Anna Nagar, Porur"
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] font-mono"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => { setTypeFilter('All'); setStatusFilter('All'); setMissionFilter('All'); setLocationZone(''); }}
                className="w-full py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-base)] font-bold text-xs shadow-sm hover:opacity-90 transition-all"
              >
                {t('reset', language)}
              </button>
            </div>
          </div>
        </div>

        {/* Fleet Composition Donut Chart */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('fleetOverview', language)}
          </h2>
          
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fleetPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">{vehicles.length}</span>
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">Total Fleet</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono mt-2 pt-2 border-t border-[var(--border-subtle)]">
            {fleetPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[var(--text-primary)]">{String(item.value).padStart(2, '0')} Units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Energy & Telemetry Summary */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span>Fleet Energy & Battery</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </h2>

          <div className="space-y-3 font-sans text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5 text-emerald-400" /> Avg Fuel Level</span>
                <span className="font-mono text-emerald-400">{avgFuel}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${avgFuel}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-[var(--text-primary)]">
                <span className="flex items-center gap-1.5"><BatteryCharging className="w-3.5 h-3.5 text-blue-400" /> Avg Battery Level</span>
                <span className="font-mono text-blue-400">{avgBattery}%</span>
              </div>
              <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${avgBattery}%` }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: Top Fleet KPIs & Fleet List Table (6 Cols) */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{t('totalVehicles', language)}</div>
              <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)] mt-1">{vehicles.length}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)]">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{t('activeVehicles', language)}</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{activeCount + onMissionCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{t('onMission', language)}</div>
              <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">{onMissionCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">IDLE</div>
              <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">{idleCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Fleet List Table Card with Mission, Fuel, Battery, GPS, Speed, Health */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              {t('fleetList', language)} (Live Telemetry Sync)
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
              Showing {filteredVehicles.length} of {vehicles.length} Units
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-tertiary)] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Vehicle / Driver</th>
                  <th className="py-2.5 px-3">Type & Status</th>
                  <th className="py-2.5 px-3">Mission ID</th>
                  <th className="py-2.5 px-3">Fuel / Battery</th>
                  <th className="py-2.5 px-3">GPS Telemetry</th>
                  <th className="py-2.5 px-3">Speed & Heading</th>
                  <th className="py-2.5 px-3">Health</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredVehicles.map((v) => {
                  const activeM = missions.find(m => m.id === v.missionId || m.ambulanceId === v.id);
                  return (
                    <tr key={v.id} className="hover:bg-[var(--bg-elevated)] transition-colors font-mono">
                      
                      {/* Vehicle ID & Driver */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[var(--text-primary)] text-sm">{v.id}</div>
                        <div className="text-[10px] font-sans text-[var(--text-tertiary)]">{v.driver || 'Stationed Driver'}</div>
                      </td>

                      {/* Type & Status */}
                      <td className="py-2.5 px-3">
                        <div className="font-sans font-semibold text-[var(--text-primary)] flex items-center gap-1">
                          <span>{v.type === 'Ambulance' ? '🚑' : v.type === 'Fire Truck' ? '🚒' : v.type === 'Police Vehicle' ? '🚓' : '🚁'}</span>
                          <span>{v.type}</span>
                        </div>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold border ${
                          v.status === 'On Mission' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : v.status === 'Active' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          • {v.status}
                        </span>
                      </td>

                      {/* Mission ID & Status */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-blue-400">{activeM?.id || v.missionId || 'STANDBY'}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] truncate max-w-[120px]">
                          {activeM?.emergencyType || v.mission || 'Patrol Duty'}
                        </div>
                      </td>

                      {/* Fuel & Battery */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <Fuel className="w-3 h-3 shrink-0" />
                          <span>{v.fuel}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-400 font-bold mt-0.5">
                          <BatteryCharging className="w-3 h-3 shrink-0" />
                          <span>{v.battery}%</span>
                        </div>
                      </td>

                      {/* GPS & Location */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="text-[var(--text-primary)] font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span>{v.location}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)] font-mono">
                          {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                        </div>
                      </td>

                      {/* Speed & Heading */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-emerald-400 flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          <span>{v.speed} km/h</span>
                        </div>
                        <div className="text-[10px] text-indigo-300 flex items-center gap-1 mt-0.5">
                          <Compass className="w-3 h-3" />
                          <span>{v.heading}°</span>
                        </div>
                      </td>

                      {/* Health */}
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border ${
                          v.health === 'Good' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : v.health === 'Warning' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <HeartPulse className="w-3 h-3 inline" />
                          {v.health}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => setSelectedVehicleId(v.id)}
                          className="p-1.5 rounded bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                          title="View Vehicle Telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Mission Distribution, Maintenance Alerts & Quick Actions (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Mission Status Distribution Chart */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('missionDistribution', language)}
          </h2>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={missionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {missionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">{onMissionCount}</span>
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">On Mission</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono mt-2 pt-2 border-t border-[var(--border-subtle)]">
            {missionPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[var(--text-primary)]">{item.value} Units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('maintenanceAlerts', language)}
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-rose-500/30">
              <div className="flex items-center justify-between font-bold text-[var(--text-primary)] font-mono">
                <span>FIR-03</span>
                <span className="text-rose-400 text-[10px]">Critical Service</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">High Water Pump Pressure Wear</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-amber-500/30">
              <div className="flex items-center justify-between font-bold text-[var(--text-primary)] font-mono">
                <span>POL-05</span>
                <span className="text-amber-400 text-[10px]">Due in 2 days</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">Brake Pad Calibration</div>
            </div>
          </div>
        </div>

        {/* Enterprise Quick Actions */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('quickActions', language)}
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1.5 font-bold text-[var(--text-primary)] transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Vehicle</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1.5 font-bold text-[var(--text-primary)] transition-all">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>V2X Alert</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1.5 font-bold text-[var(--text-primary)] transition-all">
              <RefreshCw className="w-4 h-4 text-blue-400" />
              <span>Sync GPS</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1.5 font-bold text-[var(--text-primary)] transition-all">
              <Wrench className="w-4 h-4 text-purple-400" />
              <span>Log Service</span>
            </button>
          </div>
        </div>

      </div>

      {/* Fleet Details Modal */}
      <FleetDetailsModal
        vehicleId={selectedVehicleId}
        onClose={() => setSelectedVehicleId(null)}
      />

    </div>
  );
};
