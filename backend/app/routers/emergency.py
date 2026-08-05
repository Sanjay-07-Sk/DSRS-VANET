from fastapi import APIRouter
from app.schemas.emergency_schema import EmergencyCreate
from app.services.emergency_service import *
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/emergencies",
    tags=["Emergencies"]
)


@router.post("/")
async def create(emergency: EmergencyCreate):

    response = create_emergency(emergency)

    await manager.broadcast({
        "event": "emergency_created",
        "data": response["record"]
    })

    return response


@router.get("/")
def get():
    return get_emergencies()


@router.get("/{id}")
def one(id: str):
    return get_emergency(id)


@router.put("/{id}")
async def update(id: str, emergency: EmergencyCreate):

    response = update_emergency(id, emergency)

    await manager.broadcast({
        "event": "emergency_updated",
        "data": response["record"]
    })

    return response


@router.delete("/{id}")
async def delete(id: str):

    response = delete_emergency(id)

    await manager.broadcast({
        "event": "emergency_deleted",
        "id": id
    })

    return response