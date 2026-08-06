from fastapi import HTTPException, status
from app.config.database import supabase
from app.utils.security import hash_password, verify_password
from app.utils.jwt import create_access_token


def register_user(user):
    """
    Registers a new user record into Supabase with encrypted password.
    """
    encrypted_password = hash_password(user.password)

    data = {
        "full_name": user.full_name,
        "email": user.email,
        "password": encrypted_password,
        "role": user.role
    }

    response = supabase.table("users").insert(data).execute()
    return response


def login_user(email: str, password: str):
    """
    Authenticates user credentials against Supabase users table and returns JWT token.
    Raises 404 User Not Found or 400 Invalid Password on failure.
    """
    response = supabase.table("users").select("*").eq("email", email).execute()
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User Not Found"
        )

    user_record = response.data[0]

    hashed_password = user_record.get("password", "")
    if not verify_password(password, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Password"
        )

    # Generate JWT Token with 24h validity
    token_data = {
        "sub": user_record.get("email"),
        "user_id": user_record.get("id"),
        "role": user_record.get("role", "USER")
    }
    access_token = create_access_token(data=token_data)

    user_info = {k: v for k, v in user_record.items() if k != "password"}

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_info
    }