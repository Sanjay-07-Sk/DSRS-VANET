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

app = FastAPI()

# Register Routers
app.include_router(auth_router)
app.include_router(hospital_router)
app.include_router(ambulance_router)
app.include_router(emergency_router)
app.include_router(mission_router)
app.include_router(dashboard_router)
app.include_router(websocket_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"message": "DSRS-VANET Backend Running"}

@app.get("/health")
def health():
    try:
        response = supabase.table("users").select("*").limit(1).execute()

        return {
            "status": "Healthy",
            "database": "Connected"
        }

    except Exception as e:
        return {
            "status": "Error",
            "database": str(e)
        }