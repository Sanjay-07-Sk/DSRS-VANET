from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class PriorityRequest(BaseModel):
    """
    Schema for requesting emergency priority calculation.
    """
    emergency_type: str = Field(
        ...,
        description="Type of emergency (e.g. 'Cardiac Arrest', 'Stroke', 'Fire', 'Road Accident', 'Minor Injury')",
        examples=["Cardiac Arrest"]
    )


class PriorityResponse(BaseModel):
    """
    Schema for returning calculated emergency priority.
    """
    emergency_type: str
    priority: str = Field(
        ...,
        description="Calculated priority level: CRITICAL, HIGH, MEDIUM, or LOW"
    )


class BestAmbulanceRequest(BaseModel):
    """
    Schema for requesting nearest available ambulance lookup based on location.
    """
    latitude: float = Field(..., description="Latitude of emergency location", examples=[13.0827])
    longitude: float = Field(..., description="Longitude of emergency location", examples=[80.2707])


class BestAmbulanceResponse(BaseModel):
    """
    Schema for returning best ambulance recommendation.
    """
    ambulance: Dict[str, Any] = Field(..., description="Nearest available ambulance object")
    distance_km: float = Field(..., description="Distance in kilometers between location and ambulance")
    estimated_eta_minutes: float = Field(..., description="Estimated travel ETA in minutes")


class BestHospitalRequest(BaseModel):
    """
    Schema for requesting best hospital selection based on location and bed availability.
    """
    latitude: float = Field(..., description="Latitude of emergency location", examples=[13.0827])
    longitude: float = Field(..., description="Longitude of emergency location", examples=[80.2707])


class BestHospitalResponse(BaseModel):
    """
    Schema for returning best hospital recommendation.
    """
    hospital: Dict[str, Any] = Field(..., description="Best hospital object selected")
    distance_km: float = Field(..., description="Distance in kilometers to the selected hospital")


class ETARequest(BaseModel):
    """
    Schema for calculating estimated time of arrival (ETA).
    """
    distance: float = Field(..., description="Distance in kilometers", ge=0, examples=[10.5])
    average_speed: float = Field(40.0, description="Average speed in km/h", gt=0, examples=[40.0])


class ETAResponse(BaseModel):
    """
    Schema for returning estimated travel time.
    """
    distance_km: float
    average_speed_kmh: float
    eta_minutes: float


class RecommendationRequest(BaseModel):
    """
    Schema for generating complete emergency rescue recommendation by emergency ID.
    """
    emergency_id: str = Field(..., description="Supabase UUID for the emergency record")


class RecommendationResponse(BaseModel):
    """
    Schema for returning full AI recommendation including priority, best ambulance, best hospital, and ETA.
    """
    emergency_id: str
    emergency_type: str
    priority: str
    nearest_ambulance: Optional[Dict[str, Any]] = None
    ambulance_distance_km: float
    nearest_hospital: Optional[Dict[str, Any]] = None
    hospital_distance_km: float
    estimated_eta_minutes: float
