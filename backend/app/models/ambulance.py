class Ambulance:
    """
    Ambulance domain model class representing an emergency vehicle.
    """
    def __init__(
        self,
        vehicle_number: str,
        driver_name: str,
        status: str,
        latitude: float,
        longitude: float,
        speed: float,
        id: str = None,
        mission_id: str = None,
        hospital_id: str = None
    ):
        self.id = id
        self.vehicle_number = vehicle_number
        self.driver_name = driver_name
        self.status = status
        self.latitude = latitude
        self.longitude = longitude
        self.speed = speed
        self.mission_id = mission_id
        self.hospital_id = hospital_id
