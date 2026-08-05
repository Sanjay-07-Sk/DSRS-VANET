from app.config.database import supabase
from app.utils.security import hash_password

def register_user(user):

    encrypted_password = hash_password(user.password)

    data = {
        "full_name": user.full_name,
        "email": user.email,
        "password": encrypted_password,
        "role": user.role
    }

    response = supabase.table("users").insert(data).execute()

    return response