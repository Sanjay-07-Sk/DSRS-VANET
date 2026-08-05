import asyncio
from app.config.database import supabase
from app.services.sync_service import store_record
from app.websocket.manager import manager


# Create Ambulance
def create_ambulance(ambulance):
    """
    Creates an ambulance record using store_record() and broadcasts WebSocket event.
    """
    data = {
        "vehicle_number": ambulance.vehicle_number,
        "driver_name": ambulance.driver_name,
        "status": ambulance.status,
        "latitude": ambulance.latitude,
        "longitude": ambulance.longitude,
        "speed": ambulance.speed
    }

    response = store_record("INSERT", "ambulances", data)

    # Broadcast new ambulance location to all WebSocket clients
    try:
        asyncio.create_task(
            manager.broadcast({
                "event": "vehicle_location",
                "data": response["record"]
            })
        )
    except RuntimeError:
        pass

    return response


# Get All Ambulances
def get_all_ambulances():
    """
    Queries all ambulances from Supabase.
    """
    return supabase.table("ambulances").select("*").execute()


# Get Ambulance By ID
def get_ambulance(id: str):
    """
    Queries ambulance record by ID from Supabase.
    """
    return (
        supabase
        .table("ambulances")
        .select("*")
        .eq("id", id)
        .execute()
    )


# Update Ambulance
def update_ambulance(id: str, ambulance):
    """
    Updates an ambulance record using store_record() and broadcasts WebSocket event.
    """
    data = ambulance.model_dump() if hasattr(ambulance, "model_dump") else ambulance.dict()
    data["id"] = id

    response = store_record("UPDATE", "ambulances", data)

    # Broadcast updated ambulance location
    try:
        asyncio.create_task(
            manager.broadcast({
                "event": "vehicle_updated",
                "data": response["record"]
            })
        )
    except RuntimeError:
        pass

    return response


# Delete Ambulance
def delete_ambulance(id: str):
    """
    Deletes an ambulance record using store_record() and broadcasts WebSocket event.
    """
    payload = {"id": id}
    response = store_record("DELETE", "ambulances", payload)

    # Broadcast deletion
    try:
        asyncio.create_task(
            manager.broadcast({
                "event": "vehicle_deleted",
                "data": {"id": id}
            })
        )
    except RuntimeError:
        pass

    return response