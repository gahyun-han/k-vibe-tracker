class RouteInfoRepository:
    def __init__(self) -> None:
        self._routes: dict[str, dict] = {}

    def insert(self, user_id: str, route: dict) -> dict:
        self._routes[user_id] = route
        return route

    def select(self, user_id: str) -> dict | None:
        return self._routes.get(user_id)

    def update(self, user_id: str, route: dict) -> dict:
        self._routes[user_id] = route
        return route
