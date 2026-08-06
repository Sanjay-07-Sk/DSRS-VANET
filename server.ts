import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: "*" }
});

const PORT = 3000;

app.use(express.json());

// Initial Mock Datasets
let incidents = [
  {
    id: "INC-101",
    type: "Flood - Zone 3",
    location: "Anna Nagar, Chennai",
    zone: "Zone 1 (North)",
    lat: 13.0878,
    lng: 80.2170,
    severity: "HIGH",
    caller: "Kavitha R.",
    victimCount: 14,
    description: "Waterlogging level rising rapidly above 3 feet near metro station.",
    status: "ACTIVE",
    createdAt: "2026-05-20T12:31:00Z",
    timeStr: "12:31 PM"
  },
  {
    id: "INC-102",
    type: "Fire - Industrial Area",
    location: "Manali, Chennai",
    zone: "Zone 1 (North)",
    lat: 13.1667,
    lng: 80.2667,
    severity: "HIGH",
    caller: "Suresh Kumar",
    victimCount: 8,
    description: "Factory warehouse fire with dense smoke emission.",
    status: "ACTIVE",
    createdAt: "2026-05-20T12:28:00Z",
    timeStr: "12:28 PM"
  },
  {
    id: "INC-103",
    type: "Road Collapse",
    location: "Porur, Chennai",
    zone: "Zone 4 (East)",
    lat: 13.0382,
    lng: 80.1565,
    severity: "MEDIUM",
    caller: "Traffic Post 4",
    victimCount: 3,
    description: "Main arterial road cave-in blocking two lanes.",
    status: "ACTIVE",
    createdAt: "2026-05-20T12:20:00Z",
    timeStr: "12:20 PM"
  },
  {
    id: "INC-104",
    type: "Earthquake Alert",
    location: "North Chennai",
    zone: "Zone 1 (North)",
    lat: 13.1200,
    lng: 80.2500,
    severity: "LOW",
    caller: "Seismology Center",
    victimCount: 0,
    description: "Minor tremors measured 3.4 on Richter scale. Precautionary assessment.",
    status: "ACTIVE",
    createdAt: "2026-05-20T12:10:00Z",
    timeStr: "12:10 PM"
  },
  {
    id: "INC-105",
    type: "Chemical Leak",
    location: "Ambattur, Chennai",
    zone: "Zone 2 (Central)",
    lat: 13.1143,
    lng: 80.1548,
    severity: "MEDIUM",
    caller: "Industrial Safety Unit",
    victimCount: 5,
    description: "Ammonia container leak reported in industrial estate sector 3.",
    status: "ACTIVE",
    createdAt: "2026-05-20T12:05:00Z",
    timeStr: "12:05 PM"
  }
];

let hospitals = [
  {
    id: "HOSP-01",
    name: "City Hospital",
    location: "Anna Nagar",
    lat: 13.0850,
    lng: 80.2100,
    totalCapacity: 200,
    occupied: 190,
    available: 10,
    occupancyRate: 95,
    status: "Critical",
    icuBeds: { occupied: 38, total: 40 },
    generalBeds: { occupied: 95, total: 100 },
    emergencyBeds: { occupied: 37, total: 40 },
    ventilators: { occupied: 14, total: 15 },
    pediatricBeds: { occupied: 6, total: 5 },
    doctors: 45,
    nurses: 82,
    ambulances: 6,
    bloodUnits: 42,
    lastUpdated: "12:45 PM"
  },
  {
    id: "HOSP-02",
    name: "General Hospital",
    location: "T. Nagar",
    lat: 13.0418,
    lng: 80.2341,
    totalCapacity: 150,
    occupied: 110,
    available: 40,
    occupancyRate: 73,
    status: "High Occupancy",
    icuBeds: { occupied: 22, total: 30 },
    generalBeds: { occupied: 50, total: 70 },
    emergencyBeds: { occupied: 24, total: 30 },
    ventilators: { occupied: 10, total: 20 },
    pediatricBeds: { occupied: 14, total: 20 },
    doctors: 32,
    nurses: 58,
    ambulances: 4,
    bloodUnits: 38,
    lastUpdated: "12:44 PM"
  },
  {
    id: "HOSP-03",
    name: "Apollo Hospital",
    location: "Guindy",
    lat: 13.0067,
    lng: 80.2020,
    totalCapacity: 200,
    occupied: 110,
    available: 90,
    occupancyRate: 55,
    status: "Normal",
    icuBeds: { occupied: 15, total: 30 },
    generalBeds: { occupied: 60, total: 110 },
    emergencyBeds: { occupied: 20, total: 40 },
    ventilators: { occupied: 8, total: 15 },
    pediatricBeds: { occupied: 15, total: 20 },
    doctors: 28,
    nurses: 64,
    ambulances: 5,
    bloodUnits: 50,
    lastUpdated: "12:43 PM"
  },
  {
    id: "HOSP-04",
    name: "ESIC Hospital",
    location: "Tambaram",
    lat: 12.9249,
    lng: 80.1000,
    totalCapacity: 150,
    occupied: 70,
    available: 80,
    occupancyRate: 47,
    status: "Normal",
    icuBeds: { occupied: 8, total: 20 },
    generalBeds: { occupied: 40, total: 80 },
    emergencyBeds: { occupied: 12, total: 30 },
    ventilators: { occupied: 3, total: 10 },
    pediatricBeds: { occupied: 10, total: 20 },
    doctors: 18,
    nurses: 30,
    ambulances: 3,
    bloodUnits: 26,
    lastUpdated: "12:42 PM"
  },
  {
    id: "HOSP-05",
    name: "Govt. Hospital",
    location: "Velachery",
    lat: 12.9815,
    lng: 80.2180,
    totalCapacity: 150,
    occupied: 90,
    available: 60,
    occupancyRate: 60,
    status: "High Occupancy",
    icuBeds: { occupied: 15, total: 20 },
    generalBeds: { occupied: 45, total: 80 },
    emergencyBeds: { occupied: 18, total: 30 },
    ventilators: { occupied: 6, total: 10 },
    pediatricBeds: { occupied: 12, total: 20 },
    doctors: 22,
    nurses: 41,
    ambulances: 3,
    bloodUnits: 30,
    lastUpdated: "12:40 PM"
  },
  {
    id: "HOSP-06",
    name: "Relief Camp Hospital",
    location: "Adyar (Camp)",
    lat: 13.0012,
    lng: 80.2565,
    totalCapacity: 50,
    occupied: 42,
    available: 8,
    occupancyRate: 84,
    status: "High Occupancy",
    icuBeds: { occupied: 4, total: 5 },
    generalBeds: { occupied: 26, total: 30 },
    emergencyBeds: { occupied: 9, total: 10 },
    ventilators: { occupied: 3, total: 5 },
    pediatricBeds: { occupied: 3, total: 5 },
    doctors: 10,
    nurses: 18,
    ambulances: 2,
    bloodUnits: 15,
    lastUpdated: "12:38 PM"
  }
];

let vehicles = [
  { id: "AMB-01", type: "Ambulance", status: "On Mission", location: "Porur Main Rd", zone: "Zone 4 (East)", lat: 13.0382, lng: 80.1565, heading: 45, speed: 52, driver: "Ramesh P.", fuel: 72, battery: 72, health: "Good", missionId: "MIS-801", mission: "Patient Transport", lastUpdate: "12:45 PM" },
  { id: "AMB-02", type: "Ambulance", status: "On Mission", location: "Guindy Railway Stn", zone: "Zone 3 (South)", lat: 13.0067, lng: 80.2020, heading: 90, speed: 48, driver: "Karthik V.", fuel: 68, battery: 68, health: "Good", missionId: "MIS-802", mission: "Medical Support", lastUpdate: "12:44 PM" },
  { id: "AMB-03", type: "Ambulance", status: "Idle", location: "Anna Nagar", zone: "Zone 1 (North)", lat: 13.0850, lng: 80.2100, heading: 0, speed: 0, driver: "Dinesh S.", fuel: 90, battery: 90, health: "Good", mission: "None", lastUpdate: "12:43 PM" },
  { id: "AMB-04", type: "Ambulance", status: "On Mission", location: "Adyar", zone: "Zone 3 (South)", lat: 13.0012, lng: 80.2565, heading: 135, speed: 55, driver: "Vijay M.", fuel: 82, battery: 82, health: "Good", missionId: "MIS-804", mission: "Patient Transport", lastUpdate: "12:45 PM" },
  { id: "AMB-05", type: "Ambulance", status: "On Mission", location: "Velachery", zone: "Zone 3 (South)", lat: 12.9815, lng: 80.2180, heading: 180, speed: 40, driver: "Anand K.", fuel: 78, battery: 78, health: "Good", missionId: "MIS-805", mission: "Emergency Evac", lastUpdate: "12:42 PM" },
  { id: "FIR-01", type: "Fire Truck", status: "On Mission", location: "Manali Industrial Area", zone: "Zone 1 (North)", lat: 13.1667, lng: 80.2667, heading: 270, speed: 60, driver: "Murugan T.", fuel: 64, battery: 64, health: "Good", missionId: "MIS-803", mission: "Fire Suppression", lastUpdate: "12:45 PM" },
  { id: "FIR-02", type: "Fire Truck", status: "On Mission", location: "Korattur", zone: "Zone 1 (North)", lat: 13.1118, lng: 80.1830, heading: 310, speed: 50, driver: "Ganesh N.", fuel: 58, battery: 58, health: "Good", missionId: "MIS-806", mission: "Fire Suppression", lastUpdate: "12:44 PM" },
  { id: "FIR-03", type: "Fire Truck", status: "Idle", location: "Ambattur", zone: "Zone 2 (Central)", lat: 13.1143, lng: 80.1548, heading: 0, speed: 0, driver: "Prakash L.", fuel: 76, battery: 76, health: "Good", mission: "None", lastUpdate: "12:42 PM" },
  { id: "POL-01", type: "Police Vehicle", status: "On Mission", location: "Porur Signal", zone: "Zone 4 (East)", lat: 13.0350, lng: 80.1580, heading: 20, speed: 35, driver: "Inspector Selvam", fuel: 70, battery: 70, health: "Good", missionId: "MIS-807", mission: "Traffic Clearance", lastUpdate: "12:45 PM" },
  { id: "POL-02", type: "Police Vehicle", status: "On Mission", location: "Poonamallee High Rd", zone: "Zone 2 (Central)", lat: 13.0780, lng: 80.2000, heading: 90, speed: 58, driver: "Officer Rajan", fuel: 65, battery: 65, health: "Good", missionId: "MIS-808", mission: "Route Security", lastUpdate: "12:44 PM" },
  { id: "POL-03", type: "Police Vehicle", status: "Idle", location: "Velachery", zone: "Zone 3 (South)", lat: 12.9800, lng: 80.2150, heading: 0, speed: 0, driver: "Officer Mani", fuel: 85, battery: 85, health: "Good", mission: "None", lastUpdate: "12:43 PM" },
  { id: "POL-04", type: "Police Vehicle", status: "On Mission", location: "T. Nagar", zone: "Zone 2 (Central)", lat: 13.0418, lng: 80.2341, heading: 180, speed: 25, driver: "Officer Velu", fuel: 62, battery: 62, health: "Good", missionId: "MIS-809", mission: "Crowd Management", lastUpdate: "12:44 PM" },
  { id: "POL-05", type: "Police Vehicle", status: "Idle", location: "Adyar", zone: "Zone 3 (South)", lat: 13.0012, lng: 80.2565, heading: 0, speed: 0, driver: "Officer Sundar", fuel: 88, battery: 88, health: "Good", mission: "None", lastUpdate: "12:42 PM" },
  { id: "POL-06", type: "Police Vehicle", status: "On Mission", location: "Besant Nagar", zone: "Zone 3 (South)", lat: 12.9980, lng: 80.2690, heading: 240, speed: 42, driver: "Officer Chandran", fuel: 71, battery: 71, health: "Good", missionId: "MIS-810", mission: "Traffic Clearance", lastUpdate: "12:45 PM" },
  { id: "DRN-01", type: "Drone", status: "Active", location: "Air - Zone 3", zone: "Zone 3 (South)", lat: 13.0100, lng: 80.2200, heading: 120, speed: 65, driver: "Auto-Pilot Alpha", fuel: 82, battery: 82, health: "Good", mission: "Surveillance", lastUpdate: "12:45 PM" },
  { id: "DRN-02", type: "Drone", status: "Active", location: "Air - Zone 1", zone: "Zone 1 (North)", lat: 13.1400, lng: 80.2300, heading: 45, speed: 70, driver: "Auto-Pilot Beta", fuel: 78, battery: 78, health: "Good", mission: "Communication Relay", lastUpdate: "12:44 PM" }
];

