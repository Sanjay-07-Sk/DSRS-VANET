from __future__ import annotations

from typing import List

from app.schemas.dashboard_schema import (
	BufferedEvent,
	CommunicationState,
	DashboardState,
	FallbackPacket,
	MissionLockStatus,
	SyncProgress,
	SyncSummaryState,
	TimelineEvent,
)


NETWORK_FALLBACK = "LORA_SIMULATED"


def _copy_state(state: DashboardState, **updates) -> DashboardState:
	return state.model_copy(update=updates)


def _buffered_events() -> List[BufferedEvent]:
	return [
		BufferedEvent(id="buffer-1", type="autonomous_node_activation", detail="Autonomous Emergency Node activated.", eventType="autonomous_node_activation", source="resilience", createdAt="2026-08-07T09:10:00Z", queuedAt="2026-08-07T09:10:00Z", payload={"state": "ACTIVE"}, attempts=0),
		BufferedEvent(id="buffer-2", type="offline_routing_activation", detail="Offline routing activated.", eventType="offline_routing_activation", source="resilience", createdAt="2026-08-07T09:10:01Z", queuedAt="2026-08-07T09:10:01Z", payload={"state": "ACTIVE"}, attempts=0),
		BufferedEvent(id="buffer-3", type="dkc_activation", detail="Disaster Knowledge Capsule activated.", eventType="dkc_activation", source="resilience", createdAt="2026-08-07T09:10:02Z", queuedAt="2026-08-07T09:10:02Z", payload={"state": "ACTIVE"}, attempts=0),
	]


def on_network_fail(state: DashboardState) -> DashboardState:
	if state.communicationState != CommunicationState.NORMAL or state.mission is None:
		raise ValueError("Network failure is only valid during an active mission while communicationState is NORMAL.")
	mission = state.mission.model_copy(update={"networkMode": CommunicationState.DEGRADED}) if state.mission else None
	return _copy_state(
		state,
		communicationState=CommunicationState.DEGRADED,
		mission=mission,
		timeline=state.timeline + [TimelineEvent(id="network-fail", timestamp="2026-08-07T09:10:00Z", type="network", title="Network degraded", description="Central connectivity degraded; mission continues in degraded mode.")],
		systemMessage="Network connectivity degraded.",
	)


def on_network_offline(state: DashboardState) -> DashboardState:
	if state.communicationState != CommunicationState.DEGRADED or state.mission is None:
		raise ValueError("Offline transition is only valid after a degraded mission has been established.")
	mission = state.mission.model_copy(update={"networkMode": CommunicationState.OFFLINE}) if state.mission else None
	buffered_events = _buffered_events()
	fallback_packets = [
		FallbackPacket(
			id="fallback-packet-1",
			packetId="LORA-DSRS-001",
			source="A03",
			destination="H02",
			payload={
				"missionId": state.mission.id if state.mission else None,
				"mode": "OFFLINE",
				"message": "Fallback channel active",
			},
			sentAt="2026-08-07T09:10:16Z",
			acknowledgedAt=None,
			status="QUEUED",
		)
	]
	return _copy_state(
		state,
		communicationState=CommunicationState.OFFLINE,
		autonomousNodeActive=True,
		offlineRoutingActive=True,
		dkcActive=True,
		eventBufferActive=True,
		fallbackTransport=NETWORK_FALLBACK,
		fallbackPackets=fallback_packets,
		mission=mission,
		bufferedEvents=buffered_events,
		timeline=state.timeline + [
			TimelineEvent(id="network-offline", timestamp="2026-08-07T09:10:10Z", type="network", title="Central network unavailable", description="Central network unavailable; autonomous resilience activated."),
			TimelineEvent(id="ane-activated", timestamp="2026-08-07T09:10:11Z", type="resilience", title="Autonomous Emergency Node activated", description="Autonomous Emergency Node is now active."),
			TimelineEvent(id="offline-routing-activated", timestamp="2026-08-07T09:10:12Z", type="resilience", title="Offline routing activated", description="Offline routing is now active."),
			TimelineEvent(id="dkc-activated", timestamp="2026-08-07T09:10:13Z", type="resilience", title="Disaster Knowledge Capsule activated", description="DKC activated for local resilience."),
			TimelineEvent(id="event-buffering-activated", timestamp="2026-08-07T09:10:14Z", type="resilience", title="Event buffering activated", description="Buffered events are being retained locally."),
			TimelineEvent(id="fallback-available", timestamp="2026-08-07T09:10:15Z", type="resilience", title="LoRa fallback transport available", description="Simulated LoRa fallback transport enabled."),
		],
		systemMessage="Network offline; autonomous resilience active.",
	)


