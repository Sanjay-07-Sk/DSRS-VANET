from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CommunicationState(str, Enum):
	NORMAL = "NORMAL"
	DEGRADED = "DEGRADED"
	OFFLINE = "OFFLINE"
	RECOVERING = "RECOVERING"


class Coordinate(BaseModel):
	latitude: float = Field(..., description="Latitude in decimal degrees")
	longitude: float = Field(..., description="Longitude in decimal degrees")


class Incident(BaseModel):
	id: Optional[str] = None
	incidentId: Optional[str] = None
	emergencyType: Optional[str] = None
	priority: Optional[int] = None
	severity: Optional[str] = None
	location: Optional[Coordinate] = None
	status: Optional[str] = None
	description: Optional[str] = None
	reportedAt: Optional[str] = None
	createdAt: Optional[str] = None


class PriorityFactor(BaseModel):
	name: str
	weight: float
	score: float
	note: Optional[str] = None


class PriorityResult(BaseModel):
	score: float
	category: Optional[str] = None
	normalizedScore: Optional[float] = None
	label: Optional[str] = None
	factors: List[PriorityFactor] = Field(default_factory=list)


class Ambulance(BaseModel):
	id: Optional[str] = None
	vehicle_number: Optional[str] = None
	driver_name: Optional[str] = None
	status: Optional[str] = None
	latitude: Optional[float] = None
	longitude: Optional[float] = None
	speed: Optional[float] = None
	mission_id: Optional[str] = None
	hospital_id: Optional[str] = None
	score: Optional[float] = None
	selected: bool = False
	rejected: bool = False
	reason: Optional[str] = None


class AmbulanceEvaluation(BaseModel):
	ambulanceId: Optional[str] = None
	ambulance: Optional[Ambulance] = None
	score: float
	selected: bool = False
	rejected: bool = False
	reason: Optional[str] = None
	factors: List[PriorityFactor] = Field(default_factory=list)


class Hospital(BaseModel):
	id: Optional[str] = None
	hospital_name: Optional[str] = None
	latitude: Optional[float] = None
	longitude: Optional[float] = None
	total_beds: Optional[int] = None
	available_beds: Optional[int] = None
	icu_beds: Optional[int] = None
	ventilators: Optional[int] = None
	emergency_level: Optional[str] = None
	contact_number: Optional[str] = None
	status: Optional[str] = None
	score: Optional[float] = None
	selected: bool = False
	rejected: bool = False
	reason: Optional[str] = None


class HospitalEvaluation(BaseModel):
	hospitalId: Optional[str] = None
	hospital: Optional[Hospital] = None
	score: float
	selected: bool = False
	rejected: bool = False
	reason: Optional[str] = None
	factors: List[PriorityFactor] = Field(default_factory=list)


class Mission(BaseModel):
	id: Optional[str] = None
	mission_code: Optional[str] = None
	ambulance_id: Optional[str] = None
	hospital_id: Optional[str] = None
	emergency_id: Optional[str] = None
	status: Optional[str] = None
	eta: Optional[float] = None
	networkMode: Optional[CommunicationState] = None


class TimelineEvent(BaseModel):
	id: Optional[str] = None
	timestamp: Optional[str] = None
	type: Optional[str] = None
	title: Optional[str] = None
	description: Optional[str] = None
	status: Optional[str] = None
	source: Optional[str] = None
	metadata: Dict[str, Any] = Field(default_factory=dict)


class BufferedEvent(BaseModel):
	id: Optional[str] = None
	type: Optional[str] = None
	detail: Optional[str] = None
	eventType: Optional[str] = None
	payload: Dict[str, Any] = Field(default_factory=dict)
	createdAt: Optional[str] = None
	queuedAt: Optional[str] = None
	source: Optional[str] = None
	attempts: int = 0


class MissionLockStatus(BaseModel):
	locked: bool = False
	missionId: Optional[str] = None
	lockReason: Optional[str] = None
	lockedAt: Optional[str] = None
	releasedAt: Optional[str] = None


class FallbackPacket(BaseModel):
	id: Optional[str] = None
	packetId: Optional[str] = None
	source: Optional[str] = None
	destination: Optional[str] = None
	payload: Dict[str, Any] = Field(default_factory=dict)
	sentAt: Optional[str] = None
	acknowledgedAt: Optional[str] = None
	status: Optional[str] = None


class SyncProgress(BaseModel):
	pending: int = 0
	total: int = 0
	completed: int = 0
	failed: int = 0
	lastSyncedAt: Optional[str] = None
	percentage: float = 0.0
	state: Optional[str] = None


class SyncSummary(BaseModel):
	pendingEvents: int = 0
	syncedEvents: int = 0
	failedEvents: int = 0
	lastSyncAt: Optional[str] = None
	lastError: Optional[str] = None


class SyncSummaryState(BaseModel):
	pendingEvents: int = 0
	syncedEvents: int = 0
	failedEvents: int = 0
	conflicts: int = 0
	verified: bool = False
	lastSyncAt: Optional[str] = None
	lastError: Optional[str] = None


class RouteStep(BaseModel):
	index: int
	label: Optional[str] = None
	coordinate: Optional[Coordinate] = None
	status: Optional[str] = None
	eta: Optional[float] = None


class RoutePlan(BaseModel):
	name: Optional[str] = None
	distanceKm: Optional[float] = None
	durationMinutes: Optional[float] = None
	steps: List[RouteStep] = Field(default_factory=list)


class CommunicationStatus(BaseModel):
	state: CommunicationState = CommunicationState.NORMAL
	lastUpdateAt: Optional[str] = None
	details: Optional[str] = None


class DashboardState(BaseModel):
	status: str = "idle"
	incident: Optional[Incident] = None
	priority: Optional[PriorityResult] = None
	ambulances: List[Ambulance] = Field(default_factory=list)
	hospitals: List[Hospital] = Field(default_factory=list)
	selectedAmbulance: Optional[Ambulance] = None
	selectedHospital: Optional[Hospital] = None
	mission: Optional[Mission] = None
	timeline: List[TimelineEvent] = Field(default_factory=list)
	route: List[Coordinate] = Field(default_factory=list)
	communicationState: CommunicationState = CommunicationState.NORMAL
	autonomousNodeActive: bool = False
	offlineRoutingActive: bool = False
	dkcActive: bool = False
	eventBufferActive: bool = False
	bufferedEvents: List[BufferedEvent] = Field(default_factory=list)
	syncProgress: SyncProgress = Field(default_factory=SyncProgress)
	syncSummary: Optional[SyncSummaryState] = None
	movementActive: bool = False
	routeIndex: int = 0
	missionLock: MissionLockStatus = Field(default_factory=MissionLockStatus)
	fallbackTransport: Optional[str] = None
	fallbackPackets: List[FallbackPacket] = Field(default_factory=list)
	systemMessage: Optional[str] = None

	model_config = {
		"populate_by_name": True,
		"from_attributes": True,
	}


class DashboardSnapshot(BaseModel):
	ambulances: List[Ambulance] = Field(default_factory=list)
	hospitals: List[Hospital] = Field(default_factory=list)
	emergencies: List[Incident] = Field(default_factory=list)
	missions: List[Mission] = Field(default_factory=list)
