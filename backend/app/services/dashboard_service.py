from app.config.database import supabase


def dashboard():

    ambulances = supabase.table("ambulances").select("*").execute()
    hospitals = supabase.table("hospitals").select("*").execute()
    emergencies = supabase.table("emergencies").select("*").execute()
    missions = supabase.table("missions").select("*").execute()

    return {
        "ambulances": ambulances.data,
        "hospitals": hospitals.data,
        "emergencies": emergencies.data,
        "missions": missions.data
    }


def statistics():

    ambulances = supabase.table("ambulances").select("*").execute().data
    hospitals = supabase.table("hospitals").select("*").execute().data
    emergencies = supabase.table("emergencies").select("*").execute().data
    missions = supabase.table("missions").select("*").execute().data

    available = len([a for a in ambulances if a["status"] == "AVAILABLE"])

    active = len([
        m for m in missions
        if m["status"] != "COMPLETED"
    ])

    pending = len([
        e for e in emergencies
        if e["status"] != "COMPLETED"
    ])

    return {
        "total_ambulances": len(ambulances),
        "available_ambulances": available,
        "total_hospitals": len(hospitals),
        "total_emergencies": len(emergencies),
        "pending_emergencies": pending,
        "active_missions": active
    }


def live():

    ambulances = supabase.table("ambulances").select("*").execute()
    emergencies = supabase.table("emergencies").select("*").execute()

    return {
        "ambulances": ambulances.data,
        "emergencies": emergencies.data
    }