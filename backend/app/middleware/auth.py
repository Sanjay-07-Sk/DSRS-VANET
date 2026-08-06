from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.jwt import decode_access_token
from app.config.database import supabase

# FastAPI Security OAuth2 Password Bearer Scheme for Swagger UI integration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency to extract, validate, and return the currently authenticated user
    from the HTTP Bearer Authorization header token.
    Raises 401 Unauthorized for invalid/expired tokens and 404 User Not Found if user is missing in DB.
    """
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    email = payload.get("sub")
    try:
        response = supabase.table("users").select("*").eq("email", email).execute()
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User Not Found"
            )

        user_record = response.data[0]
        user_info = {k: v for k, v in user_record.items() if k != "password"}
        return user_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )
