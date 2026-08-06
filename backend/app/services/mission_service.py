import uuid
from app.config.database import supabase
from app.services.sync_service import store_record


# Create Mission
def create_mission(mission):
    """
    Creates a new rescue mission record via store_record().
    Generates UUID id client-side if missing.
    """
    payload = mission.model_dump()
    if "id" not in payload or not payload["id"]:
        payload["id"] = str(uuid.uuid4())
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