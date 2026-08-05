import asyncio
from fastapi import FastAPI
from app.config.database import supabase

from app.routers.auth import router as auth_router
from app.routers.hospital import router as hospital_router
from app.routers.ambulance import router as ambulance_router
from app.routers.mission import router as mission_router
from app.routers.emergency import router as emergency_router
from app.routers.dashboard import router as dashboard_router
from app.routers.websocket import router as websocket_router
from app.routers.ai import router as ai_router
from app.routers.sync import router as sync_router
from app.services.sync_service import upload_pending, is_connected, get_pending_logs, logger

app = FastAPI(
    title="DSRS-VANET API",
    description="Disaster Smart Rescue System using VANET - FastAPI Backend with Offline Sync Engine",
    version="1.0.0"
)

# Register Routers
app.include_router(auth_router)
app.include_router(hospital_router)
app.include_router(ambulance_router)
app.include_router(emergency_router)
app.include_router(mission_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)
app.include_router(ai_router)
app.include_router(sync_router)


async def auto_sync_worker():
    """
    Background asynchronous task running every 30 seconds.
    If internet connectivity is detected and there are pending offline records,
    it automatically triggers upload_pending() without blocking the API.
    """
    logger.info("Background synchronization worker initialized (30s interval).")
    while True:
        try:
            await asyncio.sleep(30)
            if is_connected():
                pending = get_pending_logs()
                if pending:
                    logger.info("Auto-Sync Triggered: Internet active and pending logs detected.")
                    await asyncio.to_thread(upload_pending)
        except Exception as e:
            logger.error(f"Error in background auto-sync worker loop: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """
    FastAPI startup event to launch background tasks.
    """
    asyncio.create_task(auto_sync_worker())


@app.get("/")
def root():
    return {"message": "DSRS-VANET Backend Running with Offline Synchronization Engine"}


@app.get("/health")
def health():
    try:
        response = supabase.table("users").select("*").limit(1).execute()
        return {
            "status": "Healthy",
            "database": "Connected",
            "sync_engine": "Active"
        }
    except Exception as e:
        return {
            "status": "Error",
            "database": str(e),
            "sync_engine": "Active"
        }