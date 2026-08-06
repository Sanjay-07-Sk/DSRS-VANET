from pydantic import BaseModel, Field
from typing import Optional

class EmergencyCreate(BaseModel):
    type: str = Field(..., example="Flood - Zone 3")
    location: str = Field(..., example="Anna Nagar, Chennai")
    zone: Optional[str] = Field("Zone 1 (North)", example="Zone 1 (North)")
    lat: float = Field(..., example=13.0878)
    lng: float = Field(..., example=80.2170)
    severity: str = Field("HIGH", example="HIGH")
    caller: Optional[str] = Field("Emergency Call Center", example="Kavitha R.")
    victimCount: Optional[int] = Field(0, example=14)
    description: Optional[str] = Field("", example="Waterlogging level rising rapidly.")

class EmergencyUpdate(BaseModel):
    type: Optional[str] = None
    location: Optional[str] = None
    zone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    severity: Optional[str] = None
    caller: Optional[str] = None
    victimCount: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None

class EmergencyResponse(BaseModel):
    id: str
    type: str
    location: str
    zone: str
    lat: float
    lng: float
    severity: str
    caller: Optional[str] = None
    victimCount: int = 0
    description: Optional[str] = None
    status: str
    createdAt: Optional[str] = None
    timeStr: Optional[str] = None