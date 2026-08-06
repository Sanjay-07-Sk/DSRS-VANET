from pydantic import BaseModel, Field
from typing import Union


class MissionCreate(BaseModel):
    """
    Schema for creating a rescue mission.
    """
    mission_code: str = Field(..., description="Unique mission code identifier")
    ambulance_id: str = Field(..., description="UUID of assigned ambulance")
    hospital_id: str = Field(..., description="UUID of assigned hospital")
    emergency_id: str = Field(..., description="UUID of reported emergency")
    status: str = Field(..., description="Mission status, e.g. ASSIGNED, IN_PROGRESS, COMPLETED")
    eta: Union[float, int] = Field(..., description="Estimated travel time in minutes")


class MissionStatusUpdate(BaseModel):
    """
    Schema for updating mission status.
    """
    status: str = Field(..., description="Updated mission status string")