let decisionLogs = [
  { id: "LOG-1", timeStr: "12:45 PM", event: "Road collapse detected on Porur Main Road", description: "V2X Sensor alert triggered from vehicle POL-01", acrnScore: 92, iconType: "accident" },
  { id: "LOG-2", timeStr: "12:44 PM", event: "ACRN Engine initiated negotiation among nearby units", description: "Evaluated 5 nearby ambulances & 3 police units", acrnScore: 92, iconType: "negotiation" },
  { id: "LOG-3", timeStr: "12:43 PM", event: "Police Vehicle 2 assigned to clear traffic", description: "Route clearance priority assigned to POL-02", acrnScore: 92, iconType: "police" },
  { id: "LOG-4", timeStr: "12:42 PM", event: "Ambulance 1 rerouted via safe route", description: "Bypassing Porur junction saved 4.2 mins ETA", acrnScore: 92, iconType: "ambulance" },
  { id: "LOG-5", timeStr: "12:41 PM", event: "Patient will be shifted to City Hospital (78% capacity)", description: "Hospital notified; emergency team ready on stand-by", acrnScore: 92, iconType: "hospital" }
];

let missions: any[] = [];

// Sample AI Training Dataset (2.4M+ Records Metadata & Representatives)
const trainingDatasetSample = [
  { id: "DS-1001", rainfallIntensity: 45.2, waterLevel: 3.8, roadCapacity: 40, trafficDensity: 82, windSpeed: 28, soilMoisture: 88, temperature: 29.4, targetRiskLevel: "High", timestamp: "2026-05-18 08:30" },
  { id: "DS-1002", rainfallIntensity: 12.0, waterLevel: 1.2, roadCapacity: 85, trafficDensity: 45, windSpeed: 14, soilMoisture: 42, temperature: 31.0, targetRiskLevel: "Low", timestamp: "2026-05-18 09:00" },
  { id: "DS-1003", rainfallIntensity: 62.5, waterLevel: 5.1, roadCapacity: 20, trafficDensity: 95, windSpeed: 38, soilMoisture: 96, temperature: 27.5, targetRiskLevel: "High", timestamp: "2026-05-18 09:30" },
  { id: "DS-1004", rainfallIntensity: 0.0, waterLevel: 0.5, roadCapacity: 95, trafficDensity: 30, windSpeed: 10, soilMoisture: 25, temperature: 33.2, targetRiskLevel: "Safe", timestamp: "2026-05-18 10:00" },
  { id: "DS-1005", rainfallIntensity: 28.4, waterLevel: 2.4, roadCapacity: 60, trafficDensity: 68, windSpeed: 22, soilMoisture: 65, temperature: 28.8, targetRiskLevel: "Medium", timestamp: "2026-05-18 10:30" },
  { id: "DS-1006", rainfallIntensity: 35.1, waterLevel: 3.1, roadCapacity: 50, trafficDensity: 75, windSpeed: 25, soilMoisture: 78, temperature: 28.0, targetRiskLevel: "Medium", timestamp: "2026-05-18 11:00" },
  { id: "DS-1007", rainfallIntensity: 5.2, waterLevel: 0.8, roadCapacity: 90, trafficDensity: 35, windSpeed: 12, soilMoisture: 30, temperature: 32.5, targetRiskLevel: "Low", timestamp: "2026-05-18 11:30" }
];

