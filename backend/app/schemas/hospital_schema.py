from pydantic import BaseModel


class HospitalCreate(BaseModel):
    hospital_name: str
    latitude: float
    longitude: float
    total_beds: int
    available_beds: int
    icu_beds: int
    ventilators: int
    emergency_level: str