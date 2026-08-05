from app.config.database import supabase


# Create Mission
def create_mission(mission):

    return supabase.table("missions").insert({
        "mission_code": mission.mission_code,
        "ambulance_id": mission.ambulance_id,
        "hospital_id": mission.hospital_id,
        "emergency_id": mission.emergency_id,
        "status": mission.status,
        "eta": mission.eta
    }).execute()


# Get All Missions
def get_missions():

    return supabase.table("missions").select("*").execute()


# Get Mission By ID
def get_mission(id):

    return supabase.table("missions").select("*").eq("id", id).execute()


# Update Mission Status
def update_status(id, status):

    return supabase.table("missions").update({
        "status": status
    }).eq("id", id).execute()


# Complete Mission
def complete_mission(id):

    return (
        supabase
        .table("missions")
        .update({
            "status": "COMPLETED"
        })
        .eq("id", id)
        .execute()
    )