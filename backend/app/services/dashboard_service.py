from typing import Dict, Any
from app.config.database import supabase


def dashboard() -> Dict[str, Any]:
    """
    Returns full snapshot of ambulances, hospitals, emergencies, and missions.
    """
    ambulances = supabase.table("ambulances").select("*").execute()
    hospitals = supabase.table("hospitals").select("*").execute()
    emergencies = supabase.table("emergencies").select("*").execute()
    missions = supabase.table("missions").select("*").execute()

    return {
        "ambulances": ambulances.data or [],
        "hospitals": hospitals.data or [],
        "emergencies": emergencies.data or [],
        "missions": missions.data or []
    }


def statistics() -> Dict[str, Any]:
    """
    Calculates summary metrics for dashboard.
    """
    ambulances = supabase.table("ambulances").select("*").execute().data or []
    hospitals = supabase.table("hospitals").select("*").execute().data or []
    emergencies = supabase.table("emergencies").select("*").execute().data or []
    missions = supabase.table("missions").select("*").execute().data or []

    available = len([
        a for a in ambulances
        if str(a.get("status", "")).strip().upper() == "AVAILABLE"
    ])

    active = len([
        m for m in missions
        if str(m.get("status", "")).strip().upper() != "COMPLETED"
    ])

    pending = len([
        e for e in emergencies
        if str(e.get("status", "")).strip().upper() != "COMPLETED"
    ])

    return {
        "total_ambulances": len(ambulances),
        "available_ambulances": available,
        "total_hospitals": len(hospitals),
        "total_emergencies": len(emergencies),
        "pending_emergencies": pending,
        "active_missions": active
    }


def live() -> Dict[str, Any]:
    """
    Returns real-time locations of ambulances and emergencies for live map view.
    """
    ambulances = supabase.table("ambulances").select("*").execute()
    emergencies = supabase.table("emergencies").select("*").execute()

    return {
        "ambulances": ambulances.data or [],
        "emergencies": emergencies.data or []
    }