from fastapi import APIRouter
from app.schemas.ambulance_schema import AmbulanceCreate
from app.services.ambulance_service import *
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/ambulances",
    tags=["Ambulances"]
)


@router.post("/")
async def add_ambulance(ambulance: AmbulanceCreate):

    response = create_ambulance(ambulance)

    await manager.broadcast({
        "event": "vehicle_created",
        "data": response["record"]
    })

    return response


@router.get("/")
def all_ambulances():
    return get_all_ambulances()


@router.get("/{id}")
def ambulance(id: str):
    return get_ambulance(id)


@router.put("/{id}")
async def update(id: str, ambulance: AmbulanceCreate):

    response = update_ambulance(id, ambulance)

    await manager.broadcast({
        "event": "vehicle_updated",
        "data": response["record"]
    })

    return response


@router.delete("/{id}")
async def delete(id: str):

    response = delete_ambulance(id)

    await manager.broadcast({
        "event": "vehicle_deleted",
        "id": id
    })

    return response