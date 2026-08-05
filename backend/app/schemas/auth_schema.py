from pydantic import BaseModel

class RegisterUser(BaseModel):
    full_name: str
    email: str
    password: str
    role: str