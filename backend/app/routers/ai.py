from fastapi import APIRouter, status, HTTPException, Depends
from app.schemas.ai_schema import (
    PriorityRequest,
    PriorityResponse,
    BestAmbulanceRequest,
    BestAmbulanceResponse,
    BestHospitalRequest,
    BestHospitalResponse,
    ETARequest,
    ETAResponse,
    RecommendationRequest,
    RecommendationResponse
)
from app.services.ai_service import (
    calculate_priority,
    select_best_ambulance,
    select_best_hospital,
    estimate_eta,
    generate_recommendation
)
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Module"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/priority",
    response_model=PriorityResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Emergency Priority",
    description="Calculates emergency priority level (CRITICAL, HIGH, MEDIUM, LOW) based on emergency type using rule-based AI logic."
)
def get_priority(request: PriorityRequest):
    """
    Calculate emergency priority from emergency type.
    """
    priority = calculate_priority(request.emergency_type)
    return PriorityResponse(
        emergency_type=request.emergency_type,
        priority=priority
    )


@router.post(
    "/best-ambulance",
    response_model=BestAmbulanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Select Best Ambulance",
    description="Reads AVAILABLE ambulances from Supabase and returns the nearest ambulance calculated using the Haversine formula."
)
def get_best_ambulance(request: BestAmbulanceRequest):
    """
    Find the nearest available ambulance for given latitude and longitude.
    """
    result = select_best_ambulance(request.latitude, request.longitude)
    return BestAmbulanceResponse(**result)


@router.post(
    "/best-hospital",
    response_model=BestHospitalResponse,
    status_code=status.HTTP_200_OK,
    summary="Select Best Hospital",
    description="Reads active hospitals from Supabase with available beds and selects the best hospital based on nearest distance, maximum available beds, and ICU beds."
)
def get_best_hospital(request: BestHospitalRequest):
    """
    Find the optimal hospital with available beds based on distance and capacity.
    """
    result = select_best_hospital(request.latitude, request.longitude)
    return BestHospitalResponse(**result)


@router.post(
    "/eta",
    response_model=ETAResponse,
    status_code=status.HTTP_200_OK,
    summary="Estimate Travel ETA",
    description="Estimates travel time (ETA in minutes) based on distance in km and average speed in km/h."
)
def get_eta(request: ETARequest):
    """
    Calculate estimated travel time in minutes.
    """
    eta = estimate_eta(request.distance, request.average_speed)
    return ETAResponse(
        distance_km=request.distance,
        average_speed_kmh=request.average_speed,
        eta_minutes=eta
    )


@router.post(
    "/recommendation",
    response_model=RecommendationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Complete Rescue Recommendation",
    description="Combines priority calculation, nearest available ambulance, best hospital selection, and total ETA for a given emergency ID."
)
def get_recommendation(request: RecommendationRequest):
    """
    Generate comprehensive rescue plan recommendation given an Emergency ID.
    """
    result = generate_recommendation(request.emergency_id)
    return RecommendationResponse(**result)
