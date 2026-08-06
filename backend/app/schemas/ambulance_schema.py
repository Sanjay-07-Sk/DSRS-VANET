from pydantic import BaseModel, Field
from typing import Optional

class AmbulanceCreate(BaseModel):
    id: Optional[str] = None
    type: str = Field("Ambulance", example="Ambulance")
    status: str = Field("Idle", example="Idle")
    location: str = Field(..., example="Anna Nagar")
    zone: str = Field("Zone 1 (North)", example="Zone 1 (North)")
    lat: float = Field(..., example=13.0850)
    lng: float = Field(..., example=80.2100)
    heading: Optional[int] = Field(0, example=45)
    speed: Optional[int] = Field(0, example=50)
    driver: str = Field(..., example="Karthik V.")
    fuel: Optional[int] = Field(100, example=90)
    battery: Optional[int] = Field(100, example=95)
    health: Optional[str] = Field("Good", example="Good")
    mission: Optional[str] = Field("None", example="None")
    missionId: Optional[str] = None

class AmbulanceUpdate(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    zone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    heading: Optional[int] = None
    speed: Optional[int] = None
    driver: Optional[str] = None
    fuel: Optional[int] = None
    battery: Optional[int] = None
    health: Optional[str] = None
    mission: Optional[str] = None
    missionId: Optional[str] = None

class AmbulanceResponse(BaseModel):
    id: str
    type: str
    status: str
    location: str
    zone: str
    lat: float
    lng: float
    heading: int = 0
    speed: int = 0
    driver: str
    fuel: int = 100
    battery: int = 100
    health: str = "Good"
    mission: str = "None"
    missionId: Optional[str] = None
    lastUpdate: Optional[str] = None