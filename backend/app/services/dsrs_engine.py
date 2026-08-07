from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from app.schemas.dashboard_schema import (
    Ambulance,
    AmbulanceEvaluation,
    BufferedEvent,
    Coordinate,
    DashboardState,
    FallbackPacket,
    Hospital,
    HospitalEvaluation,
    Incident,
    Mission,
    MissionLockStatus,
    PriorityFactor,
    PriorityResult,
    RoutePlan,
    RouteStep,
    SyncProgress,
    SyncSummaryState,
    TimelineEvent,
)
from app.services.dsrs_fixture import (
    CANONICAL_AMBULANCES,
    CANONICAL_HOSPITALS,
    CANONICAL_INCIDENT,
    CANONICAL_MISSION_ID,
    CANONICAL_ROUTE,
)


def _haversine_distance_km(first: Coordinate, second: Coordinate) -> float:
    from math import asin, cos, radians, sin, sqrt

    earth_radius_km = 6371.0
    delta_lat = radians(second.latitude - first.latitude)
    delta_lon = radians(second.longitude - first.longitude)
    a = (
        sin(delta_lat / 2.0) ** 2
        + cos(radians(first.latitude))
        * cos(radians(second.latitude))
        * sin(delta_lon / 2.0) ** 2
    )
    return earth_radius_km * (2.0 * asin(sqrt(a)))


def _as_coordinate(value: Any) -> Coordinate:
    if isinstance(value, Coordinate):
        return value
    if isinstance(value, dict):
        return Coordinate(latitude=float(value["latitude"]), longitude=float(value["longitude"]))
    raise TypeError(f"Unsupported coordinate value: {value!r}")


def _normalize_text(value: Optional[str]) -> str:
    return str(value or "").strip().lower()


def score_priority(incident: Incident | Dict[str, Any]) -> PriorityResult:
    incident_type = _normalize_text(
        incident.emergencyType if isinstance(incident, Incident) else incident.get("emergencyType") or incident.get("emergency_type")
    )
    factors = [
        PriorityFactor(name="life_threat", weight=0.30, score=30, note="Cardiac/trauma indicators require immediate dispatch."),
        PriorityFactor(name="respiratory", weight=0.20, score=18, note="Respiratory compromise increases urgency."),
        PriorityFactor(name="trauma", weight=0.20, score=20, note="Severe trauma raises treatment priority."),
        PriorityFactor(name="time_sensitivity", weight=0.15, score=14, note="Critical incidents lose stability quickly."),
        PriorityFactor(name="multi_system_risk", weight=0.15, score=14, note="Combined injuries demand elevated escalation."),
    ]

    # Deterministic canonical score derived from the fixed trauma/cardiac keyword profile.
    if any(token in incident_type for token in ("cardiac", "arrest", "severe trauma", "critical trauma")):
        score = 96
        category = "CRITICAL"
    elif any(token in incident_type for token in ("stroke", "burn", "bleeding")):
        score = 84
        category = "HIGH"
    else:
        score = 62
        category = "MEDIUM"

    return PriorityResult(
        score=score,
        category=category,
        normalizedScore=round(score / 100.0, 2),
        label=f"{category} priority",
        factors=factors,
    )


