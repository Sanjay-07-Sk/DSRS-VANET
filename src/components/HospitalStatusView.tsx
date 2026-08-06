import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { HospitalMap } from './HospitalMap';
import { HospitalDetailsModal } from './HospitalDetailsModal';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Building2, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Radio, 
  FileText, 
  Download, 
  Users, 
  Stethoscope, 
  Bed, 
  HeartPulse, 
  Eye, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Syringe,
  MapPin
} from 'lucide-react';

export const HospitalStatusView: React.FC = () => {
  const { hospitals, language } = useApp();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Total metrics across network
  const totalBeds = hospitals.reduce((acc, h) => acc + h.totalCapacity, 0);
  const totalOccupied = hospitals.reduce((acc, h) => acc + h.occupied, 0);
  const totalAvailable = hospitals.reduce((acc, h) => acc + h.available, 0);

  const totalIcuTotal = hospitals.reduce((acc, h) => acc + (h.icuBeds?.total || 20), 0);
  const totalIcuOccupied = hospitals.reduce((acc, h) => acc + (h.icuBeds?.occupied || 12), 0);

  const totalVentilatorsTotal = hospitals.reduce((acc, h) => acc + (h.ventilators?.total || 12), 0);
  const totalVentilatorsOccupied = hospitals.reduce((acc, h) => acc + (h.ventilators?.occupied || 6), 0);

  const totalDoctors = hospitals.reduce((acc, h) => acc + (h.doctors || 25), 0);
  const totalBloodUnits = hospitals.reduce((acc, h) => acc + (h.bloodUnits || 120), 0);

  // Donut chart data for Hospital Overview
  const hospitalPieData = [
    { name: 'Occupied', value: totalOccupied, color: '#ef4444' },
    { name: 'Available', value: totalAvailable, color: '#22c55e' }
  ];

  // Occupancy trend 24h multi-line chart data
  const trend24h = [
    { time: '12 PM', city: 90, general: 70, apollo: 50, esic: 45, govt: 55 },
    { time: '04 PM', city: 92, general: 72, apollo: 55, esic: 48, govt: 58 },
    { time: '08 PM', city: 88, general: 68, apollo: 52, esic: 44, govt: 56 },
    { time: '12 AM', city: 91, general: 71, apollo: 54, esic: 46, govt: 59 },
    { time: '04 AM', city: 93, general: 73, apollo: 56, esic: 47, govt: 60 },
    { time: '08 AM', city: 94, general: 74, apollo: 55, esic: 47, govt: 60 },
    { time: '12 PM', city: 95, general: 73, apollo: 55, esic: 47, govt: 60 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 max-w-[1920px] mx-auto font-sans">
      
      {/* LEFT COLUMN: Hospital Overview, Status Summary, Bed & Resource Availability (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Hospital Network Overview Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span>{t('hospitalOverview', language)}</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </h2>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hospitalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hospitalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">
                {Math.round((totalOccupied / (totalBeds || 1)) * 100)}%
              </span>
              <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">Overall Occupancy</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono mt-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Occupied Beds</span>
              <span className="font-bold text-[var(--text-primary)]">{totalOccupied} Beds</span>
            </div>
            <div className="flex items-center justify-between text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available Beds</span>
              <span className="font-bold text-[var(--text-primary)]">{totalAvailable} Beds</span>
            </div>
          </div>
        </div>

        {/* ICU & Ventilator Resource Breakdown */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            Critical Care Beds & ICU
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-[var(--text-primary)]">
                <span>ICU Beds</span>
                <span className="font-mono text-[var(--text-tertiary)]">
                  {totalIcuOccupied} / {totalIcuTotal} ({Math.round((totalIcuOccupied / totalIcuTotal) * 100)}%)
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${Math.round((totalIcuOccupied / totalIcuTotal) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-[var(--text-primary)]">
                <span>Ventilators</span>
                <span className="font-mono text-[var(--text-tertiary)]">
                  {totalVentilatorsOccupied} / {totalVentilatorsTotal} ({Math.round((totalVentilatorsOccupied / totalVentilatorsTotal) * 100)}%)
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-base)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${Math.round((totalVentilatorsOccupied / totalVentilatorsTotal) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Staff & Blood Bank Resources */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            Medical Staff & Blood Bank
          </h2>

          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <Stethoscope className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <div className="text-lg font-extrabold text-[var(--text-primary)]">{totalDoctors}</div>
              <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-sans">Doctors On Duty</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <HeartPulse className="w-4 h-4 mx-auto text-rose-500 mb-1" />
              <div className="text-lg font-extrabold text-rose-400">{totalBloodUnits}</div>
              <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-sans">Blood Reserve Units</div>
            </div>
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: Top Stat Cards & Hospital List Table (6 Cols) */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Top 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">{t('totalHospitals', language)}</div>
            <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{String(hospitals.length).padStart(2, '0')}</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">{t('totalCapacity', language)}</div>
            <div className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{totalBeds}</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">ICU BEDS</div>
            <div className="text-xl font-extrabold text-rose-500 mt-1">{totalIcuTotal - totalIcuOccupied} Avail</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">VENTILATORS</div>
            <div className="text-xl font-extrabold text-purple-400 mt-1">{totalVentilatorsTotal - totalVentilatorsOccupied} Avail</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">READINESS</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1">98% Live</div>
          </div>
        </div>

        {/* Hospital List Table with ICU, Beds, Doctors, Ventilators, Blood, Emergency Readiness */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              {t('hospitalList', language)} (Live V2X Sync)
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
              Showing {hospitals.length} Trauma & Hospital Centers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-tertiary)] font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-3">Hospital / Trauma Center</th>
                  <th className="py-2.5 px-3">ICU Beds</th>
                  <th className="py-2.5 px-3">Total / Avail Beds</th>
                  <th className="py-2.5 px-3">Doctors & Staff</th>
                  <th className="py-2.5 px-3">Ventilators</th>
                  <th className="py-2.5 px-3">Blood Reserve</th>
                  <th className="py-2.5 px-3">Emergency Readiness</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                {hospitals.map((h) => {
                  const icuOcc = h.icuBeds?.occupied || 12;
                  const icuTot = h.icuBeds?.total || 20;
                  const ventOcc = h.ventilators?.occupied || 6;
                  const ventTot = h.ventilators?.total || 12;
                  const docCount = h.doctors || 24;
                  const bloodUnits = h.bloodUnits || 120;

                  return (
                    <tr key={h.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                      
                      {/* Hospital Name & Location */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold text-[10px]">🏥</span>
                          <span>{h.name}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span>{h.location}</span>
                        </div>
                      </td>

                      {/* ICU Beds */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-rose-400">
                          {icuTot - icuOcc} / {icuTot} Avail
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">
                          {icuOcc} Occupied
                        </div>
                      </td>

                      {/* Total & Avail Beds */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-emerald-400">{h.available} Available</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{h.totalCapacity} Total ({h.occupancyRate}% Occ)</div>
                      </td>

                      {/* Doctors & Staff */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-blue-400" />
                          <span>{docCount} Doctors</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{h.nurses || 48} ER Nurses</div>
                      </td>

                      {/* Ventilators */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-purple-400">{ventTot - ventOcc} / {ventTot} Avail</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{ventOcc} In Use</div>
                      </td>

                      {/* Blood Bank */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-rose-500 flex items-center gap-1">
                          <HeartPulse className="w-3 h-3 text-rose-500" />
                          <span>{bloodUnits} Units</span>
                        </div>
                      </td>

                      {/* Emergency Readiness */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          h.status === 'Critical' 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' 
                            : h.status === 'High Occupancy' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          • {h.status === 'Normal' ? 'Level 1 Ready' : h.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => setSelectedHospitalId(h.id)}
                          className="p-1.5 rounded bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          title="View Hospital Details"
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

        {/* Occupancy Trend 24h & Patient Inflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Occupancy Trend Line Chart */}
          <div className="md:col-span-7 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
              {t('occupancyTrend', language)}
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend24h}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="city" name="City Hospital" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="general" name="General Hospital" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="apollo" name="Apollo Hospital" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="esic" name="ESIC Hospital" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Inflow Breakdown */}
          <div className="md:col-span-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
              {t('patientInflow', language)}
            </h2>
            <div className="text-2xl font-extrabold font-mono text-[var(--text-primary)]">248 <span className="text-xs font-normal text-[var(--text-tertiary)]">Total ER Inflow</span></div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono">
              <div className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <div className="text-rose-500 font-extrabold text-base">96</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Critical ICU (39%)</div>
              </div>
              <div className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <div className="text-amber-500 font-extrabold text-base">102</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Trauma (41%)</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: Mini Map, Alerts & Quick Actions (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Hospital Capacity Mini Map */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {t('hospitalCapacityMap', language)}
            </h2>
            <span className="text-[10px] font-mono text-blue-400">V2X Live</span>
          </div>
          <HospitalMap height="220px" />
        </div>

        {/* Hospital Alerts & Notifications */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('alertsNotifications', language)}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-rose-500/30 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">City Hospital ER at 95% capacity</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">ICU Bed Reservation active for AMB-01</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[var(--text-primary)]">Apollo Hospital: 10 ICU Beds Released</div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Telemetry updated 2 min ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('quickActions', language)}
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1 font-bold text-[var(--text-primary)] transition-all">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Hospital</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1 font-bold text-[var(--text-primary)] transition-all">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Update ICU Beds</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1 font-bold text-[var(--text-primary)] transition-all">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Broadcast Alert</span>
            </button>

            <button className="p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex flex-col items-center justify-center gap-1 font-bold text-[var(--text-primary)] transition-all">
              <Download className="w-4 h-4 text-purple-400" />
              <span>Export Readiness</span>
            </button>
          </div>
        </div>

      </div>

      {/* Hospital Details Modal */}
      <HospitalDetailsModal
        hospitalId={selectedHospitalId}
        onClose={() => setSelectedHospitalId(null)}
      />

    </div>
  );
};
