import math
from typing import Dict, Any, List, Optional
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from app.config.database import supabase


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance in kilometers between two GPS points
    using the Haversine formula.

    :param lat1: Latitude of point 1 (in decimal degrees)
    :param lon1: Longitude of point 1 (in decimal degrees)
    :param lat2: Latitude of point 2 (in decimal degrees)
    :param lon2: Longitude of point 2 (in decimal degrees)
    :return: Distance in kilometers
    """
    # Earth mean radius in kilometers
    R = 6371.0

    # Convert decimal degrees to radians
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )

    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = R * c

    return distance


def calculate_priority(emergency_type: str) -> str:
    """
    Rule-based logic to determine emergency priority based on emergency type.

    Categories returned:
    - CRITICAL
    - HIGH
    - MEDIUM
    - LOW

    Examples:
    - Cardiac Arrest -> CRITICAL
    - Stroke -> HIGH
    - Fire -> HIGH
    - Road Accident -> MEDIUM
    - Minor Injury -> LOW

    :param emergency_type: Description or name of the emergency type
    :return: Priority string ("CRITICAL", "HIGH", "MEDIUM", "LOW")
    """
    if not emergency_type:
        return "MEDIUM"

    normalized_type = emergency_type.strip().lower()

    # Rule 1: Critical Emergency Conditions
    critical_keywords = [
        "cardiac arrest",
        "heart attack",
        "cardiac",
        "respiratory arrest",
        "unconscious",
        "severe trauma",
        "cardiac_arrest"
    ]
    for kw in critical_keywords:
        if kw in normalized_type:
            return "CRITICAL"

    # Rule 2: High Emergency Conditions
    high_keywords = [
        "stroke",
        "fire",
        "burn",
        "severe bleeding",
        "chest pain",
        "head injury",
        "poisoning",
        "drowning",
        "explosion"
    ]
    for kw in high_keywords:
        if kw in normalized_type:
            return "HIGH"

    # Rule 3: Medium Emergency Conditions
    medium_keywords = [
        "road accident",
        "accident",
        "fracture",
        "fall",
        "high fever",
        "seizure",
        "asthma attack"
    ]
    for kw in medium_keywords:
        if kw in normalized_type:
            return "MEDIUM"

    # Rule 4: Low Emergency Conditions
    low_keywords = [
        "minor injury",
        "minor burn",
        "cut",
        "sprain",
        "vomiting",
        "headache",
        "minor",
        "fever"
    ]
    for kw in low_keywords:
        if kw in normalized_type:
            return "LOW"

    # Default fallback priority
    return "MEDIUM"


def select_best_ambulance(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Reads all ambulances from Supabase database.
    Ignores ambulances whose status is not AVAILABLE.
    Calculates distance using Haversine formula and returns the nearest ambulance.

    :param latitude: Emergency latitude
    :param longitude: Emergency longitude
    :return: Dictionary containing best ambulance object, distance in km, and ETA in minutes
    """
    try:
        response = supabase.table("ambulances").select("*").execute()
        ambulances: List[Dict[str, Any]] = response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying ambulances database: {str(e)}"
        )

    # Filter available ambulances (case-insensitive check for 'AVAILABLE')
    available_ambulances = [
        amb for amb in ambulances
        if str(amb.get("status", "")).strip().upper() == "AVAILABLE"
    ]

    if not available_ambulances:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No available ambulances found"
        )

    best_ambulance: Optional[Dict[str, Any]] = None
    min_distance: float = float("inf")

    # Iterate through available ambulances and find the nearest one
    for amb in available_ambulances:
        amb_lat = float(amb.get("latitude", 0.0))
        amb_lon = float(amb.get("longitude", 0.0))

        dist = haversine_distance(latitude, longitude, amb_lat, amb_lon)
        if dist < min_distance:
            min_distance = dist
            best_ambulance = amb

    if not best_ambulance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No available ambulances found"
        )

    # Determine average speed of ambulance (default to 40.0 km/h if missing or 0)
    speed = float(best_ambulance.get("speed", 40.0) or 40.0)
    if speed <= 0:
        speed = 40.0

    eta_minutes = estimate_eta(min_distance, speed)

    return {
        "ambulance": best_ambulance,
        "distance_km": round(min_distance, 2),
        "estimated_eta_minutes": eta_minutes
    }


