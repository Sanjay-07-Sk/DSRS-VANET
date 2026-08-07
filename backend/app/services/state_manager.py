from __future__ import annotations

from dataclasses import dataclass, field
from threading import RLock
from typing import List, Optional

from app.schemas.dashboard_schema import (
	AmbulanceEvaluation,
	BufferedEvent,
	CommunicationState,
	DashboardState,
	HospitalEvaluation,
	SyncProgress,
	MissionLockStatus,
	TimelineEvent,
)
from app.services.dsrs_engine import (
	build_route,
	dispatch_mission,
	evaluate_ambulance,
	evaluate_hospital,
	score_priority,
	select_winners,
)
from app.services.resilience_service import advance_sync, on_network_fail, on_network_offline, on_network_restore
from app.services.dsrs_fixture import CANONICAL_AMBULANCES, CANONICAL_HOSPITALS, CANONICAL_INCIDENT


def _initial_state() -> DashboardState:
	return DashboardState(
		status="idle",
		incident=None,
		priority=None,
		ambulances=[],
		hospitals=[],
		selectedAmbulance=None,
		selectedHospital=None,
		mission=None,
		timeline=[],
		route=[],
		communicationState=CommunicationState.NORMAL,
		autonomousNodeActive=False,
		offlineRoutingActive=False,
		dkcActive=False,
		eventBufferActive=False,
		bufferedEvents=[],
		syncProgress=SyncProgress(),
		syncSummary=None,
		movementActive=False,
		routeIndex=0,
		missionLock=MissionLockStatus(locked=False),
		fallbackTransport=None,
		fallbackPackets=[],
		systemMessage="Demo state reset.",
	)


