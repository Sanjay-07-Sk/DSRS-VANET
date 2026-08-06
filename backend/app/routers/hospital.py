from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.hospital_schema import HospitalCreate
from app.services.hospital_service import *
from app.websocket.manager import manager
from app.middleware.auth import get_current_user

router = APIRouter(
    prefix="/api/hospitals",
    tags=["Hospitals"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Add Hospital",
    description="Registers a new hospital facility."
)
async def add_hospital(hospital: HospitalCreate):
    """
    Create a new hospital record.
    """
    response = create_hospital(hospital)

    await manager.broadcast({
        "event": "hospital_created",
        "data": response.data
    })

    return response


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    summary="Get All Hospitals",
    description="Retrieves list of all hospitals."
)
def hospitals():
    """
    Retrieve all hospitals.
    """
    return get_hospitals()


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Get Hospital By ID",
    description="Retrieves a specific hospital record by ID."
)
def hospital(id: str):
    """
    Retrieve a hospital by ID.
    """
    response = get_hospital(id)
    if hasattr(response, "data") and not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with ID '{id}' not found"
        )
    return response


@router.put(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Update Hospital",
    description="Updates an existing hospital record."
)
async def update(id: str, hospital: HospitalCreate):
    """
    Update a hospital record by ID.
    """
    response = update_hospital(id, hospital)

    await manager.broadcast({
        "event": "hospital_updated",
        "data": response.data
    })

    return response


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Hospital",
    description="Deletes a hospital record by ID."
)
async def delete(id: str):
    """
    Delete a hospital record by ID.
    """
    response = delete_hospital(id)

    await manager.broadcast({
        "event": "hospital_deleted",
        "id": id
    })

    return response