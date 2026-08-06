from pydantic import BaseModel, Field
from typing import Optional

class MissionCreate(BaseModel):
    emergencyId: Optional[str] = None
    emergencyType: Optional[str] = "Road Accident"
    location: Optional[str] = "Anna Nagar, Chennai"
    zone: Optional[str] = "Zone 1 (North)"
    ambulanceId: Optional[str] = "AMB-03"
    hospitalId: Optional[str] = "HOSP-01"
    hospitalName: Optional[str] = "City Hospital"
    etaMinutes: Optional[float] = 3.5
    acrnConfidence: Optional[int] = 94

class MissionUpdate(BaseModel):
    status: Optional[str] = None
    stepIndex: Optional[int] = None
    completedAt: Optional[str] = None

class MissionResponse(BaseModel):
    id: str
    emergencyId: str
    emergencyType: str
    location: str
    zone: str
    ambulanceId: str
    hospitalId: str
    hospitalName: str
    status: str
    etaMinutes: float
    acrnConfidence: int
    stepIndex: int
    createdAt: Optional[str] = None
    completedAt: Optional[str] = None