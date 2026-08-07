from __future__ import annotations

from typing import List

from app.schemas.dashboard_schema import Coordinate


CANONICAL_MISSION_ID = "DSRS-2026-0019"


CANONICAL_INCIDENT = {
    "id": "INC-DSRS-2026-0019",
    "incidentId": "DSRS-2026-0019",
    "emergencyType": "Severe trauma with cardiac arrest",
    "priority": 96,
    "severity": "CRITICAL",
    "location": Coordinate(latitude=13.0827, longitude=80.2707),
    "status": "ACTIVE",
    "description": "Multi-factor critical trauma incident requiring trauma-capable ambulance and ICU-ready hospital.",
    "reportedAt": "2026-08-07T09:00:00Z",
    "createdAt": "2026-08-07T09:00:00Z",
}


CANONICAL_ROUTE: List[Coordinate] = [
    Coordinate(latitude=13.0827, longitude=80.2707),
    Coordinate(latitude=13.0838, longitude=80.2719),
    Coordinate(latitude=13.0851, longitude=80.2732),
]


CANONICAL_AMBULANCES = [
    {
        "id": "A01",
        "vehicle_number": "A01",
        "driver_name": "Driver A01",
        "status": "AVAILABLE",
        "latitude": 13.0830,
        "longitude": 80.2710,
        "speed": 38.0,
        "mission_id": None,
        "hospital_id": None,
        "equipment_profile": ["oxygen", "basic_support"],
        "crew_capability": 2,
        "traffic_condition": "moderate",
        "ready": True,
    },
    {
        "id": "A02",
        "vehicle_number": "A02",
        "driver_name": "Driver A02",
        "status": "AVAILABLE",
        "latitude": 13.0855,
        "longitude": 80.2745,
        "speed": 36.0,
        "mission_id": None,
        "hospital_id": None,
        "equipment_profile": ["basic_support"],
        "crew_capability": 1,
        "traffic_condition": "moderate",
        "ready": True,
    },
    {
        "id": "A03",
        "vehicle_number": "A03",
        "driver_name": "Driver A03",
        "status": "AVAILABLE",
        "latitude": 13.0860,
        "longitude": 80.2750,
        "speed": 42.0,
        "mission_id": None,
        "hospital_id": None,
        "equipment_profile": ["trauma_pack", "oxygen", "monitoring", "ventilator"],
        "crew_capability": 4,
        "traffic_condition": "clear",
        "ready": True,
    },
]


CANONICAL_HOSPITALS = [
    {
        "id": "H01",
        "hospital_name": "H01 Trauma Center",
        "latitude": 13.0819,
        "longitude": 80.2698,
        "total_beds": 120,
        "available_beds": 4,
        "icu_beds": 0,
        "ventilators": 8,
        "emergency_level": "HIGH",
        "contact_number": "+91-0001",
        "status": "AVAILABLE",
        "trauma_capable": True,
    },
    {
        "id": "H02",
        "hospital_name": "H02 Critical Care Hospital",
        "latitude": 13.0905,
        "longitude": 80.2782,
        "total_beds": 180,
        "available_beds": 16,
        "icu_beds": 6,
        "ventilators": 18,
        "emergency_level": "CRITICAL",
        "contact_number": "+91-0002",
        "status": "AVAILABLE",
        "trauma_capable": True,
    },
    {
        "id": "H03",
        "hospital_name": "H03 Specialty Hospital",
        "latitude": 13.0920,
        "longitude": 80.2795,
        "total_beds": 150,
        "available_beds": 12,
        "icu_beds": 3,
        "ventilators": 12,
        "emergency_level": "HIGH",
        "contact_number": "+91-0003",
        "status": "AVAILABLE",
        "trauma_capable": True,
    },
]