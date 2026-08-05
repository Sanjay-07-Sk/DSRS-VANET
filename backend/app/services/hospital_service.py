from app.config.database import supabase


def create_hospital(hospital):
    data = hospital.model_dump()
    return supabase.table("hospitals").insert(data).execute()


def get_hospitals():
    return supabase.table("hospitals").select("*").execute()


def get_hospital(id: str):
    return supabase.table("hospitals").select("*").eq("id", id).execute()


def update_hospital(id: str, hospital):
    data = hospital.model_dump()
    return supabase.table("hospitals").update(data).eq("id", id).execute()


def delete_hospital(id: str):
    return supabase.table("hospitals").delete().eq("id", id).execute()