// Health Check
app.get(["/health", "/api/health"], (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString(), system: "DSRS-VANET Command Engine v2.4" });
});

// OpenAPI 3.1 JSON Specification
app.get("/openapi.json", (req, res) => {
  res.json({
    openapi: "3.1.0",
    info: {
      title: "DSRS-VANET Emergency Command & AI API",
      version: "0.1.0",
      description: "FastAPI Specification for Disaster Smart Response System — V2X Mesh & AI Routing Engine"
    },
    paths: {
      "/api/auth/register": { post: { summary: "Register User", tags: ["Authentication"] } },
      "/api/auth/login": { post: { summary: "Login User", tags: ["Authentication"] } },
      "/api/hospitals/": { get: { summary: "Get Hospitals", tags: ["Hospitals"] }, post: { summary: "Add Hospital", tags: ["Hospitals"] } },
      "/api/ambulances/": { get: { summary: "Get Ambulances", tags: ["Ambulances"] }, post: { summary: "Add Ambulance", tags: ["Ambulances"] } },
      "/api/emergencies/": { get: { summary: "Get Emergencies", tags: ["Emergencies"] }, post: { summary: "Create Emergency", tags: ["Emergencies"] } },
      "/api/missions/": { get: { summary: "Get Missions", tags: ["Missions"] }, post: { summary: "Create Mission", tags: ["Missions"] } },
      "/dashboard/statistics": { get: { summary: "Dashboard Statistics", tags: ["Dashboard"] } },
      "/api/ai/priority": { post: { summary: "Calculate Emergency Priority", tags: ["AI Module"] } },
      "/api/ai/best-ambulance": { post: { summary: "Select Best Ambulance", tags: ["AI Module"] } },
      "/api/ai/best-hospital": { post: { summary: "Select Best Hospital", tags: ["AI Module"] } },
      "/api/ai/eta": { post: { summary: "Calculate V2X ETA", tags: ["AI Module"] } },
      "/api/ai/recommendation": { post: { summary: "Generate Complete Recommendation", tags: ["AI Module"] } }
    }
  });
});

// Auth Users In-Memory Store
let registeredUsers: any[] = [
  { id: "usr-01", email: "judge@dsrs.gov.in", name: "Judge / Evaluator", role: "Judge / Evaluator", token: "dsrs-jwt-token-judge-2026" },
  { id: "usr-02", email: "admin@dsrs.gov.in", name: "Commander Vikram", role: "Command Officer", token: "dsrs-jwt-token-admin-2026" },
  { id: "usr-03", email: "er@cityhospital.org", name: "Dr. Ananya Roy", role: "Hospital Coordinator", token: "dsrs-jwt-token-hosp-2026" },
  { id: "usr-04", email: "driver01@dsrs.gov.in", name: "Karthik Subramanian", role: "Ambulance Driver", token: "dsrs-jwt-token-driver-2026" }
];

