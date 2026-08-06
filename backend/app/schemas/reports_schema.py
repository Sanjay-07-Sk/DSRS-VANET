from pydantic import BaseModel
from typing import List, Optional, Any

class ReportFilter(BaseModel):
    zone: Optional[str] = "All Zones"
    vehicleType: Optional[str] = "All"
    incidentType: Optional[str] = "All"
    format: Optional[str] = "json"

class ReportResponse(BaseModel):
    totalIncidents: int
    activeIncidents: int
    totalMissions: int
    successfulMissions: int
    avgResponseTime: str
    incidents: List[Any]
    vehicles: List[Any]
    hospitals: List[Any]
