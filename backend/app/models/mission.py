class Mission:
    """
    Mission domain model class representing a rescue dispatch mission.
    """
    def __init__(
        self,
        mission_code: str,
        ambulance_id: str,
        hospital_id: str,
        emergency_id: str,
        status: str,
        eta: float,
        id: str = None
    ):
        self.id = id
        self.mission_code = mission_code
        self.ambulance_id = ambulance_id
        self.hospital_id = hospital_id
        self.emergency_id = emergency_id
        self.status = status
        self.eta = eta
