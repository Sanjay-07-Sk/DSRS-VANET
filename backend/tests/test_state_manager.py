import os
import unittest

from app.schemas.dashboard_schema import CommunicationState
from app.services.state_manager import state_manager


class StateManagerLifecycleTestCase(unittest.TestCase):
    def setUp(self) -> None:
        state_manager.reset()

    def test_initial_state_is_idle(self) -> None:
        state = state_manager.get_state()
        self.assertEqual(state.status, "idle")
        self.assertEqual(state.communicationState, CommunicationState.NORMAL)
        self.assertIsNone(state.mission)
        self.assertIsNone(state.incident)
        self.assertIsNone(state.priority)

    def test_incident_dispatch_reset_sequence(self) -> None:
        incident_state = state_manager.create_incident()
        self.assertEqual(incident_state.status, "incident_created")
        self.assertEqual(incident_state.priority.score, 96)
        self.assertEqual(incident_state.priority.category, "CRITICAL")

        a01 = next(item for item in incident_state.ambulances if item.id == "A01")
        a03 = next(item for item in incident_state.ambulances if item.id == "A03")
        h01 = next(item for item in incident_state.hospitals if item.id == "H01")

        self.assertEqual(a01.score, 55)
        self.assertEqual(a03.score, 94)
        self.assertFalse(a01.selected)
        self.assertEqual(a01.reason, "Required trauma equipment unavailable.")
        self.assertFalse(h01.selected)
        self.assertEqual(h01.reason, "ICU capacity exhausted.")

        dispatch_state = state_manager.dispatch()
        self.assertEqual(dispatch_state.status, "mission_created")
        self.assertEqual(dispatch_state.selectedAmbulance.id, "A03")
        self.assertEqual(dispatch_state.selectedAmbulance.score, 94)
        self.assertEqual(dispatch_state.selectedHospital.id, "H02")
        self.assertEqual(dispatch_state.mission.id, "DSRS-2026-0019")
        self.assertTrue(len(dispatch_state.route) > 0)

        reset_state = state_manager.reset()
        self.assertEqual(reset_state.status, "idle")
        self.assertIsNone(reset_state.incident)
        self.assertIsNone(reset_state.mission)
        self.assertIsNone(reset_state.selectedAmbulance)
        self.assertIsNone(reset_state.selectedHospital)
        self.assertEqual(reset_state.route, [])
        self.assertEqual(reset_state.communicationState, CommunicationState.NORMAL)
        self.assertEqual(reset_state.bufferedEvents, [])
        self.assertEqual(reset_state.fallbackPackets, [])
        self.assertFalse(reset_state.missionLock.locked)

    def test_repeatability(self) -> None:
        state_manager.reset()
        state_manager.create_incident()
        first = state_manager.dispatch()
        state_manager.reset()
        state_manager.create_incident()
        second = state_manager.dispatch()

        self.assertEqual(first.model_dump(), second.model_dump())


class StateApiContractTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
        os.environ.setdefault("SUPABASE_KEY", "dummy-key")

        from app.main import app
        from app.middleware.auth import get_current_user

        app.dependency_overrides[get_current_user] = lambda: {"email": "demo@example.com", "role": "ADMIN"}
        cls.app = app

    def setUp(self) -> None:
        state_manager.reset()

    def test_http_state_lifecycle(self) -> None:
        from fastapi.testclient import TestClient

        client = TestClient(self.app)

        state_response = client.get("/api/state")
        self.assertEqual(state_response.status_code, 200)
        self.assertEqual(state_response.json()["status"], "idle")
        self.assertEqual(state_response.json()["communicationState"], "NORMAL")

        incident_response = client.post("/api/demo/incident")
        self.assertEqual(incident_response.status_code, 200)
        incident_json = incident_response.json()
        self.assertEqual(incident_json["status"], "incident_created")
        self.assertEqual(incident_json["priority"]["score"], 96)
        self.assertEqual(incident_json["priority"]["category"], "CRITICAL")
        self.assertEqual(next(item for item in incident_json["ambulances"] if item["id"] == "A01")["score"], 55)
        self.assertEqual(next(item for item in incident_json["hospitals"] if item["id"] == "H01")["reason"], "ICU capacity exhausted.")

        dispatch_response = client.post("/api/demo/dispatch")
        self.assertEqual(dispatch_response.status_code, 200)
        dispatch_json = dispatch_response.json()
        self.assertEqual(dispatch_json["status"], "mission_created")
        self.assertEqual(dispatch_json["selectedAmbulance"]["id"], "A03")
        self.assertEqual(dispatch_json["selectedAmbulance"]["score"], 94)
        self.assertEqual(dispatch_json["selectedHospital"]["id"], "H02")
        self.assertEqual(dispatch_json["mission"]["id"], "DSRS-2026-0019")
        self.assertTrue(len(dispatch_json["route"]) > 0)

        reset_response = client.post("/api/reset")
        self.assertEqual(reset_response.status_code, 200)
        reset_json = reset_response.json()
        self.assertEqual(reset_json["status"], "idle")
        self.assertIsNone(reset_json["incident"])
        self.assertIsNone(reset_json["mission"])
        self.assertIsNone(reset_json["selectedAmbulance"])
        self.assertIsNone(reset_json["selectedHospital"])
        self.assertEqual(reset_json["route"], [])
        self.assertEqual(reset_json["communicationState"], "NORMAL")
        self.assertEqual(reset_json["bufferedEvents"], [])
        self.assertEqual(reset_json["fallbackPackets"], [])
        self.assertEqual(reset_json["missionLock"]["locked"], False)


class ResilienceLifecycleTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
        os.environ.setdefault("SUPABASE_KEY", "dummy-key")

        from app.main import app
        from app.middleware.auth import get_current_user

        app.dependency_overrides[get_current_user] = lambda: {"email": "demo@example.com", "role": "ADMIN"}
        cls.app = app

    def setUp(self) -> None:
        state_manager.reset()

    def _client(self):
        from fastapi.testclient import TestClient

        return TestClient(self.app)

    def _create_dispatch(self):
        client = self._client()
        client.post("/api/demo/incident")
        client.post("/api/demo/dispatch")
        return client

    def test_happy_path_network_lifecycle(self) -> None:
        client = self._create_dispatch()

        failed = client.post("/api/network/fail")
        self.assertEqual(failed.status_code, 200)
        self.assertEqual(failed.json()["communicationState"], "DEGRADED")

        offline = client.post("/api/network/offline")
        self.assertEqual(offline.status_code, 200)
        offline_json = offline.json()
        self.assertEqual(offline_json["communicationState"], "OFFLINE")
        self.assertTrue(offline_json["autonomousNodeActive"])
        self.assertTrue(offline_json["offlineRoutingActive"])
        self.assertTrue(offline_json["dkcActive"])
        self.assertTrue(offline_json["eventBufferActive"])
        self.assertEqual(offline_json["fallbackTransport"], "LORA_SIMULATED")
        self.assertGreaterEqual(len(offline_json["bufferedEvents"]), 3)

        restore = client.post("/api/network/restore")
        self.assertEqual(restore.status_code, 200)
        restore_json = restore.json()
        self.assertEqual(restore_json["communicationState"], "RECOVERING")
        self.assertEqual(restore_json["syncProgress"]["percentage"], 0.0)
        self.assertGreaterEqual(len(restore_json["bufferedEvents"]), 3)

        progress_values = []
        for _ in range(5):
            sync_response = client.post("/api/sync/advance")
            self.assertEqual(sync_response.status_code, 200)
            progress_values.append(sync_response.json()["syncProgress"]["percentage"])

        final_state = client.get("/api/state").json()
        self.assertEqual(final_state["communicationState"], "NORMAL")
        self.assertEqual(final_state["bufferedEvents"], [])
        self.assertFalse(final_state["autonomousNodeActive"])
        self.assertFalse(final_state["offlineRoutingActive"])
        self.assertFalse(final_state["dkcActive"])
        self.assertFalse(final_state["eventBufferActive"])
        self.assertIsNone(final_state["fallbackTransport"])
        self.assertEqual(final_state["syncProgress"]["percentage"], 100.0)
        self.assertEqual(final_state["syncSummary"]["conflicts"], 0)
        self.assertTrue(final_state["syncSummary"]["verified"])
        self.assertEqual(final_state["mission"]["id"], "DSRS-2026-0019")
        self.assertEqual(final_state["selectedAmbulance"]["id"], "A03")
        self.assertEqual(final_state["selectedHospital"]["id"], "H02")
        self.assertEqual(final_state["priority"]["score"], 96)
        self.assertEqual(final_state["route"][0]["latitude"], 13.0827)

    def test_invalid_transitions_return_conflict_and_do_not_mutate_state(self) -> None:
        client = self._client()
        initial = client.get("/api/state").json()

        for method in ("/api/network/offline", "/api/network/restore", "/api/sync/advance"):
            response = client.post(method)
            self.assertEqual(response.status_code, 409)
            self.assertEqual(client.get("/api/state").json(), initial)

    def test_reset_from_resilience_states(self) -> None:
        client = self._create_dispatch()
        client.post("/api/network/fail")
        client.post("/api/network/offline")

        reset_offline = client.post("/api/reset")
        self.assertEqual(reset_offline.status_code, 200)
        self.assertEqual(reset_offline.json()["status"], "idle")

        client = self._create_dispatch()
        client.post("/api/network/fail")
        client.post("/api/network/offline")
        client.post("/api/network/restore")

        reset_recovering = client.post("/api/reset")
        self.assertEqual(reset_recovering.status_code, 200)
        self.assertEqual(reset_recovering.json()["status"], "idle")

    def test_repeatability_full_lifecycle(self) -> None:
        client = self._create_dispatch()
        first_dispatch = client.get("/api/state").json()
        client.post("/api/network/fail")
        client.post("/api/network/offline")
        client.post("/api/network/restore")
        for _ in range(5):
            client.post("/api/sync/advance")
        first_final = client.get("/api/state").json()

        client.post("/api/reset")
        client = self._create_dispatch()
        second_dispatch = client.get("/api/state").json()
        client.post("/api/network/fail")
        client.post("/api/network/offline")
        client.post("/api/network/restore")
        for _ in range(5):
            client.post("/api/sync/advance")
        second_final = client.get("/api/state").json()

        self.assertEqual(first_dispatch["mission"]["id"], second_dispatch["mission"]["id"])
        self.assertEqual(first_dispatch["selectedAmbulance"]["id"], second_dispatch["selectedAmbulance"]["id"])
        self.assertEqual(first_dispatch["selectedHospital"]["id"], second_dispatch["selectedHospital"]["id"])
        self.assertEqual(first_final, second_final)


class MovementLifecycleTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
        os.environ.setdefault("SUPABASE_KEY", "dummy-key")

        from app.main import app
        from app.middleware.auth import get_current_user

        app.dependency_overrides[get_current_user] = lambda: {"email": "demo@example.com", "role": "ADMIN"}
        cls.app = app

    def setUp(self) -> None:
        state_manager.reset()

    def _client(self):
        from fastapi.testclient import TestClient

        return TestClient(self.app)

    def _dispatch(self):
        client = self._client()
        client.post("/api/demo/incident")
        client.post("/api/demo/dispatch")
        return client

    def test_movement_progression_and_completion(self) -> None:
        client = self._dispatch()
        state = client.get("/api/state").json()
        self.assertTrue(state["movementActive"])
        self.assertEqual(state["routeIndex"], 0)

        first_move = client.post("/api/movement/advance")
        self.assertEqual(first_move.status_code, 200)
        first_json = first_move.json()
        self.assertEqual(first_json["routeIndex"], 1)
        self.assertEqual(first_json["selectedAmbulance"]["latitude"], first_json["route"][1]["latitude"])
        self.assertEqual(first_json["selectedAmbulance"]["longitude"], first_json["route"][1]["longitude"])

        route_before = first_json["route"]
        while client.get("/api/state").json()["movementActive"]:
            client.post("/api/movement/advance")

        final_state = client.get("/api/state").json()
        self.assertFalse(final_state["movementActive"])
        self.assertEqual(final_state["mission"]["status"], "COMPLETED")
        self.assertEqual(final_state["mission"]["id"], "DSRS-2026-0019")
        self.assertEqual(route_before, final_state["route"])

        invalid = client.post("/api/movement/advance")
        self.assertEqual(invalid.status_code, 409)

    def test_offline_movement_and_buffered_location_events(self) -> None:
        client = self._dispatch()
        client.post("/api/network/fail")
        client.post("/api/network/offline")

        offline_move = client.post("/api/movement/advance")
        self.assertEqual(offline_move.status_code, 200)
        offline_json = offline_move.json()
        self.assertEqual(offline_json["communicationState"], "OFFLINE")
        self.assertTrue(offline_json["offlineRoutingActive"])
        self.assertGreaterEqual(len(offline_json["bufferedEvents"]), 4)
        self.assertTrue(any(event["type"] == "vehicle_location" for event in offline_json["bufferedEvents"]))

    def test_resilience_position_preservation(self) -> None:
        client = self._dispatch()
        first_move = client.post("/api/movement/advance").json()
        latest_lat = first_move["selectedAmbulance"]["latitude"]
        latest_lon = first_move["selectedAmbulance"]["longitude"]

        client.post("/api/network/fail")
        client.post("/api/network/offline")
        second_move = client.post("/api/movement/advance").json()
        self.assertEqual(second_move["communicationState"], "OFFLINE")
        self.assertGreater(second_move["routeIndex"], 1)

        client.post("/api/network/restore")
        for _ in range(5):
            client.post("/api/sync/advance")

        final_state = client.get("/api/state").json()
        self.assertEqual(final_state["communicationState"], "NORMAL")
        self.assertEqual(final_state["selectedAmbulance"]["latitude"], second_move["selectedAmbulance"]["latitude"])
        self.assertEqual(final_state["selectedAmbulance"]["longitude"], second_move["selectedAmbulance"]["longitude"])
        self.assertGreaterEqual(final_state["routeIndex"], second_move["routeIndex"])

    def test_reset_during_movement(self) -> None:
        client = self._dispatch()
        client.post("/api/movement/advance")
        reset_state = client.post("/api/reset").json()
        self.assertEqual(reset_state["status"], "idle")
        self.assertFalse(reset_state["movementActive"])
        self.assertEqual(reset_state["routeIndex"], 0)
        self.assertEqual(reset_state["route"], [])


class MovementInvalidTransitionTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
        os.environ.setdefault("SUPABASE_KEY", "dummy-key")

        from app.main import app
        from app.middleware.auth import get_current_user

        app.dependency_overrides[get_current_user] = lambda: {"email": "demo@example.com", "role": "ADMIN"}
        cls.app = app

    def setUp(self) -> None:
        state_manager.reset()

    def _client(self):
        from fastapi.testclient import TestClient

        return TestClient(self.app)

    def test_invalid_movement_returns_conflict_without_mutation(self) -> None:
        client = self._client()
        initial = client.get("/api/state").json()

        response = client.post("/api/movement/advance")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(client.get("/api/state").json(), initial)


if __name__ == "__main__":
    unittest.main()