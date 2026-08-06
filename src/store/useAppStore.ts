import { create } from 'zustand';
import { 
  Incident, 
  Vehicle, 
  Hospital, 
  AIDecisionLog, 
  SystemStatusState, 
  Language, 
  Theme,
  Mission,
  User,
  AIDecisionStep,
  ToastNotification,
  OfflineSimulationState,
  StreamStep,
  HardwareTelemetryState
} from '../types';
import { 
  MOCK_INCIDENTS, 
  MOCK_HOSPITALS, 
  MOCK_VEHICLES, 
  MOCK_MISSIONS,
  MOCK_DECISION_LOGS, 
  MOCK_USER 
} from '../constants/mockData';
import { 
  EmergenciesService, 
  FleetService, 
  HospitalsService, 
  MissionsService, 
  AiAnalyticsService, 
  AuthService 
} from '../services/apiService';

interface AppStore {
  // Navigation & Preferences
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;

  // Hackathon Demo Mode & Presentation Mode Controls
  resetDemoMode: () => void;
  isPresentationMode: boolean;
  togglePresentationMode: () => void;

  // Hardware Telemetry
  hardwareTelemetry: HardwareTelemetryState;

  // System Health & Offline Simulation
  systemStatus: SystemStatusState;
  toggleInternetOffline: () => void;
  setSystemStatus: (status: Partial<SystemStatusState>) => void;

  offlineState: OfflineSimulationState;
  triggerOfflineSimulation: () => Promise<void>;

  // Map Animation Checkpoint Sync
  mapCheckpointStep: number;
  setMapCheckpointStep: (step: number) => void;

  // AI Decision Stream
  aiDecisionStream: StreamStep[];
  addStreamStep: (step: Omit<StreamStep, 'id' | 'timestamp'>) => void;

  // Authentication
  currentUser: User;
  token: string | null;
  setCurrentUser: (user: User) => void;
  setToken: (token: string | null) => void;
  loginUser: (email: string, pass: string, role: string) => Promise<void>;
  registerUser: (name: string, email: string, pass: string, role: string) => Promise<void>;
  logoutUser: () => void;
  updateUserProfile: (name: string, email: string, role: User['role']) => void;

