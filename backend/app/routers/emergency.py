from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.emergency_schema import EmergencyCreate
from app.services.emergency_service import *
from app.websocket.manager import manager
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/emergencies",
    tags=["Emergencies"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create Emergency",
    description="Reports a new emergency incident."
)
async def create(emergency: EmergencyCreate):
    """
    Create a new emergency record.
    """
    response = create_emergency(emergency)

    await manager.broadcast({
        "event": "emergency_created",
        "data": response.data
    })

    return response


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get All Emergencies",
    description="Retrieves list of all emergency records."
)
def get():
    """
    Retrieve all emergencies.
    """
    return get_emergencies()


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Get Emergency By ID",
    description="Retrieves a specific emergency record by ID."
)
def one(id: str):
    """
    Retrieve an emergency by ID.
    """
    response = get_emergency(id)
    if hasattr(response, "data") and not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Emergency with ID '{id}' not found"
        )
    return response


@router.put(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Update Emergency",
    description="Updates an existing emergency record."
)
async def update(id: str, emergency: EmergencyCreate):
    """
    Update an emergency record by ID.
    """
    response = update_emergency(id, emergency)

    await manager.broadcast({
        "event": "emergency_updated",
        "data": response.data
    })

    return response


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Emergency",
    description="Deletes an emergency record by ID."
)
async def delete(id: str):
    """
    Delete an emergency record by ID.
    """
    response = delete_emergency(id)

    await manager.broadcast({
        "event": "emergency_deleted",
        "id": id
    })

    return response