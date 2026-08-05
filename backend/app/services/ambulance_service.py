from app.config.database import supabase
from app.websocket.manager import manager
import asyncio


# Create Ambulance
def create_ambulance(ambulance):

    data = {
        "vehicle_number": ambulance.vehicle_number,
        "driver_name": ambulance.driver_name,
        "status": ambulance.status,
        "latitude": ambulance.latitude,
        "longitude": ambulance.longitude,
        "speed": ambulance.speed
    }

    response = supabase.table("ambulances").insert(data).execute()

    # Broadcast new ambulance location to all WebSocket clients
    try:
        asyncio.create_task(
            manager.broadcast({
                "event": "vehicle_location",
                "data": response.data
            })
        )
    except RuntimeError:
        # If no running event loop, ignore broadcasting
        pass

    return response


# Get All Ambulances
def get_all_ambulances():
    return supabase.table("ambulances").select("*").execute()


# Get Ambulance By ID
def get_ambulance(id):
    return (
        supabase
        .table("ambulances")
        .select("*")
        .eq("id", id)
        .execute()
    )


# Update Ambulance
def update_ambulance(id, ambulance):

    data = ambulance.model_dump()

    response = (
        supabase
        .table("ambulances")
        .update(data)
        .eq("id", id)
        .execute()
    )

    # Broadcast updated ambulance location
    try:
        asyncio.create_task(
            manager.broadcast({
                "event": "vehicle_updated",
                "data": response.data
            })
        )
    except RuntimeError:
        pass

    return response


# Delete Ambulance
def delete_ambulance(id):

    response = (
        supabase
        .table("ambulances")
        .delete()
        .eq("id", id)
        .execute()
    )

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