  // Core Datasets
  incidents: Incident[];
  vehicles: Vehicle[];
  hospitals: Hospital[];
  missions: Mission[];
  decisionLogs: AIDecisionLog[];
  notifications: string[];
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  setIncidents: (incidents: Incident[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setHospitals: (hospitals: Hospital[]) => void;
  setMissions: (missions: Mission[]) => void;
  completeMission: (missionId: string) => void;

  // Modals
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAiEngineModalOpen: boolean;
  setIsAiEngineModalOpen: (open: boolean) => void;
  isDatasetViewerOpen: boolean;
  setIsDatasetViewerOpen: (open: boolean) => void;

  // AI Step Runner
  aiRunnerSteps: AIDecisionStep[];
  setAiRunnerSteps: (steps: AIDecisionStep[]) => void;
  runAiDecisionSteps: (incident: Partial<Incident>) => Promise<void>;

  // Core Actions
  addIncident: (incidentData: Partial<Incident>) => Promise<void>;
  fetchInitialData: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation & Preferences
  activeTab: 'LIVE MONITORING',
  setActiveTab: (tab: string) => set({ activeTab: tab }),

  theme: (localStorage.getItem('dsrs-theme') as Theme) || 'dark',
  setTheme: (newTheme: Theme) => {
    localStorage.setItem('dsrs-theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', newTheme);
    }
    set({ theme: newTheme });
  },

  language: (localStorage.getItem('dsrs-language') as Language) || 'en',
  setLanguage: (lang: Language) => {
    localStorage.setItem('dsrs-language', lang);
    set({ language: lang });
  },

  // Presentation Mode Toggle
  isPresentationMode: false,
  togglePresentationMode: () => set((state) => ({ isPresentationMode: !state.isPresentationMode })),

  // Live Hardware Telemetry State
  hardwareTelemetry: {
    esp32Status: 'Online',
    loraLink: 'Active',
    rssi: -82,
    snr: 12.4,
    packetCount: 1452,
    commQuality: 99.8,
    lastHeartbeat: '1s ago',
    linkQuality: 'EXCELLENT',
    connectionState: 'LoRa Mesh ESP32 Node 01 Connected'
  },

  // Reset Demo Mode for Judges
  resetDemoMode: () => {
    const { addToast } = get();
    set({
      incidents: MOCK_INCIDENTS,
      missions: MOCK_MISSIONS,
      vehicles: MOCK_VEHICLES,
      hospitals: MOCK_HOSPITALS,
      decisionLogs: MOCK_DECISION_LOGS,
      mapCheckpointStep: 1,
      offlineState: {
        isCloudConnected: true,
        isSimulatingFailure: false,
        offlineStatusText: 'Cloud Telemetry Synchronized',
        bufferedEventsCount: 0,
        syncProgressPercent: 100,
        lastSyncTime: '12:45 PM'
      },
      aiDecisionStream: [
        { id: 'str-1', timestamp: '12:45:10 PM', stepName: 'Incident Declared', status: 'completed', detail: 'INC-101 registered @ Anna Nagar' },
        { id: 'str-2', timestamp: '12:45:12 PM', stepName: 'AI Priority Score', status: 'completed', detail: 'ACRN Score: 95/100 (HIGH)' },
        { id: 'str-3', timestamp: '12:45:14 PM', stepName: 'Evaluating AMB-01', status: 'rejected', detail: 'Distance: 4.8km — Busy on Mission' },
        { id: 'str-4', timestamp: '12:45:16 PM', stepName: 'Evaluating AMB-02', status: 'rejected', detail: 'Distance: 3.9km — Traffic congestion' },
        { id: 'str-5', timestamp: '12:45:18 PM', stepName: 'Selected AMB-03', status: 'selected', detail: 'Proximity: 2.1km — ALS Ready' },
        { id: 'str-6', timestamp: '12:45:20 PM', stepName: 'Evaluating HOSP-01', status: 'rejected', detail: 'Capacity: 95% — High Trauma Load' },
        { id: 'str-7', timestamp: '12:45:22 PM', stepName: 'Selected City Hospital', status: 'selected', detail: 'ER ICU Bed Reserved' },
        { id: 'str-8', timestamp: '12:45:25 PM', stepName: 'Mission MIS-801 Generated', status: 'completed', detail: 'V2X Green Wave Routing Transmitted' },
      ]
    });

    addToast({
      title: 'Demo State Reset',
      message: 'Emergency Command Center environment restored to initial baseline for Judge evaluation.',
      type: 'info'
    });
  },

  // System Health
  systemStatus: {
    internet: true,
    lora: true,
    aiEngine: true,
    hospitalFeed: true,
    vehicleFeed: true,
  },
  toggleInternetOffline: () => set((state) => ({
    systemStatus: { ...state.systemStatus, internet: !state.systemStatus.internet }
  })),
  setSystemStatus: (status: Partial<SystemStatusState>) => set((state) => ({
    systemStatus: { ...state.systemStatus, ...status }
  })),

  // Offline Continuity Simulation
  offlineState: {
    isCloudConnected: true,
    isSimulatingFailure: false,
    offlineStatusText: 'Cloud Telemetry Synchronized',
    bufferedEventsCount: 0,
    syncProgressPercent: 100,
    lastSyncTime: '12:45 PM'
  },

  triggerOfflineSimulation: async () => {
    const { addToast } = get();
    set({
      offlineState: {
        isCloudConnected: false,
        isSimulatingFailure: true,
        offlineStatusText: 'Cloud Connection Severed — Local Event Buffer Active',
        bufferedEventsCount: 1,
        syncProgressPercent: 0
      }
    });

    addToast({
      title: 'Cloud Connection Lost',
      message: 'Network offline. Emergency Command Center running on Local Mesh Event Buffer.',
      type: 'warning'
    });

    await new Promise(r => setTimeout(r, 1500));
    set(state => ({
      offlineState: { ...state.offlineState, bufferedEventsCount: 4, offlineStatusText: 'Mission Progress Buffered Locally (4 Events)' }
    }));

    await new Promise(r => setTimeout(r, 1500));
    set(state => ({
      offlineState: { ...state.offlineState, bufferedEventsCount: 8, offlineStatusText: 'Patient Vitals & GPS Telemetry Stored in Edge Mesh' }
    }));

    await new Promise(r => setTimeout(r, 1500));
    set(state => ({
      offlineState: { ...state.offlineState, isCloudConnected: true, offlineStatusText: 'Cloud Connection Restored — Uploading Queue...' }
    }));

    // Animate sync progress bar
    for (let p = 10; p <= 100; p += 25) {
      await new Promise(r => setTimeout(r, 300));
      set(state => ({
        offlineState: { ...state.offlineState, syncProgressPercent: p }
      }));
    }

    set({
      offlineState: {
        isCloudConnected: true,
        isSimulatingFailure: false,
        offlineStatusText: 'Cloud Telemetry Synchronized',
        bufferedEventsCount: 0,
        syncProgressPercent: 100,
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    addToast({
      title: 'Synchronization Complete',
      message: 'All 8 buffered emergency telemetry events successfully synced to Cloud.',
      type: 'success'
    });
  },

  // Map Animation Checkpoints (1 to 12)
  mapCheckpointStep: 1,
  setMapCheckpointStep: (step: number) => set({ mapCheckpointStep: step }),

  // AI Decision Stream
  aiDecisionStream: [
    { id: 'str-1', timestamp: '12:45:10 PM', stepName: 'Incident Declared', status: 'completed', detail: 'INC-101 registered @ Anna Nagar' },
    { id: 'str-2', timestamp: '12:45:12 PM', stepName: 'AI Priority Score', status: 'completed', detail: 'ACRN Score: 95/100 (HIGH)' },
    { id: 'str-3', timestamp: '12:45:14 PM', stepName: 'Evaluating AMB-01', status: 'rejected', detail: 'Distance: 4.8km — Busy on Mission' },
    { id: 'str-4', timestamp: '12:45:16 PM', stepName: 'Evaluating AMB-02', status: 'rejected', detail: 'Distance: 3.9km — Traffic congestion' },
    { id: 'str-5', timestamp: '12:45:18 PM', stepName: 'Selected AMB-03', status: 'selected', detail: 'Proximity: 2.1km — ALS Ready' },
    { id: 'str-6', timestamp: '12:45:20 PM', stepName: 'Evaluating HOSP-01', status: 'rejected', detail: 'Capacity: 95% — High Trauma Load' },
    { id: 'str-7', timestamp: '12:45:22 PM', stepName: 'Selected City Hospital', status: 'selected', detail: 'ER ICU Bed Reserved' },
    { id: 'str-8', timestamp: '12:45:25 PM', stepName: 'Mission MIS-801 Generated', status: 'completed', detail: 'V2X Green Wave Routing Transmitted' },
  ],
  addStreamStep: (step) => {
    const id = `str-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`;
    const newStep: StreamStep = {
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...step
    };
    set(state => ({ aiDecisionStream: [newStep, ...state.aiDecisionStream].slice(0, 20) }));
  },

  // Authentication
  token: localStorage.getItem('dsrs-jwt-token') || 'dsrs-jwt-token-judge-2026',
  currentUser: (() => {
    const saved = localStorage.getItem('dsrs-user-profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_USER;
  })(),
  setCurrentUser: (user: User) => {
    localStorage.setItem('dsrs-user-profile', JSON.stringify(user));
    set({ currentUser: user });
  },
  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('dsrs-jwt-token', token);
    } else {
      localStorage.removeItem('dsrs-jwt-token');
    }
    set({ token });
  },

  loginUser: async (email: string, pass: string, role: string) => {
    try {
      const res = await AuthService.login({ email, password: pass, role });
      if (res.success && res.data) {
        localStorage.setItem('dsrs-jwt-token', res.data.token);
        localStorage.setItem('dsrs-user-profile', JSON.stringify(res.data.user));
        set({ token: res.data.token, currentUser: res.data.user });
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  },

  registerUser: async (name: string, email: string, pass: string, role: string) => {
    try {
      const res = await AuthService.register({ name, email, password: pass, role });
      if (res.success && res.data) {
        localStorage.setItem('dsrs-jwt-token', res.data.token);
        localStorage.setItem('dsrs-user-profile', JSON.stringify(res.data.user));
        set({ token: res.data.token, currentUser: res.data.user });
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  },

  logoutUser: () => {
    localStorage.removeItem('dsrs-jwt-token');
    localStorage.removeItem('dsrs-user-profile');
    const guestUser: User = {
      id: 'usr-guest',
      name: 'Guest Officer',
      email: 'guest@dsrs.gov.in',
      role: 'Judge / Evaluator'
    };
    set({ token: null, currentUser: guestUser });
  },

  updateUserProfile: (name: string, email: string, role: User['role']) => {
    const updated = { ...get().currentUser, name, email, role };
    localStorage.setItem('dsrs-user-profile', JSON.stringify(updated));
    set({ currentUser: updated });
  },

  // Datasets initialized with centralized mock fallback
  incidents: MOCK_INCIDENTS,
  vehicles: MOCK_VEHICLES,
  hospitals: MOCK_HOSPITALS,
  missions: MOCK_MISSIONS,
  decisionLogs: MOCK_DECISION_LOGS,
  notifications: [
    "Heavy Rainfall predicted in Zone 5 within 30 mins",
    "City Hospital reached 95% bed capacity",
    "Ambulance AMB-01 assigned to incident INC-101"
  ],
  toasts: [
    {
      id: 'toast-1',
      title: 'Synchronization Complete',
      message: 'V2X Command Center telemetry synchronized across 6 hospitals & 38 vehicles.',
      type: 'success',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastNotification = {
      id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...toast
    };
    set((state) => ({ toasts: [newToast, ...state.toasts].slice(0, 5) }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },
  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
  setIncidents: (incidents: Incident[]) => set({ incidents }),
  setVehicles: (vehicles: Vehicle[]) => set({ vehicles }),
  setHospitals: (hospitals: Hospital[]) => set({ hospitals }),
  setMissions: (missions: Mission[]) => set({ missions }),

  completeMission: (missionId: string) => {
    const { missions, vehicles, hospitals, addToast } = get();
    const mIdx = missions.findIndex(m => m.id === missionId);
    if (mIdx === -1) return;

    const targetMission = missions[mIdx];
    const updatedMissions = [...missions];
    updatedMissions[mIdx] = {
      ...targetMission,
      status: 'COMPLETED',
      stepIndex: 7,
      completedAt: new Date().toISOString()
    };

    // Release vehicle
    const updatedVehicles = vehicles.map(v => {
      if (v.id === targetMission.ambulanceId || v.missionId === missionId) {
        return {
          ...v,
          status: 'Idle' as Vehicle['status'],
          mission: 'None',
          missionId: undefined
        };
      }
      return v;
    });

    // Update hospital resources
    const updatedHospitals = hospitals.map(h => {
      if (h.id === targetMission.hospitalId || h.name === targetMission.hospitalName) {
        const newOccupied = Math.min(h.totalCapacity, h.occupied + 1);
        const newAvail = h.totalCapacity - newOccupied;
        return {
          ...h,
          occupied: newOccupied,
          available: newAvail,
          occupancyRate: Math.round((newOccupied / h.totalCapacity) * 100),
          icuBeds: {
            ...h.icuBeds,
            occupied: Math.min(h.icuBeds.total, h.icuBeds.occupied + 1)
          }
        };
      }
      return h;
    });

    set({
      missions: updatedMissions,
      vehicles: updatedVehicles,
      hospitals: updatedHospitals
    });

    addToast({
      title: 'Mission Completed',
      message: `Mission ${missionId} for ${targetMission.emergencyType} completed successfully. Resources updated.`,
      type: 'success'
    });
  },

  // Modals
  isCreateModalOpen: false,
  setIsCreateModalOpen: (open: boolean) => set({ isCreateModalOpen: open }),
  isSettingsModalOpen: false,
  setIsSettingsModalOpen: (open: boolean) => set({ isSettingsModalOpen: open }),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open: boolean) => set({ isAuthModalOpen: open }),
  isAiEngineModalOpen: false,
  setIsAiEngineModalOpen: (open: boolean) => set({ isAiEngineModalOpen: open }),
  isDatasetViewerOpen: false,
  setIsDatasetViewerOpen: (open: boolean) => set({ isDatasetViewerOpen: open }),

  // AI Step Runner
  aiRunnerSteps: [
    { step: 1, title: 'Priority Score Calculation', status: 'pending' },
    { step: 2, title: 'Optimal Ambulance Selection', status: 'pending' },
    { step: 3, title: 'Hospital Bed & ICU Selection', status: 'pending' },
    { step: 4, title: 'V2X Green Wave ETA Routing', status: 'pending' },
    { step: 5, title: 'Mission Dispatch & Recommendation', status: 'pending' }
  ],
  setAiRunnerSteps: (steps: AIDecisionStep[]) => set({ aiRunnerSteps: steps }),

  runAiDecisionSteps: async (incident: Partial<Incident>) => {
    const { addStreamStep, addToast } = get();
    set({
      isAiEngineModalOpen: true,
      mapCheckpointStep: 1,
      aiRunnerSteps: [
        { step: 1, title: 'Incident Declared & Registered', status: 'completed', result: `${incident.id || 'INC-NEW'} Registered`, detail: `Type: ${incident.type} @ ${incident.location}` },
        { step: 2, title: 'AI Decision Engine Initialization', status: 'processing', result: 'ACRN Neural Core Online' },
        { step: 3, title: 'Searching Ambulances (GPS Proximity)', status: 'pending' },
        { step: 4, title: 'Searching Hospitals (ICU & Bed Capacity)', status: 'pending' },
        { step: 5, title: 'Traffic Analysis (V2X Green Wave Corridor)', status: 'pending' },
        { step: 6, title: 'Priority & Risk Matrix Calculation', status: 'pending' },
        { step: 7, title: 'Green Wave ETA & Signal Timing', status: 'pending' },
        { step: 8, title: 'Best Hospital & ER Room Selection', status: 'pending' },
        { step: 9, title: 'Mission Dispatch & Live Tracking Launch', status: 'pending' }
      ]
    });

    addStreamStep({ stepName: 'Incident Declared', status: 'completed', detail: `${incident.id || 'INC-NEW'} registered @ ${incident.location || 'Anna Nagar'}` });

    try {
      await new Promise(r => setTimeout(r, 400));
      addStreamStep({ stepName: 'AI Priority Score Calculated', status: 'completed', detail: `ACRN Score: 94/100 (${incident.severity || 'HIGH'})` });
      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 2 ? { ...s, status: 'completed' } : s.step === 3 ? { ...s, status: 'processing' } : s)
      }));

      const aRes = await AiAnalyticsService.selectBestAmbulance({ location: incident.location || 'Anna Nagar, Chennai' });
      const aData = aRes.data || { bestAmbulance: MOCK_VEHICLES[0], distanceKm: '2.1', equipmentStatus: 'ALS Ready' };
      
      addStreamStep({ stepName: 'Evaluating AMB-01', status: 'rejected', detail: 'Distance: 4.8km — Busy on transport' });
      addStreamStep({ stepName: 'Evaluating AMB-02', status: 'rejected', detail: 'Distance: 3.9km — Heavy traffic slowdown' });
      addStreamStep({ stepName: `Selected ${aData.bestAmbulance.id}`, status: 'selected', detail: `Proximity: ${aData.distanceKm} km • ${aData.equipmentStatus}` });

      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 3 ? { ...s, status: 'completed', result: `Unit: ${aData.bestAmbulance.id}`, detail: `Proximity: ${aData.distanceKm} km • ${aData.equipmentStatus}` } : s.step === 4 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 400));

      const hRes = await AiAnalyticsService.selectBestHospital({ location: incident.location || 'Anna Nagar, Chennai' });
      const hData = hRes.data || { bestHospital: MOCK_HOSPITALS[0], availableBeds: 10, icuBedsOpen: 2 };
      
      addStreamStep({ stepName: 'Evaluating HOSP-01', status: 'rejected', detail: 'Capacity: 95% — ER Bay Occupied' });
      addStreamStep({ stepName: `Selected ${hData.bestHospital.name}`, status: 'selected', detail: `ICU Open: ${hData.icuBedsOpen} • Beds Avail: ${hData.availableBeds}` });

      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 4 ? { ...s, status: 'completed', result: `Found: ${hData.bestHospital.name}`, detail: `Beds Open: ${hData.availableBeds} • ICU Open: ${hData.icuBedsOpen}` } : s.step === 5 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 400));

      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 5 ? { ...s, status: 'completed', result: 'Green Wave Synchronization Active', detail: 'Preempting 6 Traffic Signals on Anna Nagar Corridor' } : s.step === 6 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 400));

      const pRes = await AiAnalyticsService.calculatePriority({ type: incident.type, severity: incident.severity, victimCount: incident.victimCount });
      const pData = pRes.data || { priorityScore: 92, priorityLevel: 'HIGH', riskCategory: 'Trauma Emergency' };
      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 6 ? { ...s, status: 'completed', result: `Priority Score: ${pData.priorityScore}/100 (${pData.priorityLevel})`, detail: `Classification: ${pData.riskCategory}` } : s.step === 7 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 400));

      const eRes = await AiAnalyticsService.calculateEta({ origin: incident.location || 'Anna Nagar', destination: hData.bestHospital.name });
      const eData = eRes.data || { etaMinutes: 3.4, recommendedRoute: 'Poonamallee High Rd -> Flyover' };
      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 7 ? { ...s, status: 'completed', result: `Est. ETA: ${eData.etaMinutes} Mins`, detail: `Route: ${eData.recommendedRoute}` } : s.step === 8 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 400));

      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 8 ? { ...s, status: 'completed', result: `Matched: ${hData.bestHospital.name}`, detail: 'Trauma Team Alerted & ER ICU Bay Reserved' } : s.step === 9 ? { ...s, status: 'processing' } : s)
      }));

      await new Promise(r => setTimeout(r, 500));

      const rRes = await AiAnalyticsService.generateRecommendation({ incidentId: incident.id, location: incident.location, type: incident.type, severity: incident.severity });
      const rData = rRes.data || { missionId: 'MIS-812', reasoning: 'Selected AMB-03 due to closest proximity.' };

      await MissionsService.createMission({
        emergencyId: incident.id,
        emergencyType: incident.type,
        location: incident.location,
        zone: incident.zone,
        ambulanceId: aData.bestAmbulance.id,
        hospitalId: hData.bestHospital.id,
        hospitalName: hData.bestHospital.name,
        etaMinutes: eData.etaMinutes,
        acrnConfidence: 94
      });

      addStreamStep({ stepName: `Mission ${rData.missionId} Generated`, status: 'completed', detail: `V2X Dispatch Sent to ${aData.bestAmbulance.id}` });

      addToast({
        title: 'Mission Dispatched',
        message: `Mission ${rData.missionId} assigned to Ambulance ${aData.bestAmbulance.id} for ${hData.bestHospital.name}`,
        type: 'info'
      });

      set((state) => ({
        aiRunnerSteps: state.aiRunnerSteps.map(s => s.step === 9 ? { ...s, status: 'completed', result: `Mission ${rData.missionId} Dispatched`, detail: rData.reasoning } : s)
      }));

    } catch (err) {
      console.error('Error in step execution:', err);
    }
  },

  addIncident: async (incidentData: Partial<Incident>) => {
    try {
      const res = await EmergenciesService.createIncident(incidentData);
      if (res.success && res.data) {
        get().addToast({
          title: 'Incident Created',
          message: `Emergency ${res.data.id} (${res.data.type}) registered at ${res.data.location}`,
          type: 'warning'
        });
        await get().runAiDecisionSteps(res.data);
      }
    } catch (err) {
      console.error('Error creating incident:', err);
    }
  },

  fetchInitialData: async () => {
    try {
      const [incRes, vehRes, hospRes, missRes] = await Promise.all([
        EmergenciesService.getIncidents(),
        FleetService.getVehicles(),
        HospitalsService.getHospitals(),
        MissionsService.getMissions()
      ]);
      set({
        incidents: (incRes.success && incRes.data && incRes.data.length > 0) ? incRes.data : MOCK_INCIDENTS,
        vehicles: (vehRes.success && vehRes.data && vehRes.data.length > 0) ? vehRes.data : MOCK_VEHICLES,
        hospitals: (hospRes.success && hospRes.data && hospRes.data.length > 0) ? hospRes.data : MOCK_HOSPITALS,
        missions: (missRes.success && missRes.data && missRes.data.length > 0) ? missRes.data : MOCK_MISSIONS
      });
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }
}));
