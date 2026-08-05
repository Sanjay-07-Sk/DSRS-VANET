from pydantic import BaseModel

class AmbulanceCreate(BaseModel):
    vehicle_number: str
    driver_name: str
    status: str
    latitude: float
    longitude: float
    speed: float