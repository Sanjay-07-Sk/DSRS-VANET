import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { AIHeatMap } from './AIHeatMap';
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
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Flame, 
  Zap, 
  BarChart3, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  BrainCircuit 
} from 'lucide-react';

export const AIAnalyticsView: React.FC = () => {
  const { language, setIsDatasetViewerOpen } = useApp();

  // Donut chart data for Risk Level Distribution
  const riskPieData = [
    { name: 'High Risk', value: 8, color: '#ef4444' },
    { name: 'Medium Risk', value: 12, color: '#f59e0b' },
    { name: 'Low Risk', value: 8, color: '#eab308' },
    { name: 'Safe', value: 4, color: '#22c55e' }
  ];

  // Risk Trend Line Chart Data
  const trendData = [
    { time: '10:00 AM', overall: 70, flood: 40, traffic: 50, fire: 30, infra: 20 },
    { time: '10:30 AM', overall: 72, flood: 42, traffic: 55, fire: 32, infra: 22 },
    { time: '11:00 AM', overall: 75, flood: 45, traffic: 58, fire: 35, infra: 25 },
    { time: '11:30 AM', overall: 71, flood: 41, traffic: 52, fire: 31, infra: 21 },
    { time: '12:00 PM', overall: 74, flood: 44, traffic: 60, fire: 34, infra: 24 },
    { time: '12:30 PM', overall: 76, flood: 46, traffic: 62, fire: 36, infra: 26 },
    { time: '01:00 PM', overall: 78, flood: 48, traffic: 65, fire: 38, infra: 28 },
  ];

  // Feature Importance Horizontal Bar Data
  const featureImportanceData = [
    { name: 'Rainfall Intensity', value: 28 },
    { name: 'Water Level', value: 24 },
    { name: 'Road Capacity', value: 18 },
    { name: 'Traffic Density', value: 14 },
    { name: 'Wind Speed', value: 8 },
    { name: 'Soil Moisture', value: 5 },
    { name: 'Temperature', value: 3 },
  ];

  // AI Predictions Table Data
  const predictions = [
    { type: 'Road Blockage', location: 'Porur Main Road', probability: '92%', eta: '15 min', risk: 'High' },
    { type: 'Flooding', location: 'Adyar River Bank', probability: '88%', eta: '20 min', risk: 'High' },
    { type: 'Fire Spread', location: 'Industrial Area', probability: '75%', eta: '18 min', risk: 'Medium' },
    { type: 'Traffic Congestion', location: 'Guindy Signal', probability: '70%', eta: '10 min', risk: 'Medium' },
    { type: 'Infrastructure Damage', location: 'Old Bridge', probability: '65%', eta: '25 min', risk: 'Medium' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 max-w-[1920px] mx-auto font-sans">
      
      {/* LEFT COLUMN: Prediction Overview, Categories & Model Performance (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* Prediction Overview Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('predictionOverview', language)}
          </h2>

          {/* Overall Risk Score Block matching Screenshot 3 */}
          <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-rose-500/30 text-white relative overflow-hidden">
            <div className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">{t('overallRiskScore', language)}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">78</span>
              <span className="text-xs font-mono text-[var(--text-tertiary)]">/100</span>
            </div>
            <div className="text-xs font-bold text-rose-500 mt-1">{t('highRisk', language)}</div>
            
            {/* Sparkline trend representation */}
            <div className="h-6 mt-2 flex items-end gap-1">
              {[30, 45, 40, 55, 60, 58, 70, 78].map((val, i) => (
                <div key={i} className="flex-1 bg-rose-500/40 rounded-t" style={{ height: `${val}%` }} />
              ))}
            </div>
          </div>

          {/* Risk Level Distribution Donut */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider">
              {t('riskLevelDistribution', language)}
            </div>

            <div className="h-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold font-mono text-[var(--text-primary)]">32</span>
                <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase">Total Areas</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] font-mono mt-1">
              {riskPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">{String(item.value).padStart(2, '0')} ({((item.value/32)*100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Categories Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('predictionCategories', language)}
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-medium">Road Blockage</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">09</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-medium">Flooding</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">07</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-medium">Fire Spread</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">05</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-medium">Traffic Congestion</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">06</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)] font-medium">Infrastructure Damage</span>
              <span className="font-mono font-bold text-[var(--text-primary)]">05</span>
            </div>
          </div>
        </div>

        {/* Model Performance Grid matching Screenshot 3 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('modelPerformance', language)}
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Accuracy</div>
              <div className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">94.2%</div>
              <div className="text-[10px] text-emerald-400">↑ 2.1%</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Precision</div>
              <div className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">93.1%</div>
              <div className="text-[10px] text-emerald-400">↑ 1.8%</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase">Recall</div>
              <div className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">92.7%</div>
              <div className="text-[10px] text-emerald-400">↑ 2.3%</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-[var(--text-tertiary)] uppercase">F1 Score</div>
              <div className="text-base font-extrabold text-[var(--text-primary)] mt-0.5">93.0%</div>
              <div className="text-[10px] text-emerald-400">↑ 2.0%</div>
            </div>
          </div>
        </div>

      </div>

      {/* CENTER COLUMN: AI Risk Heatmap, Trend Analysis, Feature Importance & Model Details (6 Cols) */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Predicted AI Risk Heatmap Map */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-subtle)] px-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-rose-500" />
              {t('aiRiskHeatmap', language)}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> Very High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Medium</span>
            </div>
          </div>
          <AIHeatMap height="360px" />
        </div>

        {/* Analytics Key Performance Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">AVERAGE ETA</div>
            <div className="text-lg font-extrabold text-emerald-400 mt-0.5">3.2 min</div>
            <div className="text-[9px] text-emerald-400">Green Wave Active</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">AVG RESPONSE TIME</div>
            <div className="text-lg font-extrabold text-amber-400 mt-0.5">11.4 min</div>
            <div className="text-[9px] text-amber-400">↓ 1.8 min vs target</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">MISSION SUCCESS RATE</div>
            <div className="text-lg font-extrabold text-blue-400 mt-0.5">98.6%</div>
            <div className="text-[9px] text-blue-400">251 / 255 Missions</div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
            <div className="text-[9px] text-[var(--text-tertiary)] uppercase">COMM RELIABILITY</div>
            <div className="text-lg font-extrabold text-purple-400 mt-0.5">99.2%</div>
            <div className="text-[9px] text-purple-400">LoRa Mesh Dual Band</div>
          </div>
        </div>

        {/* Risk Trend Analysis Multi-Line Chart */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {t('riskTrendAnalysis', language)}
            </h2>
            <select className="bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[10px] font-mono rounded px-1.5 py-0.5 text-[var(--text-secondary)]">
              <option>Last 3 Hours</option>
              <option>Last 24 Hours</option>
            </select>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={10} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="overall" name="Overall Risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="flood" name="Flood Risk" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="traffic" name="Traffic Risk" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="fire" name="Fire Risk" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="infra" name="Infrastructure Risk" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance & Model Details Grid matching Screenshot 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Feature Importance Horizontal Bar Chart */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
              {t('featureImportance', language)}
            </h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={featureImportanceData}>
                  <XAxis type="number" stroke="var(--text-tertiary)" fontSize={10} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={9} width={90} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Model Details */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-mono text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
              {t('aiModelDetails', language)}
            </h2>

            <div className="space-y-2 text-[11px]">
              <div>
                <span className="text-[var(--text-tertiary)] block text-[9px]">Model Name</span>
                <span className="font-bold text-[var(--text-primary)]">DSRS-VANET Risk Prediction Model</span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] block text-[9px]">Model Type</span>
                <span className="font-semibold text-blue-400">XGBoost Classifier + Neural Net</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border-subtle)]">
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[9px]">Training Data</span>
                  <span className="font-bold text-[var(--text-primary)]">2.4M+ Records</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block text-[9px]">Model Version</span>
                  <span className="font-bold text-emerald-400">v2.4.1</span>
                </div>
              </div>
              <div className="pt-1 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-tertiary)] block text-[9px]">Last Trained</span>
                <span className="text-[var(--text-secondary)]">20 May 2026, 08:30 AM</span>
              </div>

              <button
                onClick={() => setIsDatasetViewerOpen(true)}
                className="w-full mt-3 py-2 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-lg font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                Inspect Training Dataset
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: AI Predictions Table, Insights & Recommended Actions (3 Cols) */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* AI Predictions Table */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {t('aiPredictionsNext30', language)}
            </h2>
            <button className="text-[10px] font-mono text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              View All
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {predictions.map((p, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[var(--text-primary)] text-xs">{p.type}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)] font-sans">{p.location}</div>
                  <div className="text-[10px] text-blue-400 mt-0.5">Prob: {p.probability} • ETA: {p.eta}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                  p.risk === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                }`}>
                  {p.risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Block matching Screenshot 3 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('aiInsights', language)}
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              Heavy rainfall and water level data indicates high probability of flooding in Adyar and Velachery areas.
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              Porur Main Road likely to get blocked due to predicted infrastructure damage.
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              City Hospital and General Hospital may reach 90%+ capacity in next 2 hours.
            </div>
          </div>
        </div>

        {/* Recommended Actions List matching Screenshot 3 */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm font-sans">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            {t('recommendedActions', language)}
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 cursor-pointer hover:border-[var(--border-strong)]">
              <span className="font-medium text-[var(--text-primary)]">Pre-position 2 ambulances near Velachery</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono text-[9px] font-bold">Priority: High</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 cursor-pointer hover:border-[var(--border-strong)]">
              <span className="font-medium text-[var(--text-primary)]">Deploy barricades at Porur Main Road</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-mono text-[9px] font-bold">Priority: High</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 cursor-pointer hover:border-[var(--border-strong)]">
              <span className="font-medium text-[var(--text-primary)]">Activate water pumps in Adyar Low Areas</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold">Priority: Medium</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 cursor-pointer hover:border-[var(--border-strong)]">
              <span className="font-medium text-[var(--text-primary)]">Increase fire brigade readiness in Industrial Area</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold">Priority: Medium</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
