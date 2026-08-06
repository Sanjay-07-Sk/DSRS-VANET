import { apiService, ApiResponse } from './apiClient';
import { Vehicle, Hospital, Incident, Mission, AIDecisionLog, User } from '../types';

export const AuthService = {
  async login(credentials: { email: string; password?: string; role?: string }) {
    return apiService.post<{ token: string; user: User }>('/auth/login', credentials);
  },
  async register(user: { name: string; email: string; password?: string; role?: string }) {
    return apiService.post<{ token: string; user: User }>('/auth/register', user);
  },
  async getCurrentUser() {
    return apiService.get<{ user: User }>('/auth/me');
  },
};

export const HospitalsService = {
  async getHospitals() {
    return apiService.get<Hospital[]>('/hospitals');
  },

  async getHospitalById(id: string) {
    return apiService.get<Hospital>(`/hospitals/${id}`);
  },

  async updateHospital(id: string, updates: Partial<Hospital>) {
    return apiService.put<Hospital>(`/hospitals/${id}`, updates);
  },
};

export const FleetService = {
  async getVehicles() {
    return apiService.get<Vehicle[]>('/ambulances');
  },

  async getVehicleById(id: string) {
    return apiService.get<Vehicle>(`/ambulances/${id}`);
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>) {
    return apiService.put<Vehicle>(`/ambulances/${id}`, updates);
  },
};

export const EmergenciesService = {
  async getIncidents() {
    return apiService.get<Incident[]>('/emergencies');
  },

  async createIncident(incidentData: Partial<Incident>) {
    return apiService.post<Incident>('/emergencies', incidentData);
  },

  async getIncidentById(id: string) {
    return apiService.get<Incident>(`/emergencies/${id}`);
  },
};

export const MissionsService = {
  async getMissions() {
    return apiService.get<Mission[]>('/missions');
  },

  async createMission(missionData: Partial<Mission>) {
    return apiService.post<Mission>('/missions', missionData);
  },

  async completeMission(id: string) {
    return apiService.patch<Mission>(`/missions/${id}/complete`);
  },
};

export const AiAnalyticsService = {
  async calculatePriority(payload: { type?: string; severity?: string; victimCount?: number }) {
    return apiService.post<{ priorityScore: number; priorityLevel: string; riskCategory: string }>('/ai/priority', payload);
  },

  async selectBestAmbulance(payload: { location: string }) {
    return apiService.post<{ bestAmbulance: Vehicle; distanceKm: string; etaMins: string; equipmentStatus?: string }>('/ai/best-ambulance', payload);
  },

  async selectBestHospital(payload: { location: string }) {
    return apiService.post<{ bestHospital: Hospital; availableBeds: number; icuBedsOpen: number }>('/ai/best-hospital', payload);
  },

  async calculateEta(payload: { origin: string; destination: string }) {
    return apiService.post<{ etaMinutes: number; distanceKm: number; recommendedRoute: string }>('/ai/eta', payload);
  },

  async generateRecommendation(payload: { incidentId?: string; location: string; type?: string; severity?: string }) {
    return apiService.post<{ missionId: string; emergencyId: string; ambulanceId: string; hospitalId: string; reasoning: string }>('/ai/recommendation', payload);
  },

  async getDataset() {
    return apiService.get<{ totalRecords: string; sampleRecords: any[] }>('/ai/dataset');
  }
};
