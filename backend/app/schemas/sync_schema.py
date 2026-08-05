from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class SyncRecord(BaseModel):
    """
    Schema representing a single offline pending sync record.
    """
    id: str = Field(..., description="Unique generated UUID for the sync record")
    timestamp: str = Field(..., description="ISO 8601 timestamp when record was saved locally")
    operation: str = Field(..., description="Database operation: INSERT, UPDATE, DELETE")
    table: str = Field(..., description="Target Supabase table name")
    status: str = Field(..., description="Sync status: PENDING, FAILED, UPLOADED")
    payload: Dict[str, Any] = Field(..., description="Payload data to sync into database")


class StoreRequest(BaseModel):
    """
    Schema for storing a database payload via the sync engine (direct or offline).
    """
    operation: str = Field("INSERT", description="Database operation: INSERT, UPDATE, DELETE", examples=["INSERT"])
    table: str = Field(..., description="Target table name (e.g. emergencies, ambulances, hospitals, missions)", examples=["emergencies"])
    payload: Dict[str, Any] = Field(..., description="Data dictionary to persist", examples=[{"emergency_type": "Road Accident", "priority": "HIGH", "latitude": 13.0827, "longitude": 80.2707, "status": "Pending"}])


class StoreResponse(BaseModel):
    """
    Schema for store endpoint response.
    """
    message: str = Field(..., description="Status summary message")
    mode: str = Field(..., description="Execution mode: ONLINE or OFFLINE")
    record: Dict[str, Any] = Field(..., description="Processed sync record or database record details")


class UploadResponse(BaseModel):
    """
    Schema for batch sync upload endpoint response.
    """
    message: str = Field(..., description="Upload operation summary message")
    uploaded_count: int = Field(..., description="Number of records successfully uploaded")
    failed_count: int = Field(..., description="Number of records that failed upload")
    remaining_count: int = Field(..., description="Number of pending records remaining in log file")
    details: Optional[List[Dict[str, Any]]] = Field(None, description="Detailed result per sync record")


class StatusResponse(BaseModel):
    """
    Schema for offline synchronization engine status response.
    """
    internet: bool = Field(..., description="True if internet connection is verified")
    pending_logs: int = Field(..., description="Number of pending records currently stored locally")
    last_sync: Optional[str] = Field(None, description="ISO timestamp of last successful batch upload")
    sync_status: str = Field(..., description="System operational mode: ONLINE or OFFLINE")