// Auth APIs
app.post("/api/auth/register", (req, res) => {
  const { email, password, name, role } = req.body;
  const existing = registeredUsers.find(u => u.email === email);
  if (existing) {
    const token = `dsrs-jwt-token-${Date.now()}`;
    existing.token = token;
    return res.json({ token, user: { id: existing.id, email: existing.email, name: existing.name, role: existing.role } });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    email: email || "user@dsrs.gov.in",
    name: name || "Command Specialist",
    role: role || "Judge / Evaluator",
    token: `dsrs-jwt-token-${Date.now()}`
  };
  registeredUsers.push(newUser);
  res.status(201).json({
    token: newUser.token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  let user = registeredUsers.find(u => u.email === email);
  if (!user) {
    user = {
      id: `usr-${Date.now()}`,
      email: email || "admin@dsrs.gov.in",
      name: email && email.includes("judge") ? "Judge Evaluator" : email ? email.split('@')[0] : "Command Officer",
      role: role || "Judge / Evaluator",
      token: `dsrs-jwt-token-${Date.now()}`
    };
    registeredUsers.push(user);
  } else if (role) {
    user.role = role;
  }

  const token = `dsrs-jwt-token-${Date.now()}`;
  user.token = token;

  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const user = registeredUsers.find(u => u.token === token) || registeredUsers[0];
  res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
});

// Hospitals CRUD
app.get(["/api/hospitals", "/api/hospitals/"], (req, res) => {
  res.json(hospitals);
});

app.post(["/api/hospitals", "/api/hospitals/"], (req, res) => {
  const newHosp = {
    id: `HOSP-0${hospitals.length + 1}`,
    ...req.body,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  hospitals.push(newHosp);
  io.emit("hospital:update", hospitals);
  res.status(201).json(newHosp);
});

app.get("/api/hospitals/:id", (req, res) => {
  const hosp = hospitals.find(h => h.id === req.params.id);
  if (!hosp) return res.status(404).json({ error: "Hospital not found" });
  res.json(hosp);
});

app.put("/api/hospitals/:id", (req, res) => {
  const idx = hospitals.findIndex(h => h.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Hospital not found" });
  hospitals[idx] = { ...hospitals[idx], ...req.body, lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  io.emit("hospital:update", hospitals);
  res.json(hospitals[idx]);
});

// Ambulances / Vehicles CRUD
app.get(["/api/ambulances", "/api/ambulances/", "/api/vehicles"], (req, res) => {
  res.json(vehicles);
});

app.post(["/api/ambulances", "/api/ambulances/"], (req, res) => {
  const newAmb = {
    id: `AMB-0${vehicles.filter(v => v.type === 'Ambulance').length + 1}`,
    type: "Ambulance",
    status: "Idle",
    ...req.body,
    lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  vehicles.push(newAmb);
  io.emit("vehicle:update", vehicles);
  res.status(201).json(newAmb);
});

app.get("/api/ambulances/:id", (req, res) => {
  const veh = vehicles.find(v => v.id === req.params.id);
  if (!veh) return res.status(404).json({ error: "Vehicle not found" });
  res.json(veh);
});

app.put("/api/ambulances/:id", (req, res) => {
  const idx = vehicles.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Vehicle not found" });
  vehicles[idx] = { ...vehicles[idx], ...req.body };
  io.emit("vehicle:update", vehicles);
  res.json(vehicles[idx]);
});

// Emergencies / Incidents CRUD
app.get(["/api/emergencies", "/api/emergencies/", "/api/incidents"], (req, res) => {
  res.json(incidents);
});

app.post(["/api/emergencies", "/api/emergencies/", "/api/incidents"], (req, res) => {
  const newInc = {
    id: `INC-${Math.floor(100 + Math.random() * 900)}`,
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
    ...req.body
  };
  incidents.unshift(newInc);
  
  const newLog = {
    id: `LOG-${Date.now()}`,
    timeStr: newInc.timeStr,
    event: `New Emergency Declared: ${newInc.type} at ${newInc.location}`,
    description: `ACRN Engine calculating priority & dispatch parameters`,
    acrnScore: Math.floor(88 + Math.random() * 8),
    iconType: "accident" as const
  };
  decisionLogs.unshift(newLog);

  io.emit("incident:created", newInc);
  io.emit("mission:event", newLog);
  
  res.status(201).json(newInc);
});

app.get("/api/emergencies/:id", (req, res) => {
  const inc = incidents.find(i => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: "Emergency not found" });
  res.json(inc);
});

// Missions APIs
app.get(["/api/missions", "/api/missions/"], (req, res) => {
  res.json(missions);
});

app.post(["/api/missions", "/api/missions/"], (req, res) => {
  const { emergencyId, emergencyType, location, zone, ambulanceId, hospitalId, hospitalName, etaMinutes, acrnConfidence } = req.body;
  const newMission = {
    id: `MIS-${Math.floor(810 + Math.random() * 100)}`,
    emergencyId: emergencyId || "INC-101",
    emergencyType: emergencyType || "Road Accident",
    location: location || "Anna Nagar, Chennai",
    zone: zone || "Zone 1 (North)",
    ambulanceId: ambulanceId || "AMB-03",
    hospitalId: hospitalId || "HOSP-01",
    hospitalName: hospitalName || "City Hospital",
    status: "CREATED",
    etaMinutes: etaMinutes || 3.8,
    acrnConfidence: acrnConfidence || 94,
    stepIndex: 1,
    createdAt: new Date().toISOString()
  };
  missions.unshift(newMission);

  // Set assigned vehicle to On Mission
  const vIdx = vehicles.findIndex(v => v.id === newMission.ambulanceId);
  if (vIdx !== -1) {
    vehicles[vIdx].status = "On Mission";
    vehicles[vIdx].missionId = newMission.id;
    vehicles[vIdx].mission = `Emergency: ${newMission.emergencyType}`;
  }

  io.emit("mission:created", newMission);
  io.emit("vehicle:update", vehicles);

  // Trigger step progression timer for judge demo
  simulateMissionSteps(newMission.id);

  res.status(201).json(newMission);
});

app.get("/api/missions/:id", (req, res) => {
  const m = missions.find(x => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: "Mission not found" });
  res.json(m);
});

app.patch("/api/missions/:id/complete", (req, res) => {
  const mIdx = missions.findIndex(x => x.id === req.params.id);
  if (mIdx === -1) return res.status(404).json({ error: "Mission not found" });

  missions[mIdx].status = "COMPLETED";
  missions[mIdx].stepIndex = 7;
  missions[mIdx].completedAt = new Date().toISOString();

  // Release vehicle
  const vIdx = vehicles.findIndex(v => v.id === missions[mIdx].ambulanceId);
  if (vIdx !== -1) {
    vehicles[vIdx].status = "Idle";
    vehicles[vIdx].mission = "None";
    delete vehicles[vIdx].missionId;
  }

  // Update Hospital Beds: Occupy +1 bed in emergency/ICU
  const hIdx = hospitals.findIndex(h => h.id === missions[mIdx].hospitalId || h.name === missions[mIdx].hospitalName);
  if (hIdx !== -1) {
    hospitals[hIdx].occupied = Math.min(hospitals[hIdx].totalCapacity, hospitals[hIdx].occupied + 1);
    hospitals[hIdx].available = hospitals[hIdx].totalCapacity - hospitals[hIdx].occupied;
    hospitals[hIdx].occupancyRate = Math.round((hospitals[hIdx].occupied / hospitals[hIdx].totalCapacity) * 100);
    hospitals[hIdx].icuBeds.occupied = Math.min(hospitals[hIdx].icuBeds.total, hospitals[hIdx].icuBeds.occupied + 1);
  }

  io.emit("mission:updated", missions[mIdx]);
  io.emit("vehicle:update", vehicles);
  io.emit("hospital:update", hospitals);

  res.json(missions[mIdx]);
});

// Helper: Simulate Mission Progress Steps in Background for Command Center Workflow
function simulateMissionSteps(missionId: string) {
  // Step 10: Hospital ACK
  setTimeout(() => {
    updateMissionStatus(missionId, "HOSPITAL_ACKNOWLEDGED", 2, "Step 10/18: Hospital Acknowledged & Emergency ICU Bed Reserved");
  }, 1200);

  // Step 11: Vehicle Assigned
  setTimeout(() => {
    const mIdx = missions.findIndex(m => m.id === missionId);
    if (mIdx !== -1) {
      const vIdx = vehicles.findIndex(v => v.id === missions[mIdx].ambulanceId);
      if (vIdx !== -1) {
        vehicles[vIdx].status = "On Mission";
        vehicles[vIdx].speed = 48;
        io.emit("vehicle:update", vehicles);
      }
    }
    updateMissionStatus(missionId, "AMBULANCE_EN_ROUTE", 3, "Step 11/18: Vehicle Assigned & V2X Navigation Directives Transmitted");
  }, 2800);

  // Step 12: Vehicle Moving
  setTimeout(() => {
    const mIdx = missions.findIndex(m => m.id === missionId);
    if (mIdx !== -1) {
      const vIdx = vehicles.findIndex(v => v.id === missions[mIdx].ambulanceId);
      if (vIdx !== -1) {
        vehicles[vIdx].speed = 68;
        io.emit("vehicle:update", vehicles);
      }
    }
    updateMissionStatus(missionId, "AMBULANCE_EN_ROUTE", 3, "Step 12/18: Vehicle Moving towards Incident Site via Green Wave Corridor");
  }, 4800);

  // Step 13: Patient Pickup
  setTimeout(() => {
    updateMissionStatus(missionId, "PATIENT_PICKED_UP", 4, "Step 13/18: Ambulance Arrived at Scene & Patient Pickup Initiated");
  }, 7200);

  // Step 14: Patient Loaded
  setTimeout(() => {
    updateMissionStatus(missionId, "PATIENT_PICKED_UP", 4, "Step 14/18: Victims Secured & On-Board V2X Vital Telemetry Live");
  }, 9500);

  // Step 15: Transport
  setTimeout(() => {
    updateMissionStatus(missionId, "TRANSPORTING_TO_HOSPITAL", 5, "Step 15/18: High-Speed Transporting to ER Bay under Green Wave Traffic Preemption");
  }, 12000);

  // Step 16: Hospital Arrival
  setTimeout(() => {
    updateMissionStatus(missionId, "PATIENT_DELIVERED", 6, "Step 16/18: Hospital Arrival at ER Emergency Trauma Bay");
  }, 15000);

  // Step 17: Patient Delivered
  setTimeout(() => {
    updateMissionStatus(missionId, "PATIENT_DELIVERED", 6, "Step 17/18: Patient Delivered & Handed Over to Trauma ICU Specialists");
  }, 17500);

  // Step 18: Mission Completed
  setTimeout(() => {
    updateMissionStatus(missionId, "COMPLETED", 7, "Step 18/18: Mission Completed — Unit Released & System Command Telemetry Reset");
  }, 20000);
}

function updateMissionStatus(missionId: string, status: any, stepIndex: number, desc: string) {
  const mIdx = missions.findIndex(m => m.id === missionId);
  if (mIdx !== -1) {
    missions[mIdx].status = status;
    missions[mIdx].stepIndex = stepIndex;
    
    if (status === "HOSPITAL_ACKNOWLEDGED") missions[mIdx].hospitalAckTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (status === "PATIENT_PICKED_UP") missions[mIdx].pickupTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (status === "PATIENT_DELIVERED") {
      missions[mIdx].deliveredTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Update hospital bed
      const hIdx = hospitals.findIndex(h => h.id === missions[mIdx].hospitalId || h.name === missions[mIdx].hospitalName);
      if (hIdx !== -1) {
        hospitals[hIdx].occupied = Math.min(hospitals[hIdx].totalCapacity, hospitals[hIdx].occupied + 1);
        hospitals[hIdx].available = hospitals[hIdx].totalCapacity - hospitals[hIdx].occupied;
        hospitals[hIdx].occupancyRate = Math.round((hospitals[hIdx].occupied / hospitals[hIdx].totalCapacity) * 100);
        hospitals[hIdx].icuBeds.occupied = Math.min(hospitals[hIdx].icuBeds.total, hospitals[hIdx].icuBeds.occupied + 1);
        io.emit("hospital:update", hospitals);
      }
    }
    if (status === "COMPLETED") {
      missions[mIdx].completedAt = new Date().toISOString();
      const vIdx = vehicles.findIndex(v => v.id === missions[mIdx].ambulanceId);
      if (vIdx !== -1) {
        vehicles[vIdx].status = "Idle";
        vehicles[vIdx].mission = "None";
        delete vehicles[vIdx].missionId;
        io.emit("vehicle:update", vehicles);
      }
    }

    const newLog = {
      id: `LOG-${Date.now()}`,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: `Mission ${missionId}: ${status.replace(/_/g, ' ')}`,
      description: desc,
      acrnScore: missions[mIdx].acrnConfidence || 94,
      iconType: status.includes("HOSPITAL") ? "hospital" : status.includes("AMBULANCE") ? "ambulance" : "negotiation" as const
    };
    decisionLogs.unshift(newLog);

    io.emit("mission:updated", missions[mIdx]);
    io.emit("mission:event", newLog);
  }
}

// Dashboard Statistics APIs
app.get(["/dashboard/", "/dashboard/statistics", "/dashboard/live", "/api/dashboard/statistics", "/api/dashboard/live"], (req, res) => {
  const completedMissionsCount = missions.filter(m => m.status === "COMPLETED" || m.status === "PATIENT_DELIVERED").length + 14;
  const totalMissionsCount = missions.length + 18;
  const activeMissionsCount = missions.filter(m => m.status !== "COMPLETED").length;
  
  res.json({
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter(i => i.status === "ACTIVE").length,
    totalMissions: totalMissionsCount,
    completedMissions: completedMissionsCount,
    activeMissions: activeMissionsCount,
    avgResponseTimeMin: 12.4,
    activeVehicles: vehicles.filter(v => v.status === "On Mission" || v.status === "Active").length,
    totalHospitals: hospitals.length,
    hospitalBedStats: {
      totalCapacity: hospitals.reduce((acc, h) => acc + h.totalCapacity, 0),
      occupied: hospitals.reduce((acc, h) => acc + h.occupied, 0),
      available: hospitals.reduce((acc, h) => acc + h.available, 0)
    }
  });
});

// AI Module Endpoints (Step-by-Step Execution for Judge Demo)
app.post("/api/ai/priority", (req, res) => {
  const { type, severity, victimCount } = req.body;
  const priorityScore = severity === 'HIGH' ? 95 : severity === 'MEDIUM' ? 72 : 45;
  res.json({
    priorityScore,
    priorityLevel: severity || "HIGH",
    riskCategory: type?.includes("Flood") ? "Natural Disaster" : "Trauma Emergency",
    acrnConfidence: Math.floor(90 + Math.random() * 8)
  });
});

app.post("/api/ai/best-ambulance", (req, res) => {
  const { location } = req.body;
  const availableAmbulances = vehicles.filter(v => v.type === "Ambulance");
  const chosen = availableAmbulances.find(v => v.status === "Idle") || availableAmbulances[0];
  res.json({
    bestAmbulance: chosen,
    distanceKm: (1.2 + Math.random() * 3).toFixed(1),
    etaMins: (2.5 + Math.random() * 3).toFixed(1),
    equipmentStatus: "Advanced Life Support (ALS) Ready"
  });
});

app.post("/api/ai/best-hospital", (req, res) => {
  const availableHospitals = hospitals.filter(h => h.available > 10);
  const chosen = availableHospitals[0] || hospitals[0];
  res.json({
    bestHospital: chosen,
    availableBeds: chosen.available,
    icuBedsOpen: chosen.icuBeds.total - chosen.icuBeds.occupied,
    distanceKm: (2.1 + Math.random() * 4).toFixed(1),
    traumaCenterReady: true
  });
});

app.post("/api/ai/eta", (req, res) => {
  res.json({
    etaMinutes: Number((2.8 + Math.random() * 2.5).toFixed(1)),
    distanceKm: 3.4,
    trafficDensity: "Low-Medium (V2X Green Light Corridor Activated)",
    recommendedRoute: "Poonamallee High Rd -> Anna Nagar Link Flyover"
  });
});

app.post("/api/ai/recommendation", (req, res) => {
  const { incidentId, location, type, severity } = req.body;
  const matchedAmb = vehicles.find(v => v.type === "Ambulance" && v.status === "Idle") || vehicles[0];
  const matchedHosp = hospitals.find(h => h.available > 15) || hospitals[0];
  
  res.json({
    missionId: `MIS-${Math.floor(810 + Math.random() * 100)}`,
    emergencyId: incidentId || "INC-101",
    ambulanceId: matchedAmb.id,
    hospitalId: matchedHosp.id,
    hospitalName: matchedHosp.name,
    etaMinutes: 3.5,
    acrnConfidence: 95,
    reasoning: `Selected ${matchedAmb.id} due to closest proximity (${matchedAmb.location}) and ${matchedHosp.name} for 24/7 ICU Trauma availability (${matchedHosp.available} open beds).`
  });
});

app.get("/api/ai/dataset", (req, res) => {
  res.json({
    totalRecords: "2,418,920",
    features: [
      { name: "Rainfall Intensity", weight: "28%" },
      { name: "Water Level", weight: "24%" },
      { name: "Road Capacity", weight: "18%" },
      { name: "Traffic Density", weight: "14%" },
      { name: "Wind Speed", weight: "8%" },
      { name: "Soil Moisture", weight: "5%" },
      { name: "Temperature", weight: "3%" }
    ],
    sampleRecords: trainingDatasetSample
  });
});

// Simple Auth API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  return res.json({
    token: "mock-jwt-token-dsrs-2026",
    user: {
      id: "usr-01",
      email,
      name: "Admin Commander",
      role: "Command Officer"
    }
  });
});

