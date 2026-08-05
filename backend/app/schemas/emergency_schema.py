from pydantic import BaseModel

class EmergencyCreate(BaseModel):

    emergency_type: str
    priority: str
    latitude: float
    longitude: float
    status: str