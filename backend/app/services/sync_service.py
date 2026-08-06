import json
import time
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status
from app.config.database import supabase
from app.utils.network import is_connected

# Setup logger for the Offline Synchronization Engine
logger = logging.getLogger("dsrs_sync_engine")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [SYNC_ENGINE] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Path setup using pathlib for cross-platform compatibility (Windows/Linux)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
OFFLINE_DIR = BASE_DIR / "offline"
PENDING_LOGS_FILE = OFFLINE_DIR / "pending_logs.json"

# In-memory track of previous connection state and last sync timestamp
_previous_connection_state: Optional[bool] = None
_last_sync_timestamp: Optional[str] = None


class SyncResult:
    """
    Unified result object returned by store_record().
    Provides attribute access (.data, .record, .mode, .message) and dictionary subscript access.
    """
    def __init__(self, data: Any, mode: str, message: str = ""):
        if isinstance(data, list):
            self.data = data
        elif data is not None:
            self.data = [data]
        else:
            self.data = []
        self.mode = mode
        self.message = message
        self.success = True
        self.record = self.data[0] if self.data else {}

    def __getitem__(self, item: str) -> Any:
        if item == "record":
            return self.record
        return getattr(self, item)

    def get(self, item: str, default: Any = None) -> Any:
        if item == "record":
            return self.record
        return getattr(self, item, default)

    def dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "message": self.message,
            "mode": self.mode,
            "data": self.data,
            "record": self.record
        }


def _ensure_file_exists() -> None:
    """
    Ensure that the offline directory and pending_logs.json file exist.
    """
    OFFLINE_DIR.mkdir(parents=True, exist_ok=True)
    if not PENDING_LOGS_FILE.exists():
        with open(PENDING_LOGS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=4)