app.get("/api/incidents", (req, res) => {
  res.json(incidents);
});

app.post("/api/incidents", (req, res) => {
  const newInc = {
    id: `INC-${Math.floor(100 + Math.random() * 900)}`,
    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    status: "ACTIVE",
    ...req.body
  };
  incidents.unshift(newInc);
  
  // Trigger AI decision log entry
  const newLog = {
    id: `LOG-${Date.now()}`,
    timeStr: newInc.timeStr,
    event: `New Incident Created: ${newInc.type} at ${newInc.location}`,
    description: `ACRN Engine dispatched optimal units with 94% confidence`,
    acrnScore: Math.floor(88 + Math.random() * 8),
    iconType: "accident" as const
  };
  decisionLogs.unshift(newLog);

  io.emit("incident:created", newInc);
  io.emit("mission:event", newLog);
  
  res.status(201).json(newInc);
});

app.post("/api/ai/decide", (req, res) => {
  const { incidentId, location, severity } = req.body;
  // Algorithmic ACRN decision simulation
  const matchedAmbulance = vehicles.find(v => v.type === "Ambulance" && v.status === "Idle") || vehicles[0];
  const matchedHospital = hospitals.find(h => h.available > 20) || hospitals[0];
  
  const score = Math.floor(88 + Math.random() * 9);
  const decisionResult = {
    missionId: `MIS-${Math.floor(800 + Math.random() * 100)}`,
    selectedAmbulance: matchedAmbulance.id,
    selectedHospital: matchedHospital.name,
    eta: `${(3 + Math.random() * 5).toFixed(1)} mins`,
    confidence: score,
    priority: severity || "HIGH",
    trafficDensity: "Medium Congestion (35% density)",
    reason: `Calculated lowest haversine distance to ${location}. Selected ${matchedHospital.name} due to ${matchedHospital.available} open beds and ICU availability.`
  };
  
  res.json(decisionResult);
});

