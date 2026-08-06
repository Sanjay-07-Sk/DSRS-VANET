from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any


class RegisterUser(BaseModel):
    """
    Schema for user registration.
    """
    full_name: str = Field(..., description="User's full name")
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's plain password to be hashed")
    role: str = Field(..., description="User role, e.g. ADMIN, DRIVER, HOSPITAL_STAFF")


class LoginUser(BaseModel):
    """
    Schema for user authentication login.
    """
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")


class UserOut(BaseModel):
    """
    Public user representation excluding password.
    """
    id: str
    full_name: str
    email: str
    role: str
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    """
    Schema returned upon successful authentication.
    """
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]