def save_offline(operation: str, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Saves a record locally into pending_logs.json when Supabase upload fails or offline.

    :param operation: Database operation (INSERT, UPDATE, DELETE)
    :param table: Target database table name
    :param payload: Record data payload
    :return: Created sync record dictionary
    """
    _ensure_file_exists()

    record_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    record = {
        "id": record_id,
        "timestamp": timestamp,
        "operation": operation.upper(),
        "table": table,
        "status": "PENDING",
        "payload": payload
    }

    try:
        pending_logs = get_pending_logs()
        pending_logs.append(record)

        with open(PENDING_LOGS_FILE, "w", encoding="utf-8") as f:
            json.dump(pending_logs, f, indent=4)

        logger.info(f"Offline Save: Operation '{operation.upper()}' saved locally for table '{table}' (ID: {record_id})")
        return record

    except Exception as e:
        logger.error(f"Failed to save record offline: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write to offline storage: {str(e)}"
        )


def get_pending_logs() -> List[Dict[str, Any]]:
    """
    Reads and returns all pending records stored in pending_logs.json.

    :return: List of pending record dictionaries
    """
    _ensure_file_exists()
    try:
        with open(PENDING_LOGS_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except Exception as e:
        logger.error(f"Failed to read pending logs file: {str(e)}")
        return []


def delete_uploaded(uploaded_ids: List[str]) -> None:
    """
    Deletes only specified uploaded record IDs from pending_logs.json.

    :param uploaded_ids: List of record IDs that were successfully uploaded
    """
    if not uploaded_ids:
        return

    _ensure_file_exists()
    current_logs = get_pending_logs()
    filtered_logs = [rec for rec in current_logs if rec.get("id") not in uploaded_ids]

    try:
        with open(PENDING_LOGS_FILE, "w", encoding="utf-8") as f:
            json.dump(filtered_logs, f, indent=4)
        logger.info(f"Deleted {len(uploaded_ids)} uploaded records from local storage.")
    except Exception as e:
        logger.error(f"Failed to update pending logs file after deletion: {str(e)}")


def clear_logs() -> Dict[str, str]:
    """
    Resets pending_logs.json to [].

    :return: Confirmation dictionary message
    """
    _ensure_file_exists()
    try:
        with open(PENDING_LOGS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=4)
        logger.info("Cleared all records from local pending_logs.json")
        return {"message": "All pending logs have been cleared successfully."}
    except Exception as e:
        logger.error(f"Failed to clear pending logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear pending logs: {str(e)}"
        )


def _execute_supabase_op(operation: str, table: str, payload: Dict[str, Any]) -> Any:
    """
    Helper function to execute database table operations against Supabase.
    """
    op = operation.upper()
    if op == "INSERT":
        return supabase.table(table).insert(payload).execute()
    elif op == "UPDATE":
        record_id = payload.get("id")
        if not record_id:
            return supabase.table(table).upsert(payload).execute()
        return supabase.table(table).update(payload).eq("id", record_id).execute()
    elif op == "DELETE":
        record_id = payload.get("id")
        if not record_id:
            raise ValueError("Payload missing 'id' field for DELETE operation")
        return supabase.table(table).delete().eq("id", record_id).execute()
    else:
        raise ValueError(f"Unsupported database operation: '{operation}'")


def upload_pending() -> Dict[str, Any]:
    """
    Reads pending_logs.json, loops through records, and uploads them to Supabase
    using exponential backoff retry logic (3 retries: 1s, 2s, 4s).
    Automatically deletes uploaded records upon success.

    :return: Dictionary summary of upload statistics
    """
    global _last_sync_timestamp

    if not is_connected():
        logger.warning("Upload Started failed: Internet connection unavailable.")
        pending_records = get_pending_logs()
        return {
            "message": "Internet connection unavailable. Synchronization postponed.",
            "uploaded_count": 0,
            "failed_count": 0,
            "remaining_count": len(pending_records),
            "details": []
        }

    pending_records = get_pending_logs()
    if not pending_records:
        return {
            "message": "No pending records found to synchronize.",
            "uploaded_count": 0,
            "failed_count": 0,
            "remaining_count": 0,
            "details": []
        }

    logger.info(f"Upload Started: Attempting to upload {len(pending_records)} records...")

    uploaded_ids: List[str] = []
    details: List[Dict[str, Any]] = []

    uploaded_count = 0
    failed_count = 0

    retry_delays = [1, 2, 4]

    for record in pending_records:
        rec_id = record.get("id")
        operation = record.get("operation", "INSERT")
        table = record.get("table")
        payload = record.get("payload", {})

        success = False
        last_error = ""

        for attempt in range(3):
            try:
                _execute_supabase_op(operation, table, payload)
                success = True
                logger.info(f"Upload Success: Record {rec_id} uploaded to table '{table}'")
                break
            except Exception as e:
                last_error = str(e)
                delay = retry_delays[attempt]
                logger.warning(
                    f"Upload attempt {attempt + 1}/3 failed for record {rec_id}: {last_error}. "
                    f"Retrying in {delay}s..."
                )
                time.sleep(delay)

        if success:
            uploaded_count += 1
            uploaded_ids.append(rec_id)
            details.append({
                "id": rec_id,
                "table": table,
                "status": "UPLOADED"
            })
        else:
            failed_count += 1
            logger.error(f"Upload Failed: Record {rec_id} for table '{table}' failed after 3 retries: {last_error}")
            details.append({
                "id": rec_id,
                "table": table,
                "status": "FAILED",
                "error": last_error
            })

    delete_uploaded(uploaded_ids)
    _last_sync_timestamp = datetime.now(timezone.utc).isoformat()

    remaining_count = len(get_pending_logs())
    logger.info(
        f"Sync Completed: Uploaded={uploaded_count}, Failed={failed_count}, Remaining={remaining_count}"
    )

    return {
        "message": f"Sync operation finished. {uploaded_count} uploaded, {failed_count} failed.",
        "uploaded_count": uploaded_count,
        "failed_count": failed_count,
        "remaining_count": remaining_count,
        "details": details
    }


def store_record(operation: str, table: str, payload: Dict[str, Any]) -> SyncResult:
    """
    Reusable internal service function called by all CRUD services.
    Attempts direct upload to Supabase if internet is available.
    If offline or upload fails, saves record locally to pending_logs.json and returns OFFLINE result.

    :param operation: Database operation (INSERT, UPDATE, DELETE)
    :param table: Target database table name
    :param payload: Record data payload
    :return: SyncResult object containing .data, .record, .mode ("ONLINE"/"OFFLINE"), and .message
    """
    if is_connected():
        try:
            res = _execute_supabase_op(operation, table, payload)
            returned_data = res.data if res.data else [payload]
            logger.info(f"Direct Upload Success: Operation '{operation}' executed on table '{table}'")
            return SyncResult(
                data=returned_data,
                mode="ONLINE",
                message=f"Uploaded directly to Supabase table '{table}'."
            )
        except Exception as e:
            logger.warning(
                f"Direct upload failed despite internet check: {str(e)}. Falling back to offline storage."
            )

    saved_record = save_offline(operation, table, payload)
    return SyncResult(
        data=[saved_record.get("payload", payload)],
        mode="OFFLINE",
        message="Internet unavailable or database unreachable. Record saved locally to offline log."
    )


def get_sync_status() -> Dict[str, Any]:
    """
    Returns network connectivity status, pending records count, last sync timestamp,
    and operational mode (ONLINE / OFFLINE). Monitors state changes for logging.

    :return: System status dictionary
    """
    global _previous_connection_state

    current_online = is_connected()

    if _previous_connection_state is not None:
        if _previous_connection_state and not current_online:
            logger.warning("Internet Lost: Network connection disconnected.")
        elif not _previous_connection_state and current_online:
            logger.info("Internet Restored: Network connection re-established.")
    _previous_connection_state = current_online

    pending_records = get_pending_logs()

    return {
        "internet": current_online,
        "pending_logs": len(pending_records),
        "last_sync": _last_sync_timestamp,
        "sync_status": "ONLINE" if current_online else "OFFLINE"
    }