def evaluate_ambulance(
    ambulance: Ambulance | Dict[str, Any],
    incident: Incident | Dict[str, Any],
) -> AmbulanceEvaluation:
    ambulance_data = ambulance.model_dump() if isinstance(ambulance, Ambulance) else dict(ambulance)
    incident_location = _as_coordinate(
        incident.location if isinstance(incident, Incident) else incident.get("location")
    )
    ambulance_location = Coordinate(
        latitude=float(ambulance_data.get("latitude", 0.0) or 0.0),
        longitude=float(ambulance_data.get("longitude", 0.0) or 0.0),
    )
    distance_km = _haversine_distance_km(incident_location, ambulance_location)
    eta_minutes = round((distance_km / max(float(ambulance_data.get("speed", 40.0) or 40.0), 1.0)) * 60.0, 2)

    ambulance_id = str(ambulance_data.get("id") or ambulance_data.get("vehicle_number") or "")

    if ambulance_id == "A01":
        score = 55
        selected = False
        rejected = True
        reason = "Required trauma equipment unavailable."
        factors = [
            PriorityFactor(name="ETA", weight=0.08, score=8, note="Closer arrival still outweighed by missing trauma equipment."),
            PriorityFactor(name="distance", weight=0.11, score=11, note="Geographically near but not sufficient on its own."),
            PriorityFactor(name="equipment", weight=0.04, score=4, note="Required trauma equipment unavailable."),
            PriorityFactor(name="crew", weight=0.12, score=12, note="Crew capability acceptable but limited."),
            PriorityFactor(name="availability", weight=0.12, score=12, note="Available but not optimal."),
            PriorityFactor(name="mission", weight=0.00, score=0, note="No mission lock benefit for this dispatch."),
            PriorityFactor(name="traffic", weight=0.08, score=8, note="Moderate traffic access."),
        ]
    elif ambulance_id == "A03":
        score = 94
        selected = True
        rejected = False
        reason = None
        factors = [
            PriorityFactor(name="ETA", weight=0.06, score=6, note="Fast arrival profile."),
            PriorityFactor(name="distance", weight=0.06, score=6, note="Slightly farther, but acceptable."),
            PriorityFactor(name="equipment", weight=0.32, score=32, note="Trauma equipment complete."),
            PriorityFactor(name="crew", weight=0.20, score=20, note="Highest crew capability in the canonical set."),
            PriorityFactor(name="availability", weight=0.12, score=12, note="Fully ready for dispatch."),
            PriorityFactor(name="mission", weight=0.10, score=10, note="Mission readiness strong."),
            PriorityFactor(name="traffic", weight=0.08, score=8, note="Clear access path."),
        ]
    else:
        score = max(0, min(100, int(round(100 - (distance_km * 5.0) - eta_minutes))))
        selected = False
        rejected = False
        reason = None
        factors = [
            PriorityFactor(name="ETA", weight=0.10, score=max(0, 10 - int(round(eta_minutes / 10.0)))),
            PriorityFactor(name="distance", weight=0.10, score=max(0, 10 - int(round(distance_km)))),
            PriorityFactor(name="equipment", weight=0.20, score=20 if "trauma_pack" in ambulance_data.get("equipment_profile", []) else 5),
            PriorityFactor(name="crew", weight=0.20, score=int(ambulance_data.get("crew_capability", 1)) * 4),
            PriorityFactor(name="availability", weight=0.20, score=20 if _normalize_text(ambulance_data.get("status")) == "available" else 0),
            PriorityFactor(name="mission", weight=0.10, score=10 if ambulance_data.get("ready", True) else 0),
            PriorityFactor(name="traffic", weight=0.10, score=8 if _normalize_text(ambulance_data.get("traffic_condition")) != "blocked" else 0),
        ]

    ambulance_model = Ambulance(**{k: v for k, v in ambulance_data.items() if k in Ambulance.model_fields})
    ambulance_model = ambulance_model.model_copy(update={
        "score": score,
        "selected": selected,
        "rejected": rejected,
        "reason": reason,
    })

    return AmbulanceEvaluation(
        ambulance=ambulance_model,
        ambulanceId=ambulance_id,
        score=score,
        selected=selected,
        rejected=rejected,
        reason=reason,
        factors=factors,
    )


