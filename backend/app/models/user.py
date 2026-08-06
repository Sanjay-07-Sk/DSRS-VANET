class User:
    """
    User domain model class representing an authenticated user.
    """
    def __init__(
        self,
        full_name: str,
        email: str,
        password: str,
        role: str,
        id: str = None
    ):
        self.id = id
        self.full_name = full_name
        self.email = email
        self.password = password
        self.role = role
