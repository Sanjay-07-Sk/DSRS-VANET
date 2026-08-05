from fastapi import APIRouter
from app.schemas.hospital_schema import HospitalCreate
from app.services.hospital_service import *
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/hospitals",
    tags=["Hospitals"]
)


@router.post("/")
async def add_hospital(hospital: HospitalCreate):

    response = create_hospital(hospital)

    await manager.broadcast({
        "event": "hospital_created",
        "data": response["record"]
    })

    return response


@router.get("/")
def hospitals():
    return get_hospitals()


@router.get("/{id}")
def hospital(id: str):
    return get_hospital(id)


@router.put("/{id}")
async def update(id: str, hospital: HospitalCreate):

    response = update_hospital(id, hospital)

    await manager.broadcast({
        "event": "hospital_updated",
        "data": response["record"]
    })

    return response


@router.delete("/{id}")
async def delete(id: str):

    response = delete_hospital(id)

    await manager.broadcast({
        "event": "hospital_deleted",
        "id": id
    })

    return response