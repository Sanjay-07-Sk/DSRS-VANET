from pydantic import BaseModel

class MissionCreate(BaseModel):
    mission_code: str
    ambulance_id: str
    hospital_id: str
    emergency_id: str
    status: str
    eta: int


class MissionStatusUpdate(BaseModel):
    status: str