app.get("/api/vehicles", (req, res) => {
  res.json(vehicles);
});

app.get("/api/hospitals", (req, res) => {
  res.json(hospitals);
});

app.get("/api/reports", (req, res) => {
  const { zone, vehicleType, incidentType } = req.query;
  let filteredIncidents = [...incidents];
  let filteredVehicles = [...vehicles];
  
  if (zone && zone !== "All Zones" && zone !== "All") {
    filteredIncidents = filteredIncidents.filter(i => i.zone === zone || i.location.includes(String(zone)));
    filteredVehicles = filteredVehicles.filter(v => v.zone === zone || v.location.includes(String(zone)));
  }
  if (vehicleType && vehicleType !== "All") {
    filteredVehicles = filteredVehicles.filter(v => v.type === vehicleType);
  }
  
  res.json({
    totalIncidents: filteredIncidents.length,
    activeIncidents: filteredIncidents.filter(i => i.status === "ACTIVE").length,
    totalMissions: 18,
    successfulMissions: 14,
    avgResponseTime: "12.4 min",
    incidents: filteredIncidents,
    vehicles: filteredVehicles,
    hospitals: hospitals
  });
});

app.get("/api/reports/export", (req, res) => {
  const { format, zone, vehicleType } = req.query;
  const fileName = `DSRS_VANET_Report_${zone || 'AllZones'}_${Date.now()}.${format || 'csv'}`;
  
  if (format === 'csv') {
    let csvContent = "Incident ID,Type,Location,Zone,Severity,Status,Timestamp\n";
    incidents.forEach(inc => {
      csvContent += `"${inc.id}","${inc.type}","${inc.location}","${inc.zone}","${inc.severity}","${inc.status}","${inc.timeStr}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(csvContent);
  }
  
  res.setHeader('Content-Type', 'application/json');
  return res.json({ message: "Export file generated successfully", downloadUrl: `/api/reports/export?format=csv&zone=${zone || ''}` });
});

// Real-time Vehicle & Telemetry Simulation loop (runs every 1 sec)
setInterval(() => {
  // Move vehicles slightly along small delta coordinates to simulate smooth GPS telemetry
  vehicles = vehicles.map(v => {
    if (v.status === "On Mission" || v.status === "Active") {
      const deltaLat = (Math.random() - 0.5) * 0.0008;
      const deltaLng = (Math.random() - 0.5) * 0.0008;
      const newLat = Number((v.lat + deltaLat).toFixed(4));
      const newLng = Number((v.lng + deltaLng).toFixed(4));
      const newSpeed = Math.floor(35 + Math.random() * 30);
      const newHeading = (v.heading + Math.floor((Math.random() - 0.5) * 20) + 360) % 360;
      return {
        ...v,
        lat: newLat,
        lng: newLng,
        speed: newSpeed,
        heading: newHeading,
        lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
    }
    return v;
  });

  io.emit("vehicle:update", vehicles);
}, 1200);

// Hospital telemetry fluctuation loop (every 10s)
setInterval(() => {
  hospitals = hospitals.map(h => {
    const deltaOccupied = Math.floor((Math.random() - 0.5) * 4);
    const newOccupied = Math.min(h.totalCapacity, Math.max(10, h.occupied + deltaOccupied));
    const newAvailable = h.totalCapacity - newOccupied;
    const rate = Math.round((newOccupied / h.totalCapacity) * 100);
    const newStatus = rate >= 90 ? "Critical" : rate >= 65 ? "High Occupancy" : "Normal";
    return {
      ...h,
      occupied: newOccupied,
      available: newAvailable,
      occupancyRate: rate,
      status: newStatus as any,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });
  io.emit("hospital:update", hospitals);
}, 10000);

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`DSRS-VANET Command Center server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
