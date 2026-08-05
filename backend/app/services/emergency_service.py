from app.config.database import supabase
from app.services.sync_service import store_record


def create_emergency(emergency):
    """
    Creates a new emergency record via store_record() (direct upload if online, offline save if offline).
    """
    payload = {
        "emergency_type": emergency.emergency_type,
        "priority": emergency.priority,
        "latitude": emergency.latitude,
        "longitude": emergency.longitude,
        "status": emergency.status
    }
    return store_record("INSERT", "emergencies", payload)


def get_emergencies():
    """
    Queries all emergency records from Supabase.
    """
    return supabase.table("emergencies").select("*").execute()


def get_emergency(id: str):
    """
    Queries a specific emergency record by ID from Supabase.
    """
    return supabase.table("emergencies").select("*").eq("id", id).execute()


def update_emergency(id: str, emergency):
    """
    Updates an emergency record via store_record().
    """
    payload = emergency.model_dump() if hasattr(emergency, "model_dump") else emergency.dict()
    payload["id"] = id
    return store_record("UPDATE", "emergencies", payload)


def delete_emergency(id: str):
    """
    Deletes an emergency record via store_record().
    """
    payload = {"id": id}
    return store_record("DELETE", "emergencies", payload)