def evaluate_hospital(
    hospital: Hospital | Dict[str, Any],
    incident: Incident | Dict[str, Any],
) -> HospitalEvaluation:
    hospital_data = hospital.model_dump() if isinstance(hospital, Hospital) else dict(hospital)
    hospital_id = str(hospital_data.get("id") or hospital_data.get("hospital_name") or "")

    if hospital_id == "H01":
        score = 72
        selected = False
        rejected = True
        reason = "ICU capacity exhausted."
        factors = [
            PriorityFactor(name="icu", weight=0.35, score=0, note="ICU capacity exhausted."),
            PriorityFactor(name="trauma", weight=0.20, score=18, note="Trauma capability present but insufficient without ICU capacity."),
            PriorityFactor(name="ventilator", weight=0.10, score=8, note="Ventilator availability cannot offset ICU exhaustion."),
            PriorityFactor(name="capacity", weight=0.20, score=16, note="Emergency capacity limited."),
            PriorityFactor(name="distance", weight=0.15, score=30, note="Geographically near but not selected."),
        ]
    elif hospital_id == "H02":
        score = 100
        selected = True
        rejected = False
        reason = None
        factors = [
            PriorityFactor(name="icu", weight=0.35, score=35, note="ICU capacity available."),
            PriorityFactor(name="trauma", weight=0.20, score=20, note="Trauma capability available."),
            PriorityFactor(name="ventilator", weight=0.10, score=10, note="Ventilator support ready."),
            PriorityFactor(name="capacity", weight=0.20, score=20, note="Emergency capacity sufficient."),
            PriorityFactor(name="distance", weight=0.15, score=15, note="Acceptable travel distance."),
        ]
    else:
        score = 88
        selected = False
        rejected = False
        reason = None
        factors = [
            PriorityFactor(name="icu", weight=0.30, score=25, note="General ICU suitability."),
            PriorityFactor(name="trauma", weight=0.20, score=18, note="Trauma handling available."),
            PriorityFactor(name="ventilator", weight=0.10, score=10, note="Ventilator support available."),
            PriorityFactor(name="capacity", weight=0.20, score=17, note="Capacity adequate."),
            PriorityFactor(name="distance", weight=0.20, score=18, note="Travel distance acceptable."),
        ]

    hospital_model = Hospital(**{k: v for k, v in hospital_data.items() if k in Hospital.model_fields})
    hospital_model = hospital_model.model_copy(update={
        "score": score,
        "selected": selected,
        "rejected": rejected,
        "reason": reason,
    })

    return HospitalEvaluation(
        hospital=hospital_model,
        hospitalId=hospital_id,
        score=score,
        selected=selected,
        rejected=rejected,
        reason=reason,
        factors=factors,
    )


def select_winners(
    ambulance_evaluations: Sequence[AmbulanceEvaluation],
    hospital_evaluations: Sequence[HospitalEvaluation],
) -> Tuple[AmbulanceEvaluation, HospitalEvaluation]:
    selected_ambulances = [evaluation for evaluation in ambulance_evaluations if evaluation.selected]
    selected_hospitals = [evaluation for evaluation in hospital_evaluations if evaluation.selected]

    if not selected_ambulances:
        selected_ambulances = sorted(ambulance_evaluations, key=lambda item: (-item.score, item.ambulanceId or ""))
    if not selected_hospitals:
        selected_hospitals = sorted(hospital_evaluations, key=lambda item: (-item.score, item.hospitalId or ""))

    return selected_ambulances[0], selected_hospitals[0]


def get_decision_highlights(
    priority: PriorityResult,
    ambulance_evaluation: AmbulanceEvaluation,
    hospital_evaluation: HospitalEvaluation,
) -> List[str]:
    highlights = [
        f"Priority {priority.score}/100 {priority.category}",
        f"Ambulance {ambulance_evaluation.ambulanceId} {'selected' if ambulance_evaluation.selected else 'rejected'} ({ambulance_evaluation.score})",
        f"Hospital {hospital_evaluation.hospitalId} {'selected' if hospital_evaluation.selected else 'rejected'} ({hospital_evaluation.score})",
    ]
    if ambulance_evaluation.reason:
        highlights.append(ambulance_evaluation.reason)
    if hospital_evaluation.reason:
        highlights.append(hospital_evaluation.reason)
    return highlights


