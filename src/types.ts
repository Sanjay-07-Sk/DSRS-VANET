export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH';
export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'PENDING';

export interface Incident {
  id: string;
  type: string;
  location: string;
  zone: string;
  lat: number;
  lng: number;
  severity: IncidentSeverity;
  caller: string;
  victimCount: number;
  description: string;
  status: IncidentStatus;
  createdAt: string;
  timeStr: string;
}

export type VehicleType = 'Ambulance' | 'Fire Truck' | 'Police Vehicle' | 'Drone' | 'Command Vehicle';
export type VehicleStatus = 'On Mission' | 'Idle' | 'Active' | 'Maintenance';

export interface Vehicle {
  id: string;
  type: VehicleType;
  status: VehicleStatus;
  location: string;
  zone: string;
  lat: number;
  lng: number;
  heading: number; // 0-360 degrees
  speed: number; // km/h
  driver: string;
  driverId?: string;
  driverPhone?: string;
  driverShift?: string;
  fuel: number; // percentage 0-100
  battery: number; // percentage 0-100
  health: 'Good' | 'Warning' | 'Critical';
  missionId?: string;
  mission: string;
  incidentId?: string;
  assignedHospital?: string;
  assignedIncident?: string;
  commStatus?: string;
  packetCount?: number;
  maintenanceStatus?: 'OK' | 'Service Due' | 'Inspection Required' | 'Critical Maintenance';
  lastServiceDate?: string;
  nextServiceDate?: string;
  emergencyContacts?: {
    dispatcher: string;
    supervisor: string;
    emergencyLine: string;
  };
  loraStats?: {
    packetsSent: number;
    packetsReceived: number;
    packetLoss: number;
    rssi: number;
    snr: number;
  };
  lastUpdate: string;
}

export type HospitalStatusType = 'Normal' | 'High Occupancy' | 'Critical' | 'Offline';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  occupied: number;
  available: number;
  occupancyRate: number; // percentage
  status: HospitalStatusType;
  icuBeds: { occupied: number; total: number };
  generalBeds: { occupied: number; total: number };
  emergencyBeds: { occupied: number; total: number };
  ventilators: { occupied: number; total: number };
  pediatricBeds: { occupied: number; total: number };
  doctors: number;
  nurses: number;
  ambulances: number;
  bloodUnits: number;
  emergencyLevel?: 'Level 1 Trauma' | 'Level 2 Emergency' | 'Level 3 Regional';
  currentLoad?: number; // %
  todaysMissions?: number;
  avgResponseTime?: number; // min
  contactPhone?: string;
  chiefMedicalOfficer?: string;
  alerts?: string[];
  lastUpdated: string;
}

export interface AIAlert {
  id: string;
  title: string;
  description: string;
  location: string;
  probability: number;
  eta: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  confidence: number;
  timeStr: string;
}

export interface AIDecisionLog {
  id: string;
  timeStr: string;
  event: string;
  description: string;
  acrnScore: number;
  iconType: 'accident' | 'negotiation' | 'police' | 'ambulance' | 'hospital' | 'flag';
}

export interface ResourceRequest {
  id: string;
  hospitalName: string;
  resourceType: string;
  requestText: string;
  priority: 'High Priority' | 'Medium Priority' | 'Low Priority';
  timeStr: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  timeStr: string;
  level: 'critical' | 'warning' | 'info' | 'success';
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  timestamp: string;
}

export interface SystemStatusState {
  internet: boolean;
  lora: boolean;
  aiEngine: boolean;
  hospitalFeed: boolean;
  vehicleFeed: boolean;
}

export interface OfflineSimulationState {
  isCloudConnected: boolean;
  isSimulatingFailure: boolean;
  offlineStatusText: string;
  bufferedEventsCount: number;
  syncProgressPercent: number;
  lastSyncTime?: string;
}

export interface StreamStep {
  id: string;
  timestamp: string;
  stepName: string;
  status: 'completed' | 'evaluating' | 'rejected' | 'selected' | 'pending';
  detail: string;
}

export interface HardwareTelemetryState {
  esp32Status: 'Online' | 'Offline' | 'Connecting';
  loraLink: 'Active' | 'Degraded' | 'Offline';
  rssi: number;
  snr: number;
  packetCount: number;
  commQuality: number;
  lastHeartbeat: string;
  linkQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  connectionState: string;
}

export type Language = 'en' | 'ta';
export type Theme = 'dark' | 'light' | 'system';

export type MissionStatus = 
  | 'CREATED' 
  | 'HOSPITAL_ACKNOWLEDGED' 
  | 'AMBULANCE_EN_ROUTE' 
  | 'PATIENT_PICKED_UP' 
  | 'TRANSPORTING_TO_HOSPITAL' 
  | 'PATIENT_DELIVERED' 
  | 'COMPLETED';

export interface Mission {
  id: string;
  emergencyId: string;
  emergencyType: string;
  location: string;
  zone: string;
  ambulanceId: string;
  hospitalId: string;
  hospitalName: string;
  status: MissionStatus;
  etaMinutes: number;
  acrnConfidence: number;
  stepIndex: number; // 1 to 7
  createdAt: string;
  hospitalAckTime?: string;
  pickupTime?: string;
  deliveredTime?: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Judge / Evaluator' | 'Command Officer' | 'Hospital Coordinator' | 'Ambulance Driver' | 'System Admin';
  token?: string;
}

export interface AIDecisionStep {
  step: number;
  title: string;
  status: 'pending' | 'processing' | 'completed';
  result?: string;
  detail?: string;
}

export interface TrainingRecord {
  id: string;
  rainfallIntensity: number; // mm/h
  waterLevel: number; // ft
  roadCapacity: number; // %
  trafficDensity: number; // %
  windSpeed: number; // km/h
  soilMoisture: number; // %
  temperature: number; // °C
  targetRiskLevel: 'High' | 'Medium' | 'Low' | 'Safe';
  timestamp: string;
}
