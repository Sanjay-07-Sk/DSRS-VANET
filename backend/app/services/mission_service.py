from app.config.database import supabase
from app.services.sync_service import store_record


# Create Mission
def create_mission(mission):
    """
    Creates a new rescue mission record via store_record().
    """
    payload = {
        "mission_code": mission.mission_code,
        "ambulance_id": mission.ambulance_id,
        "hospital_id": mission.hospital_id,
        "emergency_id": mission.emergency_id,
        "status": mission.status,
        "eta": mission.eta
    }
    return store_record("INSERT", "missions", payload)


# Get All Missions
def get_missions():
    """
    Queries all mission records from Supabase.
    """
    return supabase.table("missions").select("*").execute()


# Get Mission By ID
def get_mission(id: str):
    """
    Queries a mission record by ID from Supabase.
    """
    return supabase.table("missions").select("*").eq("id", id).execute()


# Update Mission Status
def update_status(id: str, status_value: str):
    """
    Updates status of a mission record via store_record().
    """
    payload = {
        "id": id,
        "status": status_value
    }
    return store_record("UPDATE", "missions", payload)


# Complete Mission
def complete_mission(id: str):
    """
    Marks a mission as COMPLETED via store_record().
    """
    payload = {
        "id": id,
        "status": "COMPLETED"
    }
    return store_record("UPDATE", "missions", payload)