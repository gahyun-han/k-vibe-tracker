class PersonaInfoRepository:
    def __init__(self) -> None:
        self._personas: dict[str, dict] = {}

    def insert(self, user_id: str, persona: dict) -> dict:
        self._personas[user_id] = persona
        return persona

    def select(self, user_id: str) -> dict | None:
        return self._personas.get(user_id)
