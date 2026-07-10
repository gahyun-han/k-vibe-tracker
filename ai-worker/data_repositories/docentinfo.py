class DocentInfoRepository:
    def __init__(self) -> None:
        self._docents: dict[str, dict] = {}

    def insert(self, place_id: str, payload: dict) -> dict:
        self._docents[place_id] = payload
        return payload

    def select(self, place_id: str) -> dict | None:
        return self._docents.get(place_id)

    def update(self, place_id: str, payload: dict) -> dict:
        self._docents[place_id] = payload
        return payload
