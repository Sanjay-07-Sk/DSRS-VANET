from app.config.database import supabase
from app.services.sync_service import store_record


def create_hospital(hospital):
    """
    Creates a new hospital record via store_record().
    """
    data = hospital.model_dump() if hasattr(hospital, "model_dump") else hospital.dict()
    return store_record("INSERT", "hospitals", data)


def get_hospitals():
    """
    Queries all hospital records from Supabase.
    """
    return supabase.table("hospitals").select("*").execute()


def get_hospital(id: str):
    """
    Queries a hospital record by ID from Supabase.
    """
    return supabase.table("hospitals").select("*").eq("id", id).execute()


def update_hospital(id: str, hospital):
    """
    Updates a hospital record via store_record().
    """
    data = hospital.model_dump() if hasattr(hospital, "model_dump") else hospital.dict()
    data["id"] = id
    return store_record("UPDATE", "hospitals", data)


def delete_hospital(id: str):
    """
    Deletes a hospital record via store_record().
    """
    payload = {"id": id}
    return store_record("DELETE", "hospitals", payload)