@dataclass
class DemoStateManager:
	_state: DashboardState = field(default_factory=_initial_state)
	_ambulance_evaluations: List[AmbulanceEvaluation] = field(default_factory=list)
	_hospital_evaluations: List[HospitalEvaluation] = field(default_factory=list)
	_lock: RLock = field(default_factory=RLock, repr=False)

	def get_state(self) -> DashboardState:
		with self._lock:
			return self._state.model_copy(deep=True)

	def reset(self) -> DashboardState:
		with self._lock:
			self._state = _initial_state()
			self._ambulance_evaluations = []
			self._hospital_evaluations = []
			return self._state.model_copy(deep=True)

	def create_incident(self) -> DashboardState:
		with self._lock:
			incident = self._build_incident()
			priority = score_priority(incident)
			self._ambulance_evaluations = [evaluate_ambulance(item, incident) for item in CANONICAL_AMBULANCES]
			self._hospital_evaluations = [evaluate_hospital(item, incident) for item in CANONICAL_HOSPITALS]
			ambulances = [evaluation.ambulance for evaluation in self._ambulance_evaluations]
			hospitals = [evaluation.hospital for evaluation in self._hospital_evaluations]
			timeline = [
				TimelineEvent(id="incident-created", timestamp="2026-08-07T09:00:00Z", type="incident", title="Demo incident created", description="Canonical incident loaded and evaluated."),
				TimelineEvent(id="priority-evaluated", timestamp="2026-08-07T09:00:01Z", type="priority", title="Priority evaluated", description="Priority score computed deterministically."),
			]
			self._state = self._state.model_copy(update={
				"status": "incident_created",
				"incident": incident,
				"priority": priority,
				"ambulances": ambulances,
				"hospitals": hospitals,
				"selectedAmbulance": None,
				"selectedHospital": None,
				"mission": None,
				"timeline": timeline,
				"route": [],
				"communicationState": CommunicationState.NORMAL,
				"movementActive": False,
				"routeIndex": 0,
				"missionLock": MissionLockStatus(locked=False),
				"fallbackTransport": None,
				"fallbackPackets": [],
				"systemMessage": "Canonical incident loaded and evaluated.",
			})
			return self._state.model_copy(deep=True)

	def dispatch(self) -> DashboardState:
		with self._lock:
			if self._state.incident is None or not self._ambulance_evaluations or not self._hospital_evaluations:
				raise ValueError("Demo incident must be created before dispatch.")
			selected_ambulance, selected_hospital = select_winners(self._ambulance_evaluations, self._hospital_evaluations)
			route_plan = build_route(self._state.incident, selected_ambulance.ambulance, selected_hospital.hospital)
			route = [step.coordinate for step in route_plan.steps] if route_plan else []
			mission = dispatch_mission(self._state.incident, selected_ambulance, selected_hospital, route=route_plan)
			movement_active = bool(route)
			self._state = self._state.model_copy(update={
				"status": "mission_created",
				"selectedAmbulance": selected_ambulance.ambulance,
				"selectedHospital": selected_hospital.hospital,
				"mission": mission,
				"route": route,
				"routeIndex": 0,
				"communicationState": CommunicationState.NORMAL,
				"movementActive": movement_active,
				"missionLock": MissionLockStatus(locked=True, missionId=mission.id, lockReason="Mission dispatched."),
				"systemMessage": "Canonical mission dispatched.",
				"timeline": self._state.timeline + [
					TimelineEvent(id="dispatch-decision", timestamp="2026-08-07T09:00:02Z", type="dispatch", title="Dispatch decision finalized", description="Deterministic ambulance and hospital selected."),
					TimelineEvent(id="ambulance-selected", timestamp="2026-08-07T09:00:03Z", type="ambulance", title="Ambulance selected", description=f"{selected_ambulance.ambulanceId} selected with score {selected_ambulance.score}."),
					TimelineEvent(id="hospital-selected", timestamp="2026-08-07T09:00:04Z", type="hospital", title="Hospital selected", description=f"{selected_hospital.hospitalId} selected."),
					TimelineEvent(id="mission-created", timestamp="2026-08-07T09:00:05Z", type="mission", title="Mission created", description=f"Mission {mission.id} created."),
				],
			})
			return self._state.model_copy(deep=True)

	def network_fail(self) -> DashboardState:
		with self._lock:
			self._state = on_network_fail(self._state)
			return self._state.model_copy(deep=True)

	def network_offline(self) -> DashboardState:
		with self._lock:
			self._state = on_network_offline(self._state)
			return self._state.model_copy(deep=True)

	def network_restore(self) -> DashboardState:
		with self._lock:
			self._state = on_network_restore(self._state)
			return self._state.model_copy(deep=True)

	def sync_advance(self) -> DashboardState:
		with self._lock:
			self._state = advance_sync(self._state)
			return self._state.model_copy(deep=True)

	def advance_movement(self) -> DashboardState:
		with self._lock:
			if self._state.mission is None:
				raise ValueError("Movement requires an active mission.")
			if not self._state.movementActive:
				raise ValueError("Movement is not active.")
			if not self._state.route:
				raise ValueError("Movement requires a non-empty route.")

			current_index = int(self._state.routeIndex or 0)
			last_index = len(self._state.route) - 1
			if current_index >= last_index:
				raise ValueError("Mission movement has already completed.")

			next_index = current_index + 1
			waypoint = self._state.route[next_index]
			selected_ambulance = self._state.selectedAmbulance.model_copy(update={"latitude": waypoint.latitude, "longitude": waypoint.longitude}) if self._state.selectedAmbulance else None
			ambulances = []
			for ambulance in self._state.ambulances:
				if ambulance.id == "A03" and selected_ambulance is not None:
					ambulances.append(selected_ambulance)
				else:
					ambulances.append(ambulance)

			mission_completed = next_index == last_index
			mission = self._state.mission.model_copy(update={"status": "COMPLETED" if mission_completed else self._state.mission.status}) if self._state.mission else None
			updates = {
				"selectedAmbulance": selected_ambulance,
				"ambulances": ambulances,
				"mission": mission,
				"routeIndex": next_index,
				"movementActive": not mission_completed,
				"status": "mission_completed" if mission_completed else self._state.status,
				"timeline": self._state.timeline + [
					TimelineEvent(id=f"movement-{next_index}", timestamp=f"2026-08-07T09:11:{next_index:02d}Z", type="movement", title="Ambulance moved", description=f"Ambulance advanced to waypoint {next_index}.")
				],
				"systemMessage": "Mission completed successfully." if mission_completed else f"Ambulance advanced to waypoint {next_index}.",
			}
			if self._state.communicationState == CommunicationState.OFFLINE:
				updates["bufferedEvents"] = self._state.bufferedEvents + [
					BufferedEvent(id=f"location-{next_index}", type="vehicle_location", detail=f"Vehicle location updated to waypoint {next_index}.", eventType="vehicle_location", source="movement", createdAt=f"2026-08-07T09:11:{next_index:02d}Z", queuedAt=f"2026-08-07T09:11:{next_index:02d}Z", payload={"routeIndex": next_index, "latitude": waypoint.latitude, "longitude": waypoint.longitude}, attempts=0)
				]
				if selected_ambulance is not None:
					updates["selectedAmbulance"] = selected_ambulance.model_copy(update={"latitude": waypoint.latitude, "longitude": waypoint.longitude})
			self._state = self._state.model_copy(update=updates)
			return self._state.model_copy(deep=True)

	def _build_incident(self):
		from app.schemas.dashboard_schema import Incident

		return Incident(**CANONICAL_INCIDENT)

state_manager = DemoStateManager()