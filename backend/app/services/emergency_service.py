from app.config.database import supabase

def create_emergency(emergency):

    return supabase.table("emergencies").insert({
        "emergency_type": emergency.emergency_type,
        "priority": emergency.priority,
        "latitude": emergency.latitude,
        "longitude": emergency.longitude,
        "status": emergency.status
    }).execute()


def get_emergencies():

    return supabase.table("emergencies").select("*").execute()


def get_emergency(id):

    return supabase.table("emergencies").select("*").eq("id", id).execute()


def update_emergency(id, emergency):

    return supabase.table("emergencies").update(emergency.dict()).eq("id", id).execute()


def delete_emergency(id):

    return supabase.table("emergencies").delete().eq("id", id).execute()