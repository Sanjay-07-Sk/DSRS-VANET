from typing import List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, status, HTTPException
from app.schemas.sync_schema import (
    SyncRecord,
    UploadResponse,
    StatusResponse
)
from app.services.sync_service import (
    upload_pending,
    get_pending_logs,
    get_sync_status,
    clear_logs
)

router = APIRouter(
    prefix="/api/sync",
    tags=["Sync Module"]
)


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload Pending Logs",
    description="Reads all offline pending records and uploads them to Supabase with exponential backoff retries. Deletes successfully uploaded records."
)
def upload():
    """
    Manually trigger sync of all local pending records to Supabase.
    """
    result = upload_pending()
    return UploadResponse(**result)


@router.get(
    "/pending",
    response_model=List[SyncRecord],
    status_code=status.HTTP_200_OK,
    summary="Get Pending Logs",
    description="Returns all offline sync records currently stored in pending_logs.json."
)
def pending():
    """
    Retrieve all pending offline logs.
    """
    records = get_pending_logs()
    return [SyncRecord(**rec) for rec in records]


@router.get(
    "/status",
    response_model=StatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Sync Engine Status",
    description="Returns internet connectivity status, pending records count, last sync timestamp, and current mode (ONLINE / OFFLINE)."
)
def system_status():
    """
    Fetch current network connectivity and offline sync engine metrics.
    """
    result = get_sync_status()
    return StatusResponse(**result)


@router.delete(
    "/clear",
    status_code=status.HTTP_200_OK,
    summary="Clear Pending Logs",
    description="Resets the local pending_logs.json file to empty list."
)
def clear():
    """
    Clear all local pending records.
    """
    return clear_logs()
