from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.ambulance_schema import AmbulanceCreate
from app.services.ambulance_service import *
from app.websocket.manager import manager
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/ambulances",
    tags=["Ambulances"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Add Ambulance",
    description="Registers a new emergency ambulance vehicle."
)
async def add_ambulance(ambulance: AmbulanceCreate):
    """
    Create a new ambulance record.
    """
    response = create_ambulance(ambulance)

    await manager.broadcast({
        "event": "vehicle_created",
        "data": response.data
    })

    return response


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get All Ambulances",
    description="Retrieves list of all registered ambulances."
)
def all_ambulances():
    """
    Retrieve all ambulances.
    """
    return get_all_ambulances()


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Get Ambulance By ID",
    description="Retrieves a specific ambulance record by ID."
)
def ambulance(id: str):
    """
    Retrieve an ambulance by ID.
    """
    response = get_ambulance(id)
    if hasattr(response, "data") and not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ambulance with ID '{id}' not found"
        )
    return response


@router.put(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Update Ambulance",
    description="Updates an existing ambulance record."
)
async def update(id: str, ambulance: AmbulanceCreate):
    """
    Update an ambulance record by ID.
    """
    response = update_ambulance(id, ambulance)

    await manager.broadcast({
        "event": "vehicle_updated",
        "data": response.data
    })

    return response


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Ambulance",
    description="Deletes an ambulance record by ID."
)
async def delete(id: str):
    """
    Delete an ambulance record by ID.
    """
    response = delete_ambulance(id)

    await manager.broadcast({
        "event": "vehicle_deleted",
        "id": id
    })

    return response