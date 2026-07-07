class KakaoMapClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def estimate_duration_minutes(self, waypoints: list[dict]) -> int:
        if len(waypoints) <= 1:
            return 0
        return max((len(waypoints) - 1) * 20, 20)
