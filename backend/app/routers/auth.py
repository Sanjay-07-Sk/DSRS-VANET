from fastapi import APIRouter
from app.schemas.auth_schema import RegisterUser
from app.services.auth_service import register_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(user: RegisterUser):

    register_user(user)

    return {
        "message": "User Registered Successfully"
    }