def select_best_hospital(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Reads all hospitals from Supabase database.
    Ignores hospitals with available_beds <= 0.
    Chooses best hospital based on:
    - Nearest Distance
    - Maximum Available Beds
    - ICU Beds

    :param latitude: Emergency latitude
    :param longitude: Emergency longitude
    :return: Dictionary containing best hospital object and distance in km
    """
    try:
        response = supabase.table("hospitals").select("*").execute()
        hospitals: List[Dict[str, Any]] = response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying hospitals database: {str(e)}"
        )

    # Filter hospitals with available beds > 0
    eligible_hospitals = [
        hosp for hosp in hospitals
        if int(hosp.get("available_beds", 0) or 0) > 0
    ]

    if not eligible_hospitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hospitals with available beds found"
        )

    scored_hospitals = []
    for hosp in eligible_hospitals:
        hosp_lat = float(hosp.get("latitude", 0.0))
        hosp_lon = float(hosp.get("longitude", 0.0))

        dist = haversine_distance(latitude, longitude, hosp_lat, hosp_lon)
        avail_beds = int(hosp.get("available_beds", 0) or 0)
        icu_beds = int(hosp.get("icu_beds", 0) or 0)

        # Multi-criteria decision key:
        # 1. Primary: Distance (ascending)
        # 2. Secondary: Available Beds (descending)
        # 3. Tertiary: ICU Beds (descending)
        sort_key = (dist, -avail_beds, -icu_beds)

        scored_hospitals.append({
            "hospital": hosp,
            "distance_km": dist,
            "sort_key": sort_key
        })

    # Sort hospitals by multi-criteria sort_key
    scored_hospitals.sort(key=lambda x: x["sort_key"])

    best = scored_hospitals[0]

    return {
        "hospital": best["hospital"],
        "distance_km": round(best["distance_km"], 2)
    }


def estimate_eta(distance: float, average_speed: float = 40.0) -> float:
    """
    Simple mathematical calculation to estimate travel time (ETA) in minutes.

    Formula: ETA (minutes) = (distance / average_speed) * 60

    :param distance: Distance in kilometers
    :param average_speed: Average speed in km/h (default 40.0)
    :return: ETA in minutes rounded to 2 decimal places
    """
    if distance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Distance must be a non-negative number"
        )

    if average_speed <= 0:
        average_speed = 40.0

    eta_minutes = (distance / average_speed) * 60.0
    return round(eta_minutes, 2)


def generate_recommendation(emergency_id: str) -> Dict[str, Any]:
    """
    Combines all previous functions to generate a complete AI rescue recommendation.
    Inputs an Emergency ID, fetches record from Supabase, and calculates:
    - Emergency Priority
    - Nearest Available Ambulance
    - Best Eligible Hospital
    - Total Estimated ETA

    :param emergency_id: Unique Supabase ID of the emergency
    :return: Complete recommendation response payload
    """
    if not emergency_id or not emergency_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Emergency ID must be provided"
        )

    try:
        response = (
            supabase
            .table("emergencies")
            .select("*")
            .eq("id", emergency_id.strip())
            .execute()
        )
        emergencies = response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching emergency record: {str(e)}"
        )

    if not emergencies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency with ID '{emergency_id}' not found"
        )

    emergency = emergencies[0]
    emergency_type = emergency.get("emergency_type", "")
    lat = float(emergency.get("latitude", 0.0))
    lon = float(emergency.get("longitude", 0.0))

    # 1. Calculate Priority
    priority = calculate_priority(emergency_type)

    # 2. Select Best Ambulance
    ambulance_res = select_best_ambulance(lat, lon)
    best_ambulance = ambulance_res["ambulance"]
    ambulance_dist = ambulance_res["distance_km"]
    ambulance_eta = ambulance_res["estimated_eta_minutes"]

    # 3. Select Best Hospital
    hospital_res = select_best_hospital(lat, lon)
    best_hospital = hospital_res["hospital"]
    hospital_dist = hospital_res["distance_km"]

    # 4. Estimate Travel ETA from Emergency location to Hospital
    hospital_eta = estimate_eta(hospital_dist, 40.0)

    # Total combined ETA: ambulance reach time + ambulance to hospital travel time
    total_eta = round(ambulance_eta + hospital_eta, 2)

    return {
        "emergency_id": emergency_id,
        "emergency_type": emergency_type,
        "priority": priority,
        "nearest_ambulance": best_ambulance,
        "ambulance_distance_km": ambulance_dist,
        "nearest_hospital": best_hospital,
        "hospital_distance_km": hospital_dist,
        "estimated_eta_minutes": total_eta
    }
