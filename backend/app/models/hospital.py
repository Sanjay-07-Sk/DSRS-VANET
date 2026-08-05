class Hospital:

    def __init__(
        self,
        hospital_name,
        latitude,
        longitude,
        total_beds,
        available_beds,
        icu_beds,
        ventilators,
        emergency_level,
        contact_number,
        status
    ):

        self.hospital_name = hospital_name
        self.latitude = latitude
        self.longitude = longitude
        self.total_beds = total_beds
        self.available_beds = available_beds
        self.icu_beds = icu_beds
        self.ventilators = ventilators
        self.emergency_level = emergency_level
        self.contact_number = contact_number
        self.status = status