from pydantic import BaseModel, Field
from typing import Optional, Dict

class BedCount(BaseModel):
    occupied: int = 0
    total: int = 20

class HospitalCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., example="City Hospital")
    location: str = Field(..., example="Anna Nagar")
    lat: float = Field(..., example=13.0850)
    lng: float = Field(..., example=80.2100)
    totalCapacity: int = Field(200, example=200)
    occupied: int = Field(150, example=150)
    available: int = Field(50, example=50)
    occupancyRate: int = Field(75, example=75)
    status: str = Field("Normal", example="Normal")
    icuBeds: Optional[Dict[str, int]] = Field(default_factory=lambda: {"occupied": 10, "total": 20})
    generalBeds: Optional[Dict[str, int]] = Field(default_factory=lambda: {"occupied": 100, "total": 130})
    emergencyBeds: Optional[Dict[str, int]] = Field(default_factory=lambda: {"occupied": 30, "total": 40})
    ventilators: Optional[Dict[str, int]] = Field(default_factory=lambda: {"occupied": 10, "total": 15})
    doctors: Optional[int] = 20
    nurses: Optional[int] = 40
    ambulances: Optional[int] = 4
    bloodUnits: Optional[int] = 30

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    totalCapacity: Optional[int] = None
    occupied: Optional[int] = None
    available: Optional[int] = None
    occupancyRate: Optional[int] = None
    status: Optional[str] = None
    icuBeds: Optional[Dict[str, int]] = None
    generalBeds: Optional[Dict[str, int]] = None
    emergencyBeds: Optional[Dict[str, int]] = None
    ventilators: Optional[Dict[str, int]] = None
    doctors: Optional[int] = None
    nurses: Optional[int] = None
    ambulances: Optional[int] = None
    bloodUnits: Optional[int] = None

class HospitalResponse(BaseModel):
    id: str
    name: str
    location: str
    lat: float
    lng: float
    totalCapacity: int
    occupied: int
    available: int
    occupancyRate: int
    status: str
    icuBeds: Dict[str, int]
    generalBeds: Dict[str, int]
    emergencyBeds: Dict[str, int]
    ventilators: Dict[str, int]
    doctors: int = 10
    nurses: int = 20
    ambulances: int = 4
    bloodUnits: int = 30
    lastUpdated: Optional[str] = None