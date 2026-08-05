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

        logger.info(f"Offline Save: Record {record_id} saved locally for table '{table}'")
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
    Helper function to execute table operations against Supabase.
    """
    op = operation.upper()
    if op == "INSERT":
        return supabase.table(table).insert(payload).execute()
    elif op == "UPDATE":
        record_id = payload.get("id")
        if not record_id:
            raise ValueError("Payload missing 'id' field for UPDATE operation")
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

    # Backoff retry delays: 1 second, 2 seconds, 4 seconds
    retry_delays = [1, 2, 4]

    for record in pending_records:
        rec_id = record.get("id")
        operation = record.get("operation", "INSERT")
        table = record.get("table")
        payload = record.get("payload", {})

        success = False
        last_error = ""

        # Attempt up to 3 retries with exponential backoff
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

    # Automatically delete successfully uploaded records
    delete_uploaded(uploaded_ids)

    # Update last sync timestamp
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


def store_record(operation: str, table: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Stores data by attempting direct upload to Supabase if internet is available.
    If offline or upload fails, falls back to offline storage in pending_logs.json.

    :param operation: Database operation (INSERT, UPDATE, DELETE)
    :param table: Target database table name
    :param payload: Record payload data
    :return: Response dictionary indicating ONLINE or OFFLINE storage mode
    """
    if is_connected():
        try:
            res = _execute_supabase_op(operation, table, payload)
            returned_data = res.data[0] if res.data else payload
            logger.info(f"Direct Upload Success: Record stored in table '{table}'")
            return {
                "message": f"Record uploaded directly to Supabase table '{table}'.",
                "mode": "ONLINE",
                "record": returned_data
            }
        except Exception as e:
            logger.warning(f"Direct upload failed despite internet check: {str(e)}. Falling back to offline storage.")

    # Fallback to offline save
    saved_record = save_offline(operation, table, payload)
    return {
        "message": "Internet unavailable or upload failed. Record saved locally to offline log.",
        "mode": "OFFLINE",
        "record": saved_record
    }


def get_sync_status() -> Dict[str, Any]:
    """
    Returns network connectivity status, pending records count, last sync timestamp,
    and operational mode (ONLINE / OFFLINE). Monitors state changes for logging.

    :return: System status dictionary
    """
    global _previous_connection_state

    current_online = is_connected()

    # Log state changes (Internet Lost / Internet Restored)
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