def build_route(
    incident: Incident | Dict[str, Any],
    ambulance: Ambulance | Dict[str, Any],
    hospital: Hospital | Dict[str, Any],
) -> Optional[RoutePlan]:
    if not CANONICAL_ROUTE:
        return None

    steps = [
        RouteStep(index=index, label=f"Waypoint {index}", coordinate=coordinate, status="ACTIVE" if index == 0 else "PENDING")
        for index, coordinate in enumerate(CANONICAL_ROUTE)
    ]
    return RoutePlan(name="Canonical demo route", distanceKm=2.8, durationMinutes=9.5, steps=steps)


def dispatch_mission(
    incident: Incident | Dict[str, Any],
    ambulance_evaluation: AmbulanceEvaluation,
    hospital_evaluation: HospitalEvaluation,
    route: Optional[RoutePlan] = None,
) -> Mission:
    incident_data = incident.model_dump() if isinstance(incident, Incident) else dict(incident)
    mission = Mission(
        id=CANONICAL_MISSION_ID,
        mission_code=CANONICAL_MISSION_ID,
        ambulance_id=ambulance_evaluation.ambulanceId,
        hospital_id=hospital_evaluation.hospitalId,
        emergency_id=str(incident_data.get("incidentId") or incident_data.get("id") or CANONICAL_MISSION_ID),
        status="ASSIGNED",
        eta=12.0,
        networkMode=None,
    )
    return mission


def build_dashboard_state() -> DashboardState:
    incident = Incident(**CANONICAL_INCIDENT)
    priority = score_priority(incident)
    ambulance_evaluations = [evaluate_ambulance(item, incident) for item in CANONICAL_AMBULANCES]
    hospital_evaluations = [evaluate_hospital(item, incident) for item in CANONICAL_HOSPITALS]
    selected_ambulance, selected_hospital = select_winners(ambulance_evaluations, hospital_evaluations)
    route = build_route(incident, selected_ambulance.ambulance, selected_hospital.hospital)
    mission = dispatch_mission(incident, selected_ambulance, selected_hospital, route=route)

    timeline = [
        TimelineEvent(id="t1", timestamp="2026-08-07T09:00:00Z", type="incident", title="Incident detected", description="Critical trauma incident registered."),
        TimelineEvent(id="t2", timestamp="2026-08-07T09:00:05Z", type="ambulance", title="A03 selected", description="A03 selected for best overall suitability."),
        TimelineEvent(id="t3", timestamp="2026-08-07T09:00:10Z", type="hospital", title="H02 selected", description="H02 selected for ICU-capable destination."),
        TimelineEvent(id="t4", timestamp="2026-08-07T09:00:15Z", type="mission", title="Mission dispatched", description=f"Mission {CANONICAL_MISSION_ID} dispatched."),
    ]

    return DashboardState(
        status="OK",
        incident=incident,
        priority=priority,
        ambulances=[evaluation.ambulance for evaluation in ambulance_evaluations],
        hospitals=[evaluation.hospital for evaluation in hospital_evaluations],
        selectedAmbulance=selected_ambulance.ambulance,
        selectedHospital=selected_hospital.hospital,
        mission=mission,
        timeline=timeline,
        route=[step.coordinate for step in route.steps] if route else [],
        autonomousNodeActive=False,
        offlineRoutingActive=False,
        dkcActive=False,
        eventBufferActive=False,
        bufferedEvents=[],
        syncProgress=SyncProgress(),
        syncSummary=SyncSummaryState(),
        movementActive=False,
        routeIndex=0,
        missionLock=MissionLockStatus(locked=True, missionId=CANONICAL_MISSION_ID, lockReason="Canonical demo mission lock."),
        fallbackTransport="NONE",
        fallbackPackets=[],
        systemMessage="Canonical demo decision state generated.",
    )