def on_network_restore(state: DashboardState) -> DashboardState:
	if state.communicationState != CommunicationState.OFFLINE:
		raise ValueError("Restore is only valid from the OFFLINE state.")
	progress = state.syncProgress.model_copy(update={"percentage": 0.0, "state": "RECOVERING"})
	mission = state.mission.model_copy(update={"networkMode": CommunicationState.RECOVERING}) if state.mission else None
	return _copy_state(
		state,
		communicationState=CommunicationState.RECOVERING,
		syncProgress=progress,
		mission=mission,
		timeline=state.timeline + [TimelineEvent(id="network-restored", timestamp="2026-08-07T09:10:20Z", type="network", title="Central network restored", description="Central network restored — synchronization initiated.")],
		systemMessage="RECOVERING: synchronization initiated.",
	)


def advance_sync(state: DashboardState) -> DashboardState:
	if state.communicationState != CommunicationState.RECOVERING:
		raise ValueError("Synchronization can only advance while RECOVERING.")
	current = int(round(state.syncProgress.percentage or 0.0)) if state.syncProgress else 0
	next_value = min(100, current + 20)
	progress = state.syncProgress.model_copy(update={"percentage": float(next_value), "state": "RECOVERING"})
	timeline = list(state.timeline)
	if next_value < 100:
		timeline.append(TimelineEvent(id=f"sync-advance-{next_value}", timestamp=f"2026-08-07T09:10:{20 + (next_value // 20):02d}Z", type="sync", title="Synchronization advanced", description=f"Synchronization advanced to {next_value}%."))
		return _copy_state(state, syncProgress=progress, timeline=timeline, systemMessage=f"RECOVERING: synchronization at {next_value}%.")

	summary = SyncSummaryState(
		pendingEvents=0,
		syncedEvents=len(state.bufferedEvents),
		failedEvents=0,
		conflicts=0,
		verified=True,
		lastSyncAt="2026-08-07T09:10:50Z",
		lastError=None,
	)
	mission = state.mission.model_copy(update={"networkMode": CommunicationState.NORMAL}) if state.mission else None
	final_timeline = timeline + [
		TimelineEvent(id="sync-replay", timestamp="2026-08-07T09:10:46Z", type="sync", title="Replay complete", description="Buffered events replayed."),
		TimelineEvent(id="sync-verify", timestamp="2026-08-07T09:10:47Z", type="sync", title="Verification complete", description="Verification completed."),
		TimelineEvent(id="sync-conflicts-zero", timestamp="2026-08-07T09:10:48Z", type="sync", title="Zero conflicts", description="Conflicts = 0."),
		TimelineEvent(id="sync-restored", timestamp="2026-08-07T09:10:49Z", type="sync", title="Restored to normal", description="Synchronization complete; normal operation restored."),
	]
	return _copy_state(
		state,
		communicationState=CommunicationState.NORMAL,
		autonomousNodeActive=False,
		offlineRoutingActive=False,
		dkcActive=False,
		eventBufferActive=False,
		bufferedEvents=[],
		fallbackTransport=None,
		fallbackPackets=[],
		syncProgress=progress.model_copy(update={"percentage": 100.0, "state": "NORMAL"}),
		syncSummary=summary,
		mission=mission,
		timeline=final_timeline,
		systemMessage="Synchronization complete; normal operation restored.",
	)