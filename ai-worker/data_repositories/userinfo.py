class UserInfoRepository:
    def __init__(self) -> None:
        self._users: dict[str, dict] = {}

    def insert(self, user_id: str, payload: dict) -> dict:
        self._users[user_id] = payload
        return payload

    def select(self, user_id: str) -> dict | None:
        return self._users.get(user_id)
