class TourApiClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def search_keyword(self, keyword: str) -> list[dict]:
        if not keyword:
            return []
        return [{"name": keyword, "lat": 37.5665, "lng": 126.9780}]
