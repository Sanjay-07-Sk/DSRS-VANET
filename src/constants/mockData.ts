import { Incident, Vehicle, Hospital, Mission, AIDecisionLog, User } from '../types';

// Helper generators for Chennai realistic data
const CHENNAI_ZONES = [
  'Zone 1 (North)',
  'Zone 2 (Central)',
  'Zone 3 (South)',
  'Zone 4 (East)',
  'Zone 5 (West)'
];

const CHENNAI_LOCATIONS = [
  { name: 'Anna Nagar, Chennai', lat: 13.0878, lng: 80.2170, zone: 'Zone 1 (North)' },
  { name: 'Manali, Chennai', lat: 13.1667, lng: 80.2667, zone: 'Zone 1 (North)' },
  { name: 'Porur, Chennai', lat: 13.0382, lng: 80.1565, zone: 'Zone 4 (East)' },
  { name: 'North Chennai', lat: 13.1200, lng: 80.2500, zone: 'Zone 1 (North)' },
  { name: 'Ambattur, Chennai', lat: 13.1143, lng: 80.1548, zone: 'Zone 2 (Central)' },
  { name: 'T. Nagar, Chennai', lat: 13.0418, lng: 80.2341, zone: 'Zone 2 (Central)' },
  { name: 'Guindy, Chennai', lat: 13.0067, lng: 80.2020, zone: 'Zone 3 (South)' },
  { name: 'Adyar, Chennai', lat: 13.0012, lng: 80.2565, zone: 'Zone 3 (South)' },
  { name: 'Velachery, Chennai', lat: 12.9815, lng: 80.2180, zone: 'Zone 3 (South)' },
  { name: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000, zone: 'Zone 5 (West)' },
  { name: 'Koyambedu, Chennai', lat: 13.0694, lng: 80.1948, zone: 'Zone 2 (Central)' },
  { name: 'Besant Nagar, Chennai', lat: 12.9980, lng: 80.2690, zone: 'Zone 3 (South)' },
  { name: 'Royapettah, Chennai', lat: 13.0538, lng: 80.2618, zone: 'Zone 2 (Central)' },
  { name: 'Perambur, Chennai', lat: 13.1167, lng: 80.2417, zone: 'Zone 1 (North)' },
  { name: 'Egmore, Chennai', lat: 13.0732, lng: 80.2609, zone: 'Zone 2 (Central)' }
];

const INCIDENT_TYPES = [
  'Flood - Severe Inundation',
  'Fire - Structural Hazard',
  'Road Traffic Collision',
  'Chemical Container Leak',
  'Building Collapse Risk',
  'Cardiac Medical Emergency',
  'Substation Electrical Fire',
  'Bridge Structural Crack',
  'Gas Pipeline Pressure Surge',
  'Severe Waterlogging - Metro Corridor'
];

const CALLERS = [
  'Kavitha R.', 'Suresh Kumar', 'Traffic Post 4', 'Seismology Center',
  'Industrial Safety Unit', 'Officer Selvam', 'Dr. Ananya Roy', 'Control Room 108',
  'Public Helplines', 'Met Department', 'Coast Guard Relay', 'Zonal Officer Murugan'
];

