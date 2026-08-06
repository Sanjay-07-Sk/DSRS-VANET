import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  FileText, 
  Filter, 
  Download, 
  ShieldAlert, 
  BarChart3, 
  Cpu, 
  FileSpreadsheet,
  FileType,
  Building2,
  Radio,
  Activity,
  Calendar,
  Layers,
  Truck,
  RotateCcw
} from 'lucide-react';

export type ReportCategory = 
  | 'Overview Report' 
  | 'Incident Reports' 
  | 'Mission Reports' 
  | 'Fleet Reports' 
  | 'Hospital Reports' 
  | 'AI Decision Reports' 
  | 'Communication Reports' 
  | 'Analytics Reports';

export const ReportsView: React.FC = () => {
  const { language, incidents, vehicles, hospitals, missions, decisionLogs } = useApp();
  const [activeReportMenu, setActiveReportMenu] = useState<ReportCategory>('Overview Report');

  // Filter states
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Reset all filters
  const resetFilters = () => {
    setSelectedDate('All');
    setSelectedZone('All');
    setSelectedHospital('All');
    setSelectedVehicle('All');
    setSelectedPriority('All');
    setSelectedStatus('All');
  };

  // Helper to filter items based on criteria
  const getFilteredData = () => {
    switch (activeReportMenu) {
      case 'Incident Reports':
        return incidents.filter(i => {
          if (selectedZone !== 'All' && i.zone !== selectedZone) return false;
          if (selectedPriority !== 'All' && i.severity !== selectedPriority) return false;
          if (selectedStatus !== 'All' && i.status !== selectedStatus) return false;
          return true;
        }).map(i => ({
          IncidentID: i.id,
          Type: i.type,
          Location: i.location,
          Zone: i.zone,
          Severity: i.severity,
          Status: i.status,
          Victims: i.victimCount,
          Time: i.timeStr,
          Date: i.createdAt.substring(0, 10)
        }));

      case 'Mission Reports':
      case 'Overview Report':
        return missions.filter(m => {
          if (selectedZone !== 'All' && m.zone !== selectedZone) return false;
          if (selectedHospital !== 'All' && m.hospitalName !== selectedHospital) return false;
          if (selectedVehicle !== 'All' && m.ambulanceId !== selectedVehicle) return false;
          if (selectedStatus !== 'All' && m.status !== selectedStatus) return false;
          return true;
        }).map(m => ({
          MissionID: m.id,
          EmergencyId: m.emergencyId,
          EmergencyType: m.emergencyType,
          Location: m.location,
          Zone: m.zone,
          AmbulanceID: m.ambulanceId,
          HospitalName: m.hospitalName,
          Status: m.status,
          ETAMinutes: m.etaMinutes,
          ACRNConfidence: `${m.acrnConfidence}%`,
          CreatedAt: m.createdAt.substring(0, 10)
        }));

      case 'Fleet Reports':
        return vehicles.filter(v => {
          if (selectedZone !== 'All' && v.zone !== selectedZone) return false;
          if (selectedVehicle !== 'All' && v.type !== selectedVehicle && v.id !== selectedVehicle) return false;
          if (selectedStatus !== 'All' && v.status !== selectedStatus) return false;
          return true;
        }).map(v => ({
          VehicleID: v.id,
          Type: v.type,
          DriverName: v.driver,
          Status: v.status,
          Location: v.location,
          Zone: v.zone,
          FuelLevel: `${v.fuel}%`,
          BatteryLevel: `${v.battery}%`,
          SpeedKmH: `${v.speed} km/h`,
          Health: v.health,
          MaintenanceStatus: v.maintenanceStatus || 'OK',
          CommStatus: v.commStatus || 'LoRa Active'
        }));

      case 'Hospital Reports':
        return hospitals.filter(h => {
          if (selectedHospital !== 'All' && h.name !== selectedHospital) return false;
          if (selectedStatus !== 'All' && h.status !== selectedStatus) return false;
          return true;
        }).map(h => ({
          HospitalName: h.name,
          Location: h.location,
          Status: h.status,
          TotalBeds: h.totalCapacity,
          OccupiedBeds: h.occupied,
          AvailableBeds: h.available,
          OccupancyRate: `${h.occupancyRate}%`,
          ICUBedsAvailable: (h.icuBeds?.total || 20) - (h.icuBeds?.occupied || 12),
          VentilatorsAvailable: (h.ventilators?.total || 12) - (h.ventilators?.occupied || 6),
          DoctorsOnDuty: h.doctors || 24,
          EmergencyLevel: h.emergencyLevel || 'Level 1 Trauma'
        }));

      case 'AI Decision Reports':
        return decisionLogs.map(d => ({
          LogID: d.id,
          TimeStr: d.timeStr,
          Event: d.event,
          Description: d.description,
          ACRNScore: `${d.acrnScore}%`,
          Category: d.iconType
        }));

      case 'Communication Reports':
        return vehicles.map(v => ({
          VehicleID: v.id,
          Type: v.type,
          CommChannel: v.commStatus || 'LoRa Mesh Active',
          PacketCount: v.packetCount || 1420,
          PacketsSent: v.loraStats?.packetsSent || 1450,
          PacketsReceived: v.loraStats?.packetsReceived || 1442,
          PacketLoss: `${v.loraStats?.packetLoss || 0.5}%`,
          SignalRSSI: `${v.loraStats?.rssi || -82} dBm`,
          SignalSNR: `${v.loraStats?.snr || 12.4} dB`
        }));

      case 'Analytics Reports':
      default:
        return [
          { Metric: 'Total Emergencies Registered', Value: incidents.length, Target: '250+' },
          { Metric: 'Total Dispatched Missions', Value: missions.length, Target: '250+' },
          { Metric: 'Active Fleet Units', Value: vehicles.length, Target: '38 Units' },
          { Metric: 'Total Hospital Centers', Value: hospitals.length, Target: '6 Centers' },
          { Metric: 'Average V2X Response Time', Value: '11.4 min', Target: '< 12 min' },
          { Metric: 'Average ETA Green Wave', Value: '3.2 min', Target: '< 4 min' },
          { Metric: 'Mission Success Rate', Value: '98.6%', Target: '> 95%' },
          { Metric: 'Communication Reliability', Value: '99.2%', Target: '> 98%' }
        ];
    }
  };

  const filteredData = getFilteredData();

  // Export handlers
  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) return;
    const filename = `DSRS_${activeReportMenu.replace(/\s+/g, '_')}_${Date.now()}`;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(obj => 
      Object.values(obj).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = '\uFEFF' + `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLSX = () => {
    if (!filteredData || filteredData.length === 0) return;
    const filename = `DSRS_${activeReportMenu.replace(/\s+/g, '_')}_${Date.now()}`;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeReportMenu.substring(0, 31));
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!filteredData || filteredData.length === 0) return;
    const filename = `DSRS_${activeReportMenu.replace(/\s+/g, '_')}_${Date.now()}`;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`DSRS-VANET — ${activeReportMenu}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()} | Filtered Rows: ${filteredData.length}`, 14, 28);

    let y = 38;
    const keys = Object.keys(filteredData[0]).slice(0, 5);

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.text(keys.join("  |  "), 14, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 6;

    // Table Rows
    doc.setFont("helvetica", "normal");
    filteredData.slice(0, 35).forEach((row: any) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const lineStr = keys.map(k => String(row[k] ?? '').substring(0, 16)).join("  |  ");
      doc.text(lineStr, 14, y);
      y += 6;
    });

    doc.save(`${filename}.pdf`);
  };

  const menuItems: Array<{ name: ReportCategory; icon: any }> = [
    { name: 'Overview Report', icon: FileText },
    { name: 'Incident Reports', icon: ShieldAlert },
    { name: 'Mission Reports', icon: Activity },
    { name: 'Fleet Reports', icon: Truck },
    { name: 'Hospital Reports', icon: Building2 },
    { name: 'AI Decision Reports', icon: Cpu },
    { name: 'Communication Reports', icon: Radio },
    { name: 'Analytics Reports', icon: BarChart3 }
  ];

  // Response Time Trend Data for graph
  const responseTimeData = [
    { date: '14 May', time: 14.1 },
    { date: '15 May', time: 13.2 },
    { date: '16 May', time: 12.8 },
    { date: '17 May', time: 11.9 },
    { date: '18 May', time: 12.6 },
    { date: '19 May', time: 12.1 },
    { date: '20 May', time: 11.4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 max-w-[1920px] mx-auto font-sans">
      
      {/* LEFT COLUMN: Reports Navigation Menu & Filter Panel (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Reports Categories Menu */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)] px-2 font-mono">
            COMMAND CENTER REPORTS
          </h2>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeReportMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveReportMenu(item.name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[var(--text-primary)] text-[var(--bg-base)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comprehensive Filter Controls */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 font-mono">
              <Filter className="w-4 h-4 text-blue-400" />
              Report Data Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-[10px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div>
              <label className="block text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Zone Filter</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] text-xs"
              >
                <option value="All">All Zones (Citywide)</option>
                <option value="Zone 1 (North)">Zone 1 (North)</option>
                <option value="Zone 2 (Central)">Zone 2 (Central)</option>
                <option value="Zone 3 (South)">Zone 3 (South)</option>
                <option value="Zone 4 (East)">Zone 4 (East)</option>
                <option value="Zone 5 (West)">Zone 5 (West)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Hospital Center</label>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] text-xs"
              >
                <option value="All">All Hospitals ({hospitals.length})</option>
                {hospitals.map(h => (
                  <option key={h.id} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Vehicle Unit Type</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-2 text-[var(--text-primary)] text-xs"
              >
                <option value="All">All Vehicle Types</option>
                <option value="Ambulance">Ambulance</option>
                <option value="Fire Truck">Fire Truck</option>
                <option value="Police Vehicle">Police Vehicle</option>
                <option value="Drone">Drone</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-1.5 text-[var(--text-primary)] text-xs"
                >
                  <option value="All">All</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-tertiary)] uppercase mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-1.5 text-[var(--text-primary)] text-xs"
                >
                  <option value="All">All</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="On Mission">On Mission</option>
                  <option value="Idle">Idle</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Export Downloads Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)] flex items-center gap-2 font-mono">
            <Download className="w-4 h-4 text-emerald-400" />
            Direct Download Export
          </h2>

          <button
            onClick={handleExportCSV}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-emerald-500/50 flex items-center justify-between text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Download CSV File</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">.CSV</span>
          </button>

          <button
            onClick={handleExportXLSX}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-blue-500/50 flex items-center justify-between text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <span>Download Excel File</span>
            </div>
            <span className="text-[10px] font-mono text-blue-400">.XLSX</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="w-full p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-rose-500/50 flex items-center justify-between text-xs font-bold text-[var(--text-primary)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileType className="w-4 h-4 text-rose-400" />
              <span>Download PDF File</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400">.PDF</span>
          </button>
        </div>

      </div>

      {/* RIGHT CONTENT AREA: Report Table & Charts (9 Cols) */}
      <div className="lg:col-span-9 space-y-5">
        
        {/* Top Operational Metrics Stat Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase">TOTAL DATASET ROWS</div>
            <div className="text-2xl font-extrabold text-blue-400 mt-1">{filteredData.length}</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase">ACTIVE FLEET</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{vehicles.length} Units</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase">HOSPITAL NETWORK</div>
            <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">{hospitals.length} Centers</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase">AVG RESPONSE TIME</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">11.4 min</div>
          </div>
        </div>

        {/* ACTIVE REPORT PANEL CONTENT */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2 font-mono">
                <FileText className="w-5 h-5 text-blue-400" />
                {activeReportMenu}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Displaying {filteredData.length} filtered records. Exports include active filters.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleExportXLSX}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FileType className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC REPORT TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-tertiary)] font-mono text-[10px] uppercase">
                  {filteredData.length > 0 && Object.keys(filteredData[0]).map((headerKey) => (
                    <th key={headerKey} className="py-2.5 px-3">{headerKey}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                {filteredData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    {Object.values(row).map((val: any, valIdx) => (
                      <td key={valIdx} className="py-2.5 px-3">
                        <span className={valIdx === 0 ? 'font-bold text-blue-400' : 'text-[var(--text-primary)]'}>
                          {String(val)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Response Time Trend Graph */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 font-mono">
              Average Emergency Response Time Trend (Minutes)
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} domain={[8, 16]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" name="Avg Response Time (min)" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
