from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.mission_schema import MissionCreate, MissionStatusUpdate
from app.services.mission_service import *
from app.websocket.manager import manager
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/missions",
    tags=["Missions"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Mission",
    description="Dispatches a new rescue mission."
)
async def create(mission: MissionCreate):
    """
    Create a new rescue mission.
    """
    response = create_mission(mission)

    await manager.broadcast({
        "event": "mission_created",
        "data": response.data
    })

    return response


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get All Missions",
    description="Retrieves list of all rescue missions."
)
def all():
    """
    Retrieve all rescue missions.
    """
    return get_missions()


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Get Mission By ID",
    description="Retrieves a specific rescue mission by ID."
)
def one(id: str):
    """
    Retrieve a rescue mission by ID.
    """
    response = get_mission(id)
    if hasattr(response, "data") and not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mission with ID '{id}' not found"
        )
    return response


@router.patch(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Update Mission Status",
    description="Updates status of an ongoing mission."
)
async def update(id: str, mission: MissionStatusUpdate):
    """
    Update mission status.
    """
    response = update_status(id, mission.status)

    await manager.broadcast({
        "event": "mission_updated",
        "data": response.data
    })

    return response


@router.patch(
    "/{id}/complete",
    status_code=status.HTTP_200_OK,
    summary="Complete Mission",
    description="Marks a rescue mission as COMPLETED."
)
async def complete(id: str):
    """
    Complete a rescue mission.
    """
    response = complete_mission(id)

    await manager.broadcast({
        "event": "mission_completed",
        "data": response.data
    })

    return response