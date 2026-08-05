from fastapi import APIRouter
from app.schemas.mission_schema import MissionCreate, MissionStatusUpdate
from app.services.mission_service import *
from app.websocket.manager import manager

router = APIRouter(
    prefix="/api/missions",
    tags=["Missions"]
)


@router.post("/")
async def create(mission: MissionCreate):

    response = create_mission(mission)

    await manager.broadcast({
        "event": "mission_created",
        "data": response["record"]
    })

    return response


@router.get("/")
def all():
    return get_missions()


@router.get("/{id}")
def one(id: str):
    return get_mission(id)


@router.patch("/{id}")
async def update(id: str, mission: MissionStatusUpdate):

    response = update_status(id, mission.status)

    await manager.broadcast({
        "event": "mission_updated",
        "data": response["record"]
    })

    return response


@router.patch("/{id}/complete")
async def complete(id: str):

    response = complete_mission(id)

    await manager.broadcast({
        "event": "mission_completed",
        "data": response["record"]
    })

    return response