from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth_schema import RegisterUser, LoginUser, TokenResponse
from app.services.auth_service import register_user, login_user
from app.middleware.auth import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
    description="Registers a new system user with hashed credentials."
)
def register(user: RegisterUser):
    """
    Register a new user in the system.
    """
    try:
        response = register_user(user)
        user_data = response.data if hasattr(response, "data") else response
        return {
            "success": True,
            "message": "User Registered Successfully",
            "data": user_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User registration failed: {str(e)}"
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login User",
    description="Authenticates user credentials and returns a JWT access token."
)
def login(form_data: OAuth2PasswordRequestForm = Depends()):

    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    return login_user(
        email=form_data.username,
        password=form_data.password
    )


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Returns profile information for the currently authenticated user."
)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Fetch profile of the currently logged-in user.
    """
    return {
        "success": True,
        "user": current_user
    }