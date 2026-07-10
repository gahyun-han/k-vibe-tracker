class LocationInfoRepository:
    def __init__(self) -> None:
        self._locations: dict[str, dict] = {}

    def insert(self, location_id: str, payload: dict) -> dict:
        self._locations[location_id] = payload
        return payload

    def select(self, location_id: str) -> dict | None:
        return self._locations.get(location_id)

    def update(self, location_id: str, payload: dict) -> dict:
        self._locations[location_id] = payload
        return payload