// Generate 255 Incidents
export const MOCK_INCIDENTS: Incident[] = Array.from({ length: 255 }, (_, i) => {
  const loc = CHENNAI_LOCATIONS[i % CHENNAI_LOCATIONS.length];
  const type = INCIDENT_TYPES[i % INCIDENT_TYPES.length];
  const caller = CALLERS[i % CALLERS.length];
  const severities: Incident['severity'][] = ['HIGH', 'MEDIUM', 'LOW'];
  const statusList: Incident['status'][] = i < 25 ? ['ACTIVE'] : i < 200 ? ['RESOLVED'] : ['PENDING'];
  
  const hour = Math.floor(12 - (i * 0.15)) % 24;
  const minute = (i * 7) % 60;
  const timeStr = `${((hour + 11) % 12 + 1)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;

  return {
    id: `INC-${101 + i}`,
    type,
    location: loc.name,
    zone: loc.zone,
    lat: Number((loc.lat + (Math.sin(i) * 0.015)).toFixed(4)),
    lng: Number((loc.lng + (Math.cos(i) * 0.015)).toFixed(4)),
    severity: severities[i % 3],
    caller,
    victimCount: Math.floor(1 + (i * 3) % 18),
    description: `Automated V2X incident alert logged near ${loc.name}. Immediate priority dispatch initiated.`,
    status: statusList[i % statusList.length],
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    timeStr,
  };
});

// 6 Detailed Hospitals
export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'City Hospital',
    location: 'Anna Nagar, Chennai',
    lat: 13.0850,
    lng: 80.2100,
    totalCapacity: 200,
    occupied: 190,
    available: 10,
    occupancyRate: 95,
    status: 'Critical',
    icuBeds: { occupied: 38, total: 40 },
    generalBeds: { occupied: 95, total: 100 },
    emergencyBeds: { occupied: 37, total: 40 },
    ventilators: { occupied: 14, total: 15 },
    pediatricBeds: { occupied: 6, total: 5 },
    doctors: 45,
    nurses: 82,
    ambulances: 6,
    bloodUnits: 42,
    emergencyLevel: 'Level 1 Trauma',
    currentLoad: 95,
    todaysMissions: 48,
    avgResponseTime: 10.4,
    contactPhone: '+91 44 2621 1000',
    chiefMedicalOfficer: 'Dr. R. Sundaram, MD (Trauma Care)',
    alerts: ['ICU Capacity at 95%', 'High Trauma Inflow Expected'],
    lastUpdated: '12:45 PM',
  },
  {
    id: 'HOSP-02',
    name: 'General Hospital',
    location: 'T. Nagar, Chennai',
    lat: 13.0418,
    lng: 80.2341,
    totalCapacity: 150,
    occupied: 110,
    available: 40,
    occupancyRate: 73,
    status: 'High Occupancy',
    icuBeds: { occupied: 22, total: 30 },
    generalBeds: { occupied: 50, total: 70 },
    emergencyBeds: { occupied: 24, total: 30 },
    ventilators: { occupied: 10, total: 20 },
    pediatricBeds: { occupied: 14, total: 20 },
    doctors: 32,
    nurses: 58,
    ambulances: 4,
    bloodUnits: 38,
    emergencyLevel: 'Level 1 Trauma',
    currentLoad: 73,
    todaysMissions: 36,
    avgResponseTime: 11.8,
    contactPhone: '+91 44 2834 2000',
    chiefMedicalOfficer: 'Dr. Meenakshi S., MS (Surgeon)',
    alerts: ['Blood Bank O-Negative Low'],
    lastUpdated: '12:44 PM',
  },
  {
    id: 'HOSP-03',
    name: 'Apollo Hospital',
    location: 'Guindy, Chennai',
    lat: 13.0067,
    lng: 80.2020,
    totalCapacity: 200,
    occupied: 110,
    available: 90,
    occupancyRate: 55,
    status: 'Normal',
    icuBeds: { occupied: 15, total: 30 },
    generalBeds: { occupied: 60, total: 110 },
    emergencyBeds: { occupied: 20, total: 40 },
    ventilators: { occupied: 8, total: 15 },
    pediatricBeds: { occupied: 15, total: 20 },
    doctors: 28,
    nurses: 64,
    ambulances: 5,
    bloodUnits: 50,
    emergencyLevel: 'Level 2 Emergency',
    currentLoad: 55,
    todaysMissions: 29,
    avgResponseTime: 9.6,
    contactPhone: '+91 44 2829 0200',
    chiefMedicalOfficer: 'Dr. K. Vijay, DNB (Emergency)',
    alerts: ['Normal Operational Readiness'],
    lastUpdated: '12:43 PM',
  },
  {
    id: 'HOSP-04',
    name: 'ESIC Hospital',
    location: 'Tambaram, Chennai',
    lat: 12.9249,
    lng: 80.1000,
    totalCapacity: 150,
    occupied: 70,
    available: 80,
    occupancyRate: 47,
    status: 'Normal',
    icuBeds: { occupied: 8, total: 20 },
    generalBeds: { occupied: 40, total: 80 },
    emergencyBeds: { occupied: 12, total: 30 },
    ventilators: { occupied: 3, total: 10 },
    pediatricBeds: { occupied: 10, total: 20 },
    doctors: 18,
    nurses: 30,
    ambulances: 3,
    bloodUnits: 26,
    emergencyLevel: 'Level 3 Regional',
    currentLoad: 47,
    todaysMissions: 18,
    avgResponseTime: 13.2,
    contactPhone: '+91 44 2226 3000',
    chiefMedicalOfficer: 'Dr. Anand Kumar, MD',
    alerts: ['80 Beds Available'],
    lastUpdated: '12:42 PM',
  },
  {
    id: 'HOSP-05',
    name: 'Govt. Hospital',
    location: 'Velachery, Chennai',
    lat: 12.9815,
    lng: 80.2180,
    totalCapacity: 150,
    occupied: 90,
    available: 60,
    occupancyRate: 60,
    status: 'High Occupancy',
    icuBeds: { occupied: 15, total: 20 },
    generalBeds: { occupied: 45, total: 80 },
    emergencyBeds: { occupied: 18, total: 30 },
    ventilators: { occupied: 6, total: 10 },
    pediatricBeds: { occupied: 12, total: 20 },
    doctors: 22,
    nurses: 41,
    ambulances: 3,
    bloodUnits: 30,
    emergencyLevel: 'Level 2 Emergency',
    currentLoad: 60,
    todaysMissions: 24,
    avgResponseTime: 12.1,
    contactPhone: '+91 44 2243 4000',
    chiefMedicalOfficer: 'Dr. S. Rajesh, MS',
    alerts: ['Flood Relief Bay Activated'],
    lastUpdated: '12:40 PM',
  },
  {
    id: 'HOSP-06',
    name: 'Relief Camp Hospital',
    location: 'Adyar (Camp), Chennai',
    lat: 13.0012,
    lng: 80.2565,
    totalCapacity: 50,
    occupied: 42,
    available: 8,
    occupancyRate: 84,
    status: 'High Occupancy',
    icuBeds: { occupied: 4, total: 5 },
    generalBeds: { occupied: 26, total: 30 },
    emergencyBeds: { occupied: 9, total: 10 },
    ventilators: { occupied: 3, total: 5 },
    pediatricBeds: { occupied: 3, total: 5 },
    doctors: 10,
    nurses: 18,
    ambulances: 2,
    bloodUnits: 15,
    emergencyLevel: 'Level 3 Regional',
    currentLoad: 84,
    todaysMissions: 15,
    avgResponseTime: 14.5,
    contactPhone: '+91 44 2441 5000',
    chiefMedicalOfficer: 'Dr. Priya V., MBBS',
    alerts: ['Field Hospital Medical Supplies Requested'],
    lastUpdated: '12:38 PM',
  },
];

// Generate 20 Ambulances, 10 Police Vehicles, 8 Fire Trucks = 38 Vehicles
const DRIVERS = [
  'Ramesh P.', 'Karthik V.', 'Dinesh S.', 'Vijay M.', 'Anand K.',
  'Murugan T.', 'Ganesh N.', 'Prakash L.', 'Inspector Selvam', 'Officer Rajan',
  'Officer Mani', 'Officer Velu', 'Officer Sundar', 'Officer Chandran', 'Auto-Pilot Alpha'
];

export const MOCK_VEHICLES: Vehicle[] = [
  // 20 Ambulances
  ...Array.from({ length: 20 }, (_, i) => {
    const id = `AMB-${(i + 1).toString().padStart(2, '0')}`;
    const loc = CHENNAI_LOCATIONS[i % CHENNAI_LOCATIONS.length];
    const isMission = i % 2 === 0;
    const missionId = isMission ? `MIS-${801 + i}` : undefined;
    const hosp = MOCK_HOSPITALS[i % MOCK_HOSPITALS.length];
    const inc = MOCK_INCIDENTS[i % MOCK_INCIDENTS.length];

    return {
      id,
      type: 'Ambulance' as const,
      status: (isMission ? 'On Mission' : i % 3 === 0 ? 'Active' : 'Idle') as Vehicle['status'],
      location: loc.name,
      zone: loc.zone,
      lat: Number((loc.lat + (Math.sin(i) * 0.01)).toFixed(4)),
      lng: Number((loc.lng + (Math.cos(i) * 0.01)).toFixed(4)),
      heading: (i * 35) % 360,
      speed: isMission ? 45 + (i * 3) % 25 : 0,
      driver: DRIVERS[i % DRIVERS.length],
      driverId: `DRV-${1000 + i}`,
      driverPhone: `+91 9840${(10000 + i * 137).toString().substring(0, 6)}`,
      driverShift: i % 2 === 0 ? 'Day Shift (08:00 - 16:00)' : 'Night Shift (16:00 - 00:00)',
      fuel: Math.max(45, 95 - i * 2),
      battery: Math.max(50, 98 - i * 2),
      health: (i % 7 === 0 ? 'Warning' : 'Good') as Vehicle['health'],
      missionId,
      mission: isMission ? `Emergency Patient Transport to ${hosp.name}` : 'Patrol Duty / Standby',
      incidentId: inc.id,
      assignedHospital: hosp.name,
      assignedIncident: `${inc.id} (${inc.type})`,
      commStatus: i % 5 === 0 ? '5G Connected' : 'LoRa Mesh Active',
      packetCount: 1200 + i * 142,
      maintenanceStatus: (i % 8 === 0 ? 'Service Due' : 'OK') as Vehicle['maintenanceStatus'],
      lastServiceDate: '2026-04-15',
      nextServiceDate: '2026-06-15',
      emergencyContacts: {
        dispatcher: 'Dispatcher R. Nair (+91 44 2829 9901)',
        supervisor: 'Capt. R. Deshmukh (+91 98400 11223)',
        emergencyLine: '108 Command Desk'
      },
      loraStats: {
        packetsSent: 1420 + i * 80,
        packetsReceived: 1412 + i * 80,
        packetLoss: 0.5,
        rssi: -82 - (i % 10),
        snr: 12.4
      },
      lastUpdate: '12:45 PM',
    };
  }),

  // 10 Police Vehicles
  ...Array.from({ length: 10 }, (_, i) => {
    const id = `POL-${(i + 1).toString().padStart(2, '0')}`;
    const loc = CHENNAI_LOCATIONS[(i + 3) % CHENNAI_LOCATIONS.length];
    const isMission = i % 2 === 1;

    return {
      id,
      type: 'Police Vehicle' as const,
      status: (isMission ? 'On Mission' : 'Active') as Vehicle['status'],
      location: loc.name,
      zone: loc.zone,
      lat: Number((loc.lat + (Math.sin(i) * 0.012)).toFixed(4)),
      lng: Number((loc.lng + (Math.cos(i) * 0.012)).toFixed(4)),
      heading: (i * 45) % 360,
      speed: isMission ? 55 : 20,
      driver: `Inspector ${['Selvam', 'Rajan', 'Mani', 'Velu', 'Sundar', 'Chandran'][i % 6]}`,
      driverId: `POL-DRV-${200 + i}`,
      driverPhone: `+91 9444${(20000 + i * 231).toString().substring(0, 6)}`,
      driverShift: '24-Hour Command Patrol',
      fuel: 85 - i * 3,
      battery: 88 - i * 2,
      health: 'Good' as const,
      mission: isMission ? 'Green Wave Route Security & Traffic Clearance' : 'Patrol',
      assignedHospital: 'N/A (Police Escort)',
      assignedIncident: `INC-${102 + i}`,
      commStatus: 'V2X Encrypted Mesh',
      packetCount: 2100 + i * 90,
      maintenanceStatus: 'OK' as const,
      lastServiceDate: '2026-05-01',
      nextServiceDate: '2026-07-01',
      emergencyContacts: {
        dispatcher: 'Police Control Room (+91 44 2345 2222)',
        supervisor: 'AC P. Chandrasekar (+91 94440 88990)',
        emergencyLine: '100 Emergency Control'
      },
      loraStats: {
        packetsSent: 2800 + i * 50,
        packetsReceived: 2795 + i * 50,
        packetLoss: 0.2,
        rssi: -78,
        snr: 14.1
      },
      lastUpdate: '12:44 PM',
    };
  }),

  // 8 Fire Trucks
  ...Array.from({ length: 8 }, (_, i) => {
    const id = `FIR-${(i + 1).toString().padStart(2, '0')}`;
    const loc = CHENNAI_LOCATIONS[(i + 5) % CHENNAI_LOCATIONS.length];
    const isMission = i === 0 || i === 1;

    return {
      id,
      type: 'Fire Truck' as const,
      status: (isMission ? 'On Mission' : 'Idle') as Vehicle['status'],
      location: loc.name,
      zone: loc.zone,
      lat: Number((loc.lat + (Math.sin(i) * 0.008)).toFixed(4)),
      lng: Number((loc.lng + (Math.cos(i) * 0.008)).toFixed(4)),
      heading: (i * 60) % 360,
      speed: isMission ? 60 : 0,
      driver: `Fire Captain ${['Murugan', 'Ganesh', 'Prakash', 'Kumar'][i % 4]}`,
      driverId: `FIR-DRV-${300 + i}`,
      driverPhone: `+91 9841${(30000 + i * 188).toString().substring(0, 6)}`,
      driverShift: 'Emergency Fire Standby',
      fuel: 75 - i * 4,
      battery: 80 - i * 3,
      health: (i === 2 ? 'Warning' : 'Good') as Vehicle['health'],
      mission: isMission ? 'Chemical & Industrial Fire Suppression' : 'Station Standby',
      assignedHospital: 'N/A (Fire Services)',
      assignedIncident: `INC-${102 + i}`,
      commStatus: 'V2X Heavy Duty Radio',
      packetCount: 1800 + i * 70,
      maintenanceStatus: (i === 2 ? 'Service Due' : 'OK') as Vehicle['maintenanceStatus'],
      lastServiceDate: '2026-04-10',
      nextServiceDate: '2026-06-10',
      emergencyContacts: {
        dispatcher: 'Fire Command (+91 44 2841 0101)',
        supervisor: 'Chief Officer Thanikachalam',
        emergencyLine: '101 Fire Services'
      },
      loraStats: {
        packetsSent: 1950 + i * 40,
        packetsReceived: 1940 + i * 40,
        packetLoss: 0.5,
        rssi: -85,
        snr: 11.8
      },
      lastUpdate: '12:43 PM',
    };
  })
];

// Generate 255 Missions
export const MOCK_MISSIONS: Mission[] = Array.from({ length: 255 }, (_, i) => {
  const inc = MOCK_INCIDENTS[i % MOCK_INCIDENTS.length];
  const veh = MOCK_VEHICLES[i % MOCK_VEHICLES.length];
  const hosp = MOCK_HOSPITALS[i % MOCK_HOSPITALS.length];
  const isCompleted = i >= 20;

  return {
    id: `MIS-${801 + i}`,
    emergencyId: inc.id,
    emergencyType: inc.type,
    location: inc.location,
    zone: inc.zone,
    ambulanceId: veh.id,
    hospitalId: hosp.id,
    hospitalName: hosp.name,
    status: (isCompleted ? 'COMPLETED' : i % 5 === 0 ? 'AMBULANCE_EN_ROUTE' : 'PATIENT_PICKED_UP') as Mission['status'],
    etaMinutes: Number((2.5 + (i * 0.4) % 12).toFixed(1)),
    acrnConfidence: Math.floor(90 + (i * 3) % 9),
    stepIndex: isCompleted ? 7 : (i % 6) + 1,
    createdAt: new Date(Date.now() - i * 1800000).toISOString(),
    completedAt: isCompleted ? new Date(Date.now() - (i - 20) * 1800000).toISOString() : undefined
  };
});

// Generate 255 AI Decision Logs
export const MOCK_DECISION_LOGS: AIDecisionLog[] = Array.from({ length: 255 }, (_, i) => {
  const inc = MOCK_INCIDENTS[i % MOCK_INCIDENTS.length];
  const hour = Math.floor(12 - (i * 0.1)) % 24;
  const minute = (i * 5) % 60;
  const timeStr = `${((hour + 11) % 12 + 1)}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  const icons: AIDecisionLog['iconType'][] = ['accident', 'negotiation', 'police', 'ambulance', 'hospital', 'flag'];

  return {
    id: `LOG-${1 + i}`,
    timeStr,
    event: `ACRN Engine: Optimized dispatch for ${inc.type}`,
    description: `Evaluated 5 nearby ambulances & 3 traffic corridors near ${inc.location}. Dispatched unit with ${92 + (i % 7)}% ACRN neural confidence score.`,
    acrnScore: 90 + (i % 10),
    iconType: icons[i % icons.length]
  };
});

export const MOCK_USER: User = {
  id: 'usr-01',
  name: 'Judge / Evaluator',
  email: 'judge@dsrs.gov.in',
  role: 'Judge / Evaluator',
};
