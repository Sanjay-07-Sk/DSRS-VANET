class Emergency:
    """
    Emergency domain model class representing a reported incident.
    """
    def __init__(
        self,
        emergency_type: str,
        priority: str,
        latitude: float,
        longitude: float,
        status: str,
        id: str = None,
        description: str = None,
        reported_by: str = None
    ):
        self.id = id
        self.emergency_type = emergency_type
        self.priority = priority
        self.latitude = latitude
        self.longitude = longitude
        self.status = status
        self.description = description
        self.reported_by = reported_by
