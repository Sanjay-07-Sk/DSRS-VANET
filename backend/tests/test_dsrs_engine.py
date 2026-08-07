import unittest

from app.services.dsrs_engine import (
    build_dashboard_state,
    build_route,
    dispatch_mission,
    evaluate_ambulance,
    evaluate_hospital,
    score_priority,
)
from app.services.dsrs_fixture import CANONICAL_AMBULANCES, CANONICAL_HOSPITALS, CANONICAL_INCIDENT, CANONICAL_MISSION_ID
from app.schemas.dashboard_schema import Incident


class DsrsEngineTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.incident = Incident(**CANONICAL_INCIDENT)

    def test_priority_is_canonical(self) -> None:
        priority = score_priority(self.incident)
        self.assertEqual(priority.score, 96)
        self.assertEqual(priority.category, "CRITICAL")

    def test_ambulance_and_hospital_selection_are_canonical(self) -> None:
        ambulance_evaluations = [evaluate_ambulance(item, self.incident) for item in CANONICAL_AMBULANCES]
        hospital_evaluations = [evaluate_hospital(item, self.incident) for item in CANONICAL_HOSPITALS]

        a01 = next(item for item in ambulance_evaluations if item.ambulanceId == "A01")
        a03 = next(item for item in ambulance_evaluations if item.ambulanceId == "A03")
        h01 = next(item for item in hospital_evaluations if item.hospitalId == "H01")
        h02 = next(item for item in hospital_evaluations if item.hospitalId == "H02")

        self.assertEqual(a01.score, 55)
        self.assertFalse(a01.selected)
        self.assertEqual(a01.reason, "Required trauma equipment unavailable.")

        self.assertEqual(a03.score, 94)
        self.assertTrue(a03.selected)

        self.assertEqual(h01.reason, "ICU capacity exhausted.")
        self.assertFalse(h01.selected)
        self.assertTrue(h02.selected)

        selected_ambulance = next(item for item in ambulance_evaluations if item.selected)
        selected_hospital = next(item for item in hospital_evaluations if item.selected)

        self.assertEqual(selected_ambulance.ambulanceId, "A03")
        self.assertEqual(selected_hospital.hospitalId, "H02")

    def test_mission_and_dashboard_are_deterministic(self) -> None:
        first_state = build_dashboard_state()
        second_state = build_dashboard_state()

        self.assertEqual(first_state.model_dump(), second_state.model_dump())
        self.assertEqual(first_state.priority.score, 96)
        self.assertEqual(first_state.priority.category, "CRITICAL")
        self.assertEqual(first_state.selectedAmbulance.id, "A03")
        self.assertEqual(first_state.selectedHospital.id, "H02")
        self.assertEqual(first_state.mission.id, CANONICAL_MISSION_ID)

        route = build_route(first_state.incident, first_state.selectedAmbulance, first_state.selectedHospital)
        mission = dispatch_mission(first_state.incident, evaluate_ambulance(CANONICAL_AMBULANCES[2], self.incident), evaluate_hospital(CANONICAL_HOSPITALS[1], self.incident), route=route)
        self.assertEqual(mission.id, CANONICAL_MISSION_ID)


if __name__ == "__main__":
    unittest.main()