from fastapi import FastAPI
from app.config.database import supabase
from app.routers.auth import router as auth_router

app = FastAPI(
    title="DSRS-VANET API",
    version="1.0.0"
)

app.include_router(auth_router)
@app.get("/")
def root():
    return {"message": "DSRS-VANET Backend Running"}

@app.get("/health")
def health():
    try:
        # Try reading one row from users table
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