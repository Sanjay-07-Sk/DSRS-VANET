// Centralized System Constants & Enums

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum IncidentStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  PENDING = 'PENDING',
}

export enum VehicleType {
  AMBULANCE = 'Ambulance',
  FIRE_TRUCK = 'Fire Truck',
  POLICE_VEHICLE = 'Police Vehicle',
  DRONE = 'Drone',
  COMMAND_VEHICLE = 'Command Vehicle',
}

export enum VehicleStatus {
  ON_MISSION = 'On Mission',
  IDLE = 'Idle',
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
}

export enum HospitalStatus {
  NORMAL = 'Normal',
  HIGH_OCCUPANCY = 'High Occupancy',
  CRITICAL = 'Critical',
  OFFLINE = 'Offline',
}

export enum MissionStatus {
  CREATED = 'CREATED',
  HOSPITAL_ACKNOWLEDGED = 'HOSPITAL_ACKNOWLEDGED',
  AMBULANCE_EN_ROUTE = 'AMBULANCE_EN_ROUTE',
  PATIENT_PICKED_UP = 'PATIENT_PICKED_UP',
  TRANSPORTING_TO_HOSPITAL = 'TRANSPORTING_TO_HOSPITAL',
  PATIENT_DELIVERED = 'PATIENT_DELIVERED',
  COMPLETED = 'COMPLETED',
}

export enum UserRole {
  JUDGE_EVALUATOR = 'Judge / Evaluator',
  COMMAND_OFFICER = 'Command Officer',
  HOSPITAL_COORDINATOR = 'Hospital Coordinator',
  AMBULANCE_DRIVER = 'Ambulance Driver',
  SYSTEM_ADMIN = 'System Admin',
}

export const ZONES = [
  'All Zones',
  'Zone 1 (North)',
  'Zone 2 (Central)',
  'Zone 3 (South)',
  'Zone 4 (East)',
] as const;

export const DEFAULT_MAP_CENTER: [number, number] = [13.0827, 80.2707]; // Chennai Center
export const DEFAULT_MAP_ZOOM = 12;
